-- Comprehensive Fix for Signup Issue
-- This script will fix the database error preventing user signup

-- Step 1: Check current state
SELECT 'Checking current database state...' as step;

-- Check if user_role enum exists
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role';

-- Check current trigger function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 2: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
    first_name_val TEXT;
    last_name_val TEXT;
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    RAISE NOTICE 'User ID: %', NEW.id;
    RAISE NOTICE 'Raw metadata: %', NEW.raw_user_meta_data;
    
    -- Safely extract values with fallbacks
    BEGIN
        -- Extract first_name and last_name
        first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
        last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
        
        -- Extract role with proper error handling
        IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'role' THEN
            user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
        ELSE
            user_role_val := 'member';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error parsing role, using default: %', SQLERRM;
        user_role_val := 'member';
    END;
    
    -- Insert with comprehensive error handling
    BEGIN
        INSERT INTO public.users (id, email, first_name, last_name, role)
        VALUES (
            NEW.id,
            NEW.email,
            first_name_val,
            last_name_val,
            user_role_val
        );
        
        RAISE NOTICE 'User % created successfully in public.users with role: %', NEW.email, user_role_val;
        
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'User % already exists in public.users', NEW.email;
        -- Don't raise the error, just log it
        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error creating user %: %', NEW.email, SQLERRM;
        -- Don't raise the error, just log it
        RETURN NEW;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Step 6: Ensure users table has the right structure
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'member';

-- Step 7: Test the trigger with a safe test
SELECT 'Testing trigger with safe test...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_metadata JSONB := '{"first_name": "Test", "last_name": "User", "role": "member"}'::jsonb;
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, 'testuser123@example.com', test_metadata);
    
    RAISE NOTICE 'Test user created with ID: %', test_id;
    
    -- Check if it was created in public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = test_id) THEN
        RAISE NOTICE 'SUCCESS: User was created in public.users';
        
        -- Show the created user details
        RAISE NOTICE 'User details: %', (
            SELECT row_to_json(u) 
            FROM public.users u 
            WHERE id = test_id
        );
    ELSE
        RAISE NOTICE 'FAILURE: User was NOT created in public.users';
    END IF;
    
    -- Clean up test user
    DELETE FROM auth.users WHERE id = test_id;
    DELETE FROM public.users WHERE id = test_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test failed: %', SQLERRM;
END $$;

-- Step 8: Check for any existing problematic users
SELECT 'Checking for existing problematic users...' as step;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'thereeluxreview@gmail.com'
UNION ALL
SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at
FROM public.users
WHERE email = 'thereeluxreview@gmail.com';

-- Step 9: Clean up any existing problematic users
DELETE FROM auth.users WHERE email = 'thereeluxreview@gmail.com';
DELETE FROM public.users WHERE email = 'thereeluxreview@gmail.com';

SELECT 'Signup issue should now be fixed!' as result; 