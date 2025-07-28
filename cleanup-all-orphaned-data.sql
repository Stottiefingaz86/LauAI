-- Clean up all orphaned data and fix email exists errors
-- This will completely clean the database and start fresh

-- 1. Show current state
SELECT 'Current state - Teams:' as info;
SELECT id, name, description, created_at FROM teams ORDER BY created_at DESC;

SELECT 'Current state - Members:' as info;
SELECT id, name, email, team_id, created_at FROM members ORDER BY created_at DESC;

-- 2. Delete all orphaned members (members without valid team_id)
DELETE FROM members 
WHERE team_id IS NULL OR team_id NOT IN (SELECT id FROM teams);

-- 3. Delete all data to start completely fresh
DELETE FROM members;
DELETE FROM teams;
DELETE FROM surveys;
DELETE FROM survey_questions;
DELETE FROM survey_responses;
DELETE FROM survey_insights;
DELETE FROM survey_completions;
DELETE FROM meetings;
DELETE FROM signals;
DELETE FROM insights;
DELETE FROM billing_info;
DELETE FROM payment_sessions;
DELETE FROM customers;
DELETE FROM invitations;
DELETE FROM profiles;
DELETE FROM alerts;
DELETE FROM team_health;

-- 4. Verify the database is clean
SELECT 'Final state - Teams:' as info, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Final state - Members:' as info, COUNT(*) as count FROM members
UNION ALL
SELECT 'Final state - Surveys:' as info, COUNT(*) as count FROM surveys
UNION ALL
SELECT 'Final state - Survey Questions:' as info, COUNT(*) as count FROM survey_questions
UNION ALL
SELECT 'Final state - Survey Responses:' as info, COUNT(*) as count FROM survey_responses
UNION ALL
SELECT 'Final state - Survey Insights:' as info, COUNT(*) as count FROM survey_insights
UNION ALL
SELECT 'Final state - Survey Completions:' as info, COUNT(*) as count FROM survey_completions
UNION ALL
SELECT 'Final state - Meetings:' as info, COUNT(*) as count FROM meetings
UNION ALL
SELECT 'Final state - Signals:' as info, COUNT(*) as count FROM signals
UNION ALL
SELECT 'Final state - Insights:' as info, COUNT(*) as count FROM insights
UNION ALL
SELECT 'Final state - Billing Info:' as info, COUNT(*) as count FROM billing_info
UNION ALL
SELECT 'Final state - Payment Sessions:' as info, COUNT(*) as count FROM payment_sessions
UNION ALL
SELECT 'Final state - Customers:' as info, COUNT(*) as count FROM customers
UNION ALL
SELECT 'Final state - Invitations:' as info, COUNT(*) as count FROM invitations
UNION ALL
SELECT 'Final state - Profiles:' as info, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Final state - Alerts:' as info, COUNT(*) as count FROM alerts
UNION ALL
SELECT 'Final state - Team Health:' as info, COUNT(*) as count FROM team_health; 