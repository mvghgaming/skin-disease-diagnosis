-- Medical Expert System Database Schema
-- Initial migration for creating all core tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: diseases
-- Stores disease information
CREATE TABLE IF NOT EXISTS diseases (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: rules
-- Stores rule metadata
CREATE TABLE IF NOT EXISTS rules (
  id VARCHAR(50) PRIMARY KEY,
  disease_id VARCHAR(50) REFERENCES diseases(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  logic VARCHAR(10) NOT NULL CHECK (logic IN ('AND', 'OR')),
  explanation TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: conditions
-- Stores normalized rule conditions
CREATE TABLE IF NOT EXISTS conditions (
  id SERIAL PRIMARY KEY,
  rule_id VARCHAR(50) REFERENCES rules(id) ON DELETE CASCADE,
  variable VARCHAR(255) NOT NULL,
  operator VARCHAR(20) NOT NULL CHECK (operator IN ('=', '!=', 'IN', 'NOT_IN', '>', '<', '>=', '<=', 'CONTAINS_ANY', 'IS_NOT_NULL', 'IS_NULL', 'LIKE')),
  value JSONB NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: conclusions
-- Stores normalized rule conclusions
CREATE TABLE IF NOT EXISTS conclusions (
  id SERIAL PRIMARY KEY,
  rule_id VARCHAR(50) REFERENCES rules(id) ON DELETE CASCADE,
  variable VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: diagnosis_sessions
-- Tracks user diagnosis sessions
CREATE TABLE IF NOT EXISTS diagnosis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Table: session_facts
-- Stores working memory facts for each session
CREATE TABLE IF NOT EXISTS session_facts (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES diagnosis_sessions(id) ON DELETE CASCADE,
  variable VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  source VARCHAR(50) DEFAULT 'user' CHECK (source IN ('user', 'inferred')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, variable)
);

-- Table: fired_rules
-- Audit trail of which rules fired in each session
CREATE TABLE IF NOT EXISTS fired_rules (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES diagnosis_sessions(id) ON DELETE CASCADE,
  rule_id VARCHAR(50) REFERENCES rules(id),
  fired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  explanation TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rules_disease_id ON rules(disease_id);
CREATE INDEX IF NOT EXISTS idx_rules_status ON rules(status);
CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(category);
CREATE INDEX IF NOT EXISTS idx_conditions_rule_id ON conditions(rule_id);
CREATE INDEX IF NOT EXISTS idx_conditions_variable ON conditions(variable);
CREATE INDEX IF NOT EXISTS idx_conclusions_rule_id ON conclusions(rule_id);
CREATE INDEX IF NOT EXISTS idx_session_facts_session_id ON session_facts(session_id);
CREATE INDEX IF NOT EXISTS idx_session_facts_variable ON session_facts(variable);
CREATE INDEX IF NOT EXISTS idx_fired_rules_session_id ON fired_rules(session_id);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_status ON diagnosis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_diagnosis_sessions_created_at ON diagnosis_sessions(created_at);
