-- Final Database Fix - No Authentication Dependencies
-- This creates a completely standalone database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS team_health CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS payment_sessions CASCADE;
DROP TABLE IF EXISTS billing_info CASCADE;
DROP TABLE IF EXISTS insights CASCADE;
DROP TABLE IF EXISTS signals CASCADE;
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS survey_completions CASCADE;
DROP TABLE IF EXISTS survey_insights CASCADE;
DROP TABLE IF EXISTS survey_responses CASCADE;
DROP TABLE IF EXISTS survey_questions CASCADE;
DROP TABLE IF EXISTS surveys CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Create teams table (no auth dependencies)
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table (no auth dependencies)
CREATE TABLE members (
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

-- Create surveys table (no auth dependencies)
CREATE TABLE surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval INTEGER DEFAULT 7,
  last_sent TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_questions table
CREATE TABLE survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text',
  required BOOLEAN DEFAULT FALSE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_responses table
CREATE TABLE survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create survey_insights table
CREATE TABLE survey_insights (
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

-- Create survey_completions table
CREATE TABLE survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0
);

-- Create survey_invitations table
CREATE TABLE survey_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

-- Create meetings table
CREATE TABLE meetings (
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

-- Create signals table
CREATE TABLE signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID,
  type TEXT NOT NULL,
  value DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create insights table
CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_info table (no auth dependencies)
CREATE TABLE billing_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_sessions table (no auth dependencies)
CREATE TABLE payment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table (no auth dependencies)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table (no auth dependencies)
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  team_id UUID,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (no auth dependencies)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_health table
CREATE TABLE team_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID,
  score DECIMAL(3,2),
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_health ENABLE ROW LEVEL SECURITY;

-- Create simple policies for all tables
CREATE POLICY "Allow all" ON teams FOR ALL USING (true);
CREATE POLICY "Allow all" ON members FOR ALL USING (true);
CREATE POLICY "Allow all" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_questions FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_responses FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_insights FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_completions FOR ALL USING (true);
CREATE POLICY "Allow all" ON survey_invitations FOR ALL USING (true);
CREATE POLICY "Allow all" ON meetings FOR ALL USING (true);
CREATE POLICY "Allow all" ON signals FOR ALL USING (true);
CREATE POLICY "Allow all" ON insights FOR ALL USING (true);
CREATE POLICY "Allow all" ON billing_info FOR ALL USING (true);
CREATE POLICY "Allow all" ON payment_sessions FOR ALL USING (true);
CREATE POLICY "Allow all" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all" ON invitations FOR ALL USING (true);
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all" ON alerts FOR ALL USING (true);
CREATE POLICY "Allow all" ON team_health FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_members_team_id ON members(team_id);
CREATE INDEX idx_survey_responses_member_id ON survey_responses(member_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_insights_member_id ON survey_insights(member_id);
CREATE INDEX idx_survey_completions_member_id ON survey_completions(member_id);
CREATE INDEX idx_meetings_member_id ON meetings(member_id);
CREATE INDEX idx_signals_member_id ON signals(member_id);
CREATE INDEX idx_insights_member_id ON insights(member_id);
CREATE INDEX idx_alerts_member_id ON alerts(member_id);
CREATE INDEX idx_team_health_team_id ON team_health(team_id);

-- Insert sample data
INSERT INTO teams (name, department) VALUES 
  ('Engineering Team', 'Engineering'),
  ('Marketing Team', 'Marketing'),
  ('Sales Team', 'Sales');

INSERT INTO members (name, email, role, department) VALUES 
  ('John Doe', 'john.doe@example.com', 'developer', 'Engineering'),
  ('Jane Smith', 'jane.smith@example.com', 'manager', 'Marketing');

INSERT INTO surveys (title, description, status) VALUES 
  ('Performance 1:1 Assessment', 'Comprehensive performance evaluation survey', 'active');

INSERT INTO billing_info (plan, status) VALUES 
  ('basic', 'active');

-- Grant permissions to all tables
GRANT ALL ON teams TO authenticated;
GRANT ALL ON members TO authenticated;
GRANT ALL ON surveys TO authenticated;
GRANT ALL ON survey_questions TO authenticated;
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON survey_insights TO authenticated;
GRANT ALL ON survey_completions TO authenticated;
GRANT ALL ON survey_invitations TO authenticated;
GRANT ALL ON meetings TO authenticated;
GRANT ALL ON signals TO authenticated;
GRANT ALL ON insights TO authenticated;
GRANT ALL ON billing_info TO authenticated;
GRANT ALL ON payment_sessions TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON invitations TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON alerts TO authenticated;
GRANT ALL ON team_health TO authenticated; 