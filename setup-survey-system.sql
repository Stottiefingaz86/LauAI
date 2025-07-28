-- Comprehensive Survey System Setup
-- Run this script in your Supabase SQL Editor

-- 1. Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create survey_questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'rating', 'multiple_choice', 'yes_no')),
  required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id),
  responses JSONB NOT NULL DEFAULT '{}',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create survey_invitations table
CREATE TABLE IF NOT EXISTS public.survey_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'completed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on all tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_invitations ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for surveys
-- Allow users to view surveys they created or are active
CREATE POLICY "Users can view surveys" ON public.surveys
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      created_by = auth.uid() OR 
      status = 'active'
    )
  );

-- Allow users to create surveys
CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update surveys they created
CREATE POLICY "Users can update surveys" ON public.surveys
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete surveys they created
CREATE POLICY "Users can delete surveys" ON public.surveys
  FOR DELETE USING (auth.uid() = created_by);

-- 7. Create RLS policies for survey_questions
-- Allow users to view questions for surveys they can access
CREATE POLICY "Users can view survey questions" ON public.survey_questions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM public.surveys 
        WHERE id = survey_questions.survey_id 
        AND (created_by = auth.uid() OR status = 'active')
      )
    )
  );

-- Allow users to create questions for surveys they created
CREATE POLICY "Users can create survey questions" ON public.survey_questions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_questions.survey_id 
      AND created_by = auth.uid()
    )
  );

-- Allow users to update questions for surveys they created
CREATE POLICY "Users can update survey questions" ON public.survey_questions
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_questions.survey_id 
      AND created_by = auth.uid()
    )
  );

-- Allow users to delete questions for surveys they created
CREATE POLICY "Users can delete survey questions" ON public.survey_questions
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_questions.survey_id 
      AND created_by = auth.uid()
    )
  );

-- 8. Create RLS policies for survey_responses
-- Allow users to view responses for surveys they created
CREATE POLICY "Users can view survey responses" ON public.survey_responses
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_responses.survey_id 
      AND created_by = auth.uid()
    )
  );

-- Allow members to submit responses
CREATE POLICY "Members can submit survey responses" ON public.survey_responses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    member_id IS NOT NULL
  );

-- Allow users to update responses they submitted
CREATE POLICY "Users can update survey responses" ON public.survey_responses
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    member_id IS NOT NULL
  );

-- 9. Create RLS policies for survey_invitations
-- Allow users to view invitations for surveys they created
CREATE POLICY "Users can view survey invitations" ON public.survey_invitations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_invitations.survey_id 
      AND created_by = auth.uid()
    )
  );

-- Allow users to create invitations for surveys they created
CREATE POLICY "Users can create survey invitations" ON public.survey_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_invitations.survey_id 
      AND created_by = auth.uid()
    )
  );

-- Allow users to update invitations for surveys they created
CREATE POLICY "Users can update survey invitations" ON public.survey_invitations
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.surveys 
      WHERE id = survey_invitations.survey_id 
      AND created_by = auth.uid()
    )
  );

-- 10. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_questions_updated_at BEFORE UPDATE ON public.survey_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_responses_updated_at BEFORE UPDATE ON public.survey_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_survey_invitations_updated_at BEFORE UPDATE ON public.survey_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create trigger for survey response analysis
CREATE OR REPLACE FUNCTION trigger_survey_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- This would trigger AI analysis of the survey response
    -- For now, we'll just log the event
    RAISE NOTICE 'Survey response submitted: %', NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_survey_analysis_trigger
    AFTER INSERT ON public.survey_responses
    FOR EACH ROW EXECUTE FUNCTION trigger_survey_analysis();

-- 12. Insert sample data for testing
INSERT INTO public.surveys (title, description, status, created_by) VALUES
('Team Performance Check-in', 'Monthly check-in to assess team performance and identify areas for improvement', 'active', (SELECT id FROM public.users LIMIT 1)),
('Employee Satisfaction Survey', 'Annual survey to measure employee satisfaction and engagement', 'draft', (SELECT id FROM public.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample questions
INSERT INTO public.survey_questions (survey_id, question, type, required, order_index) VALUES
((SELECT id FROM public.surveys WHERE title = 'Team Performance Check-in' LIMIT 1), 'How would you rate your overall job satisfaction?', 'rating', true, 0),
((SELECT id FROM public.surveys WHERE title = 'Team Performance Check-in' LIMIT 1), 'What challenges are you currently facing in your role?', 'text', false, 1),
((SELECT id FROM public.surveys WHERE title = 'Team Performance Check-in' LIMIT 1), 'Do you feel supported by your manager?', 'yes_no', true, 2),
((SELECT id FROM public.surveys WHERE title = 'Employee Satisfaction Survey' LIMIT 1), 'How satisfied are you with your current role?', 'rating', true, 0),
((SELECT id FROM public.surveys WHERE title = 'Employee Satisfaction Survey' LIMIT 1), 'What would improve your work experience?', 'text', false, 1)
ON CONFLICT DO NOTHING;

-- 13. Verify the setup
SELECT 'Survey system setup complete!' as status;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'survey%';
SELECT 'Sample surveys:' as info;
SELECT title, status FROM public.surveys;
SELECT 'Sample questions:' as info;
SELECT sq.question, sq.type, s.title as survey_title FROM public.survey_questions sq JOIN public.surveys s ON sq.survey_id = s.id; 