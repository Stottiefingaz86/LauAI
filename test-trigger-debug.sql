-- Debug Trigger Issue
-- This will help us understand what's happening when a user signs up

-- Step 1: Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 2: Check if function exists
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 3: Drop and recreate with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 4: Create function with detailed logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the incoming data
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    RAISE NOTICE 'User ID: %', NEW.id;
    RAISE NOTICE 'Raw metadata: %', NEW.raw_user_meta_data;
    
    -- Check if metadata exists
    IF NEW.raw_user_meta_data IS NULL THEN
        RAISE NOTICE 'No metadata found, using defaults';
        INSERT INTO public.users (id, email, first_name, last_name, role)
        VALUES (
            NEW.id,
            NEW.email,
            '',
            '',
            'member'
        );
    ELSE
        RAISE NOTICE 'Metadata found, extracting values';
        INSERT INTO public.users (id, email, first_name, last_name, role)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
        );
    END IF;
    
    RAISE NOTICE 'User % created successfully in public.users', NEW.email;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating user %: %', NEW.email, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Step 7: Test the trigger manually (optional)
-- This simulates what happens when a user signs up
-- INSERT INTO auth.users (id, email, raw_user_meta_data) 
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     '{"first_name": "Test", "last_name": "User", "role": "member"}'::jsonb
-- ); 