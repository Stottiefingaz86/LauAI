-- Remove sample data that was automatically added
-- This will clean up the database to start fresh

-- Remove sample members first (due to foreign key constraints)
DELETE FROM members WHERE email IN (
  'john.doe@example.com',
  'jane.smith@example.com'
);

-- Remove sample teams
DELETE FROM teams WHERE name IN (
  'Engineering Team',
  'Marketing Team', 
  'Sales Team'
);

-- Remove sample survey
DELETE FROM surveys WHERE title = 'Performance 1:1 Assessment';

-- Remove sample billing info
DELETE FROM billing_info WHERE plan = 'basic';

-- Verify the cleanup
SELECT 'Teams remaining:' as info, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Members remaining:' as info, COUNT(*) as count FROM members
UNION ALL
SELECT 'Surveys remaining:' as info, COUNT(*) as count FROM surveys; 