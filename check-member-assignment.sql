-- Check member assignment and debug why member isn't showing in team

-- 1. Check all members with their team assignments
SELECT 'All members with team info:' as info;
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

-- 2. Check the Design team specifically
SELECT 'Design team details:' as info;
SELECT id, name, description, created_at FROM teams WHERE name = 'Design';

-- 3. Check members assigned to Design team
SELECT 'Members in Design team:' as info;
SELECT 
  m.id,
  m.name,
  m.email,
  m.team_id,
  m.created_at
FROM members m
JOIN teams t ON m.team_id = t.id
WHERE t.name = 'Design';

-- 4. Check for any members without team_id
SELECT 'Members without team_id:' as info;
SELECT id, name, email, team_id, created_at FROM members WHERE team_id IS NULL;

-- 5. Check the most recent member added
SELECT 'Most recent member added:' as info;
SELECT id, name, email, team_id, created_at 
FROM members 
ORDER BY created_at DESC 
LIMIT 1; 