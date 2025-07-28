-- Complete Database Setup for SignalOS
-- This script creates all necessary tables and columns

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table with all required columns
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  department TEXT,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  signals INTEGER DEFAULT 0,
  last_survey TIMESTAMP WITH TIME ZONE,
  survey_count INTEGER DEFAULT 0,
  average_survey_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval INTEGER DEFAULT 7,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'rating', 'yes_no')),
  required BOOLEAN DEFAULT FALSE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_insights table
CREATE TABLE IF NOT EXISTS survey_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  score DECIMAL(3,2) DEFAULT 0,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_completions table
CREATE TABLE IF NOT EXISTS survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  duration INTEGER, -- in minutes
  recording_url TEXT,
  transcript TEXT,
  analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create signals table
CREATE TABLE IF NOT EXISTS signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  value DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON teams
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON surveys
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_questions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_responses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_insights
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_completions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON meetings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON signals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON insights
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);

CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_questions_type ON survey_questions(question_type);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_member_id ON survey_responses(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_submitted_at ON survey_responses(submitted_at);

CREATE INDEX IF NOT EXISTS idx_survey_insights_survey_id ON survey_insights(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_member_id ON survey_insights(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_sentiment ON survey_insights(sentiment);

CREATE INDEX IF NOT EXISTS idx_survey_completions_survey_id ON survey_completions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_member_id ON survey_completions(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_completed_at ON survey_completions(completed_at);

CREATE INDEX IF NOT EXISTS idx_meetings_member_id ON meetings(member_id);
CREATE INDEX IF NOT EXISTS idx_meetings_team_id ON meetings(team_id);

CREATE INDEX IF NOT EXISTS idx_signals_member_id ON signals(member_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);

CREATE INDEX IF NOT EXISTS idx_insights_member_id ON insights(member_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);

-- Function to update member survey stats
CREATE OR REPLACE FUNCTION update_member_survey_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE members 
  SET 
    survey_count = (
      SELECT COUNT(DISTINCT survey_id) 
      FROM survey_completions 
      WHERE member_id = NEW.member_id
    ),
    average_survey_score = (
      SELECT AVG(total_score) 
      FROM survey_completions 
      WHERE member_id = NEW.member_id
    )
  WHERE id = NEW.member_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update member stats when survey is completed
DROP TRIGGER IF EXISTS trigger_update_member_survey_stats ON survey_completions;
CREATE TRIGGER trigger_update_member_survey_stats
  AFTER INSERT ON survey_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_member_survey_stats();

-- Insert sample data for testing
INSERT INTO teams (name, department, description) 
VALUES 
  ('Engineering Team', 'Engineering', 'Core development team'),
  ('Marketing Team', 'Marketing', 'Digital marketing and growth'),
  ('Sales Team', 'Sales', 'Customer acquisition and retention')
ON CONFLICT DO NOTHING;

-- Insert sample members
INSERT INTO members (name, email, role, department, team_id) 
SELECT 
  'John Doe',
  'john.doe@example.com',
  'developer',
  'Engineering',
  t.id
FROM teams t WHERE t.name = 'Engineering Team'
ON CONFLICT DO NOTHING;

INSERT INTO members (name, email, role, department, team_id) 
SELECT 
  'Jane Smith',
  'jane.smith@example.com',
  'manager',
  'Marketing',
  t.id
FROM teams t WHERE t.name = 'Marketing Team'
ON CONFLICT DO NOTHING;

-- Insert sample survey
INSERT INTO surveys (title, description, status) 
VALUES ('Performance 1:1 Assessment', 'Comprehensive performance evaluation survey', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO survey_questions (survey_id, question_text, question_type, required, description, category)
SELECT 
  s.id,
  'How would you rate your overall job satisfaction?',
  'rating',
  true,
  'Rate your satisfaction with your current role and responsibilities',
  'satisfaction'
FROM surveys s WHERE s.title = 'Performance 1:1 Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO survey_questions (survey_id, question_text, question_type, required, description, category)
SELECT 
  s.id,
  'Do you feel supported by your manager?',
  'yes_no',
  true,
  'Indicate whether you feel adequately supported in your role',
  'support'
FROM surveys s WHERE s.title = 'Performance 1:1 Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO survey_questions (survey_id, question_text, question_type, required, description, category)
SELECT 
  s.id,
  'What challenges are you currently facing in your role?',
  'text',
  false,
  'Please describe any obstacles or difficulties you''re experiencing',
  'challenges'
FROM surveys s WHERE s.title = 'Performance 1:1 Assessment'
ON CONFLICT DO NOTHING;

-- Grant all permissions to authenticated users
GRANT ALL ON teams TO authenticated;
GRANT ALL ON members TO authenticated;
GRANT ALL ON surveys TO authenticated;
GRANT ALL ON survey_questions TO authenticated;
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON survey_insights TO authenticated;
GRANT ALL ON survey_completions TO authenticated;
GRANT ALL ON meetings TO authenticated;
GRANT ALL ON signals TO authenticated;
GRANT ALL ON insights TO authenticated;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_questions;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE signals;
ALTER PUBLICATION supabase_realtime ADD TABLE insights; 