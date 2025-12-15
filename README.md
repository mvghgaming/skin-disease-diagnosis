# Medical Expert System - Skin Disease Diagnosis

Rule-based expert system for diagnosing skin diseases using forward-chaining inference. Built with Next.js, TypeScript, and Neon PostgreSQL.

## Features

- 🏥 **7 Skin Diseases**: Chốc (Impetigo), Nhọt (Boils), Viêm Nang Lông (Folliculitis), Trứng Cá (Acne), Lao Da (TB), SSSS, Bệnh Phong (Leprosy)
- 📋 **99+ Clinical Rules**: Diagnosis, risk assessment, treatment, and complications
- 🧠 **Forward-Chaining Engine**: Processes AND/OR logic with nested conditions
- 🇻🇳 **Vietnamese Support**: Based on Vietnamese Ministry of Health guidelines

## Quick Start

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment (.env.local)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# 3. Run migrations
pnpm run migrate

# 4. Seed database
pnpm run seed

# 5. Start development
pnpm run dev
```

Visit http://localhost:3000

## How to Use

### 1. Get Diagnosis

1. Go to homepage → Click "Get Diagnosis"
2. Fill in patient symptoms (age, sex, skin lesions, etc.)
3. View diagnosis results with:
   - Main diagnosis & differential diagnoses
   - Treatment recommendations
   - Explanation of fired rules

### 2. View Test Cases

- Navigate to `/test` page to see all predefined test cases
- Each test case includes:
  - Patient information (age, sex)
  - Symptoms based on rule attributes
  - Expected diagnosis
- Test cases only use attributes defined in the rules

### 3. Admin Dashboard (Optional)

- Go to "Manage Rules" to view all rules and diseases
- See rule conditions, conclusions, and explanations
- Check diagnosis statistics

## Project Structure

```
cs217/
├── rules/                      # Disease rule files (JSON)
│   ├── rules_choc.json        # Chốc (10 rules)
│   ├── rule_nhot.json         # Nhọt (10 rules)
│   ├── rule_viemnanglong.json # Viêm Nang Lông (15 rules)
│   ├── rule_trungca.json      # Trứng Cá (10 rules)
│   ├── rule_laoda.json        # Lao Da (16 rules)
│   ├── rule_SSSS.json         # SSSS (17 rules)
│   └── rule_phong.json        # Bệnh Phong (21 rules)
├── testcases.json             # Test cases (20 scenarios)
├── concepts.json              # All available attributes
├── src/
│   ├── app/                   # Next.js pages & API routes
│   ├── components/            # React components
│   └── lib/                   # Database & inference engine
└── scripts/                   # Migration & seed scripts
```

## Test Cases Format

Test cases in `testcases.json` use this structure:

```json
{
  "name": "Test Case 1: Chốc",
  "description": "Trẻ em 5 tuổi với bọng nước...",
  "expectedDiagnosis": "Chốc",
  "symptoms": {
    "PATIENT_INFO.age (Tuổi)": "0-5",
    "PATIENT_INFO.sex (Giới tính)": "Nam",
    "SKIN_LESION_MORPHOLOGY.vesicle_or_bulla (Bọng nước/bóng nước nông)": true,
    ...
  }
}
```

**Important**:
- Only use attributes defined in `rules/*.json` files
- Include Vietnamese labels next to attribute names
- Custom patient attributes: age, sex, diabetes, immunosuppressed, HIV_status, pregnant, breastfeeding

## Adding New Rules

1. **Edit rule file** in `rules/` directory (e.g., `rule_nhot.json`)
2. **Follow this format**:
```json
{
  "id": "NHOT_11",
  "group": "Chẩn đoán",
  "description": "Rule description",
  "logic": "AND",
  "if": [
    {
      "concept": "SKIN_LESION_MORPHOLOGY",
      "attribute": "pustule",
      "operator": "=",
      "value": true
    }
  ],
  "then": [
    {
      "concept": "DIAGNOSIS_ASSESSMENT",
      "attribute": "main_diagnosis",
      "value": "Nhọt"
    }
  ],
  "explanation": "Clinical explanation in Vietnamese"
}
```
3. **Re-seed database**: `pnpm run seed`

## Available Operators

`=`, `!=`, `IN`, `NOT_IN`, `>`, `<`, `>=`, `<=`, `CONTAINS_ANY`, `IS_NOT_NULL`, `LIKE`

## Scripts

```bash
pnpm run dev      # Start development
pnpm run build    # Build for production
pnpm run migrate  # Run database migrations
pnpm run seed     # Seed database from JSON files
```

## Troubleshooting

**No rules showing?**
- Run `pnpm run seed`
- Check `DATABASE_URL` in `.env.local`

**Diagnosis errors?**
- Verify all symptom fields are filled
- Check browser console for errors

**Database connection issues?**
- Ensure `?sslmode=require` in connection string
- Verify Neon database is active

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Neon PostgreSQL
- **UI**: Radix UI components

## License

Educational purposes only.
