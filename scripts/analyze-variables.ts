import { readFileSync, readdirSync } from 'fs';
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

// Read concepts.json
const conceptsPath = join(process.cwd(), 'concepts.json');
const concepts: ConceptsFile = JSON.parse(readFileSync(conceptsPath, 'utf-8'));

// Get all variables from input concepts
const allVariables = new Set<string>();
const inputConcepts = [
  'PATIENT_INFO',
  'RISK_FACTOR_ASSESSMENT',
  'SKIN_LESION_MORPHOLOGY',
  'LESION_DISTRIBUTION',
  'SYSTEMIC_AND_NEURO_SIGNS',
  'LABORATORY_ASSESSMENT',
  'SEVERITY_ASSESSMENT'
];

for (const [conceptName, concept] of Object.entries(concepts.concepts)) {
  if (!inputConcepts.includes(conceptName)) continue;
  for (const [attrName, attr] of Object.entries(concept.attributes)) {
    if (attr.pk || attr.fk) continue;
    allVariables.add(`${conceptName}.${attrName}`);
  }
}

// Read all rules and extract used variables
const rulesDir = join(process.cwd(), 'rules');
const usedVariables = new Set<string>();
const variablesByDisease = new Map<string, Set<string>>();

function extractVariables(conditions: any[], diseaseName: string) {
  for (const cond of conditions) {
    if (cond.concept && cond.attribute) {
      const variable = `${cond.concept}.${cond.attribute}`;
      usedVariables.add(variable);

      if (!variablesByDisease.has(diseaseName)) {
        variablesByDisease.set(diseaseName, new Set());
      }
      variablesByDisease.get(diseaseName)!.add(variable);
    }
    if (cond.conditions) {
      extractVariables(cond.conditions, diseaseName);
    }
  }
}

for (const file of readdirSync(rulesDir)) {
  if (!file.endsWith('.json')) continue;
  const filePath = join(rulesDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  const diseaseName = data.disease || file;

  for (const rule of data.rules || []) {
    if (rule.if) extractVariables(rule.if, diseaseName);
  }
}

// Find unused variables
const unusedVariables = [...allVariables].filter(v => !usedVariables.has(v)).sort();
const usedList = [...usedVariables].filter(v => allVariables.has(v)).sort();

// Group by namespace
const groupByNamespace = (vars: string[]) => {
  const groups = new Map<string, string[]>();
  for (const v of vars) {
    const [ns] = v.split('.');
    if (!groups.has(ns)) groups.set(ns, []);
    groups.get(ns)!.push(v);
  }
  return groups;
};

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║              VARIABLE USAGE ANALYSIS                           ║');
console.log('╠════════════════════════════════════════════════════════════════╣');
console.log(`║ Total variables in concepts:  ${String(allVariables.size).padStart(3)}                             ║`);
console.log(`║ Variables used in rules:      ${String(usedList.length).padStart(3)}                             ║`);
console.log(`║ Unused variables:             ${String(unusedVariables.length).padStart(3)}                             ║`);
console.log('╚════════════════════════════════════════════════════════════════╝');

console.log('\n📊 UNUSED VARIABLES BY NAMESPACE:\n');

const unusedByNs = groupByNamespace(unusedVariables);
for (const [ns, vars] of unusedByNs) {
  const concept = concepts.concepts[ns];
  console.log(`\n🔸 ${ns} (${concept?.description || ns}):`);
  for (const v of vars) {
    const attrName = v.split('.')[1];
    const attr = concept?.attributes[attrName];
    console.log(`   - ${attrName}: ${attr?.description || 'N/A'}`);
  }
}

console.log('\n\n✅ USED VARIABLES BY NAMESPACE:\n');

const usedByNs = groupByNamespace(usedList);
for (const [ns, vars] of usedByNs) {
  const concept = concepts.concepts[ns];
  console.log(`\n🔹 ${ns} (${vars.length} variables used):`);
  for (const v of vars) {
    const attrName = v.split('.')[1];
    // Find which diseases use this variable
    const diseases: string[] = [];
    for (const [disease, diseaseVars] of variablesByDisease) {
      if (diseaseVars.has(v)) diseases.push(disease);
    }
    console.log(`   - ${attrName} [${diseases.join(', ')}]`);
  }
}
