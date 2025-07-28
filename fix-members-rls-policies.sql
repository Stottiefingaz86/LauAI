-- Fix RLS policies for members table
-- Run this script in your Supabase SQL Editor

-- 1. Check current RLS policies
SELECT 'Current RLS policies for members table:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'members';

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Team members can view members" ON public.members;
DROP POLICY IF EXISTS "Users can insert members" ON public.members;
DROP POLICY IF EXISTS "Users can update members" ON public.members;
DROP POLICY IF EXISTS "Users can delete members" ON public.members;

-- 3. Create new RLS policies
-- Allow any authenticated user to view members
CREATE POLICY "Team members can view members" ON public.members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert members (must be the creator)
CREATE POLICY "Users can insert members" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = added_by);

-- Allow users to update members they created
CREATE POLICY "Users can update members" ON public.members
  FOR UPDATE USING (auth.uid() = added_by);

-- Allow users to delete members they created
CREATE POLICY "Users can delete members" ON public.members
  FOR DELETE USING (auth.uid() = added_by);

-- 4. Verify the new policies
SELECT 'New RLS policies for members table:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'members';

-- 5. Test insert (optional - will show if policies work)
-- This will only work if you have a user logged in
-- INSERT INTO public.members (name, email, role, department, team_id, added_by)
-- VALUES ('Test Member', 'test@example.com', 'Member', 'Test Role', 
--         (SELECT id FROM public.teams LIMIT 1), 
--         (SELECT id FROM public.users LIMIT 1)); 