-- Quick cleanup to remove the problematic member
-- This will remove the member with the email that's causing the conflict

-- First, show what we're about to delete
SELECT 'Members that will be deleted:' as info;
SELECT id, name, email, team_id, created_at FROM members WHERE email = 'stottiefingaz@gmail.com';

-- Delete the specific member
DELETE FROM members WHERE email = 'stottiefingaz@gmail.com';

-- Show remaining members
SELECT 'Remaining members:' as info;
SELECT id, name, email, team_id, created_at FROM members ORDER BY created_at DESC;

-- Show teams
SELECT 'Teams:' as info;
SELECT id, name, description, created_at FROM teams ORDER BY created_at DESC; 