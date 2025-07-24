-- Check Supabase Authentication Settings
-- This will help us understand if there are any restrictions

-- Step 1: Check if email confirmation is required
SELECT 'Checking auth settings...' as step;

-- Step 2: Check if there are any auth policies that might be blocking signup
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- Step 3: Check if there are any RLS policies on auth.users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- Step 4: Check if there are any triggers on auth.users that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Step 5: Check if there are any functions that might be called during signup
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'auth'
AND routine_name LIKE '%user%';

-- Step 6: Check if there are any constraints on auth.users that might be failing
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;

-- Step 7: Test if we can manually insert into auth.users
SELECT 'Testing manual insert...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'manualtest@example.com';
BEGIN
    -- Try to insert directly into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (test_id, test_email, crypt('testpassword', gen_salt('bf')), NOW(), NOW(), NOW());
    
    RAISE NOTICE 'SUCCESS: Manual insert into auth.users worked';
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Manual insert failed: %', SQLERRM;
END $$; 