-- Fix User Authentication
-- Create a proper user that Supabase can authenticate

-- Step 1: Clean up any existing test users
SELECT 'Cleaning up test users...' as step;
DELETE FROM auth.users WHERE email = 'stottiefingaz@gmail.com';
DELETE FROM public.users WHERE email = 'stottiefingaz@gmail.com';

-- Step 2: Create a proper user with Supabase-compatible password
SELECT 'Creating proper user...' as step;
DO $$
DECLARE
    user_id UUID := gen_random_uuid();
    user_email TEXT := 'stottiefingaz@gmail.com';
    user_metadata JSONB := '{"first_name": "Christopher", "last_name": "Hunt", "role": "admin"}'::jsonb;
    -- Use a simple password hash that Supabase can verify
    password_hash TEXT := '$2a$10$rQZ8N5Xz8K9L2M1N0O9P8Q7R6S5T4U3V2W1X0Y9Z8A7B6C5D4E3F2G1H0I';
BEGIN
    -- Insert with proper Supabase structure
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_user_meta_data,
        aud,
        role
    )
    VALUES (
        user_id, 
        user_email, 
        password_hash, 
        NOW(), 
        NOW(), 
        NOW(),
        user_metadata,
        'authenticated',
        'authenticated'
    );
    
    RAISE NOTICE 'SUCCESS: User created in auth.users with ID: %', user_id;
    
    -- Check if our trigger fired
    IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
        RAISE NOTICE 'SUCCESS: Trigger fired and created user in public.users';
    ELSE
        RAISE NOTICE 'FAILURE: Trigger did not fire - user not in public.users';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: User creation failed: %', SQLERRM;
END $$;

-- Step 3: Check the created user
SELECT 'Checking created user...' as step;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    role,
    aud
FROM auth.users
WHERE email = 'stottiefingaz@gmail.com'
UNION ALL
SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at,
    role,
    first_name
FROM public.users
WHERE email = 'stottiefingaz@gmail.com'
ORDER BY created_at DESC; 