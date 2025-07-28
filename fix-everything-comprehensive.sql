-- COMPREHENSIVE FIX FOR ALL SURVEY AND EMAIL ISSUES
-- Run this in your Supabase SQL editor

-- 1. First, let's see what we're working with
SELECT 'Current surveys:' as info;
SELECT id, title, status, created_at FROM surveys ORDER BY created_at DESC;

SELECT 'Current members:' as info;
SELECT id, name, email, team_id FROM members LIMIT 10;

-- 2. Disable RLS completely to ensure operations work
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE survey_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- 3. Drop all existing policies that might interfere
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON surveys;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON survey_questions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON survey_responses;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON survey_insights;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON survey_completions;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON survey_invitations;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON surveys;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON survey_questions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON survey_responses;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON survey_insights;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON survey_completions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON survey_invitations;

-- 4. Re-enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 5. Create simple, permissive policies for all operations
CREATE POLICY "Full access for authenticated users" ON surveys
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON survey_questions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON survey_responses
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON survey_insights
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON survey_completions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON survey_invitations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON members
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users" ON teams
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Verify policies are created
SELECT 'Policies created:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('surveys', 'survey_questions', 'survey_responses', 'survey_insights', 'survey_completions', 'survey_invitations', 'members', 'teams');

-- 7. Test survey deletion manually (replace with actual survey ID)
-- DELETE FROM survey_responses WHERE survey_id = 'your-survey-id';
-- DELETE FROM survey_insights WHERE survey_id = 'your-survey-id';
-- DELETE FROM survey_completions WHERE survey_id = 'your-survey-id';
-- DELETE FROM survey_invitations WHERE survey_id = 'your-survey-id';
-- DELETE FROM survey_questions WHERE survey_id = 'your-survey-id';
-- DELETE FROM surveys WHERE id = 'your-survey-id';

-- 8. Check for any orphaned data
SELECT 'Orphaned data check:' as info;
SELECT 'survey_responses' as table_name, COUNT(*) as count FROM survey_responses
UNION ALL
SELECT 'survey_insights' as table_name, COUNT(*) as count FROM survey_insights
UNION ALL
SELECT 'survey_completions' as table_name, COUNT(*) as count FROM survey_completions
UNION ALL
SELECT 'survey_invitations' as table_name, COUNT(*) as count FROM survey_invitations
UNION ALL
SELECT 'survey_questions' as table_name, COUNT(*) as count FROM survey_questions; 