import * as fs from 'fs';
import * as path from 'path';

interface Condition {
  concept?: string;
  attribute?: string;
  operator?: string;
  value?: any;
  logic?: string;
  if?: Condition[];
}

interface Conclusion {
  concept?: string;
  attribute?: string;
  value?: any;
}

interface Rule {
  id: string;
  group?: string;
  description?: string;
  logic?: string;
  if: Condition[];
  then: Conclusion[];
}

interface RuleFile {
  disease: string;
  disease_code: string;
  rules: Rule[];
}

interface DiseaseStats {
  name: string;
  code: string;
  fileName: string;
  ruleCount: number;
  ruleGroups: Map<string, number>;
}

// Read all rule files
const rulesDir = path.join(process.cwd(), 'rules');
const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.json'));

const diseaseStats: DiseaseStats[] = [];
let totalRules = 0;
let totalConditions = 0;
let totalConclusions = 0;

const operatorCounts = new Map<string, number>();
const conceptCounts = new Map<string, number>();
const ruleGroupCounts = new Map<string, number>();

// Count conditions recursively
function countConditions(conditions: Condition[]): number {
  if (!conditions || !Array.isArray(conditions)) return 0;

  let count = 0;

  for (const condition of conditions) {
    if (condition.concept && condition.attribute) {
      count++;

      // Count operator
      const op = condition.operator || '=';
      operatorCounts.set(op, (operatorCounts.get(op) || 0) + 1);

      // Count concept (namespace)
      conceptCounts.set(condition.concept, (conceptCounts.get(condition.concept) || 0) + 1);
    }

    // Handle nested conditions
    if (condition.if && Array.isArray(condition.if)) {
      count += countConditions(condition.if);
    }
  }

  return count;
}

// Count conclusions
function countConclusions(conclusions: Conclusion[] | null | undefined): number {
  if (!conclusions || !Array.isArray(conclusions)) return 0;

  let count = 0;
  for (const conclusion of conclusions) {
    if (conclusion.concept && conclusion.attribute) {
      count++;
      // Also count concepts in conclusions
      conceptCounts.set(conclusion.concept, (conceptCounts.get(conclusion.concept) || 0) + 1);
    }
  }

  return count;
}

// Process each rule file
for (const fileName of ruleFiles) {
  const filePath = path.join(rulesDir, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  const ruleFile: RuleFile = JSON.parse(content);

  const stats: DiseaseStats = {
    name: ruleFile.disease,
    code: ruleFile.disease_code,
    fileName: fileName,
    ruleCount: ruleFile.rules.length,
    ruleGroups: new Map<string, number>(),
  };

  totalRules += ruleFile.rules.length;

  for (const rule of ruleFile.rules) {
    // Count conditions
    totalConditions += countConditions(rule.if);

    // Count conclusions
    totalConclusions += countConclusions(rule.then);

    // Count rule groups
    const ruleGroup = rule.group || 'Unknown';
    stats.ruleGroups.set(ruleGroup, (stats.ruleGroups.get(ruleGroup) || 0) + 1);
    ruleGroupCounts.set(ruleGroup, (ruleGroupCounts.get(ruleGroup) || 0) + 1);
  }

  diseaseStats.push(stats);
}

// Sort disease stats by rule count (descending)
diseaseStats.sort((a, b) => b.ruleCount - a.ruleCount);

// Sort maps for display
const sortedOperators = Array.from(operatorCounts.entries()).sort((a, b) => b[1] - a[1]);
const sortedConcepts = Array.from(conceptCounts.entries()).sort((a, b) => b[1] - a[1]);
const sortedRuleGroups = Array.from(ruleGroupCounts.entries()).sort((a, b) => b[1] - a[1]);

// Operator descriptions
const operatorDescriptions: Record<string, string> = {
  '=': 'Bằng',
  '!=': 'Khác',
  '>': 'Lớn hơn',
  '>=': 'Lớn hơn hoặc bằng',
  '<': 'Nhỏ hơn',
  '<=': 'Nhỏ hơn hoặc bằng',
  'IN': 'Thuộc tập hợp',
  'LIKE': 'Pattern matching',
  'CONTAINS': 'Chứa',
  'CONTAINS_ANY': 'Chứa bất kỳ',
  'IS_NULL': 'Là null',
  'IS_NOT_NULL': 'Không null',
};

// Concept descriptions
const conceptDescriptions: Record<string, string> = {
  'SKIN_LESION_MORPHOLOGY': 'Hình thái tổn thương da',
  'DIAGNOSIS_ASSESSMENT': 'Đánh giá chẩn đoán',
  'LESION_DISTRIBUTION': 'Phân bố tổn thương',
  'TREATMENT_PLAN': 'Kế hoạch điều trị',
  'SEVERITY_ASSESSMENT': 'Đánh giá mức độ nặng',
  'LABORATORY_ASSESSMENT': 'Xét nghiệm',
  'PATIENT_INFO': 'Thông tin bệnh nhân',
  'SYSTEMIC_AND_NEURO_SIGNS': 'Triệu chứng toàn thân & thần kinh',
  'RISK_FACTOR_ASSESSMENT': 'Đánh giá yếu tố nguy cơ',
};

// Generate markdown
let markdown = `# Thống kê luật chẩn đoán (Rules Statistics)

> Cập nhật tự động từ các file JSON trong thư mục \`rules/\`

## Tổng quan (Overview)

| Chỉ số | Giá trị |
|--------|---------|
| Tổng số bệnh | **${diseaseStats.length}** |
| Tổng số luật | **${totalRules}** |
| Tổng số điều kiện | **${totalConditions}** |
| Tổng số kết luận | **${totalConclusions}** |

---

## Thống kê theo bệnh (Statistics by Disease)

| Bệnh | Mã | File | Số luật |
|------|-----|------|---------|
`;

for (const stat of diseaseStats) {
  markdown += `| ${stat.name} | ${stat.code} | ${stat.fileName} | ${stat.ruleCount} |\n`;
}

markdown += `\n---\n\n## Chi tiết từng bệnh (Disease Details)\n\n`;

let index = 1;
for (const stat of diseaseStats) {
  markdown += `### ${index}. ${stat.name} - ${stat.ruleCount} luật\n\n`;
  markdown += `| Nhóm luật | Số lượng |\n`;
  markdown += `|-----------|----------|\n`;

  const sortedGroups = Array.from(stat.ruleGroups.entries()).sort((a, b) => b[1] - a[1]);
  for (const [group, count] of sortedGroups) {
    markdown += `| ${group} | ${count} |\n`;
  }

  markdown += `\n`;
  index++;
}

markdown += `---\n\n## Thống kê theo nhóm luật (Statistics by Rule Group)\n\n`;
markdown += `| Nhóm luật | Số lượng | Tỷ lệ |\n`;
markdown += `|-----------|----------|-------|\n`;

for (const [group, count] of sortedRuleGroups) {
  const percentage = ((count / totalRules) * 100).toFixed(1);
  markdown += `| ${group} | ${count} | ${percentage}% |\n`;
}

markdown += `\n---\n\n## Thống kê toán tử (Operator Statistics)\n\n`;
markdown += `| Toán tử | Số lượng | Mô tả |\n`;
markdown += `|---------|----------|-------|\n`;

for (const [operator, count] of sortedOperators) {
  const description = operatorDescriptions[operator] || '';
  markdown += `| \`${operator}\` | ${count} | ${description} |\n`;
}

markdown += `\n---\n\n## Thống kê Concept (Concept Statistics)\n\n`;
markdown += `| Concept | Số lần sử dụng | Mô tả |\n`;
markdown += `|---------|----------------|-------|\n`;

for (const [concept, count] of sortedConcepts) {
  const description = conceptDescriptions[concept] || '';
  markdown += `| ${concept} | ${count} | ${description} |\n`;
}

markdown += `\n---\n\n## Phân loại nhóm luật (Rule Group Categories)\n\n`;
markdown += `### Chẩn đoán (Diagnosis)
- Chẩn đoán
- Chẩn đoán phân biệt
- Chẩn đoán thể bệnh
- Xác định chẩn đoán – WHO
- Nhận diện thương tổn – phân thể
- Xác định căn nguyên

### Điều trị (Treatment)
- Điều trị
- Điều trị triệu chứng
- Điều trị hỗ trợ
- Điều trị MDT
- Nguyên tắc điều trị
- Thủ thuật

### Đánh giá (Assessment)
- Đánh giá mức độ
- Yếu tố nguy cơ
- Nguyên nhân – nguy cơ – cơ chế lây

### Cảnh báo & Biến chứng (Warnings & Complications)
- Cảnh báo
- Cảnh báo an toàn
- Cảnh báo tương tác thuốc
- Cảnh báo tác dụng phụ
- Biến chứng
- Thần kinh – biến chứng

### Phòng bệnh & Tiên lượng (Prevention & Prognosis)
- Phòng bệnh
- Phòng ngừa/tái phát
- Tiên lượng
- Tiên lượng – phòng bệnh
- Tư vấn
- Tư vấn chăm sóc

---

## Biểu đồ phân bố (Distribution Charts)

### Luật theo bệnh
\`\`\`
`;

const maxBarLength = 20;
const maxRuleCount = Math.max(...diseaseStats.map(s => s.ruleCount));

for (const stat of diseaseStats) {
  const barLength = Math.round((stat.ruleCount / maxRuleCount) * maxBarLength);
  const bar = '█'.repeat(barLength);
  const percentage = ((stat.ruleCount / totalRules) * 100).toFixed(1);
  const name = stat.name.padEnd(15);
  markdown += `${name} ${bar} ${stat.ruleCount} (${percentage}%)\n`;
}

markdown += `\`\`\`

### Concept sử dụng nhiều nhất
\`\`\`
`;

const maxConceptCount = Math.max(...sortedConcepts.map(([, count]) => count));

for (const [concept, count] of sortedConcepts) {
  const barLength = Math.round((count / maxConceptCount) * maxBarLength);
  const bar = '█'.repeat(barLength);
  const name = concept.padEnd(24);
  markdown += `${name} ${bar} ${count}\n`;
}

markdown += `\`\`\`

---

*Tạo tự động bởi hệ thống - Medical Expert System*
`;

// Write to file
const outputPath = path.join(process.cwd(), 'RULES_STATISTICS.md');
fs.writeFileSync(outputPath, markdown, 'utf-8');

console.log('✅ Statistics generated successfully!');
console.log(`📊 Total diseases: ${diseaseStats.length}`);
console.log(`📊 Total rules: ${totalRules}`);
console.log(`📊 Total conditions: ${totalConditions}`);
console.log(`📊 Total conclusions: ${totalConclusions}`);
console.log(`📄 Output: ${outputPath}`);
