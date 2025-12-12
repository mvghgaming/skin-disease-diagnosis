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

interface JSONRule {
  rule_id: string;
  rule_name: string;
  category: string;
  conditions: any;
  actions: any;
  explanation: string;
}

interface JSONDiseaseFile {
  disease: string;
  description: string;
  rules: JSONRule[];
}

/**
 * Transform JSON conditions to database format
 */
function transformConditions(conditions: any): { logic: 'AND' | 'OR', conditionsArray: any[] } {
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
 * Transform JSON actions to database conclusions
 */
function transformConclusions(actions: any): any[] {
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
 * Map category names to database enum values
 */
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
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
    'Nguyên nhân khác & phòng bệnh': 'diagnosis_support'
  };

  return categoryMap[category] || 'diagnosis';
}

/**
 * Transform JSON rule to database Rule format
 */
function transformRule(jsonRule: JSONRule, diseaseId: string): Rule {
  const { logic, conditionsArray } = transformConditions(jsonRule.conditions);
  const conclusions = transformConclusions(jsonRule.actions);

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

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    const diseases = [
      { file: '1-choc.json', id: 'CHOC' },
      { file: '2-nhot.json', id: 'NHOT' },
      { file: '3-viem-nang-long.json', id: 'FOL' }
    ];

    let totalRules = 0;
    let totalConditions = 0;
    let totalConclusions = 0;

    for (const disease of diseases) {
      const filePath = join(process.cwd(), 'rules', disease.file);
      console.log(`📄 Reading file: ${disease.file}`);

      const jsonData: JSONDiseaseFile = JSON.parse(readFileSync(filePath, 'utf-8'));
      console.log(`   Disease: ${jsonData.disease}`);
      console.log(`   Rules found: ${jsonData.rules.length}`);

      // Transform rules
      const transformedRules = jsonData.rules.map(rule =>
        transformRule(rule, disease.id)
      );

      // Seed the rules
      console.log(`   💾 Inserting rules into database...`);
      const result = await seedRulesFromJSON(
        transformedRules,
        disease.id,
        jsonData.disease,
        jsonData.description
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
