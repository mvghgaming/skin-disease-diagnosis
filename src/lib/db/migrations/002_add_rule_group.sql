-- Add rule_group column to store original Vietnamese group name from JSON
ALTER TABLE rules ADD COLUMN IF NOT EXISTS rule_group VARCHAR(255);

-- Create index for rule_group queries
CREATE INDEX IF NOT EXISTS idx_rules_rule_group ON rules(rule_group);
