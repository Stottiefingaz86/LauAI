-- Fix System-Wide Signup Issue
-- The problem is at the Supabase authentication level, not the trigger

-- Step 1: Check if there are any authentication restrictions
SELECT 'Checking authentication settings...' as step;

-- Step 2: Check if signup is enabled
SELECT 
    setting_name,
    setting_value
FROM pg_settings 
WHERE setting_name LIKE '%auth%' 
OR setting_name LIKE '%signup%';

-- Step 3: Check if there are any auth policies blocking signup
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

-- Step 4: Check if there are any unique constraints that might be causing issues
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass
AND contype = 'u'; -- unique constraints only

-- Step 5: Check if there are any triggers on auth.users that might be interfering
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- Step 6: Check if the auth.users table has the right structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Step 7: Test if we can manually insert into auth.users with the exact structure Supabase expects
SELECT 'Testing manual insert with Supabase structure...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'systemtest@example.com';
BEGIN
    -- Try to insert with the exact structure Supabase expects
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_user_meta_data
    )
    VALUES (
        test_id, 
        test_email, 
        crypt('TestPassword123!', gen_salt('bf')), 
        NOW(), 
        NOW(), 
        NOW(),
        '{"first_name": "Test", "last_name": "User", "role": "member"}'::jsonb
    );
    
    RAISE NOTICE 'SUCCESS: Manual insert into auth.users worked with Supabase structure';
    
    -- Check if our trigger fired
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: Trigger also fired and created user in public.users';
    ELSE
        RAISE NOTICE 'WARNING: Trigger did not fire - user not in public.users';
    END IF;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Manual insert failed: %', SQLERRM;
END $$;

-- Step 8: Check if there are any RLS policies that might be blocking the auth.users table
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
AND tablename = 'users'
AND (cmd = 'INSERT' OR cmd = 'ALL'); 