-- Comprehensive Survey Creation Fix
-- This script fixes all issues preventing survey creation

-- 1. Update question_type enum to include 'yes_no'
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'yes_no';

-- 2. Enable RLS on surveys table
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can create surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete own surveys" ON public.surveys;

-- 4. Add missing policies for surveys table
CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE USING (created_by = auth.uid());

-- 5. Enable RLS on survey_questions table
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can create survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can update survey questions" ON public.survey_questions;
DROP POLICY IF EXISTS "Users can delete survey questions" ON public.survey_questions;

-- 7. Add policies for survey_questions table
CREATE POLICY "Users can view survey questions" ON public.survey_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE surveys.id = survey_questions.survey_id 
      AND (surveys.created_by = auth.uid() OR surveys.team_id IS NULL OR
        EXISTS (
          SELECT 1 FROM public.team_members 
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

-- 8. Add category column to survey_questions if it doesn't exist
ALTER TABLE public.survey_questions ADD COLUMN IF NOT EXISTS category TEXT;

-- 9. Verify the fixes
SELECT 'Enum values:' as info, unnest(enum_range(NULL::question_type)) as values;

SELECT 'Survey policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'surveys'
ORDER BY policyname;

SELECT 'Survey questions policies:' as info, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'survey_questions'
ORDER BY policyname;

-- 10. Test survey creation (this will show if the policies work)
-- Note: This is just for verification, actual creation will be done by the app
SELECT 'RLS is enabled on surveys:' as info, 
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_tables 
         WHERE tablename = 'surveys' 
         AND rowsecurity = true
       ) THEN 'YES' ELSE 'NO' END as enabled; 