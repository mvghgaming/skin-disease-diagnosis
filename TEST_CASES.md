# Medical Expert System - Test Cases

Comprehensive test scenarios for the 3-disease diagnostic system.

**Total**: 15 test cases covering Chốc (7), Nhọt (3), Viêm Nang Lông (5)

---

## Test Case Matrix

| ID | Disease | Scenario | Severity | Rules Expected |
|----|---------|----------|----------|----------------|
| TC1 | Chốc | Typical with itching | Mild | 5/10 |
| TC2 | Chốc | Localized, low risk | Mild | 4/10 |
| TC3 | Chốc | Widespread + fever | Severe | 7/10 |
| TC4 | Chốc | With complications | Severe | 7/10 ⚠️ |
| TC5 | Chốc | Atypical (differential) | N/A | 2/10 |
| TC6 | Chốc | Minimal symptoms | Mild | 1/10 |
| TC7 | Chốc | Drug resistance | Severe | 7/10 |
| TC8 | Nhọt | Mild localized | Mild | 3/10 |
| TC9 | Nhọt | Facial (danger zone) | Severe | 4/10 ⚠️ |
| TC10 | Nhọt | Multiple + diabetes | Severe | 8/10 |
| TC11 | Viêm NL | Common mild | Mild | 6/15 |
| TC12 | Viêm NL | Pseudo (shaving) | Mild | 7/15 |
| TC13 | Viêm NL | Eosinophilic (HIV) | Moderate | 6-7/15 |
| TC14 | Viêm NL | Decalvans (scarring) | Severe | 5/15 ⚠️ |
| TC15 | Viêm NL | Differential vs Nhọt | N/A | 2-3 |

⚠️ = Critical/urgent case

---

## Chốc (Impetigo) Test Cases

### TC1: Typical Chốc with Itching

**Input**: Vesicle+crust (yellow-brown) on face, hot/humid environment, itching
**Expected**: Diagnosis "Chốc điển hình", local treatment 5-7 days, antihistamine
**Rules**: CHOC_1, CHOC_2, CHOC_3, CHOC_6, CHOC_9

### TC3: Widespread Chốc with Fever

**Input**: Yellow crust on face, poor hygiene, trauma, fever, pain, widespread
**Expected**: Systemic antibiotics 7-10 days, pain relief
**Rules**: CHOC_1, CHOC_2, CHOC_3, CHOC_4, CHOC_6, CHOC_7, CHOC_9

### TC4: Chốc with Complications ⚠️

**Input**: Yellow crust on leg, fever, malaise, systemic involvement
**Expected**: **Complication flag** = Acute post-streptococcal glomerulonephritis
**Rules**: CHOC_1-4, CHOC_6, CHOC_7, CHOC_10
**Note**: Critical warning should be visible in UI

### TC5: Atypical - Differential Diagnosis

**Input**: NO vesicles, red crust (not yellow-brown), trunk location
**Expected**: Differential list = [Herpes, Chàm, Viêm da tiết bã]
**Rules**: CHOC_5, CHOC_9 (only 2 rules fire)

### TC7: Drug Resistance

**Input**: Widespread + fever, but antibiotics "Không dùng được do kháng thuốc"
**Expected**: Alternative = Clindamycin
**Rules**: CHOC_1-4, CHOC_6, CHOC_7, CHOC_8

---

## Nhọt (Boils) Test Cases

### TC8: Mild Localized Boil

**Input**: Nodule+pustule on back, follicular area, pain, mild severity
**Expected**: Local antiseptic 5-7 days, Paracetamol
**Rules**: NHOT_1, NHOT_6, NHOT_9

### TC9: Facial Boil (Danger Zone) ⚠️

**Input**: Nodule+pustule on **face**, pain
**Expected**: **Severity auto-upgraded to Nặng**, systemic antibiotics 7-10 days
**Rules**: NHOT_1, NHOT_4, NHOT_7, NHOT_9
**Note**: Facial location triggers danger zone protocol

### TC10: Multiple Boils + Diabetes

**Input**: Multiple boils on buttocks, diabetes=Yes, poor hygiene, occlusive clothing
**Expected**: Severe, widespread, systemic antibiotics, drainage, follow-up
**Rules**: NHOT_1-3, NHOT_5, NHOT_7-10 (8 rules)
**Note**: High-risk patient requiring aggressive treatment

---

## Viêm Nang Lông (Folliculitis) Test Cases

### TC11: Common Folliculitis

**Input**: Pustules on back, follicular area, itching, no scar, mild
**Expected**: Local antiseptic + Fucidin/Mupirocin 7-10 days, antihistamine
**Rules**: FOL_1, FOL_7, FOL_8, FOL_9, FOL_10, FOL_15

### TC12: Pseudo-Folliculitis (Shaving)

**Input**: Pustules on **chin**, skin trauma (shaving), itching
**Expected**: Diagnosis = "Giả viêm nang lông", prevention advice (avoid close shaving)
**Rules**: FOL_1, FOL_2, FOL_7-10, FOL_15

### TC13: Eosinophilic Folliculitis (HIV)

**Input**: Pustules on chest, **immunosuppressed=Yes**, severe itching, moderate
**Expected**: Diagnosis = "Viêm nang lông tăng bạch cầu ái toan", systemic treatment may be needed
**Rules**: FOL_1, FOL_3, FOL_7-10, FOL_12/13
**Note**: HIV patient requires close monitoring

### TC14: Decalvans (Scarring Hair Loss) ⚠️

**Input**: Pustules on **scalp**, **scar=Yes**, pain, severe, deformity
**Expected**: Diagnosis = "Viêm nang lông Decalvans", systemic antibiotics, **urgent referral**
**Rules**: FOL_1, FOL_4, FOL_7, FOL_8, FOL_12
**Note**: Permanent hair loss - requires early aggressive treatment

### TC15: Differential - Folliculitis vs Boil

**Input**: Pustule + deep nodule, follicular area, severe pain
**Expected**: Could be either disease, differential list includes "Nhọt"
**Rules**: FOL_1, FOL_5, (possibly NHOT_1)
**Note**: Demonstrates overlapping symptoms

---

## Quick Reference

### Input Variables

| Category | Key Variables |
|----------|---------------|
| **Morphology** | vesicle_or_bulla, pustule, crust_color, nodule_or_abscess, scar |
| **Distribution** | main_location, follicular_area, number_of_lesions |
| **Risk** | hygiene_level, skin_trauma, hot_humid_environment, diabetes, immunosuppressed |
| **Systemic** | fever, pruritus, pain, malaise |
| **Severity** | extent_of_lesions, overall_severity, systemic_involvement |

### Common Patterns

**Chốc**: Yellow-brown crust + face/hands/legs
**Nhọt**: Deep nodule + pain + follicular area
**Viêm NL**: Pustules + follicular + itching (mild scar)

### Severity Indicators

- **Mild**: Localized, no systemic signs
- **Moderate**: Multiple lesions OR immunosuppressed
- **Severe**: Widespread OR facial OR diabetes OR fever OR complications

---

## Validation Checklist

### Functional
- [ ] All 35 rules can fire under appropriate conditions
- [ ] AND/OR logic works correctly
- [ ] Vietnamese text displays properly
- [ ] Session data persists

### UI
- [ ] Multi-step form navigation
- [ ] All input types render correctly
- [ ] Diagnosis results show all sections
- [ ] Fired rules are expandable

### API
- [ ] POST /api/diagnosis returns valid results
- [ ] GET /api/rules returns all 35 rules
- [ ] Database handles UTF-8 characters

### Edge Cases
- [ ] Empty input
- [ ] Conflicting symptoms
- [ ] Maximum differential diagnoses
- [ ] All symptoms = No

---

## Testing Instructions

### Manual Testing
```bash
# 1. Start server
pnpm run dev

# 2. Navigate to http://localhost:3000

# 3. Test each case:
- Click "Get Diagnosis"
- Enter symptoms per test case
- Verify expected results
- Check fired rules

# 4. Admin Dashboard:
- Click "Manage Rules"
- Verify all 35 rules appear
```

### Performance Benchmarks
- **Diagnosis API**: < 500ms
- **Rules List**: < 200ms
- **Page Load**: < 2s

---

## Critical Test Cases Summary

**Must Pass**:
1. **TC1** - Basic Chốc diagnosis
2. **TC4** - Complication detection ⚠️
3. **TC9** - Facial boil danger zone ⚠️
4. **TC10** - Diabetes high-risk scenario
5. **TC14** - Decalvans urgent case ⚠️

**Edge Cases**:
1. **TC5** - Differential when not matching
2. **TC7** - Drug resistance handling
3. **TC15** - Multi-disease overlap

---

**Document Version**: 2.0
**Last Updated**: 2025-12-13
**Diseases**: Chốc, Nhọt, Viêm Nang Lông
**Total Test Cases**: 15
