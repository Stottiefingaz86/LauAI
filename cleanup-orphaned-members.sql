-- Clean up orphaned members and fix email exists error
-- This will remove all members that don't have a valid team_id

-- First, show what we're about to delete
SELECT 'Members that will be deleted (orphaned):' as info;
SELECT id, name, email, team_id, created_at 
FROM members 
WHERE team_id IS NULL OR team_id NOT IN (SELECT id FROM teams);

-- Delete orphaned members
DELETE FROM members 
WHERE team_id IS NULL OR team_id NOT IN (SELECT id FROM teams);

-- Show final state
SELECT 'Remaining members:' as info;
SELECT id, name, email, team_id, created_at FROM members ORDER BY created_at DESC;

-- Show remaining teams
SELECT 'Remaining teams:' as info;
SELECT id, name, description, created_at FROM teams ORDER BY created_at DESC; 