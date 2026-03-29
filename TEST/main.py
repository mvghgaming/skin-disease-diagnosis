import json
import os
import sys
import datetime
# Giả sử file db_connector.py nằm cùng thư mục
from db_connector import fetch_patient_data, save_diagnosis_result

def save_to_json_file(patient_id, diagnosis_result):
    """
    Lưu kết quả chẩn đoán ra file JSON vào thư mục 'results'
    Tên file: diagnosis_ID_YYYYMMDD_HHMMSS.json
    """
    # 1. Tạo thư mục chứa kết quả nếu chưa có
    folder = "results"
    if not os.path.exists(folder):
        os.makedirs(folder)

    # 2. Tạo tên file có timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{folder}/patient_{patient_id}_{timestamp}.json"

    # 3. Cấu trúc dữ liệu để lưu
    output_data = {
        "meta_data": {
            "patient_id": patient_id,
            "created_at": timestamp,
            "system_version": "1.0"
        },
        "diagnosis_result": diagnosis_result
    }

    # 4. Ghi file
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=4)
        print(f"📁 Đã xuất file JSON: {filename}")
    except Exception as e:
        print(f"❌ Lỗi khi ghi file JSON: {e}")

class RuleEngine:
    def __init__(self, rule_files):
        """
        Khởi tạo RuleEngine và tải tất cả các luật từ danh sách file.
        Xử lý linh hoạt cả 2 định dạng JSON (List hoặc Object).
        """
        self.rules = []
        print("\n📥 ĐANG TẢI CƠ SỞ TRI THỨC...")
        
        for file_path in rule_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        
                        # --- XỬ LÝ ĐA DẠNG CẤU TRÚC JSON ---
                        if isinstance(data, list):
                            current_rules = data
                        else:
                            current_rules = data.get('rules', [])
                        
                        self.rules.extend(current_rules)
                    print(f"  ✅ {file_path}: Đã tải {len(current_rules)} luật.")
                except Exception as e:
                    print(f"  ❌ {file_path}: Lỗi đọc file ({e})")
            else:
                print(f"  ⚠️ {file_path}: Không tìm thấy file.")
        
        print(f"🏁 TỔNG CỘNG: Đã tải {len(self.rules)} luật vào hệ thống.\n")

    def _get_value(self, concept, attribute, patient_data, current_results):
        """
        Hàm lấy giá trị THÔNG MINH (Cập nhật mới):
        1. Ưu tiên lấy từ KẾT QUẢ VỪA CHẨN ĐOÁN (Memory) để phục vụ luật tiếp theo.
        2. Nếu không có, mới lấy từ DỮ LIỆU GỐC (Database).
        """
        
        # --- 1. KIỂM TRA TRONG KẾT QUẢ VỪA TÍNH TOÁN (MEMORY) ---
        # Giúp luật sau (VD: Điều trị) nhìn thấy kết quả của luật trước (VD: Chẩn đoán)
        if concept == "DIAGNOSIS_ASSESSMENT":
            if attribute == "main_diagnosis" and current_results.get("main_diagnosis"):
                return current_results["main_diagnosis"]
            
            if attribute == "subtype" and current_results.get("subtype"):
                return current_results["subtype"]
                
            if attribute == "WHO_group" and current_results.get("WHO_group"):
                return current_results["WHO_group"]
                
            if attribute == "diagnostic_certainty" and current_results.get("diagnostic_certainty"):
                return current_results["diagnostic_certainty"]

        # --- 2. LẤY TỪ DỮ LIỆU DB (FALLBACK) ---
        return patient_data.get(concept, {}).get(attribute)

    def _evaluate_condition(self, condition, patient_data, current_results):
        """
        Đánh giá điều kiện, truyền thêm current_results để hỗ trợ suy diễn chuỗi.
        """
        
        # --- 1. XỬ LÝ LOGIC LỒNG NHAU (AND/OR) ---
        nested_rules = condition.get('sub_conditions') or condition.get('conditions')
        
        if nested_rules:
            logic = condition.get('logic', 'AND')
            # Đệ quy: Truyền tiếp current_results xuống dưới
            results = [self._evaluate_condition(sub, patient_data, current_results) for sub in nested_rules]
            
            if logic == 'AND':
                return all(results)
            elif logic == 'OR':
                return any(results)
            return False

        # --- 2. XỬ LÝ ĐIỀU KIỆN ĐƠN ---
        concept = condition.get('concept')
        attribute = condition.get('attribute')
        operator = condition.get('operator')
        target_value = condition.get('value')

        # GỌI HÀM LẤY GIÁ TRỊ MỚI (Memory -> DB)
        actual_value = self._get_value(concept, attribute, patient_data, current_results)

        # Xử lý các toán tử đặc biệt
        if operator == 'IS_NOT_NULL':
            return actual_value is not None and actual_value != ""
        if operator == 'IS_NULL':
            return actual_value is None or actual_value == ""

        if actual_value is None:
            return False

        # --- 3. SO KHỚP GIÁ TRỊ ---
        try:
            if operator == '=':
                return actual_value == target_value
            elif operator == '!=':
                return actual_value != target_value
            elif operator == '>':
                return actual_value > target_value
            elif operator == '>=':
                return actual_value >= target_value
            elif operator == '<':
                return actual_value < target_value
            elif operator == '<=':
                return actual_value <= target_value
            elif operator == 'IN':
                return actual_value in target_value
            elif operator == 'BETWEEN':
                if isinstance(target_value, list) and len(target_value) == 2:
                    return target_value[0] <= actual_value <= target_value[1]
                return False
            elif operator == 'CONTAINS_ANY':
                if isinstance(actual_value, list):
                    return any(item in actual_value for item in target_value)
                return actual_value in target_value
            elif operator == 'LIKE':
                if isinstance(target_value, str) and target_value.endswith('%'):
                    prefix = target_value.rstrip('%')
                    return str(actual_value).startswith(prefix)
                return str(actual_value) == str(target_value)
        except Exception as e:
            return False
        
        return False

    def diagnose(self, patient_data):
        """
        Chạy toàn bộ luật. Cập nhật kết quả ngay lập tức để luật sau thấy kết quả luật trước.
        """
        results = {
            "main_diagnosis": None,
            "subtype": None,
            "diagnostic_certainty": None,
            "WHO_group": None,
            "treatment_plan": [],
            "prevention_advice": [],
            "warnings": [],
            "rules_triggered": []
        }

        print("\n🔍 ĐANG PHÂN TÍCH DỮ LIỆU...")
        
        for rule in self.rules:
            rule_logic = rule.get('logic', 'AND')
            conditions = rule.get('if', [])
            
            # TRUYỀN `results` VÀO HÀM ĐÁNH GIÁ
            cond_results = [self._evaluate_condition(c, patient_data, results) for c in conditions]
            
            is_triggered = all(cond_results) if rule_logic == 'AND' else any(cond_results)

            if is_triggered:
                rule_id = rule.get('id', 'UNKNOWN')
                desc = rule.get('description', '')
                print(f"  👉 Kích hoạt: [{rule_id}] - {desc}")
                results["rules_triggered"].append(rule_id)
                
                # CẬP NHẬT NGAY VÀO `results` (MEMORY)
                for action in rule.get('then', []):
                    concept = action.get('concept')
                    attribute = action.get('attribute')
                    value = action.get('value')

                    if concept == "DIAGNOSIS_ASSESSMENT":
                        if attribute == "main_diagnosis":
                            results["main_diagnosis"] = value
                        elif attribute == "subtype":
                            results["subtype"] = value
                        elif attribute == "WHO_group":
                            results["WHO_group"] = value
                        elif attribute == "diagnostic_certainty":
                            results["diagnostic_certainty"] = value
                        elif attribute == "differential_list":
                            val_str = ", ".join(value) if isinstance(value, list) else value
                            results["warnings"].append(f"Chẩn đoán phân biệt: {val_str}")
                        elif attribute == "complication_type":
                            results["warnings"].append(f"Biến chứng: {value}")
                            
                    elif concept == "TREATMENT_PLAN":
                        if attribute == "prevention_advice":
                            results["prevention_advice"].append(value)
                        elif attribute in ["local_antiseptic", "topical_antibiotic", "systemic_antibiotic", 
                                         "pain_relief", "antipruritic", "acne_regimen", "regimen", "local_treatment"]:
                            val_str = ", ".join(value) if isinstance(value, list) else value
                            
                            label_map = {
                                "local_antiseptic": "Sát khuẩn tại chỗ",
                                "topical_antibiotic": "Kháng sinh bôi",
                                "systemic_antibiotic": "Kháng sinh uống",
                                "acne_regimen": "Phác đồ trứng cá",
                                "regimen": "Phác đồ đặc hiệu",
                                "pain_relief": "Giảm đau/Hồi sức",
                                "antipruritic": "Giảm ngứa"
                            }
                            label = label_map.get(attribute, attribute)
                            results["treatment_plan"].append(f"{label}: {val_str}")
                            
                        elif attribute == "treatment_duration":
                            results["treatment_plan"].append(f"Thời gian: {value}")

        return results

# --- HÀM MAIN (GIỮ NGUYÊN) ---
def main():
    print("==========================================")
    print("   HỆ THỐNG HỖ TRỢ CHẨN ĐOÁN DA LIỄU")
    print("   (Hỗ trợ: Nhọt, Chốc, Lao da, Phong,")
    print("    SSSS, Trứng cá, Viêm nang lông)")
    print("==========================================\n")

    # 1. Danh sách file luật - load from RULE folder next to this script
    rule_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'RULE')
    rule_files = [os.path.join(rule_dir, fname) for fname in [
        'rule_nhot.json',
        'rules_choc.json',
        'RULE_laoda.json',
        'rule_phong.json',
        'rule_trungca.json',
        'rule_viemnanglong.json',
        'rule_SSSS.json'
    ]]
    
    # Khởi tạo Engine
    engine = RuleEngine(rule_files)
    
    while True:
        # 2. Nhập ID
        try:
            input_str = input("\n🔹 Nhập ID Bệnh nhân (hoặc 'q' để thoát): ")
            if input_str.lower() == 'q':
                break
            target_patient_id = int(input_str)
        except ValueError:
            print("❌ ID phải là số nguyên.")
            continue

        # 3. Lấy dữ liệu
        print(f"📡 Đang tải dữ liệu bệnh nhân ID {target_patient_id}...")
        real_patient_data = fetch_patient_data(target_patient_id)

        if not real_patient_data:
            print("❌ Không tìm thấy dữ liệu. Vui lòng kiểm tra lại DB.")
            continue

        # 4. Chẩn đoán
        diagnosis_result = engine.diagnose(real_patient_data)

        # 5. Hiển thị kết quả
        print("\n" + "="*50)
        print(f"       KẾT QUẢ CHẨN ĐOÁN (ID: {target_patient_id})")
        print("="*50)
        
        main_diag = diagnosis_result.get("main_diagnosis")
        certainty = diagnosis_result.get("diagnostic_certainty")
        
        if main_diag or certainty:
            display_diag = main_diag if main_diag else "Chưa xác định"
            if certainty and certainty != main_diag:
                display_diag += f" ({certainty})"
            
            print(f"✅ CHẨN ĐOÁN:      {display_diag}")
            
            if diagnosis_result['subtype']:
                print(f"🔹 Thể bệnh:       {diagnosis_result['subtype']}")
            if diagnosis_result['WHO_group']:
                print(f"🔹 Phân nhóm WHO:  {diagnosis_result['WHO_group']}")
            
            if diagnosis_result['treatment_plan']:
                print("\n💊 PHÁC ĐỒ ĐIỀU TRỊ:")
                for item in diagnosis_result['treatment_plan']:
                    print(f"   • {item}")
            
            if diagnosis_result['prevention_advice']:
                print("\n💡 TƯ VẤN & DỰ PHÒNG:")
                for advice in diagnosis_result['prevention_advice']:
                    print(f"   • {advice}")

            if diagnosis_result['warnings']:
                print("\n⚠️ CẢNH BÁO / BIẾN CHỨNG:")
                for warn in diagnosis_result['warnings']:
                    print(f"   ! {warn}")
        else:
            print("⚪ Không đủ dữ liệu để đưa ra chẩn đoán với các luật hiện tại.")
            print("   (Kiểm tra lại triệu chứng đầu vào trong Database)")


        # --- LƯU TRỮ ---
        print("\n💾 Đang xử lý lưu trữ...")
        
        # 1. Lưu vào Database (Neon)
        save_diagnosis_result(target_patient_id, diagnosis_result)
        
        # 2. Lưu ra file JSON (Local) - ĐÃ THÊM MỚI
        save_to_json_file(target_patient_id, diagnosis_result)
        
        print("✅ Hoàn tất toàn bộ quy trình.")

if __name__ == "__main__":
    main()