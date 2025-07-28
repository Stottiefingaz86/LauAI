-- Add proper foreign key constraints with cascade delete
-- This ensures that when a team is deleted, all its members are automatically deleted

-- First, drop any existing foreign key constraints
ALTER TABLE members 
DROP CONSTRAINT IF EXISTS members_team_id_fkey;

-- Add the proper foreign key constraint with CASCADE DELETE
ALTER TABLE members 
ADD CONSTRAINT members_team_id_fkey 
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Also add cascade delete for survey-related tables
ALTER TABLE survey_questions 
DROP CONSTRAINT IF EXISTS survey_questions_survey_id_fkey;

ALTER TABLE survey_questions 
ADD CONSTRAINT survey_questions_survey_id_fkey 
FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;

ALTER TABLE survey_responses 
DROP CONSTRAINT IF EXISTS survey_responses_survey_id_fkey;

ALTER TABLE survey_responses 
ADD CONSTRAINT survey_responses_survey_id_fkey 
FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE;

ALTER TABLE survey_responses 
DROP CONSTRAINT IF EXISTS survey_responses_member_id_fkey;

ALTER TABLE survey_responses 
ADD CONSTRAINT survey_responses_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Add cascade delete for other related tables
ALTER TABLE survey_insights 
DROP CONSTRAINT IF EXISTS survey_insights_member_id_fkey;

ALTER TABLE survey_insights 
ADD CONSTRAINT survey_insights_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE survey_completions 
DROP CONSTRAINT IF EXISTS survey_completions_member_id_fkey;

ALTER TABLE survey_completions 
ADD CONSTRAINT survey_completions_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE meetings 
DROP CONSTRAINT IF EXISTS meetings_member_id_fkey;

ALTER TABLE meetings 
ADD CONSTRAINT meetings_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE signals 
DROP CONSTRAINT IF EXISTS signals_member_id_fkey;

ALTER TABLE signals 
ADD CONSTRAINT signals_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE insights 
DROP CONSTRAINT IF EXISTS insights_member_id_fkey;

ALTER TABLE insights 
ADD CONSTRAINT insights_member_id_fkey 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Verify the constraints were added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('members', 'survey_questions', 'survey_responses', 'survey_insights', 'survey_completions', 'meetings', 'signals', 'insights')
ORDER BY tc.table_name, tc.constraint_name; 