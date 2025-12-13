# Medical Expert System - Skin Disease Diagnosis

Rule-based expert system for diagnosing skin diseases using forward-chaining inference. Built with Next.js, TypeScript, and Neon PostgreSQL based on Vietnamese Ministry of Health guidelines.

## Features

- 🏥 **7 Skin Diseases**: Chốc (Impetigo), Nhọt (Boils), Viêm Nang Lông (Folliculitis), Trứng Cá (Acne), Lao Da (TB), SSSS, Bệnh Phong (Leprosy)
- 📋 **99 Clinical Rules**: Diagnosis, risk assessment, treatment recommendations, and complications
- 🧠 **Forward-Chaining Engine**: Processes AND/OR logic with nested conditions
- 🇻🇳 **Vietnamese Support**: Full medical terminology in Vietnamese based on MOH guidelines
- 📊 **Admin Dashboard**: View and manage diagnostic rules
- 🔬 **Advanced Operators**: Support for CONTAINS_ANY, IS_NOT_NULL, LIKE patterns

## Tech Stack

**Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
**Backend**: Next.js API Routes, Neon PostgreSQL (serverless)
**UI**: Radix UI components

## Quick Start

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database ([neon.tech](https://neon.tech))

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment (.env.local)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# 3. Run migrations
pnpm run migrate

# 4. Seed database (loads 7 diseases, 99 rules)
pnpm run seed

# 5. Start development server
pnpm run dev
```

Visit http://localhost:3000

## Project Structure

```
cs217/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   ├── components/             # React components
│   ├── lib/
│   │   ├── db/                # Database & migrations
│   │   ├── inference/         # Forward-chaining engine
│   │   └── seed/              # Seeding utilities
│   └── types/                 # TypeScript definitions
├── rules/                     # Disease rule files (JSON)
│   ├── rules_choc.json       # Chốc / Impetigo (10 rules)
│   ├── rule_nhot.json        # Nhọt / Boils (10 rules)
│   ├── rule_viemnanglong.json # Viêm Nang Lông / Folliculitis (15 rules)
│   ├── rule_trungca.json     # Trứng Cá / Acne (10 rules)
│   ├── RULE_laoda.json       # Lao Da / Cutaneous TB (16 rules)
│   ├── rule_SSSS.json        # SSSS (17 rules)
│   └── rule_phong.json       # Bệnh Phong / Leprosy (21 rules)
├── chuong1-pdf/              # Source clinical PDFs
├── scripts/                  # Migration & seed scripts
└── TEST_CASES.md             # 15 test scenarios
```

## Diseases Coverage

| Disease | Vietnamese | Rules | Key Features |
|---------|-----------|-------|--------------|
| Impetigo | Chốc | 10 | Honey-colored crusts, complications tracking |
| Boils | Nhọt | 10 | Facial danger zone, diabetes risk |
| Folliculitis | Viêm Nang Lông | 15 | 4 subtypes, scarring variants |
| Acne | Trứng Cá | 10 | Drug safety, age restrictions |
| Cutaneous TB | Lao Da | 16 | 7 TB types, treatment regimens |
| SSSS | SSSS | 17 | Differential diagnosis, severity grading |
| Leprosy | Bệnh Phong | 21 | WHO classification, MDT protocols |

**Total**: 99 rules covering comprehensive diagnosis, treatment, and safety protocols

## Usage

### Diagnosis Flow
1. Navigate to homepage → "Get Diagnosis"
2. Complete 5-step symptom form
3. Receive diagnosis with:
   - Main diagnosis & differential list
   - Risk assessment
   - Treatment recommendations
   - Fired rules with explanations

### Admin Dashboard
1. Homepage → "Manage Rules"
2. View statistics and all rules
3. Inspect conditions, conclusions, explanations

## Database Schema

**Core Tables**:
- `diseases` - Disease information
- `rules` - Rule metadata (name, category, logic)
- `conditions` - Rule IF conditions (variable, operator, value)
- `conclusions` - Rule THEN actions (variable, value)
- `diagnosis_sessions` - User diagnosis tracking
- `session_facts` - Working memory
- `fired_rules` - Audit trail

## Inference Engine

**Forward-Chaining Algorithm**:
1. Initialize working memory with symptoms
2. Sort rules by priority (diagnosis → risk → treatment)
3. Evaluate conditions (AND/OR logic)
4. Apply conclusions if satisfied
5. Repeat until no new rules fire

**Operators**: `=`, `!=`, `IN`, `NOT_IN`, `>`, `<`, `>=`, `<=`, `CONTAINS_ANY`, `IS_NOT_NULL`, `LIKE`

## API Endpoints

### Diagnosis
- `POST /api/diagnosis` - Submit symptoms, get diagnosis
- `GET /api/sessions` - List diagnosis sessions

### Rules Management
- `GET /api/rules` - List all rules
- `GET /api/rules/[id]` - Get specific rule
- `POST /api/rules` - Create rule
- `PUT /api/rules/[id]` - Update rule
- `DELETE /api/rules/[id]` - Delete rule

### Diseases
- `GET /api/diseases` - List diseases
- `POST /api/diseases` - Create disease

## Adding New Diseases

1. **Create JSON** in `rules/` directory:
```json
{
  "disease": "Disease Name",
  "description": "Description",
  "rules": [
    {
      "rule_id": "DISEASE_1",
      "rule_name": "Rule name",
      "category": "Chẩn đoán",
      "conditions": { "Variable.name": "value" },
      "actions": { "DiagnosisAssessment.result": "value" },
      "explanation": "Clinical explanation"
    }
  ]
}
```

2. **Update seed script** (`scripts/seed.ts`):
```typescript
const diseases = [
  { file: '1-choc.json', id: 'CHOC' },
  { file: '2-nhot.json', id: 'NHOT' },
  { file: '3-viem-nang-long.json', id: 'FOL' },
  { file: '4-new-disease.json', id: 'NEW' } // Add here
];
```

3. **Run seed**: `pnpm run seed`

## Test Cases

The system includes comprehensive test scenarios covering all 7 diseases with various presentations, complications, and treatment pathways.

## Scripts

```bash
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server
pnpm run migrate  # Run database migrations
pnpm run seed     # Seed database from JSON
```

## Troubleshooting

**Database Issues**
- Verify `DATABASE_URL` in `.env.local`
- Ensure `?sslmode=require` in connection string
- Check Neon dashboard for connectivity

**No Rules Showing**
- Run `pnpm run seed`
- Verify all 7 JSON files exist in `rules/`
- Check admin dashboard for seeding status

**Diagnosis Errors**
- Ensure rules are seeded successfully
- Check browser console for API errors
- Verify all required symptom fields filled

## Example Test

**Input** (Typical Impetigo):
- Vesicle/Bulla: Yes
- Crust Color: Vàng nâu (honey-yellow)
- Location: Mặt (face)
- Hygiene: Kém (poor)
- Fever: No, Itching: Yes

**Expected Output**:
- Diagnosis: "Chốc điển hình"
- Treatment: Local antiseptic + topical antibiotic
- Duration: 5-7 days
- Rules fired: CHOC_1, CHOC_2, CHOC_3, CHOC_4, CHOC_6, CHOC_9

## Project Info

- **Version**: 0.2.0
- **Diseases**: 7
- **Rules**: 99
- **Language**: Vietnamese + English
- **Source**: Vietnamese Ministry of Health Guidelines
- **Database**: Neon PostgreSQL (serverless)
- **Operators**: 11 comparison operators including pattern matching

## Contributing

1. Add clinical documentation to `chuong1-pdf/`
2. Convert to JSON format in `rules/` (use concept/attribute structure)
3. Update seed script with new disease
4. Test rules with inference engine
5. Validate all operators work correctly

## License

Educational purposes only.

## Support

- Check admin dashboard for status
- Verify all 7 JSON files are valid
- Test API endpoints: `/api/diagnosis`, `/api/rules`
- Review ER_Diagram.md for database structure
- See concepts.json for all available attributes
