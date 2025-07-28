-- Real Survey System Setup
-- This creates the complete survey response and analysis system

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID REFERENCES survey_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Insights Table (for analyzed responses)
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

-- Survey Completions Table (overall survey completion tracking)
CREATE TABLE IF NOT EXISTS survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score DECIMAL(3,2) DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing tables
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_survey TIMESTAMP WITH TIME ZONE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS survey_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS average_survey_score DECIMAL(3,2) DEFAULT 0;

-- Add missing columns to surveys table
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 7; -- days
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS last_sent TIMESTAMP WITH TIME ZONE;

-- RLS Policies for Survey Responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own survey responses" ON survey_responses
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = member_id
    )
  );

CREATE POLICY "Users can insert their own survey responses" ON survey_responses
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = member_id
    )
  );

-- RLS Policies for Survey Insights
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights for their team" ON survey_insights
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = member_id
    ) OR
    auth.uid() IN (
      SELECT created_by FROM teams WHERE id IN (
        SELECT team_id FROM members WHERE id = member_id
      )
    )
  );

CREATE POLICY "System can insert survey insights" ON survey_insights
  FOR INSERT WITH CHECK (true);

-- RLS Policies for Survey Completions
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view completions for their team" ON survey_completions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM members WHERE id = member_id
    ) OR
    auth.uid() IN (
      SELECT created_by FROM teams WHERE id IN (
        SELECT team_id FROM members WHERE id = member_id
      )
    )
  );

CREATE POLICY "System can insert survey completions" ON survey_completions
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
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
  -- Update member's survey count and average score
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
CREATE TRIGGER trigger_update_member_survey_stats
  AFTER INSERT ON survey_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_member_survey_stats();

-- Insert sample survey questions for testing
INSERT INTO survey_questions (survey_id, question_text, question_type, required, description, category)
VALUES 
  (
    (SELECT id FROM surveys WHERE title = 'Performance 1:1 Assessment' LIMIT 1),
    'How would you rate your overall job satisfaction?',
    'rating',
    true,
    'Rate your satisfaction with your current role and responsibilities',
    'satisfaction'
  ),
  (
    (SELECT id FROM surveys WHERE title = 'Performance 1:1 Assessment' LIMIT 1),
    'Do you feel supported by your manager?',
    'yes_no',
    true,
    'Indicate whether you feel adequately supported in your role',
    'support'
  ),
  (
    (SELECT id FROM surveys WHERE title = 'Performance 1:1 Assessment' LIMIT 1),
    'What challenges are you currently facing in your role?',
    'text',
    false,
    'Please describe any obstacles or difficulties you''re experiencing',
    'challenges'
  ),
  (
    (SELECT id FROM surveys WHERE title = 'Performance 1:1 Assessment' LIMIT 1),
    'How would you rate your work-life balance?',
    'rating',
    true,
    'Rate your satisfaction with your current work-life balance',
    'balance'
  ),
  (
    (SELECT id FROM surveys WHERE title = 'Performance 1:1 Assessment' LIMIT 1),
    'What are your career goals for the next 6 months?',
    'text',
    false,
    'Share your professional development objectives',
    'goals'
  )
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON survey_responses TO authenticated;
GRANT ALL ON survey_insights TO authenticated;
GRANT ALL ON survey_completions TO authenticated;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE survey_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE survey_completions; 