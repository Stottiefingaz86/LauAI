-- Test Database Setup
-- Run this after setting up the trigger to verify everything works

-- 1. Check if trigger exists
SELECT 'Trigger exists:' as test, 
       COUNT(*) as count 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if function exists
SELECT 'Function exists:' as test, 
       COUNT(*) as count 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Check if users table exists
SELECT 'Users table exists:' as test, 
       COUNT(*) as count 
FROM information_schema.tables 
WHERE table_name = 'users' 
AND table_schema = 'public';

-- 4. Check users table structure
SELECT 'Users table columns:' as test,
       column_name,
       data_type,
       is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if RLS is enabled
SELECT 'RLS enabled:' as test,
       schemaname,
       tablename,
       rowsecurity
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- 6. Check RLS policies
SELECT 'RLS policies:' as test,
       policyname,
       permissive,
       roles,
       cmd,
       qual
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'; 