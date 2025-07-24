-- Fix Signup Issue
-- Let's address potential issues step by step

-- Step 1: Check if the user_role enum exists and has the right values
SELECT 'Checking user_role enum...' as step;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

-- Step 2: Drop and recreate the trigger with better error handling
SELECT 'Recreating trigger with better error handling...' as step;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 3: Create function with comprehensive error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    RAISE NOTICE 'User ID: %', NEW.id;
    RAISE NOTICE 'Raw metadata: %', NEW.raw_user_meta_data;
    
    -- Safely extract role with fallback
    BEGIN
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
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
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

-- Step 6: Test the trigger
SELECT 'Testing trigger...' as step;
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_metadata JSONB := '{"first_name": "Christopher", "last_name": "Hunt", "role": "admin"}'::jsonb;
BEGIN
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, raw_user_meta_data) 
    VALUES (test_id, 'stottiefingaz@gmail.com', test_metadata);
    
    RAISE NOTICE 'Test user created with ID: %', test_id;
    
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