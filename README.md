# LauAI - Team Performance Analytics Platform

A modern, glassmorphic web application for tracking team performance through surveys, 1:1 meetings, and AI-powered insights.

## 🚀 Features

- **Real-time Authentication** - Supabase Auth with email/password
- **Team Management** - Create teams, add members, manage roles
- **Survey System** - Create and send surveys with dynamic URLs
- **Performance Tracking** - Signal-based performance metrics
- **AI Insights** - Automated analysis and recommendations
- **Modern UI** - Dark theme with glassmorphic effects
- **Responsive Design** - Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6
- **Styling**: Tailwind CSS with custom glassmorphic components
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Deployment**: Vercel (planned)

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account
- Resend account (for email)

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd LauAI
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
REACT_APP_SUPABASE_URL=https://ycmiaagfyszjqmfhsgqb.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_RESEND_API_KEY=your_resend_api_key_here
```

### 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the schema from `supabase/schema.sql`

### 4. Start Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🗄️ Database Schema

### Core Tables

- **users** - User profiles (extends Supabase auth)
- **teams** - Team/department information
- **team_members** - Junction table for team membership
- **surveys** - Survey templates and active surveys
- **survey_questions** - Individual survey questions
- **survey_responses** - User responses to surveys
- **meetings** - 1:1 meeting recordings and analysis
- **signals** - Performance metrics and scores
- **ai_insights** - AI-generated insights and recommendations

### Row Level Security

All tables have RLS enabled with appropriate policies:
- Users can only see their own data
- Team members can see team data
- Survey responses are private to the user

## 🔐 Authentication

The app uses Supabase Auth with:
- Email/password authentication
- Automatic user profile creation
- Session management
- Protected routes

## 📊 Features Overview

### Dashboard
- Performance overview with KPIs
- Department filtering
- AI insights and recommendations
- Team concerns tracking

### Teams
- Create and manage teams
- Add/remove team members
- Individual member profiles
- Performance tracking

### Surveys
- Create survey templates
- Send surveys to teams/individuals
- Dynamic survey URLs
- Response tracking

### 1:1 Meetings
- Upload meeting recordings
- AI analysis of conversations
- Performance insights
- Action item tracking

## 🎨 UI Components

### Glassmorphic Design
- Custom Tailwind classes for glass effects
- Dark theme with mint accent colors
- Smooth animations and transitions
- Responsive design

### Key Components
- `AppShell` - Main layout with sidebar
- `Dock` - Quick action bar
- `glass-card` - Glassmorphic cards
- `glass-button` - Styled buttons
- `glass-input` - Form inputs

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_RESEND_API_KEY=your_resend_api_key
```

## 🔧 Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── data/          # Mock data and utilities
├── lib/           # External service integrations
├── pages/         # Page components
└── index.css      # Global styles and Tailwind
```

### Key Files

- `src/App.js` - Main app with routing
- `src/contexts/AuthContext.js` - Authentication state
- `src/lib/supabase.js` - Supabase client
- `src/lib/supabaseService.js` - Database operations
- `src/components/AppShell.js` - Main layout
- `src/components/Dock.js` - Quick actions

## 🐛 Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   npm start -- --port 3001
   ```

2. **Supabase connection issues**
   - Check environment variables
   - Verify Supabase project is active
   - Check RLS policies

3. **Authentication not working**
   - Ensure Supabase Auth is enabled
   - Check email confirmation settings
   - Verify user creation trigger

## 📝 TODO

- [ ] Implement Resend email integration
- [ ] Add OpenAI API for meeting analysis
- [ ] Create edge functions for complex operations
- [ ] Add real-time notifications
- [ ] Implement file upload for meeting recordings
- [ ] Add advanced analytics dashboard
- [ ] Create admin panel for user management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using React, Supabase, and Tailwind CSS
