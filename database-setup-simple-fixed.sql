-- Simplified Database Setup for LauAI
-- Run this in your Supabase SQL Editor

-- Step 1: Create custom types (remove IF NOT EXISTS for types)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'leader', 'member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role user_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create members table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    rating TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- Step 5: Create billing_info table
CREATE TABLE IF NOT EXISTS public.billing_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT DEFAULT 'basic',
    customer_id TEXT,
    subscription_id TEXT,
    subscription_status TEXT DEFAULT 'trial',
    used_seats INTEGER DEFAULT 1,
    total_seats INTEGER DEFAULT 5,
    monthly_cost DECIMAL(10,2) DEFAULT 20.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role DEFAULT 'member',
    status TEXT DEFAULT 'pending',
    invite_link TEXT,
    invited_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Step 7: Create surveys table
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id),
    target_type TEXT DEFAULT 'individual', -- 'individual' or 'department'
    target_id UUID, -- user_id or team_id
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 8: Create survey_questions table
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'text', -- 'text', 'rating', 'multiple_choice'
    options JSONB, -- For multiple choice questions
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 9: Create survey_responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    response TEXT,
    rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 10: Create signals table
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL, -- 'motivation', 'impact', 'engagement'
    value DECIMAL(3,2) NOT NULL, -- 0.00 to 1.00
    source TEXT DEFAULT 'survey', -- 'survey', 'meeting', 'manual'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 11: Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'performance', 'concern', 'recommendation'
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 12: Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    recording_url TEXT,
    duration INTEGER, -- in seconds
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 13: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 14: Create function to handle new user registration
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

-- Step 15: Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 16: Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Step 17: Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Step 18: Create RLS policies for teams table
CREATE POLICY "Authenticated users can view teams" ON public.teams
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin')
        )
    );

-- Step 19: Create RLS policies for members table
CREATE POLICY "Authenticated users can view members" ON public.members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage members" ON public.members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin')
        )
    );

-- Step 20: Create RLS policies for billing_info table
CREATE POLICY "Users can view their own billing info" ON public.billing_info
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage billing info" ON public.billing_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin')
        )
    );

-- Step 21: Create RLS policies for other tables
CREATE POLICY "Authenticated users can view surveys" ON public.surveys
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view signals" ON public.signals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view insights" ON public.insights
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 22: Insert sample data
INSERT INTO public.teams (name, description) VALUES 
    ('Engineering', 'Software development team'),
    ('Marketing', 'Marketing and communications team'),
    ('Sales', 'Sales and business development team')
ON CONFLICT DO NOTHING;

-- Step 23: Grant basic permissions (this should work)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 24: Test the trigger (optional - you can run this to test)
-- This will show if the trigger is working properly
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'; 