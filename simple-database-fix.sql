-- Simple Database Fix
-- This creates only the essential tables needed for the app to work

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic members table (without user_id dependency)
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  department TEXT,
  team_id UUID,
  signals INTEGER DEFAULT 0,
  last_survey TIMESTAMP WITH TIME ZONE,
  survey_count INTEGER DEFAULT 0,
  average_survey_score DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic survey_questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT FALSE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic survey_insights table
CREATE TABLE IF NOT EXISTS survey_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  sentiment TEXT,
  score DECIMAL(3,2) DEFAULT 0,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic survey_completions table
CREATE TABLE IF NOT EXISTS survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  member_id UUID,
  team_id UUID,
  duration INTEGER,
  recording_url TEXT,
  transcript TEXT,
  analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic signals table
CREATE TABLE IF NOT EXISTS signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID,
  type TEXT NOT NULL,
  value DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (but with simple policies)
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

-- Create simple RLS policies
CREATE POLICY "Allow all for authenticated" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON members FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON survey_questions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON survey_responses FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON survey_insights FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON survey_completions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON signals FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON insights FOR ALL USING (true);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_member_id ON survey_responses(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_member_id ON survey_insights(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_member_id ON survey_completions(member_id);

-- Insert sample data
INSERT INTO teams (name, department) VALUES 
  ('Engineering Team', 'Engineering'),
  ('Marketing Team', 'Marketing'),
  ('Sales Team', 'Sales')
ON CONFLICT DO NOTHING;

INSERT INTO members (name, email, role, department) VALUES 
  ('John Doe', 'john.doe@example.com', 'developer', 'Engineering'),
  ('Jane Smith', 'jane.smith@example.com', 'manager', 'Marketing')
ON CONFLICT DO NOTHING;

INSERT INTO surveys (title, description, status) VALUES 
  ('Performance 1:1 Assessment', 'Comprehensive performance evaluation survey', 'active')
ON CONFLICT DO NOTHING;

-- Grant permissions
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