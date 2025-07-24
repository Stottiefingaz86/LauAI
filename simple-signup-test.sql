-- Simple Signup Test
-- Let's test with a completely different email

-- Step 1: Test with a different email
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'testuser123@example.com';
    test_metadata JSONB := '{"first_name": "Test", "last_name": "User", "role": "member"}'::jsonb;
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, test_email, test_metadata);
    
    RAISE NOTICE 'Test user created with ID: % and email: %', test_id, test_email;
    
    -- Check if it was created in public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: User was created in public.users';
    ELSE
        RAISE NOTICE 'FAILURE: User was NOT created in public.users';
    END IF;
    
    -- Clean up
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
END $$;

-- Step 2: Check if there are any unique constraints on email
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
AND pg_get_constraintdef(oid) LIKE '%email%';

-- Step 3: Check if the specific email has any special handling
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
WHERE email LIKE '%stottiefingaz%'
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users
WHERE email LIKE '%stottiefingaz%'; 