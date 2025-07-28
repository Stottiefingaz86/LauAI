-- Fix survey relationships and ensure proper database setup
-- This script will create missing tables and fix relationships

-- 1. Ensure surveys table exists with proper structure
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  team_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure survey_questions table exists with proper foreign key
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE
);

-- 3. Ensure survey_responses table exists with proper foreign keys
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  user_id UUID,
  question_id UUID NOT NULL,
  response_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE
);

-- 4. Create survey_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.survey_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  member_id UUID NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE
);

-- 5. Create survey_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.survey_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  member_id UUID NOT NULL,
  total_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE
);

-- 6. Create survey_insights table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.survey_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL,
  member_id UUID NOT NULL,
  sentiment TEXT,
  key_insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE
);

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON public.survey_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_survey_id ON public.survey_invitations(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_invitations_member_id ON public.survey_invitations(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_survey_id ON public.survey_completions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_completions_member_id ON public.survey_completions(member_id);

-- 8. Enable RLS on all survey tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_insights ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for surveys
CREATE POLICY "Allow authenticated users to view surveys" ON public.surveys
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create surveys" ON public.surveys
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update surveys" ON public.surveys
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 10. Create RLS policies for survey_questions
CREATE POLICY "Allow authenticated users to view survey questions" ON public.survey_questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create survey questions" ON public.survey_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 11. Create RLS policies for survey_responses
CREATE POLICY "Allow authenticated users to view survey responses" ON public.survey_responses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 12. Create RLS policies for survey_invitations
CREATE POLICY "Allow authenticated users to view survey invitations" ON public.survey_invitations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create survey invitations" ON public.survey_invitations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update survey invitations" ON public.survey_invitations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 13. Create RLS policies for survey_completions
CREATE POLICY "Allow authenticated users to view survey completions" ON public.survey_completions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create survey completions" ON public.survey_completions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 14. Create RLS policies for survey_insights
CREATE POLICY "Allow authenticated users to view survey insights" ON public.survey_insights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create survey insights" ON public.survey_insights
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 15. Grant permissions to authenticated users
GRANT ALL ON public.surveys TO authenticated;
GRANT ALL ON public.survey_questions TO authenticated;
GRANT ALL ON public.survey_responses TO authenticated;
GRANT ALL ON public.survey_invitations TO authenticated;
GRANT ALL ON public.survey_completions TO authenticated;
GRANT ALL ON public.survey_insights TO authenticated;

-- 16. Insert some sample survey data if tables are empty
INSERT INTO public.surveys (id, title, description, status, created_at)
SELECT 
  gen_random_uuid(),
  'Sample Survey',
  'A sample survey for testing',
  'active',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.surveys LIMIT 1);

-- 17. Insert sample questions for the sample survey
INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, required)
SELECT 
  s.id,
  'How satisfied are you with your current role?',
  'rating',
  1,
  true
FROM public.surveys s
WHERE s.title = 'Sample Survey'
AND NOT EXISTS (SELECT 1 FROM public.survey_questions sq WHERE sq.survey_id = s.id);

INSERT INTO public.survey_questions (survey_id, question_text, question_type, order_index, required)
SELECT 
  s.id,
  'What would you like to improve in your work environment?',
  'text',
  2,
  false
FROM public.surveys s
WHERE s.title = 'Sample Survey'
AND NOT EXISTS (SELECT 1 FROM public.survey_questions sq WHERE sq.survey_id = s.id AND sq.order_index = 2); 