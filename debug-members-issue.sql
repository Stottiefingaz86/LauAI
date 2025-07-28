-- Debug and fix members issue
-- This script will help identify why you're getting "email exists" errors

-- 1. Check all members in the database
SELECT 'All members in database:' as info;
SELECT id, name, email, team_id, created_at FROM members ORDER BY created_at DESC;

-- 2. Check members without team_id (orphaned members)
SELECT 'Members without team_id (orphaned):' as info;
SELECT id, name, email, team_id, created_at FROM members WHERE team_id IS NULL;

-- 3. Check all teams
SELECT 'All teams in database:' as info;
SELECT id, name, description, created_at FROM teams ORDER BY created_at DESC;

-- 4. Check for duplicate emails
SELECT 'Duplicate emails:' as info;
SELECT email, COUNT(*) as count 
FROM members 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 5. Show members with their team names
SELECT 'Members with team info:' as info;
SELECT 
  m.id,
  m.name,
  m.email,
  m.team_id,
  t.name as team_name,
  m.created_at
FROM members m
LEFT JOIN teams t ON m.team_id = t.id
ORDER BY m.created_at DESC;

-- 6. Clean up orphaned members (uncomment if you want to delete them)
-- DELETE FROM members WHERE team_id IS NULL;

-- 7. Show final state
SELECT 'Final member count:' as info, COUNT(*) as count FROM members;
SELECT 'Final team count:' as info, COUNT(*) as count FROM teams; 