-- Create survey_invitations table for tracking survey sends
-- This table will store when surveys are sent to members

CREATE TABLE IF NOT EXISTS survey_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  member_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_invitations_survey_id ON survey_invitations(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_member_id ON survey_invitations(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_email ON survey_invitations(email);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_status ON survey_invitations(status);

-- Enable RLS
ALTER TABLE survey_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to view survey invitations" ON survey_invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert survey invitations" ON survey_invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update survey invitations" ON survey_invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON survey_invitations TO authenticated;

-- Insert some sample data for testing
INSERT INTO survey_invitations (survey_id, member_id, email, status) 
SELECT 
  s.id as survey_id,
  m.id as member_id,
  m.email as email,
  'sent' as status
FROM surveys s
CROSS JOIN members m
WHERE s.title = 'test' 
  AND m.name IS NOT NULL
LIMIT 5; 