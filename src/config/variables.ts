export interface VariableDefinition {
  label_vi: string;
  label_en: string;
  type: 'boolean' | 'string' | 'number' | 'array';
  enum?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface VariableNamespace {
  namespace: string;
  label_vi: string;
  label_en: string;
  variables: {
    [key: string]: VariableDefinition;
  };
}

// Auto-generated from concepts.json
export const VARIABLE_SCHEMAS: VariableNamespace[] = [
  {
    namespace: 'PATIENT_INFO',
    label_vi: 'Thông tin nền của bệnh nhân',
    label_en: 'PATIENT INFO',
    variables: {
      'age': {
        label_vi: 'Tuổi',
        label_en: 'age',
        type: 'string'
        ,enum: ["0-5","6-12","13-18","19-30","31-50","51-70","71+"]
      },
      'sex': {
        label_vi: 'Giới tính',
        label_en: 'sex',
        type: 'string'
        ,enum: ["Nam","Nữ"]
      },
      'diabetes': {
        label_vi: 'Có đái tháo đường',
        label_en: 'diabetes',
        type: 'boolean'
      },
      'immunosuppressed': {
        label_vi: 'Suy giảm miễn dịch',
        label_en: 'immunosuppressed',
        type: 'boolean'
      },
      'onset_duration': {
        label_vi: 'Thời gian tiến triển tổn thương',
        label_en: 'onset duration',
        type: 'string'
        ,enum: ["< 1 tuần","1-2 tuần","2-4 tuần","1-3 tháng","3-6 tháng","> 6 tháng","Khởi phát nhanh sau tiếp xúc nhiệt"]
      },
      'pregnant': {
        label_vi: 'Đang mang thai',
        label_en: 'pregnant',
        type: 'boolean'
      },
      'breastfeeding': {
        label_vi: 'Đang cho con bú',
        label_en: 'breastfeeding',
        type: 'boolean'
      },
      'HIV_status': {
        label_vi: 'Có HIV hay không',
        label_en: 'HIV status',
        type: 'boolean'
      },
    }
  },
  {
    namespace: 'RISK_FACTOR_ASSESSMENT',
    label_vi: 'Đánh giá yếu tố nguy cơ',
    label_en: 'RISK FACTOR ASSESSMENT',
    variables: {
      'hygiene_level': {
        label_vi: 'Mức độ vệ sinh da',
        label_en: 'hygiene level',
        type: 'string'
        ,enum: ["Tốt","Trung bình","Kém"]
      },
      'skin_trauma': {
        label_vi: 'Tổn thương da sẵn (trầy xước, cào gãi…)',
        label_en: 'skin trauma',
        type: 'boolean'
      },
      'hot_humid_environment': {
        label_vi: 'Sống/làm việc nơi nóng ẩm',
        label_en: 'hot humid environment',
        type: 'boolean'
      },
      'occlusive_clothing': {
        label_vi: 'Quần áo bó, không thoáng',
        label_en: 'occlusive clothing',
        type: 'boolean'
      },
      'hyperhidrosis': {
        label_vi: 'Tăng tiết mồ hôi',
        label_en: 'hyperhidrosis',
        type: 'boolean'
      },
      'close_contact_tb_leprosy': {
        label_vi: 'Tiếp xúc gần, kéo dài với bệnh nhân lao da/phong',
        label_en: 'close contact tb leprosy',
        type: 'boolean'
      },
      'mycobacteria_cross_immunity': {
        label_vi: 'Miễn dịch chéo với Mycobacterium khác',
        label_en: 'mycobacteria cross immunity',
        type: 'boolean'
      },
      'acne_inducing_drug_history': {
        label_vi: 'Tiền sử dùng thuốc gây trứng cá',
        label_en: 'acne inducing drug history',
        type: 'string'
        ,enum: ["Không","Corticoid","Androgen","Lithium","Isoniazid","Halogen","Khác"]
      },
      'time_from_exposure_to_symptoms_in_years': {
        label_vi: 'Thời gian (năm) từ lúc phơi nhiễm đến khi xuất hiện triệu chứng',
        label_en: 'time from exposure to symptoms in years',
        type: 'string'
        ,enum: ["< 1 năm","1-2 năm","2-5 năm","5-10 năm","> 10 năm"]
      },
    }
  },
  {
    namespace: 'SKIN_LESION_MORPHOLOGY',
    label_vi: 'Hình thái tổn thương da chi tiết',
    label_en: 'SKIN LESION MORPHOLOGY',
    variables: {
      'vesicle_or_bulla': {
        label_vi: 'Bọng nước/bóng nước nông',
        label_en: 'vesicle or bulla',
        type: 'boolean'
      },
      'crust_presence': {
        label_vi: 'Có vảy, đóng mày',
        label_en: 'crust presence',
        type: 'boolean'
      },
      'crust_color': {
        label_vi: 'Màu vảy',
        label_en: 'crust color',
        type: 'string'
        ,enum: ["Vàng nâu","Nâu đen","Đỏ","Trắng","Xanh lục"]
      },
      'pustule': {
        label_vi: 'Mụn mủ (viêm nang lông, trứng cá, nhọt…)',
        label_en: 'pustule',
        type: 'boolean'
      },
      'nodule_or_abscess': {
        label_vi: 'Nốt viêm, ổ mủ sâu',
        label_en: 'nodule or abscess',
        type: 'boolean'
      },
      'exfoliative_erythema': {
        label_vi: 'Ban đỏ bong vảy lan tỏa',
        label_en: 'exfoliative erythema',
        type: 'boolean'
      },
      'scar': {
        label_vi: 'Sẹo',
        label_en: 'scar',
        type: 'boolean'
      },
      'comedones_present': {
        label_vi: 'Có mụn đầu đen/đầu trắng/mụn cám',
        label_en: 'comedones present',
        type: 'boolean'
      },
      'ulceration': {
        label_vi: 'Có loét',
        label_en: 'ulceration',
        type: 'boolean'
      },
      'primary_lesion': {
        label_vi: 'Loại tổn thương chính (vết loét, củ lao, mảng sùi…)',
        label_en: 'primary lesion',
        type: 'string'
        ,enum: ["Vết loét","Củ lao","Mảng sùi","Nốt","Nốt dưới da","Áp xe lạnh","Sẩn","Cục dưới da","Bọng nước","Mụn mủ","Ban đỏ","Dát nhạt màu"]
      },
      'visual_features': {
        label_vi: 'Hình ảnh gợi ý: màu vàng đỏ, ấn kính vàng nâu, đỏ tím, mủ nhầy thối…',
        label_en: 'visual features',
        type: 'array'
        ,enum: ["Màu vàng đỏ","Ấn kính vàng nâu","Đỏ tím","Mủ nhầy thối","Bề mặt bóng","Viền đỏ","Vỡ rò dịch","Tạo đường hầm","Hoại tử ở giữa","Sẹo lõm","Đau khi sờ nắn","Mềm ở giữa"]
      },
      'patch_type': {
        label_vi: 'Có dát nhạt màu (thể I – phong)',
        label_en: 'patch type',
        type: 'boolean'
      },
      'patch_color': {
        label_vi: 'Màu dát',
        label_en: 'patch color',
        type: 'string'
        ,enum: ["Nhạt màu","Đỏ","Nâu","Trắng","Thâm","Hồng nhạt"]
      },
      'plaque_type': {
        label_vi: 'Có mảng/củ ranh giới rõ (thể T)',
        label_en: 'plaque type',
        type: 'boolean'
      },
      'diffuse_infiltration': {
        label_vi: 'Thâm nhiễm lan tỏa đối xứng hai bên (thể L)',
        label_en: 'diffuse infiltration',
        type: 'boolean'
      },
      'borderline_features_between_T_and_L': {
        label_vi: 'Đặc điểm trung gian giữa thể T và L',
        label_en: 'borderline features between T and L',
        type: 'boolean'
      },
      'erythema': {
        label_vi: 'Có ban đỏ',
        label_en: 'erythema',
        type: 'boolean'
      },
    }
  },
  {
    namespace: 'LESION_DISTRIBUTION',
    label_vi: 'Vị trí và phân bố tổn thương da',
    label_en: 'LESION DISTRIBUTION',
    variables: {
      'main_location': {
        label_vi: 'Vị trí chính (mặt, tay, chân…)',
        label_en: 'main location',
        type: 'string'
        ,enum: ["Mặt","Trán","Má","Cằm","Ngực","Lưng","Lưng trên","Bụng","Tay","Cánh tay","Chân","Cẳng chân","Mông","Cổ","Da đầu","Toàn thân","Mũi","Tai","Môi trên","Miệng","Hậu môn","Sinh dục","Mu bàn tay","Mu bàn chân","Cẳng tay","Vai","Cổ dưới hàm","Xương đòn","Tháp mũi"]
      },
      'typical_for_disease': {
        label_vi: 'Vị trí có điển hình cho bệnh đó không',
        label_en: 'typical for disease',
        type: 'boolean'
      },
      'follicular_area': {
        label_vi: 'Vùng quanh nang lông',
        label_en: 'follicular area',
        type: 'boolean'
      },
      'number_of_lesions': {
        label_vi: 'Ít/nhiều/rải rác/lan tỏa',
        label_en: 'number of lesions',
        type: 'string'
        ,enum: ["Đơn độc","Ít (2-5)","Nhiều","Nhiều (6-20)","Rải rác (>20)","Lan tỏa"]
      },
      'border_clarity': {
        label_vi: 'Ranh giới tổn thương (rõ/không rõ)',
        label_en: 'border clarity',
        type: 'string'
        ,enum: ["Rõ","Không rõ","Một phần rõ"]
      },
      'symmetry': {
        label_vi: 'Kiểu phân bố (đối xứng, lệch bên…)',
        label_en: 'symmetry',
        type: 'string'
        ,enum: ["Đối xứng","Đối xứng 2 bên","Lệch bên trái","Lệch bên phải","Không đối xứng"]
      },
    }
  },
  {
    namespace: 'SYSTEMIC_AND_NEURO_SIGNS',
    label_vi: 'Triệu chứng toàn thân và thần kinh',
    label_en: 'SYSTEMIC AND NEURO SIGNS',
    variables: {
      'fever': {
        label_vi: 'Có sốt',
        label_en: 'fever',
        type: 'boolean'
      },
      'pain': {
        label_vi: 'Đau vùng tổn thương',
        label_en: 'pain',
        type: 'boolean'
      },
      'pruritus': {
        label_vi: 'Ngứa',
        label_en: 'pruritus',
        type: 'boolean'
      },
      'malaise': {
        label_vi: 'Mệt mỏi, suy nhược',
        label_en: 'malaise',
        type: 'boolean'
      },
      'center_sensation': {
        label_vi: 'Cảm giác tại trung tâm tổn thương',
        label_en: 'center sensation',
        type: 'string'
        ,enum: ["Bình thường","Giảm","Mất","Mất hoàn toàn","Mất hoặc giảm","Tăng"]
      },
      'temperature_or_pain_sensation_loss_on_lesion': {
        label_vi: 'Mất cảm giác nóng/lạnh/đau tại tổn thương',
        label_en: 'temperature or pain sensation loss on lesion',
        type: 'boolean'
      },
      'enlarged_painful_nerves': {
        label_vi: 'Dây thần kinh ngoại biên phì đại/ấn đau',
        label_en: 'enlarged painful nerves',
        type: 'boolean'
      },
    }
  },
  {
    namespace: 'LABORATORY_ASSESSMENT',
    label_vi: 'Kết quả cận lâm sàng, xét nghiệm',
    label_en: 'LABORATORY ASSESSMENT',
    variables: {
      'other_myco_tests': {
        label_vi: 'Các xét nghiệm khác về vi khuẩn',
        label_en: 'other myco tests',
        type: 'string'
        ,enum: ["Không","PCR","Cấy vi khuẩn","Xét nghiệm phân tử","Tụ cầu vàng","MSSA","MRSA","Khác"]
      },
      'inflammatory_markers': {
        label_vi: 'Chỉ số viêm (bạch cầu, CRP…)',
        label_en: 'inflammatory markers',
        type: 'string'
        ,enum: ["Bình thường","Tăng nhẹ","Tăng trung bình","Tăng cao","Nghi nhiễm khuẩn tụ cầu","Độc tố ETA/ETB","Không có vi khuẩn"]
      },
      'bacteria_test': {
        label_vi: 'Test vi khuẩn lao/bệnh phẩm khác',
        label_en: 'bacteria test',
        type: 'string'
        ,enum: ["Âm tính","Dương tính","Chưa làm"]
      },
      'tuberculin_test': {
        label_vi: 'Kết quả test Tuberculin/Mantoux',
        label_en: 'tuberculin test',
        type: 'string'
        ,enum: ["Âm tính","Dương tính","Dương tính yếu","Dương tính mạnh","Chưa làm"]
      },
      'histopathology': {
        label_vi: 'Mô bệnh học: nang lao điển hình/không điển hình…',
        label_en: 'histopathology',
        type: 'string'
        ,enum: ["Bình thường","Nang điển hình","Nang lao điển hình","Nang lao không điển hình","Viêm mạn tính","Chưa làm"]
      },
      'leprosy_bacilloscopy_result': {
        label_vi: 'Kết quả soi trực khuẩn phong',
        label_en: 'leprosy bacilloscopy result',
        type: 'string'
        ,enum: ["Âm tính","Dương tính","Dương tính (+)","Dương tính (++)","Dương tính (+++)","Chưa làm"]
      },
      'leprosy_Ziehl_Neelsen_smear': {
        label_vi: 'Nhuộm Ziehl–Neelsen tìm M. leprae',
        label_en: 'leprosy Ziehl Neelsen smear',
        type: 'string'
        ,enum: ["Âm tính","Dương tính","Chưa làm"]
      },
      'bacteriological_index': {
        label_vi: 'Chỉ số BI (0–6)',
        label_en: 'bacteriological index',
        type: 'string'
        ,enum: ["0","1","2","3","4","5","6"]
      },
    }
  },
  {
    namespace: 'SEVERITY_ASSESSMENT',
    label_vi: 'Đánh giá mức độ nặng',
    label_en: 'SEVERITY ASSESSMENT',
    variables: {
      'extent_of_lesions': {
        label_vi: 'Phạm vi tổn thương',
        label_en: 'extent of lesions',
        type: 'string'
        ,enum: ["Khu trú","Lan rộng","Toàn thân"]
      },
      'systemic_involvement': {
        label_vi: 'Có biểu hiện toàn thân',
        label_en: 'systemic involvement',
        type: 'boolean'
      },
      'overall_severity': {
        label_vi: 'Mức độ chung: nhẹ/trung bình/nặng',
        label_en: 'overall severity',
        type: 'string'
        ,enum: ["Nhẹ","Trung bình","Nặng"]
      },
      'total_lesion_count': {
        label_vi: 'Tổng mọi loại tổn thương',
        label_en: 'total lesion count',
        type: 'string'
        ,enum: ["0","1-5","6-10","11-20","21-50",">50"]
      },
      'recurrent_infections': {
        label_vi: 'Nhiễm trùng tái phát nhiều lần',
        label_en: 'recurrent infections',
        type: 'boolean'
      },
      'M_leprae_doubling_time': {
        label_vi: 'Tốc độ nhân đôi của M. leprae',
        label_en: 'M leprae doubling time',
        type: 'string'
        ,enum: ["Rất chậm","Chậm","Trung bình","Nhanh"]
      },
      'muscle_atrophy_or_deformity_of_limbs': {
        label_vi: 'Teo cơ hoặc biến dạng chi do phong',
        label_en: 'muscle atrophy or deformity of limbs',
        type: 'boolean'
      },
    }
  },
];

// Helper functions for working with variables
export function getVariableSchema(variable: string): VariableDefinition | null {
  const [namespace, fieldName] = variable.split('.');
  const namespaceSchema = VARIABLE_SCHEMAS.find(ns => ns.namespace === namespace);
  if (!namespaceSchema) return null;
  return namespaceSchema.variables[fieldName] || null;
}

export function getVariableNamespace(variable: string): VariableNamespace | null {
  const [namespace] = variable.split('.');
  return VARIABLE_SCHEMAS.find(ns => ns.namespace === namespace) || null;
}

export function getAllVariables(): string[] {
  const variables: string[] = [];
  VARIABLE_SCHEMAS.forEach(namespace => {
    Object.keys(namespace.variables).forEach(fieldName => {
      variables.push(`${namespace.namespace}.${fieldName}`);
    });
  });
  return variables;
}

export function validateVariableValue(variable: string, value: any): boolean {
  const schema = getVariableSchema(variable);
  if (!schema) return false;

  if (schema.type === 'boolean' && typeof value !== 'boolean') return false;
  if (schema.type === 'string' && typeof value !== 'string') return false;
  if (schema.type === 'number' && typeof value !== 'number') return false;
  if (schema.type === 'array' && !Array.isArray(value)) return false;

  if (schema.enum && schema.type === 'string') {
    return schema.enum.includes(value);
  }

  if (schema.type === 'number' && schema.validation) {
    if (schema.validation.min !== undefined && value < schema.validation.min) return false;
    if (schema.validation.max !== undefined && value > schema.validation.max) return false;
  }

  return true;
}

// Get input namespaces (for user symptom input)
export function getInputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    !['DIAGNOSIS_ASSESSMENT', 'TREATMENT_PLAN'].includes(ns.namespace)
  );
}

// Get output namespaces (for diagnosis results)
export function getOutputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    ['DIAGNOSIS_ASSESSMENT', 'TREATMENT_PLAN'].includes(ns.namespace)
  );
}
