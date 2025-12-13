import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { seedRulesFromJSON } from '../src/lib/seed/seeder';
import { Rule } from '../src/types/rule';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.error('Please set it in your .env.local file');
  process.exit(1);
}

// Old format (legacy)
interface JSONRuleLegacy {
  rule_id: string;
  rule_name: string;
  category: string;
  conditions: any;
  actions: any;
  explanation: string;
}

// New format (concept-based)
interface JSONConditionNew {
  concept: string;
  attribute: string;
  operator: string;
  value: any;
  logic?: 'AND' | 'OR';
  conditions?: JSONConditionNew[];
}

interface JSONConclusionNew {
  concept: string;
  attribute: string;
  value: any;
}

interface JSONRuleNew {
  id: string;
  group: string;
  description: string;
  logic: 'AND' | 'OR';
  if: JSONConditionNew[];
  then: JSONConclusionNew[];
  explanation: string;
}

interface JSONDiseaseFileLegacy {
  disease: string;
  description: string;
  rules: JSONRuleLegacy[];
}

interface JSONDiseaseFileNew {
  disease: string;
  disease_code?: string;
  rules: JSONRuleNew[];
}

/**
 * Transform concept.attribute to variable name
 */
function conceptToVariable(concept: string, attribute: string): string {
  return `${concept}.${attribute}`;
}

/**
 * Recursively transform nested conditions (handles logic OR/AND within conditions)
 */
function transformNestedConditions(conditions: JSONConditionNew[]): any[] {
  const result: any[] = [];

  for (const condition of conditions) {
    // Check if this is a nested logic condition
    if (condition.logic && condition.conditions) {
      // Recursively handle nested conditions
      const nested = transformNestedConditions(condition.conditions);
      result.push(...nested);
    } else {
      // Regular condition
      result.push({
        variable: conceptToVariable(condition.concept, condition.attribute),
        operator: condition.operator || '=',
        value: condition.value
      });
    }
  }

  return result;
}

/**
 * Transform new format conditions to database format
 */
function transformConditionsNew(conditions: JSONConditionNew[], logic: 'AND' | 'OR'): { logic: 'AND' | 'OR', conditionsArray: any[] } {
  const conditionsArray = transformNestedConditions(conditions);
  return { logic, conditionsArray };
}

/**
 * Transform new format conclusions to database format
 */
function transformConclusionsNew(conclusions: JSONConclusionNew[]): any[] {
  return conclusions.map(conclusion => ({
    variable: conceptToVariable(conclusion.concept, conclusion.attribute),
    value: conclusion.value
  }));
}

/**
 * Transform old format conditions to database format (legacy support)
 */
function transformConditionsLegacy(conditions: any): { logic: 'AND' | 'OR', conditionsArray: any[] } {
  const conditionsArray: any[] = [];
  let logic: 'AND' | 'OR' = 'AND';

  // Check if it's an OR structure
  if (conditions.OR) {
    logic = 'OR';
    for (const orCondition of conditions.OR) {
      for (const [key, value] of Object.entries(orCondition)) {
        conditionsArray.push({
          variable: key,
          operator: Array.isArray(value) ? 'IN' : '=',
          value: value
        });
      }
    }
  } else {
    // It's an AND structure (default)
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'OR' || key === 'AND') continue;
      conditionsArray.push({
        variable: key,
        operator: Array.isArray(value) ? 'IN' : '=',
        value: value
      });
    }
  }

  return { logic, conditionsArray };
}

/**
 * Transform old format actions to database conclusions (legacy support)
 */
function transformConclusionsLegacy(actions: any): any[] {
  const conclusions: any[] = [];

  for (const [key, value] of Object.entries(actions)) {
    conclusions.push({
      variable: key,
      value: value
    });
  }

  return conclusions;
}

/**
 * Map category/group names to database enum values
 */
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    // Vietnamese mappings
    'Chẩn đoán': 'diagnosis',
    'Chẩn đoán phân biệt': 'differential',
    'Yếu tố nguy cơ': 'risk',
    'Điều trị': 'treatment',
    'Hỗ trợ triệu chứng': 'symptom_support',
    'Biến chứng': 'complication',
    'Đánh giá nguy cơ & mức độ nặng': 'risk',
    'Chẩn đoán các thể viêm nang lông': 'diagnosis',
    'Nguyên tắc điều trị': 'treatment',
    'Điều trị cụ thể': 'treatment',
    'Nguyên nhân khác & phòng bệnh': 'diagnosis_support',
    'Đánh giá mức độ': 'risk',
    'Thủ thuật': 'treatment',
    'Điều trị triệu chứng': 'symptom_support',
    'Phòng ngừa/tái phát': 'treatment',
    'Chẩn đoán thể bệnh': 'diagnosis',
    'Phòng bệnh': 'diagnosis_support',
    'Nguyên nhân – nguy cơ – cơ chế lây': 'risk',
    'Nhận diện thương tổn – phân thể': 'diagnosis',
    'Thần kinh – biến chứng': 'complication',
    'Xác định chẩn đoán – WHO': 'diagnosis',
    'Điều trị MDT': 'treatment',
    'Tiên lượng – phòng bệnh': 'diagnosis_support',
    'Cảnh báo': 'complication',
    'Cảnh báo an toàn': 'complication',
    'Cảnh báo tương tác thuốc': 'complication',
    'Cảnh báo tác dụng phụ': 'complication',
    'Tư vấn chăm sóc': 'symptom_support',
    'Xác định căn nguyên': 'diagnosis',
    'Điều trị hỗ trợ': 'symptom_support',
    'Tiên lượng': 'diagnosis_support',
    'Tư vấn': 'symptom_support'
  };

  return categoryMap[category] || 'diagnosis';
}

/**
 * Transform new format rule to database Rule format
 */
function transformRuleNew(jsonRule: JSONRuleNew, diseaseId: string): Rule {
  const { logic, conditionsArray } = transformConditionsNew(jsonRule.if, jsonRule.logic);
  const conclusions = transformConclusionsNew(jsonRule.then);

  return {
    id: jsonRule.id,
    name: jsonRule.description,
    category: mapCategory(jsonRule.group) as any,
    logic: logic,
    conditions: conditionsArray,
    conclusions: conclusions,
    explanation: jsonRule.explanation,
    status: 'active',
    disease_id: diseaseId,
    priority: 0
  };
}

/**
 * Transform old format rule to database Rule format (legacy support)
 */
function transformRuleLegacy(jsonRule: JSONRuleLegacy, diseaseId: string): Rule {
  const { logic, conditionsArray } = transformConditionsLegacy(jsonRule.conditions);
  const conclusions = transformConclusionsLegacy(jsonRule.actions);

  return {
    id: jsonRule.rule_id,
    name: jsonRule.rule_name,
    category: mapCategory(jsonRule.category) as any,
    logic: logic,
    conditions: conditionsArray,
    conclusions: conclusions,
    explanation: jsonRule.explanation,
    status: 'active',
    disease_id: diseaseId,
    priority: 0
  };
}

/**
 * Detect format and transform rule accordingly
 */
function transformRule(jsonRule: any, diseaseId: string): Rule {
  // Check if it's new format (has 'if', 'then', 'group') or old format (has 'conditions', 'actions', 'category')
  if ('if' in jsonRule && 'then' in jsonRule && 'group' in jsonRule) {
    return transformRuleNew(jsonRule as JSONRuleNew, diseaseId);
  } else {
    return transformRuleLegacy(jsonRule as JSONRuleLegacy, diseaseId);
  }
}

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    const diseases = [
      { file: 'rules_choc.json', id: 'CHOC', name: 'Chốc (Impetigo)' },
      { file: 'rule_nhot.json', id: 'NHOT', name: 'Nhọt (Boils/Furuncles)' },
      { file: 'rule_viemnanglong.json', id: 'FOL', name: 'Viêm Nang Lông (Folliculitis)' },
      { file: 'rule_trungca.json', id: 'ACNE', name: 'Trứng Cá (Acne)' },
      { file: 'rule_laoda.json', id: 'TB', name: 'Lao Da (Cutaneous Tuberculosis)' },
      { file: 'rule_SSSS.json', id: 'SSSS', name: 'SSSS (Staphylococcal Scalded Skin Syndrome)' },
      { file: 'rule_phong.json', id: 'LEPROSY', name: 'Bệnh Phong (Leprosy)' }
    ];

    let totalRules = 0;
    let totalConditions = 0;
    let totalConclusions = 0;

    for (const disease of diseases) {
      const filePath = join(process.cwd(), 'rules', disease.file);
      console.log(`📄 Reading file: ${disease.file}`);

      const jsonData: any = JSON.parse(readFileSync(filePath, 'utf-8'));

      // All files should now have consistent format: object with disease info
      const rules = jsonData.rules || [];
      const diseaseName = jsonData.disease || disease.name;
      const diseaseDescription = jsonData.description || '';

      console.log(`   Disease: ${diseaseName}`);
      console.log(`   Rules found: ${rules.length}`);

      // Transform rules
      const transformedRules = rules.map((rule: any) =>
        transformRule(rule, disease.id)
      );

      // Seed the rules
      console.log(`   💾 Inserting rules into database...`);
      const result = await seedRulesFromJSON(
        transformedRules,
        disease.id,
        diseaseName,
        diseaseDescription
      );

      console.log(`   ✅ Completed!`);
      console.log(`      - Rules: ${result.rulesInserted}`);
      console.log(`      - Conditions: ${result.conditionsInserted}`);
      console.log(`      - Conclusions: ${result.conclusionsInserted}\n`);

      totalRules += result.rulesInserted;
      totalConditions += result.conditionsInserted;
      totalConclusions += result.conclusionsInserted;
    }

    console.log('✅ All seeding completed successfully!\n');
    console.log('📊 Total Summary:');
    console.log(`  - Diseases: ${diseases.length}`);
    console.log(`  - Rules: ${totalRules}`);
    console.log(`  - Conditions: ${totalConditions}`);
    console.log(`  - Conclusions: ${totalConclusions}`);
    console.log('\n✨ Database is ready for use!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
