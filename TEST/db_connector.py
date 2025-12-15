# file: db_connector.py
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load chuỗi kết nối từ file .env
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Tạo kết nối đến Neon PostgreSQL"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Lỗi kết nối Database: {e}")
        return None

def fetch_patient_data(patient_id):
    """
    Truy vấn dữ liệu từ NHIỀU BẢNG trong Database
    và gom lại thành một Dictionary duy nhất cho Rule Engine.
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    patient_data = {}
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # 1. Lấy thông tin cơ bản
            cur.execute("SELECT * FROM PATIENT_INFO WHERE patient_id = %s", (patient_id,))
            patient_info = cur.fetchone()
            if not patient_info:
                print(f"Không tìm thấy bệnh nhân ID: {patient_id}")
                return None
            patient_data["PATIENT_INFO"] = dict(patient_info)

            # 2. Lấy hình thái tổn thương (SKIN_LESION_MORPHOLOGY)
            cur.execute("SELECT * FROM SKIN_LESION_MORPHOLOGY WHERE patient_id = %s", (patient_id,))
            morphology = cur.fetchone()
            # Postgres trả về list cho mảng, ta giữ nguyên hoặc convert nếu cần
            patient_data["SKIN_LESION_MORPHOLOGY"] = dict(morphology) if morphology else {}

            # 3. Lấy triệu chứng toàn thân (SYSTEMIC_AND_NEURO_SIGNS)
            cur.execute("SELECT * FROM SYSTEMIC_AND_NEURO_SIGNS WHERE patient_id = %s", (patient_id,))
            signs = cur.fetchone()
            patient_data["SYSTEMIC_AND_NEURO_SIGNS"] = dict(signs) if signs else {}

            # 4. Lấy xét nghiệm (LABORATORY_ASSESSMENT)
            cur.execute("SELECT * FROM LABORATORY_ASSESSMENT WHERE patient_id = %s", (patient_id,))
            lab = cur.fetchone()
            patient_data["LABORATORY_ASSESSMENT"] = dict(lab) if lab else {}

            # 5. Lấy mức độ nặng (SEVERITY_ASSESSMENT) - Cần cho luật đếm số lượng tổn thương
            cur.execute("SELECT * FROM SEVERITY_ASSESSMENT WHERE patient_id = %s", (patient_id,))
            severity = cur.fetchone()
            patient_data["SEVERITY_ASSESSMENT"] = dict(severity) if severity else {}
            
            # 6. Lấy phân bố tổn thương (LESION_DISTRIBUTION)
            cur.execute("SELECT * FROM LESION_DISTRIBUTION WHERE patient_id = %s", (patient_id,))
            dist = cur.fetchone()
            patient_data["LESION_DISTRIBUTION"] = dict(dist) if dist else {}

            # (Có thể thêm các bảng khác như RISK_FACTOR nếu luật yêu cầu)

    except Exception as e:
        print(f"❌ Lỗi khi lấy dữ liệu: {e}")
    finally:
        conn.close()
        
    return patient_data

def save_diagnosis_result(patient_id, diagnosis_result):
    """
    Lưu kết quả chẩn đoán từ Rule Engine ngược lại vào bảng DIAGNOSIS_ASSESSMENT
    """
    conn = get_db_connection()
    if not conn:
        return

    try:
        main_diagnosis = diagnosis_result.get("main_diagnosis")
        # Gom các cảnh báo thành chuỗi để lưu (nếu có)
        warnings = ", ".join(diagnosis_result.get("warnings", []))
        
        # Câu lệnh SQL UPDATE (hoặc INSERT nếu chưa có dòng nào)
        # Ở đây giả định dòng trong DIAGNOSIS_ASSESSMENT đã được tạo sẵn khi nhập liệu bệnh nhân
        # Nếu chưa, bạn cần dùng INSERT
        sql = """
            INSERT INTO DIAGNOSIS_ASSESSMENT (patient_id, main_diagnosis, complication_type)
            VALUES (%s, %s, %s)
            ON CONFLICT (id) DO UPDATE 
            SET main_diagnosis = EXCLUDED.main_diagnosis,
                complication_type = EXCLUDED.complication_type;
        """
        # Lưu ý: Do bảng DIAGNOSIS_ASSESSMENT dùng ID tự tăng làm PK, 
        # câu lệnh trên chỉ là ví dụ. Tốt nhất ta check xem đã có record chưa:
        
        with conn.cursor() as cur:
            # Kiểm tra xem đã có record chẩn đoán cho bệnh nhân này chưa
            cur.execute("SELECT id FROM DIAGNOSIS_ASSESSMENT WHERE patient_id = %s", (patient_id,))
            existing = cur.fetchone()
            
            if existing:
                update_sql = """
                    UPDATE DIAGNOSIS_ASSESSMENT 
                    SET main_diagnosis = %s, complication_type = %s
                    WHERE patient_id = %s
                """
                cur.execute(update_sql, (main_diagnosis, warnings, patient_id))
            else:
                insert_sql = """
                    INSERT INTO DIAGNOSIS_ASSESSMENT (patient_id, main_diagnosis, complication_type)
                    VALUES (%s, %s, %s)
                """
                cur.execute(insert_sql, (patient_id, main_diagnosis, warnings))
            
            conn.commit()
            print(f"✅ Đã lưu kết quả chẩn đoán cho bệnh nhân {patient_id} vào Neon DB!")

    except Exception as e:
        print(f"❌ Lỗi khi lưu kết quả: {e}")
    finally:
        conn.close()

# --- TEST THỬ KẾT NỐI ---
if __name__ == "__main__":
    conn = get_db_connection()
    if conn:
        print("✅ Kết nối Neon thành công!")
        conn.close()