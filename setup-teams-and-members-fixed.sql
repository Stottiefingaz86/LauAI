-- Fixed setup for Teams and Members functionality
-- Run this script in your Supabase SQL Editor

-- 1. First, let's check if the teams table exists and has data
SELECT 'Checking teams table...' as status;
SELECT COUNT(*) as team_count FROM public.teams;

-- 2. Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Create the members table if it doesn't exist
DROP TABLE IF EXISTS public.members CASCADE;

CREATE TABLE public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  signals TEXT DEFAULT 'New',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on members table
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for members table
-- Allow any authenticated user to view members
CREATE POLICY "Team members can view members" ON public.members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow users to insert members (must be the creator)
CREATE POLICY "Users can insert members" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update members they created
CREATE POLICY "Users can update members" ON public.members
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete members they created
CREATE POLICY "Users can delete members" ON public.members
  FOR DELETE USING (auth.uid() = created_by);

-- 6. Add trigger for updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Check if we have any teams to work with
SELECT 'Checking for existing teams...' as status;
SELECT id, name, created_at FROM public.teams ORDER BY created_at DESC LIMIT 5;

-- 8. Check if we have any users to work with
SELECT 'Checking for existing users...' as status;
SELECT id, email, first_name, last_name FROM public.users ORDER BY created_at DESC LIMIT 5;

-- 9. Insert a test team if none exist
INSERT INTO public.teams (name, description, created_by)
SELECT 'Default Team', 'Your first team', u.id
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.teams)
LIMIT 1;

-- 10. Insert a test member if none exist
INSERT INTO public.members (name, email, role, department, team_id, created_by)
SELECT 
  'Test Member', 
  'test@example.com', 
  'Member', 
  'Engineering',
  t.id,
  u.id
FROM public.teams t, public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.members)
LIMIT 1;

-- 11. Verify the setup
SELECT 'Verification complete!' as status;
SELECT 'Teams:' as table_name, COUNT(*) as count FROM public.teams
UNION ALL
SELECT 'Members:' as table_name, COUNT(*) as count FROM public.members;

-- 12. Show sample data
SELECT 'Sample teams:' as info;
SELECT id, name, description, created_at FROM public.teams ORDER BY created_at DESC LIMIT 3;

SELECT 'Sample members:' as info;
SELECT id, name, email, role, department, team_id FROM public.members ORDER BY created_at DESC LIMIT 3; 