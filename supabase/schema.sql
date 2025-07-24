-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE question_type AS ENUM ('text', 'rating', 'multiple_choice');

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
  insight_type TEXT NOT NULL, -- 'performance', 'concern', 'recommendation'
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
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 