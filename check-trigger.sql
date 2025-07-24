-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check if the user_role type exists
SELECT 
    typname,
    typtype
FROM pg_type 
WHERE typname = 'user_role';

-- Check if the users table exists and has the right structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position; 