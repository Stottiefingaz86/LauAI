-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE question_type AS ENUM ('text', 'rating', 'multiple_choice', 'yes_no');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams/Departments table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4ade80',
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Surveys table
CREATE TABLE public.surveys (
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

-- Survey questions table
CREATE TABLE public.survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  options JSONB, -- For multiple choice questions
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL, -- Flexible response storage
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1:1 Meeting recordings table
CREATE TABLE public.meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  recording_url TEXT,
  duration INTEGER, -- in seconds
  participants JSONB, -- Array of user IDs
  team_id UUID REFERENCES public.teams(id),
  uploaded_by UUID REFERENCES public.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  analysis_data JSONB -- AI analysis results
);

-- Performance signals table
CREATE TABLE public.signals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL, -- 'survey', 'meeting', 'manual'
  value INTEGER NOT NULL, -- 1-10 scale
  source_id UUID, -- Reference to survey_id or meeting_id
  source_type TEXT, -- 'survey' or 'meeting'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Insights table
CREATE TABLE public.ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id),
  insight_type TEXT NOT NULL, -- 'performance', 'concern', 'recommendation', 'meeting_analysis', 'survey_analysis'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  action_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Row Level Security Policies

-- Users can only see their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Team members can see team data
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view teams" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

-- Team members can see other team members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm2
      WHERE tm2.team_id = team_members.team_id AND tm2.user_id = auth.uid()
    )
  );

-- Survey access policies
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view surveys" ON public.surveys
  FOR SELECT USING (
    team_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = surveys.team_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create surveys" ON public.surveys
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE USING (created_by = auth.uid());

-- Survey questions access policies
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
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

-- Users can only see their own responses
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

-- Meeting access policies
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view meetings" ON public.meetings
  FOR SELECT USING (
    team_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = meetings.team_id AND user_id = auth.uid()
    )
  );

-- Signals access policies
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own signals" ON public.signals
  FOR SELECT USING (user_id = auth.uid());

-- AI Insights access policies
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view insights" ON public.ai_insights
  FOR SELECT USING (
    user_id = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = ai_insights.team_id AND user_id = auth.uid()
    ))
  );

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_val user_role;
    first_name_val TEXT;
    last_name_val TEXT;
BEGIN
    -- Safely extract values with fallbacks
    first_name_val := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    last_name_val := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    
    -- Extract role with proper error handling
    IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'role' THEN
        user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
    ELSE
        user_role_val := 'member';
    END IF;
    
    -- Insert with comprehensive error handling
    INSERT INTO public.users (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        first_name_val,
        last_name_val,
        user_role_val
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to trigger meeting analysis when recording is uploaded
CREATE OR REPLACE FUNCTION trigger_meeting_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if recording_url is provided and not already analyzed
  IF NEW.recording_url IS NOT NULL AND NEW.analyzed_at IS NULL THEN
    -- Call the analyze-meeting edge function
    PERFORM net.http_post(
      url := 'https://ycmiaagfyszjqmfhsgqb.supabase.co/functions/v1/analyze-meeting',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings')::json->>'service_role_key'
      ),
      body := jsonb_build_object(
        'meeting_id', NEW.id,
        'recording_url', NEW.recording_url,
        'user_id', NEW.uploaded_by,
        'team_id', NEW.team_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for meeting analysis
CREATE TRIGGER trigger_meeting_analysis_trigger
  AFTER INSERT OR UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION trigger_meeting_analysis();

-- Function to trigger survey analysis when responses are submitted
CREATE OR REPLACE FUNCTION trigger_survey_analysis()
RETURNS TRIGGER AS $$
DECLARE
  survey_responses_count INTEGER;
  total_questions_count INTEGER;
BEGIN
  -- Count total responses for this survey and user
  SELECT COUNT(*) INTO survey_responses_count
  FROM public.survey_responses
  WHERE survey_id = NEW.survey_id AND user_id = NEW.user_id;
  
  -- Count total questions in the survey
  SELECT COUNT(*) INTO total_questions_count
  FROM public.survey_questions
  WHERE survey_id = NEW.survey_id;
  
  -- If all questions are answered, trigger analysis
  IF survey_responses_count >= total_questions_count THEN
    -- Get all responses for this survey and user
    WITH user_responses AS (
      SELECT 
        sr.survey_id,
        sr.user_id,
        jsonb_agg(
          jsonb_build_object(
            'question_id', sr.question_id,
            'response_data', sr.response_data
          )
        ) as responses
      FROM public.survey_responses sr
      WHERE sr.survey_id = NEW.survey_id AND sr.user_id = NEW.user_id
      GROUP BY sr.survey_id, sr.user_id
    )
    SELECT net.http_post(
      url := 'https://ycmiaagfyszjqmfhsgqb.supabase.co/functions/v1/process-survey',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings')::json->>'service_role_key'
      ),
      body := jsonb_build_object(
        'survey_id', survey_id,
        'user_id', user_id,
        'responses', responses,
        'team_id', (SELECT team_id FROM public.surveys WHERE id = survey_id)
      )
    ) FROM user_responses;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for survey analysis
CREATE TRIGGER trigger_survey_analysis_trigger
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION trigger_survey_analysis();

-- Enable the http extension for edge function calls
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions"; 