-- Bypass Signup Issue
-- Since Supabase auth is blocking signups, let's test if our trigger works manually

-- Step 1: Check if there are any existing users with the specific email
SELECT 'Checking for existing users...' as step;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com';

-- Step 2: Manually create the user in auth.users (bypassing Supabase auth)
SELECT 'Manually creating user...' as step;
DO $$
DECLARE
    user_id UUID := gen_random_uuid();
    user_email TEXT := 'stottiefingaz@gmail.com';
    user_metadata JSONB := '{"first_name": "Christopher", "last_name": "Hunt", "role": "admin"}'::jsonb;
BEGIN
    -- Insert directly into auth.users
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
        user_id, 
        user_email, 
        crypt('TestPassword123!', gen_salt('bf')), 
        NOW(), 
        NOW(), 
        NOW(),
        user_metadata
    );
    
    RAISE NOTICE 'SUCCESS: User created in auth.users with ID: %', user_id;
    
    -- Check if our trigger fired
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
        RAISE NOTICE 'SUCCESS: Trigger fired and created user in public.users';
        
        -- Show the created user
        RAISE NOTICE 'User in public.users: %', (SELECT row_to_json(u) FROM public.users u WHERE id = user_id);
    ELSE
        RAISE NOTICE 'FAILURE: Trigger did not fire - user not in public.users';
    END IF;
    
    -- Don't clean up - let's keep this user for testing
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Manual user creation failed: %', SQLERRM;
END $$;

-- Step 3: Check if the user was created successfully
SELECT 'Checking created user...' as step;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com'
UNION ALL
SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at,
    created_at
FROM public.users
WHERE email = 'stottiefingaz@gmail.com'
ORDER BY created_at DESC;

-- Step 4: Test if we can sign in with the manually created user
SELECT 'Testing signin capability...' as step;
-- This will show if the user can be authenticated
SELECT 
    id,
    email,
    email_confirmed_at,
    encrypted_password IS NOT NULL as has_password
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com'; 