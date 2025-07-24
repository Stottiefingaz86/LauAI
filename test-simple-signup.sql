-- Simple Signup Test
-- Let's test the most basic signup scenario

-- Step 1: Check if there are any existing users with the specific email
SELECT 'Checking for existing users...' as step;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com';

-- Step 2: Check if there are any users in public.users
SELECT 'Checking public.users...' as step;
SELECT 
    id,
    email,
    created_at
FROM public.users
WHERE email = 'stottiefingaz@gmail.com';

-- Step 3: Test a completely fresh signup with a new email
SELECT 'Testing fresh signup...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'freshsignup@example.com';
    test_metadata JSONB := '{"first_name": "Fresh", "last_name": "User", "role": "member"}'::jsonb;
BEGIN
    -- Try to insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, test_email, test_metadata);
    
    RAISE NOTICE 'SUCCESS: Fresh user created in auth.users with ID: %', test_id;
    
    -- Check if our trigger fired
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: Trigger fired and created user in public.users';
    ELSE
        RAISE NOTICE 'FAILURE: Trigger did not fire - user not in public.users';
    END IF;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Fresh signup failed: %', SQLERRM;
END $$;

-- Step 4: Check if there are any database-level restrictions
SELECT 'Checking database restrictions...' as step;
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass
AND pg_get_constraintdef(oid) LIKE '%email%';

-- Step 5: Check if the issue is with the specific email format
SELECT 'Testing email format...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test@test.com'; -- Simple email format
    test_metadata JSONB := '{"first_name": "Test", "last_name": "User", "role": "member"}'::jsonb;
BEGIN
    -- Try to insert with simple email
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, test_email, test_metadata);
    
    RAISE NOTICE 'SUCCESS: Simple email signup worked';
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Simple email signup failed: %', SQLERRM;
END $$; 