-- Fix the INSERT policy for members table
-- Run this script in your Supabase SQL Editor

-- 1. Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert members" ON public.members;

-- 2. Create a corrected INSERT policy
-- Allow users to insert members (no USING condition needed for INSERT)
CREATE POLICY "Users can insert members" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = added_by);

-- 3. Verify the fixed policy
SELECT 'Fixed INSERT policy for members table:' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'members' AND cmd = 'INSERT';

-- 4. Test the policy (optional)
-- This should now work if you have a user logged in
-- INSERT INTO public.members (name, email, role, department, team_id, added_by)
-- VALUES ('Test Member', 'test@example.com', 'Member', 'Test Role', 
--         (SELECT id FROM public.teams LIMIT 1), 
--         (SELECT id FROM public.users LIMIT 1)); 