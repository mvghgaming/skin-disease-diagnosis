import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ConceptAttribute {
  type: string;
  description: string;
  pk?: boolean;
  fk?: string;
  options?: string[];
}

interface Concept {
  description: string;
  attributes: {
    [key: string]: ConceptAttribute;
  };
}

interface ConceptsFile {
  concepts: {
    [key: string]: Concept;
  };
}

// Map SQL types to TypeScript types
function mapTypeToTS(sqlType: string): 'boolean' | 'string' | 'number' | 'array' {
  const upperType = sqlType.toUpperCase();
  if (upperType === 'BOOLEAN') return 'boolean';
  if (upperType === 'INT' || upperType === 'INTEGER') return 'number';
  if (upperType === 'SET') return 'array';
  return 'string';
}

// Generate variable schemas from concepts.json
function generateVariables() {
  const conceptsPath = join(process.cwd(), 'concepts.json');
  const conceptsData: ConceptsFile = JSON.parse(readFileSync(conceptsPath, 'utf-8'));

  const outputLines: string[] = [];

  // Add type definitions
  outputLines.push(`export interface VariableDefinition {
  label_vi: string;
  label_en: string;
  type: 'boolean' | 'string' | 'number' | 'array';
  enum?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface VariableNamespace {
  namespace: string;
  label_vi: string;
  label_en: string;
  variables: {
    [key: string]: VariableDefinition;
  };
}
`);

  outputLines.push('// Auto-generated from concepts.json');
  outputLines.push('export const VARIABLE_SCHEMAS: VariableNamespace[] = [');

  // Input concepts (user fills these)
  const inputConcepts = [
    'PATIENT_INFO',
    'RISK_FACTOR_ASSESSMENT',
    'SKIN_LESION_MORPHOLOGY',
    'LESION_DISTRIBUTION',
    'SYSTEMIC_AND_NEURO_SIGNS',
    'LABORATORY_ASSESSMENT',
    'SEVERITY_ASSESSMENT'
  ];

  for (const [conceptName, concept] of Object.entries(conceptsData.concepts)) {
    if (!inputConcepts.includes(conceptName)) continue;

    outputLines.push('  {');
    outputLines.push(`    namespace: '${conceptName}',`);
    outputLines.push(`    label_vi: '${concept.description}',`);
    outputLines.push(`    label_en: '${conceptName.replace(/_/g, ' ')}',`);
    outputLines.push('    variables: {');

    for (const [attrName, attr] of Object.entries(concept.attributes)) {
      // Skip primary/foreign keys
      if (attr.pk || attr.fk) continue;

      const tsType = mapTypeToTS(attr.type);

      outputLines.push(`      '${attrName}': {`);
      outputLines.push(`        label_vi: '${attr.description}',`);
      outputLines.push(`        label_en: '${attrName.replace(/_/g, ' ')}',`);
      outputLines.push(`        type: '${tsType}'`);

      // Add enum options if available
      if (attr.options && attr.options.length > 0) {
        const optionsStr = JSON.stringify(attr.options);
        outputLines.push(`        ,enum: ${optionsStr}`);
      }

      outputLines.push(`      },`);
    }

    outputLines.push('    }');
    outputLines.push('  },');
  }

  outputLines.push('];');

  // Add helper functions
  outputLines.push(`
// Helper functions for working with variables
export function getVariableSchema(variable: string): VariableDefinition | null {
  const [namespace, fieldName] = variable.split('.');
  const namespaceSchema = VARIABLE_SCHEMAS.find(ns => ns.namespace === namespace);
  if (!namespaceSchema) return null;
  return namespaceSchema.variables[fieldName] || null;
}

export function getVariableNamespace(variable: string): VariableNamespace | null {
  const [namespace] = variable.split('.');
  return VARIABLE_SCHEMAS.find(ns => ns.namespace === namespace) || null;
}

export function getAllVariables(): string[] {
  const variables: string[] = [];
  VARIABLE_SCHEMAS.forEach(namespace => {
    Object.keys(namespace.variables).forEach(fieldName => {
      variables.push(\`\${namespace.namespace}.\${fieldName}\`);
    });
  });
  return variables;
}

export function validateVariableValue(variable: string, value: any): boolean {
  const schema = getVariableSchema(variable);
  if (!schema) return false;

  if (schema.type === 'boolean' && typeof value !== 'boolean') return false;
  if (schema.type === 'string' && typeof value !== 'string') return false;
  if (schema.type === 'number' && typeof value !== 'number') return false;
  if (schema.type === 'array' && !Array.isArray(value)) return false;

  if (schema.enum && schema.type === 'string') {
    return schema.enum.includes(value);
  }

  if (schema.type === 'number' && schema.validation) {
    if (schema.validation.min !== undefined && value < schema.validation.min) return false;
    if (schema.validation.max !== undefined && value > schema.validation.max) return false;
  }

  return true;
}

// Get input namespaces (for user symptom input)
export function getInputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    !['DIAGNOSIS_ASSESSMENT', 'TREATMENT_PLAN'].includes(ns.namespace)
  );
}

// Get output namespaces (for diagnosis results)
export function getOutputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    ['DIAGNOSIS_ASSESSMENT', 'TREATMENT_PLAN'].includes(ns.namespace)
  );
}
`);

  // Write to file
  const outputPath = join(process.cwd(), 'src', 'config', 'variables.ts');
  writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');

  console.log('✅ Generated variables.ts from concepts.json');
  console.log(`   Output: ${outputPath}`);
}

try {
  generateVariables();
} catch (error) {
  console.error('❌ Generation failed:', error);
  process.exit(1);
}
