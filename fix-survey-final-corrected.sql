-- Final Survey Fix - Corrected Table References
-- This script fixes the team_id column error and sets up surveys properly

-- 1. Create the question_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
        CREATE TYPE question_type AS ENUM ('text', 'rating', 'multiple_choice', 'yes_no');
    END IF;
END $$;

-- 2. Create survey_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'survey_status') THEN
        CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed', 'archived');
    END IF;
END $$;

-- 3. Create surveys table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status survey_status DEFAULT 'draft',
  created_by UUID REFERENCES public.users(id),
  team_id UUID REFERENCES public.teams(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create survey_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple choice questions
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create survey_responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL, -- Flexible response storage
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS on surveys table
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can create surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Team members can view surveys" ON public.surveys;

-- 8. Add policies for surveys table (using correct table references)
CREATE POLICY "Team members can view surveys" ON public.surveys
  FOR SELECT USING (
    team_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE team_id = surveys.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE USING (created_by = auth.uid());

-- 9. Enable RLS on survey_questions table
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- 10. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can create survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can update survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can delete survey questions" ON public.survey_questions;

-- 11. Add policies for survey_questions table (using correct table references)
CREATE POLICY "Users can view survey questions" ON public.survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND (surveys.created_by = auth.uid() OR surveys.team_id IS NULL OR
        EXISTS (
          SELECT 1 FROM public.members 
          WHERE team_id = surveys.team_id AND user_id = auth.uid()
        ))
    )
  );

CREATE POLICY "Users can create survey questions" ON public.survey_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update survey questions" ON public.survey_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete survey questions" ON public.survey_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND surveys.created_by = auth.uid()
    )
  );

-- 12. Enable RLS on survey_responses table
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 13. Add policies for survey_responses table
DROP POLICY IF EXISTS "Users can view own responses" ON public.survey_responses;
CREATE POLICY "Users can view own responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

-- 14. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create trigger for surveys table
DROP TRIGGER IF EXISTS update_surveys_updated_at ON public.surveys;
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Verify everything is set up correctly
SELECT 'Enum values:' as info, unnest(enum_range(NULL::question_type)) as values;

SELECT 'Survey policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'surveys'
ORDER BY policyname;

SELECT 'Survey questions policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'survey_questions'
ORDER BY policyname;

SELECT 'RLS is enabled on surveys:' as info, 
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_tables 
         WHERE tablename = 'surveys' 
         AND rowsecurity = true
       ) THEN 'YES' ELSE 'NO' END as enabled;

SELECT 'Tables exist:' as info, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'surveys') 
       THEN 'surveys: YES' ELSE 'surveys: NO' END as surveys,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'survey_questions') 
       THEN 'survey_questions: YES' ELSE 'survey_questions: NO' END as survey_questions; 