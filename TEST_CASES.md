# Test Cases - Hệ Thống Chẩn Đoán Bệnh Da

## Chốc (Impetigo)

### TC01: Chốc điển hình
**Input:**
- SKIN_LESION_MORPHOLOGY.vesicle_or_bulla = `true`
- SKIN_LESION_MORPHOLOGY.crust_presence = `true`
- SKIN_LESION_MORPHOLOGY.crust_color = `Vàng nâu`
- LESION_DISTRIBUTION.main_location = `Mặt`
- RISK_FACTOR_ASSESSMENT.hygiene_level = `Kém`

**Expected:** Chẩn đoán = "Chốc điển hình"

---

### TC02: Chốc lan rộng
**Input:**
- SKIN_LESION_MORPHOLOGY.vesicle_or_bulla = `true`
- SKIN_LESION_MORPHOLOGY.crust_color = `Vàng nâu`
- LESION_DISTRIBUTION.number_of_lesions = `Nhiều`
- SEVERITY_ASSESSMENT.extent_of_lesions = `Lan rộng`
- RISK_FACTOR_ASSESSMENT.hygiene_level = `Kém`

**Expected:** Chẩn đoán = "Chốc lan rộng", Điều trị tích cực hơn

---

### TC03: Chốc có biến chứng
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `Chốc`
- SYSTEMIC_AND_NEURO_SIGNS.fever = `true`
- SKIN_LESION_MORPHOLOGY.lymph_node = `Hạch vùng`
- SEVERITY_ASSESSMENT.systemic_involvement = `true`

**Expected:** Biến chứng = `true`, Kháng sinh toàn thân

---

## Nhọt (Boils/Furuncles)

### TC04: Nhọt nhẹ
**Input:**
- SKIN_LESION_MORPHOLOGY.nodule_or_abscess = `true`
- SKIN_LESION_MORPHOLOGY.pustule = `true`
- LESION_DISTRIBUTION.main_location = `Lưng`
- SYSTEMIC_AND_NEURO_SIGNS.fever = `false`
- SYSTEMIC_AND_NEURO_SIGNS.pain = `true`
- SEVERITY_ASSESSMENT.overall_severity = `Nhẹ`

**Expected:** Chẩn đoán = "Nhọt", Mức độ = "Nhẹ"

---

### TC05: Nhọt vùng nguy hiểm
**Input:**
- SKIN_LESION_MORPHOLOGY.nodule_or_abscess = `true`
- LESION_DISTRIBUTION.main_location = `Mũi` hoặc `Môi` hoặc `Mắt`
- PATIENT_INFO.diabetes = `true`
- SEVERITY_ASSESSMENT.overall_severity = `Nặng`

**Expected:** Cảnh báo vùng nguy hiểm, Nguy cơ cao

---

### TC06: Nhọt ở bệnh nhân đái tháo đường
**Input:**
- SKIN_LESION_MORPHOLOGY.nodule_or_abscess = `true`
- PATIENT_INFO.diabetes = `true`
- SEVERITY_ASSESSMENT.recurrent_infections = `true`
- RISK_FACTOR_ASSESSMENT.overall_infection_risk = `Cao`

**Expected:** Điều trị tích cực, Kiểm soát đường huyết

---

## Viêm Nang Lông (Folliculitis)

### TC07: Viêm nang lông thông thường
**Input:**
- SKIN_LESION_MORPHOLOGY.pustule = `true`
- LESION_DISTRIBUTION.follicular_area = `true`
- LESION_DISTRIBUTION.main_location = `Chân` hoặc `Tay`
- RISK_FACTOR_ASSESSMENT.hot_humid_environment = `true`
- SEVERITY_ASSESSMENT.overall_severity = `Nhẹ`

**Expected:** Chẩn đoán = "Viêm nang lông thông thường"

---

### TC08: Viêm nang lông giả mủ xanh
**Input:**
- SKIN_LESION_MORPHOLOGY.pustule = `true`
- LESION_DISTRIBUTION.follicular_area = `true`
- RISK_FACTOR_ASSESSMENT.hygiene_level = `Bể bơi/Jacuzzi`
- LABORATORY_ASSESSMENT.bacteria_test = `Pseudomonas`

**Expected:** Chẩn đoán = "Viêm nang lông giả mủ xanh"

---

### TC09: Viêm nang lông decalvans
**Input:**
- SKIN_LESION_MORPHOLOGY.pustule = `true`
- LESION_DISTRIBUTION.main_location = `Da đầu`
- SKIN_LESION_MORPHOLOGY.scar = `true`
- SYSTEMIC_AND_NEURO_SIGNS.hair_loss = `true`
- SEVERITY_ASSESSMENT.overall_severity = `Nặng`

**Expected:** Chẩn đoán = "Viêm nang lông decalvans"

---

## Trứng Cá (Acne)

### TC10: Trứng cá thông thường
**Input:**
- SKIN_LESION_MORPHOLOGY.comedones_present = `true`
- SKIN_LESION_MORPHOLOGY.pustule = `true`
- LESION_DISTRIBUTION.seborrheic_area = `true`
- LESION_DISTRIBUTION.main_location = `Mặt`
- PATIENT_INFO.age = `16`

**Expected:** Chẩn đoán = "Trứng cá thông thường"

---

### TC11: Trứng cá sơ sinh
**Input:**
- PATIENT_INFO.age = `0` (hoặc ≤ 1)
- SKIN_LESION_MORPHOLOGY.comedones_present = `true`
- LESION_DISTRIBUTION.main_location = `Tháp mũi` hoặc `Má` hoặc `Trán`

**Expected:** Chẩn đoán = "Trứng cá sơ sinh", Tự khỏi sau 5-7 ngày

---

### TC12: Cảnh báo Isotretinoin - Thai kỳ
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `Trứng cá%` (LIKE)
- TREATMENT_PLAN.acne_regimen = `%Isotretinoin%` (LIKE)
- PATIENT_INFO.pregnant = `true`

**Expected:** CHỐNG CHỈ ĐỊNH tuyệt đối Isotretinoin

---

### TC13: Cảnh báo Isotretinoin - Tuổi
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `Trứng cá%` (LIKE)
- TREATMENT_PLAN.acne_regimen = `%Isotretinoin%` (LIKE)
- PATIENT_INFO.age = `14` (< 16)

**Expected:** Không dùng Isotretinoin cho trẻ < 16 tuổi

---

### TC14: Cảnh báo tương tác thuốc
**Input:**
- TREATMENT_PLAN.acne_regimen = `%Isotretinoin%` (LIKE)
- TREATMENT_PLAN.systemic_antibiotic = `Doxycyclin` hoặc `Tetracyclin`

**Expected:** Cảnh báo nguy cơ tăng áp lực nội sọ

---

## Lao Da (Cutaneous TB)

### TC15: Lao da - Lupus vulgaris
**Input:**
- SKIN_LESION_MORPHOLOGY.tuberculous_plaque = `true`
- SKIN_LESION_MORPHOLOGY.visual_features = `Màu vàng đỏ, Ấn kính vàng nâu`
- LABORATORY_ASSESSMENT.tuberculin_test = `Dương tính`
- LABORATORY_ASSESSMENT.histopathology = `Nang lao điển hình`

**Expected:** Chẩn đoán = "Lupus vulgaris"

---

### TC16: Lao da - Scrofuloderma
**Input:**
- SKIN_LESION_MORPHOLOGY.ulceration = `true`
- SKIN_LESION_MORPHOLOGY.chronic_inflamation_features = `Đường hầm, Vỡ rò`
- SKIN_LESION_MORPHOLOGY.lymph_node = `Hạch toàn thân`
- SKIN_LESION_MORPHOLOGY.visual_features = `Mủ nhầy thối`

**Expected:** Chẩn đoán = "Scrofuloderma"

---

### TC17: Lao da ở bệnh nhân HIV
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `Lao da%` (LIKE)
- PATIENT_INFO.HIV_status = `true`

**Expected:** Thời gian điều trị = 9 tháng (thay vì 6 tháng)

---

## SSSS (Staphylococcal Scalded Skin Syndrome)

### TC18: SSSS điển hình
**Input:**
- PATIENT_INFO.age = `3` (< 5)
- SEVERITY_ASSESSMENT.systemic_involvement = `true`
- SKIN_LESION_MORPHOLOGY.exfoliative_erythema = `true`
- SKIN_LESION_MORPHOLOGY.crust_presence = `false`
- SKIN_LESION_MORPHOLOGY.vesicle_or_bulla = `true`

**Expected:** Chẩn đoán = "SSSS"

---

### TC19: SSSS - Phân biệt TEN
**Input:**
- SKIN_LESION_MORPHOLOGY.exfoliative_erythema = `true`
- SKIN_LESION_MORPHOLOGY.vesicle_or_bulla = `true`
- TREATMENT_PLAN.systemic_antibiotic = `Không đáp ứng`

**Expected:** Chẩn đoán phân biệt = "Hội chứng Lyell (TEN)"

---

### TC20: SSSS - MRSA
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `SSSS`
- LABORATORY_ASSESSMENT.other_myco_tests = `MRSA`

**Expected:** Điều trị = Vancomycin 7-14 ngày

---

## Bệnh Phong (Leprosy)

### TC21: Phong thể củ (T) - PB
**Input:**
- SKIN_LESION_MORPHOLOGY.plaque_type = `true`
- LESION_DISTRIBUTION.border_clarity = `Rõ`
- SYSTEMIC_AND_NEURO_SIGNS.center_sensation = `Mất` hoặc `Giảm`
- SEVERITY_ASSESSMENT.total_lesion_count = `3` (≤ 5)
- LABORATORY_ASSESSMENT.bacteriological_index = `0`

**Expected:** Thể = "Củ (T)", WHO = "PB (ít vi khuẩn)", MDT 6 tháng

---

### TC22: Phong thể u (L) - MB
**Input:**
- SKIN_LESION_MORPHOLOGY.diffuse_infiltration = `true`
- LESION_DISTRIBUTION.symmetry = `Đối xứng 2 bên`
- LESION_DISTRIBUTION.border_clarity = `Không rõ`
- SEVERITY_ASSESSMENT.total_lesion_count = `8` (> 5)
- LABORATORY_ASSESSMENT.bacteriological_index = `3` (> 0)

**Expected:** Thể = "U (L)", WHO = "MB (nhiều vi khuẩn)", MDT 12 tháng

---

### TC23: Phong - Phát hiện sớm
**Input:**
- DIAGNOSIS_ASSESSMENT.main_diagnosis = `Bệnh phong%` (LIKE)
- DIAGNOSIS_ASSESSMENT.early_detection = `true`
- TREATMENT_PLAN.MDT_completed_as_recommended = `true`

**Expected:** Tiên lượng = "Tốt, khỏi hoàn toàn hoặc ít di chứng"
