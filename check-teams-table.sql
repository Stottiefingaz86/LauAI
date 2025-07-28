-- Check Teams Table Setup
-- Run this in your Supabase SQL Editor

-- Step 1: Check if teams table exists
SELECT 'Checking teams table...' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'teams' AND table_schema = 'public';

-- Step 2: Check teams table structure
SELECT 'Checking teams table structure...' as step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teams' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Check RLS policies on teams table
SELECT 'Checking RLS policies...' as step;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'teams' AND schemaname = 'public';

-- Step 4: Check if RLS is enabled
SELECT 'Checking RLS status...' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'teams' AND schemaname = 'public';

-- Step 5: Test inserting a team (this will show any errors)
SELECT 'Testing team insertion...' as step;
DO $$
DECLARE
    test_team_id UUID;
    test_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- dummy user ID
BEGIN
    -- Try to insert a test team
    INSERT INTO public.teams (name, description, created_by)
    VALUES ('Test Team', 'Test team description', test_user_id)
    RETURNING id INTO test_team_id;
    
    RAISE NOTICE 'SUCCESS: Test team created with ID: %', test_team_id;
    
    -- Clean up
    DELETE FROM public.teams WHERE id = test_team_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Team insertion failed: %', SQLERRM;
END $$;

-- Step 6: Check current teams
SELECT 'Current teams in database:' as step;
SELECT 
    id,
    name,
    description,
    created_by,
    created_at
FROM public.teams
ORDER BY created_at DESC; 