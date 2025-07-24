-- LauAI Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'leader', 'member');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'canceled', 'past_due');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'canceled');
CREATE TYPE signal_type AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE insight_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'member',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Members table (team members)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role DEFAULT 'member',
    department TEXT,
    position TEXT,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- Billing info table
CREATE TABLE IF NOT EXISTS public.billing_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    customer_id TEXT,
    plan TEXT DEFAULT 'basic',
    seats INTEGER DEFAULT 1,
    used_seats INTEGER DEFAULT 1,
    total_seats INTEGER DEFAULT 1,
    monthly_cost DECIMAL(10,2) DEFAULT 20.00,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    subscription_status subscription_status DEFAULT 'trial',
    trial_days_left INTEGER DEFAULT 14,
    invite_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment sessions table
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    seats INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role DEFAULT 'member',
    invited_by UUID REFERENCES public.users(id),
    status invitation_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type TEXT DEFAULT 'text',
    options JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    response_data JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signals table
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    signal_type signal_type NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 10),
    notes TEXT,
    source TEXT DEFAULT 'survey',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity insight_severity DEFAULT 'medium',
    action_items JSONB,
    insight_type TEXT DEFAULT 'performance',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    recording_url TEXT,
    duration INTEGER, -- in seconds
    file_size INTEGER, -- in bytes
    analyzed_at TIMESTAMP WITH TIME ZONE,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_team_id ON public.members(team_id);
CREATE INDEX IF NOT EXISTS idx_signals_member_id ON public.signals(member_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON public.signals(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_member_id ON public.insights(member_id);
CREATE INDEX IF NOT EXISTS idx_meetings_member_id ON public.meetings(member_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_member_id ON public.survey_responses(member_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for teams table
CREATE POLICY "Users can view teams they belong to" ON public.teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for members table
CREATE POLICY "Users can view members in their teams" ON public.members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m2
            WHERE m2.team_id = members.team_id AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for billing_info table
CREATE POLICY "Users can view their own billing info" ON public.billing_info
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage billing info" ON public.billing_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for signals table
CREATE POLICY "Users can view signals for members in their teams" ON public.signals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.members m2 ON m.team_id = m2.team_id
            WHERE m.id = signals.member_id AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage signals" ON public.signals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for insights table
CREATE POLICY "Users can view insights for members in their teams" ON public.insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.members m2 ON m.team_id = m2.team_id
            WHERE m.id = insights.member_id AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage insights" ON public.insights
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for meetings table
CREATE POLICY "Users can view meetings for members in their teams" ON public.meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.members m
            JOIN public.members m2 ON m.team_id = m2.team_id
            WHERE m.id = meetings.member_id AND m2.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage meetings" ON public.meetings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_id UUID,
    first_name TEXT,
    last_name TEXT,
    role user_role
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users
    SET 
        first_name = update_user_profile.first_name,
        last_name = update_user_profile.last_name,
        role = update_user_profile.role,
        updated_at = NOW()
    WHERE id = update_user_profile.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data for testing
INSERT INTO public.teams (name, description) VALUES
('Engineering', 'Software development team'),
('Marketing', 'Marketing and communications team'),
('Sales', 'Sales and business development team')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 