import { Conclusion } from './rule';

export interface WorkingMemory {
  [variable: string]: any;
}

export interface FiredRule {
  ruleId: string;
  ruleName: string;
  explanation: string;
  conclusions: Conclusion[];
  group?: string;  // Rule group from JSON (e.g., "Chẩn đoán", "Điều trị")
  category?: string; // Rule category in DB
}

export interface DiagnosisResult {
  sessionId: string;
  diagnosis: {
    main_diagnosis?: string;
    differential_list?: string[];
    complication_flag?: boolean;
    complication_type?: string;
  };
  treatment?: {
    local_antiseptic?: string[];
    topical_antibiotic?: string;
    systemic_antibiotic?: string | string[];
    treatment_duration?: string;
    antipruritic?: string;
    pain_relief?: string;
  };
  risk?: {
    overall_infection_risk?: string;
  };
  firedRules: FiredRule[];
  workingMemory: WorkingMemory;
  confidence?: number;
}

export interface DiagnosisInput {
  symptoms: WorkingMemory;
  sessionId?: string;
}

export interface DiagnosisSession {
  id: string;
  status: 'active' | 'completed' | 'abandoned';
  created_at: Date;
  completed_at?: Date;
}

export interface SessionFact {
  id: number;
  session_id: string;
  variable: string;
  value: any;
  source: 'user' | 'inferred';
  created_at: Date;
}
