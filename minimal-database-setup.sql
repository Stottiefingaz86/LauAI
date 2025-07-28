-- Minimal Database Setup
-- This creates only the most essential tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create members table first (this is what's missing)
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  department TEXT,
  team_id UUID,
  signals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_insights table
CREATE TABLE IF NOT EXISTS survey_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  sentiment TEXT,
  score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_completions table
CREATE TABLE IF NOT EXISTS survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "Allow all" ON members FOR ALL USING (true);
CREATE POLICY "Allow all" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_questions FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_responses FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_insights FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_completions FOR ALL USING (true);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_member_id ON survey_responses(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_member_id ON survey_insights(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_member_id ON survey_completions(member_id);

-- Insert sample data
INSERT INTO teams (name, department) VALUES 
  ('Engineering Team', 'Engineering'),
  ('Marketing Team', 'Marketing')
ON CONFLICT DO NOTHING;

INSERT INTO members (name, email, role, department) VALUES 
  ('John Doe', 'john.doe@example.com', 'developer', 'Engineering'),
  ('Jane Smith', 'jane.smith@example.com', 'manager', 'Marketing')
ON CONFLICT DO NOTHING;

INSERT INTO surveys (title, description, status) VALUES 
  ('Performance 1:1 Assessment', 'Comprehensive performance evaluation survey', 'active')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON members TO authenticated;
GRANT ALL ON teams TO authenticated;
GRANT ALL ON surveys TO authenticated;
GRANT ALL ON survey_questions TO authenticated;
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON survey_insights TO authenticated;
GRANT ALL ON survey_completions TO authenticated; 