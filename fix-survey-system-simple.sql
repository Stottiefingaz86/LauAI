-- Simplified Survey System Setup
-- This script creates the survey response system step by step

-- First, ensure we have the basic tables
CREATE TABLE IF NOT EXISTS surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'member',
  department TEXT,
  team_id UUID,
  user_id UUID REFERENCES auth.users(id),
  signals INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now create the survey response tables
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  question_id UUID,
  response TEXT NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  score DECIMAL(3,2) DEFAULT 0,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES survey_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID,
  member_id UUID,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Add missing columns to existing tables
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_survey TIMESTAMP WITH TIME ZONE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS survey_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS average_survey_score DECIMAL(3,2) DEFAULT 0;

-- Add missing columns to surveys table
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 7;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS last_sent TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Enable all access for authenticated users" ON survey_responses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_insights
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON survey_completions
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_member_id ON survey_responses(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_submitted_at ON survey_responses(submitted_at);

CREATE INDEX IF NOT EXISTS idx_survey_insights_survey_id ON survey_insights(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_member_id ON survey_insights(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_insights_sentiment ON survey_insights(sentiment);

CREATE INDEX IF NOT EXISTS idx_survey_completions_survey_id ON survey_completions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_member_id ON survey_completions(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_completed_at ON survey_completions(completed_at);

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

-- Insert sample survey for testing
INSERT INTO surveys (title, description, status) 
VALUES ('Performance 1:1 Assessment', 'Comprehensive performance evaluation survey', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample questions for the survey
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

-- Grant permissions
GRANT ALL ON surveys TO authenticated;
GRANT ALL ON survey_questions TO authenticated;
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON survey_insights TO authenticated;
GRANT ALL ON survey_completions TO authenticated;
GRANT ALL ON members TO authenticated; 