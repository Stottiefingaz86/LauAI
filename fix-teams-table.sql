-- Fix teams table by adding missing created_by column
-- Run this script in your Supabase SQL Editor

-- 1. Check current teams table structure
SELECT 'Current teams table structure:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add created_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN created_by UUID REFERENCES public.users(id);
        RAISE NOTICE 'Added created_by column to teams table';
    ELSE
        RAISE NOTICE 'created_by column already exists in teams table';
    END IF;
END $$;

-- 3. Update existing teams to have a created_by value (if any exist)
UPDATE public.teams 
SET created_by = (SELECT id FROM public.users LIMIT 1)
WHERE created_by IS NULL;
image.png
-- 4. Verify the fix
SELECT 'Teams table structure after fix:' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Show current teams data
SELECT 'Current teams data:' as status;
SELECT id, name, description, created_by, created_at FROM public.teams; 