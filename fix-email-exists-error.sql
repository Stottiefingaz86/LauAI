-- Fix email exists error by cleaning up orphaned members
-- This script will completely clean the database and start fresh

-- 1. First, let's see what's currently in the database
SELECT 'Current state - Teams:' as info;
SELECT id, name, description, created_at FROM teams ORDER BY created_at DESC;

SELECT 'Current state - Members:' as info;
SELECT id, name, email, team_id, created_at FROM members ORDER BY created_at DESC;

-- 2. Delete all orphaned members (members without valid team_id)
DELETE FROM members 
WHERE team_id IS NULL OR team_id NOT IN (SELECT id FROM teams);

-- 3. Delete all members to start completely fresh
DELETE FROM members;

-- 4. Delete all teams to start completely fresh  
DELETE FROM teams;

-- 5. Delete all surveys to start completely fresh
DELETE FROM surveys;

-- 6. Delete all survey questions to start completely fresh
DELETE FROM survey_questions;

-- 7. Delete all survey responses to start completely fresh
DELETE FROM survey_responses;

-- 8. Delete all survey insights to start completely fresh
DELETE FROM survey_insights;

-- 9. Delete all survey completions to start completely fresh
DELETE FROM survey_completions;

-- 10. Delete all meetings to start completely fresh
DELETE FROM meetings;

-- 11. Delete all signals to start completely fresh
DELETE FROM signals;

-- 12. Delete all insights to start completely fresh
DELETE FROM insights;

-- 13. Delete all billing info to start completely fresh
DELETE FROM billing_info;

-- 14. Delete all payment sessions to start completely fresh
DELETE FROM payment_sessions;

-- 15. Delete all customers to start completely fresh
DELETE FROM customers;

-- 16. Delete all invitations to start completely fresh
DELETE FROM invitations;

-- 17. Delete all profiles to start completely fresh
DELETE FROM profiles;

-- 18. Delete all alerts to start completely fresh
DELETE FROM alerts;

-- 19. Delete all team health to start completely fresh
DELETE FROM team_health;

-- 20. Verify the database is clean
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