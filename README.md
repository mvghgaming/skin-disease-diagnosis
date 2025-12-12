# Medical Expert System - Skin Disease Diagnosis

Rule-based expert system for diagnosing skin diseases using forward-chaining inference. Built with Next.js, TypeScript, and Neon PostgreSQL based on Vietnamese Ministry of Health guidelines.

## Features

- 🏥 **3 Skin Diseases**: Chốc (Impetigo), Nhọt (Boils), Viêm Nang Lông (Folliculitis)
- 📋 **35 Clinical Rules**: Diagnosis, risk assessment, and treatment recommendations
- 🧠 **Forward-Chaining Engine**: Processes AND/OR logic for intelligent inference
- 🇻🇳 **Vietnamese Support**: Full medical terminology in Vietnamese
- 📊 **Admin Dashboard**: View and manage diagnostic rules
- 🧪 **15 Test Cases**: Comprehensive validation scenarios

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

# 4. Seed database (loads 3 diseases, 35 rules)
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
│   ├── 1-choc.json           # Chốc (10 rules)
│   ├── 2-nhot.json           # Nhọt (10 rules)
│   └── 3-viem-nang-long.json # Viêm Nang Lông (15 rules)
├── chuong1-pdf/              # Source clinical PDFs
├── scripts/                  # Migration & seed scripts
└── TEST_CASES.md             # 15 test scenarios
```

## Diseases Coverage

| Disease | Vietnamese | Rules | Key Features |
|---------|-----------|-------|--------------|
| Impetigo | Chốc | 10 | Honey-colored crusts, localized/widespread |
| Boils | Nhọt | 10 | Facial danger zone, diabetes risk |
| Folliculitis | Viêm Nang Lông | 15 | 4 subtypes, scarring variants |

**Total**: 35 rules, 82 conditions, 58 conclusions

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

**Operators**: `=`, `!=`, `IN`, `NOT_IN`, `>`, `<`, `>=`, `<=`

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

See **`TEST_CASES.md`** for 15 comprehensive scenarios:

| Cases | Disease | Coverage |
|-------|---------|----------|
| TC 1-7 | Chốc | Typical, widespread, complications |
| TC 8-10 | Nhọt | Mild, facial, diabetic |
| TC 11-15 | Viêm Nang Lông | Common, pseudo, eosinophilic, decalvans |

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
- Verify all 3 JSON files exist in `rules/`
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

- **Version**: 0.1.0
- **Diseases**: 3
- **Rules**: 35 (82 conditions, 58 conclusions)
- **Test Cases**: 15
- **Language**: Vietnamese + English
- **Source**: Vietnamese Ministry of Health Guidelines

## Contributing

1. Add PDF documentation to `chuong1-pdf/`
2. Convert to JSON in `rules/`
3. Add test cases to `TEST_CASES.md`
4. Update seed script
5. Test with inference engine

## License

Educational purposes only.

## Support

- Review `TEST_CASES.md` for examples
- Check admin dashboard for status
- Verify all 3 JSON files are valid
- Test API endpoints: `/api/diagnosis`, `/api/rules`
