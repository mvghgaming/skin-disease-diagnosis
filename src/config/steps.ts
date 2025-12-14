/**
 * Step-by-step workflow configuration for the diagnosis wizard
 * Option A: 4 input steps + 1 dynamic results page
 */

export interface StepConfig {
  id: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
  type: 'input' | 'result';
  // For input steps: which variable namespaces to show
  inputNamespaces?: string[];
  // Icon name from lucide-react
  icon: string;
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 'patient-info',
    title_vi: 'Thông tin bệnh nhân',
    title_en: 'Patient Information',
    description_vi: 'Nhập thông tin cơ bản về bệnh nhân',
    description_en: 'Enter basic patient information',
    type: 'input',
    inputNamespaces: ['PATIENT_INFO'],
    icon: 'User',
  },
  {
    id: 'symptoms',
    title_vi: 'Triệu chứng',
    title_en: 'Symptoms',
    description_vi: 'Mô tả các triệu chứng và tổn thương da',
    description_en: 'Describe symptoms and skin lesions',
    type: 'input',
    inputNamespaces: [
      'SKIN_LESION_MORPHOLOGY',
      'LESION_DISTRIBUTION',
      'SYSTEMIC_AND_NEURO_SIGNS',
    ],
    icon: 'Stethoscope',
  },
  {
    id: 'risk-factors',
    title_vi: 'Yếu tố nguy cơ',
    title_en: 'Risk Factors',
    description_vi: 'Đánh giá các yếu tố nguy cơ và tiền sử',
    description_en: 'Assess risk factors and history',
    type: 'input',
    inputNamespaces: ['RISK_FACTOR_ASSESSMENT', 'SEVERITY_ASSESSMENT'],
    icon: 'AlertTriangle',
  },
  {
    id: 'lab-results',
    title_vi: 'Xét nghiệm',
    title_en: 'Lab Results',
    description_vi: 'Nhập kết quả xét nghiệm (nếu có)',
    description_en: 'Enter lab results (if available)',
    type: 'input',
    inputNamespaces: ['LABORATORY_ASSESSMENT'],
    icon: 'FlaskConical',
  },
  {
    id: 'results',
    title_vi: 'Kết quả',
    title_en: 'Results',
    description_vi: 'Kết quả chẩn đoán và đề xuất điều trị',
    description_en: 'Diagnosis results and treatment recommendations',
    type: 'result',
    icon: 'ClipboardCheck',
  },
];

// Get input steps only
export function getInputSteps(): StepConfig[] {
  return WIZARD_STEPS.filter((step) => step.type === 'input');
}

// Get result steps only
export function getResultSteps(): StepConfig[] {
  return WIZARD_STEPS.filter((step) => step.type === 'result');
}

// Get step by ID
export function getStepById(id: string): StepConfig | undefined {
  return WIZARD_STEPS.find((step) => step.id === id);
}

// Get all input namespaces
export function getAllInputNamespaces(): string[] {
  const namespaces = new Set<string>();
  WIZARD_STEPS.forEach((step) => {
    step.inputNamespaces?.forEach((ns) => namespaces.add(ns));
  });
  return Array.from(namespaces);
}
