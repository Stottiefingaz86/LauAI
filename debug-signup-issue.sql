-- Comprehensive Debug for Signup Issue
-- This will help us understand exactly what's failing

-- Step 1: Check if there are any existing users with this email
SELECT 'Checking for existing users...' as step;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com'
UNION ALL
SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at
FROM public.users
WHERE email = 'stottiefingaz@gmail.com';

-- Step 2: Check trigger and function status
SELECT 'Checking trigger and function...' as step;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 3: Check table structure and constraints
SELECT 'Checking table structure...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Check for any unique constraints that might be failing
SELECT 'Checking constraints...' as step;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Step 5: Test with exact same data structure
SELECT 'Testing with exact data structure...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_metadata JSONB := '{"first_name": "Christopher", "last_name": "Hunt", "role": "admin"}'::jsonb;
BEGIN
    -- Insert into auth.users with exact same structure
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, 'stottiefingaz@gmail.com', test_metadata);
    
    RAISE NOTICE 'Test user created with ID: %', test_id;
    
    -- Check if it was created in public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: User was created in public.users';
    ELSE
        RAISE NOTICE 'FAILURE: User was NOT created in public.users';
    END IF;
    
    -- Clean up test user
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
END $$;

-- Step 6: Check recent errors in the database
SELECT 'Checking for recent errors...' as step;
SELECT 
    query_start,
    state,
    query
FROM pg_stat_activity 
WHERE application_name LIKE '%supabase%'
AND (query LIKE '%error%' OR query LIKE '%fail%')
ORDER BY query_start DESC
LIMIT 10; 