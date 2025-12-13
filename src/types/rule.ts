export type LogicOperator = 'AND' | 'OR';

export type ComparisonOperator = '=' | '!=' | 'IN' | 'NOT_IN' | '>' | '<' | '>=' | '<=' | 'CONTAINS_ANY' | 'IS_NOT_NULL' | 'IS_NULL' | 'LIKE';

export type RuleStatus = 'active' | 'inactive' | 'draft';

export type RuleCategory =
  | 'diagnosis'
  | 'diagnosis_support'
  | 'differential'
  | 'risk'
  | 'treatment'
  | 'symptom_support'
  | 'complication';

export interface Condition {
  variable: string;
  operator: ComparisonOperator;
  value: any;  // Can be boolean, string, number, or array
}

export interface Conclusion {
  variable: string;
  value: any;  // Can be boolean, string, number, or array
}

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  logic: LogicOperator;
  conditions: Condition[];
  conclusions: Conclusion[];
  explanation: string;
  status: RuleStatus;
  disease_id?: string;
  priority?: number;
}

// Database types (for internal use)
export interface RuleDB {
  id: string;
  disease_id: string | null;
  name: string;
  category: string;
  logic: LogicOperator;
  explanation: string;
  status: RuleStatus;
  priority: number;
  created_at: Date;
  updated_at?: Date;
}

export interface ConditionDB {
  id: number;
  rule_id: string;
  variable: string;
  operator: ComparisonOperator;
  value: any;  // JSONB in PostgreSQL
  position: number;
}

export interface ConclusionDB {
  id: number;
  rule_id: string;
  variable: string;
  value: any;  // JSONB in PostgreSQL
  position: number;
}
