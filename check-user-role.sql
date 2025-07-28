-- Check and Fix User Role
-- Let's see what role the user actually has and fix it

-- Step 1: Check user role in auth.users
SELECT 'Checking user role in auth.users...' as step;
SELECT 
    id,
    email,
    raw_user_meta_data,
    role
FROM auth.users
WHERE email = 'christopher.hunt86@gmail.com';

-- Step 2: Check user role in public.users
SELECT 'Checking user role in public.users...' as step;
SELECT 
    id,
    email,
    first_name,
    last_name,
    role
FROM public.users
WHERE email = 'christopher.hunt86@gmail.com';

-- Step 3: Update user role to admin in both tables
SELECT 'Updating user role to admin...' as step;
DO $$
BEGIN
    -- Update auth.users
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE email = 'christopher.hunt86@gmail.com';
    
    -- Update public.users
    UPDATE public.users 
    SET role = 'admin'
    WHERE email = 'christopher.hunt86@gmail.com';
    
    RAISE NOTICE 'SUCCESS: User role updated to admin in both tables';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'FAILURE: Error updating user role: %', SQLERRM;
END $$;

-- Step 4: Verify the changes
SELECT 'Verifying role changes...' as step;
SELECT 
    'auth.users' as table_name,
    id,
    email,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data
FROM auth.users
WHERE email = 'christopher.hunt86@gmail.com'
UNION ALL
SELECT 
    'public.users' as table_name,
    id,
    email,
    role::text,
    NULL
FROM public.users
WHERE email = 'christopher.hunt86@gmail.com'
ORDER BY table_name; 