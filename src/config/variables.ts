export interface VariableDefinition {
  label_vi: string;
  label_en: string;
  type: 'boolean' | 'string' | 'number' | 'array';
  enum?: string[];  // For select dropdowns
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

// Variable schemas based on choc.json structure
export const VARIABLE_SCHEMAS: VariableNamespace[] = [
  {
    namespace: 'SkinLesionMorphology',
    label_vi: 'Hình thái tổn thương da',
    label_en: 'Skin Lesion Morphology',
    variables: {
      'vesicle_or_bulla': {
        label_vi: 'Bóng nước/bọng nước',
        label_en: 'Vesicle or Bulla',
        type: 'boolean'
      },
      'crust_presence': {
        label_vi: 'Có vảy/vỏ',
        label_en: 'Crust Presence',
        type: 'boolean'
      },
      'crust_color': {
        label_vi: 'Màu vảy',
        label_en: 'Crust Color',
        type: 'string',
        enum: ['Vàng nâu', 'Đỏ', 'Đen', 'Trắng', 'Khác']
      }
    }
  },
  {
    namespace: 'LesionDistribution',
    label_vi: 'Phân bố tổn thương',
    label_en: 'Lesion Distribution',
    variables: {
      'main_location': {
        label_vi: 'Vị trí chính',
        label_en: 'Main Location',
        type: 'string',
        enum: ['Mặt', 'Tay', 'Chân', 'Thân', 'Đầu', 'Khác']
      },
      'typical_for_disease': {
        label_vi: 'Vị trí điển hình cho bệnh',
        label_en: 'Typical for Disease',
        type: 'boolean'
      }
    }
  },
  {
    namespace: 'RiskFactorAssessment',
    label_vi: 'Đánh giá yếu tố nguy cơ',
    label_en: 'Risk Factor Assessment',
    variables: {
      'hygiene_level': {
        label_vi: 'Mức độ vệ sinh',
        label_en: 'Hygiene Level',
        type: 'string',
        enum: ['Tốt', 'Trung bình', 'Kém']
      },
      'skin_trauma': {
        label_vi: 'Chấn thương da',
        label_en: 'Skin Trauma',
        type: 'boolean'
      },
      'hot_humid_environment': {
        label_vi: 'Môi trường nóng ẩm',
        label_en: 'Hot Humid Environment',
        type: 'boolean'
      },
      'overall_infection_risk': {
        label_vi: 'Nguy cơ nhiễm trùng tổng thể',
        label_en: 'Overall Infection Risk',
        type: 'string',
        enum: ['Thấp', 'Trung bình', 'Tăng', 'Cao']
      }
    }
  },
  {
    namespace: 'SystemicAndNeurologicSigns',
    label_vi: 'Dấu hiệu toàn thân và thần kinh',
    label_en: 'Systemic and Neurologic Signs',
    variables: {
      'fever': {
        label_vi: 'Sốt',
        label_en: 'Fever',
        type: 'boolean'
      },
      'pruritus': {
        label_vi: 'Ngứa',
        label_en: 'Pruritus',
        type: 'boolean'
      },
      'pain': {
        label_vi: 'Đau',
        label_en: 'Pain',
        type: 'boolean'
      },
      'malaise': {
        label_vi: 'Mệt mỏi/khó chịu',
        label_en: 'Malaise',
        type: 'boolean'
      }
    }
  },
  {
    namespace: 'SeverityAssessment',
    label_vi: 'Đánh giá mức độ nghiêm trọng',
    label_en: 'Severity Assessment',
    variables: {
      'extent_of_lesions': {
        label_vi: 'Phạm vi tổn thương',
        label_en: 'Extent of Lesions',
        type: 'string',
        enum: ['Khu trú', 'Lan rộng', 'Toàn thân']
      },
      'systemic_involvement': {
        label_vi: 'Ảnh hưởng toàn thân',
        label_en: 'Systemic Involvement',
        type: 'boolean'
      }
    }
  },
  {
    namespace: 'DiagnosisAssessment',
    label_vi: 'Đánh giá chẩn đoán',
    label_en: 'Diagnosis Assessment',
    variables: {
      'main_diagnosis': {
        label_vi: 'Chẩn đoán chính',
        label_en: 'Main Diagnosis',
        type: 'string'
      },
      'differential_list': {
        label_vi: 'Danh sách chẩn đoán phân biệt',
        label_en: 'Differential Diagnosis List',
        type: 'array'
      },
      'complication_flag': {
        label_vi: 'Cờ biến chứng',
        label_en: 'Complication Flag',
        type: 'boolean'
      },
      'complication_type': {
        label_vi: 'Loại biến chứng',
        label_en: 'Complication Type',
        type: 'string'
      }
    }
  },
  {
    namespace: 'TreatmentPlan',
    label_vi: 'Kế hoạch điều trị',
    label_en: 'Treatment Plan',
    variables: {
      'local_antiseptic': {
        label_vi: 'Sát trùng tại chỗ',
        label_en: 'Local Antiseptic',
        type: 'array'
      },
      'topical_antibiotic': {
        label_vi: 'Kháng sinh bôi',
        label_en: 'Topical Antibiotic',
        type: 'string'
      },
      'systemic_antibiotic': {
        label_vi: 'Kháng sinh toàn thân',
        label_en: 'Systemic Antibiotic',
        type: 'string'
      },
      'treatment_duration': {
        label_vi: 'Thời gian điều trị',
        label_en: 'Treatment Duration',
        type: 'string'
      },
      'antipruritic': {
        label_vi: 'Thuốc giảm ngứa',
        label_en: 'Antipruritic',
        type: 'string'
      },
      'pain_relief': {
        label_vi: 'Giảm đau',
        label_en: 'Pain Relief',
        type: 'string'
      }
    }
  }
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

  // Type checking
  if (schema.type === 'boolean' && typeof value !== 'boolean') return false;
  if (schema.type === 'string' && typeof value !== 'string') return false;
  if (schema.type === 'number' && typeof value !== 'number') return false;
  if (schema.type === 'array' && !Array.isArray(value)) return false;

  // Enum validation
  if (schema.enum && schema.type === 'string') {
    return schema.enum.includes(value);
  }

  // Numeric range validation
  if (schema.type === 'number' && schema.validation) {
    if (schema.validation.min !== undefined && value < schema.validation.min) return false;
    if (schema.validation.max !== undefined && value > schema.validation.max) return false;
  }

  return true;
}

// Get input namespaces (for user symptom input)
export function getInputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    !['DiagnosisAssessment', 'TreatmentPlan'].includes(ns.namespace)
  );
}

// Get output namespaces (for diagnosis results)
export function getOutputNamespaces(): VariableNamespace[] {
  return VARIABLE_SCHEMAS.filter(ns =>
    ['DiagnosisAssessment', 'TreatmentPlan'].includes(ns.namespace)
  );
}
