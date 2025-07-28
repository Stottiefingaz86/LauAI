-- Fix Survey RLS Policies
-- This script adds the missing INSERT, UPDATE, and DELETE policies for surveys and survey_questions

-- Enable RLS on surveys table (if not already enabled)
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Add missing policies for surveys table
CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE USING (created_by = auth.uid());

-- Enable RLS on survey_questions table (if not already enabled)
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;

-- Add policies for survey_questions table
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

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('surveys', 'survey_questions')
ORDER BY tablename, policyname; 