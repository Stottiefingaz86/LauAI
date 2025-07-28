-- Fix members table by adding missing added_by column
-- Run this script in your Supabase SQL Editor

-- 1. Check current members table structure
SELECT 'Current members table structure:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Add added_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'added_by'
    ) THEN
        ALTER TABLE public.members ADD COLUMN added_by UUID REFERENCES public.users(id);
        RAISE NOTICE 'Added added_by column to members table';
    ELSE
        RAISE NOTICE 'added_by column already exists in members table';
    END IF;
END $$;

-- 3. Update existing members to have a added_by value (if any exist)
UPDATE public.members
SET added_by = (SELECT id FROM public.users LIMIT 1)
WHERE added_by IS NULL;

-- 4. Verify the fix
SELECT 'Members table structure after fix:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Show current members data
SELECT 'Current members data:' as status;
SELECT id, name, email, role, department, team_id, added_by, created_at FROM public.members; 