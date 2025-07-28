-- Fix RLS policies for survey deletion
-- This script ensures that survey deletion works properly

-- Enable RLS on all survey-related tables
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might interfere with deletion
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON surveys;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON survey_questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON survey_responses;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON survey_insights;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON survey_completions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON survey_invitations;

-- Create comprehensive policies that allow full CRUD operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON surveys
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON survey_questions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON survey_responses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON survey_insights
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON survey_completions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON survey_invitations
    FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('surveys', 'survey_questions', 'survey_responses', 'survey_insights', 'survey_completions', 'survey_invitations'); 