-- Comprehensive fix for members table
-- Run this script in your Supabase SQL Editor

-- 1. First, ensure the added_by column exists
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

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Team members can view members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;

-- 3. Create new policies with proper conditions
-- Allow any authenticated user to view members
CREATE POLICY "Team members can view members" ON public.members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert members (WITH CHECK only, no USING for INSERT)
CREATE POLICY "Users can insert members" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = added_by);

-- Allow users to update members they created
CREATE POLICY "Users can update members" ON public.members
  FOR UPDATE USING (auth.uid() = added_by);

-- Allow users to delete members they created
CREATE POLICY "Users can delete members" ON public.members
  FOR DELETE USING (auth.uid() = added_by);

-- 4. Verify the table structure
SELECT 'Members table structure:' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'members' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verify the policies
SELECT 'Members table policies:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY cmd;

-- 6. Show current data
SELECT 'Current members data:' as status;
SELECT id, name, email, role, department, team_id, added_by, created_at FROM public.members; 