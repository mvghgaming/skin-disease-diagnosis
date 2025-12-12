export interface Disease {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
}

export interface DiseaseWithRules extends Disease {
  rule_count?: number;
}
