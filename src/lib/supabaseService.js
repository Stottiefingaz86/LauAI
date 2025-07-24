import { supabase } from './supabase'

// Authentication
export const authService = {
  // Sign up with email and password
  async signUp(email, password, firstName, lastName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Get user session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Teams
export const teamService = {
  // Get all teams for current user
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(user_id)
      `)
      .eq('team_members.user_id', (await supabase.auth.getUser()).data.user?.id)
    return { data, error }
  },

  // Create a new team
  async createTeam(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
    return { data, error }
  },

  // Update team
  async updateTeam(teamId, updates) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
    return { data, error }
  },

  // Delete team
  async deleteTeam(teamId) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
    return { error }
  },

  // Add member to team
  async addMemberToTeam(teamId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role
      }])
      .select()
    return { data, error }
  },

  // Remove member from team
  async removeMemberFromTeam(teamId, userId) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)
    return { error }
  }
}

// Members
export const memberService = {
  // Get all members for a team
  async getTeamMembers(teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        users (
          id,
          email,
          first_name,
          last_name,
          avatar_url,
          role
        )
      `)
      .eq('team_id', teamId)
    return { data, error }
  },

  // Get member profile
  async getMemberProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update member profile
  async updateMemberProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    return { data, error }
  }
}

// Surveys
export const surveyService = {
  // Get all surveys for current user's teams
  async getSurveys() {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        teams (
          id,
          name,
          color
        )
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Create a new survey
  async createSurvey(surveyData) {
    const { data, error } = await supabase
      .from('surveys')
      .insert([surveyData])
      .select()
    return { data, error }
  },

  // Update survey
  async updateSurvey(surveyId, updates) {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', surveyId)
      .select()
    return { data, error }
  },

  // Delete survey
  async deleteSurvey(surveyId) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId)
    return { error }
  },

  // Get survey questions
  async getSurveyQuestions(surveyId) {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index')
    return { data, error }
  },

  // Add question to survey
  async addSurveyQuestion(questionData) {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert([questionData])
      .select()
    return { data, error }
  },

  // Submit survey response
  async submitSurveyResponse(responseData) {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert([responseData])
      .select()
    return { data, error }
  },

  // Get survey responses
  async getSurveyResponses(surveyId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey_questions (*),
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('survey_id', surveyId)
    return { data, error }
  }
}

// Signals
export const signalService = {
  // Get signals for a user
  async getUserSignals(userId) {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add a signal
  async addSignal(signalData) {
    const { data, error } = await supabase
      .from('signals')
      .insert([signalData])
      .select()
    return { data, error }
  },

  // Update signal
  async updateSignal(signalId, updates) {
    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', signalId)
      .select()
    return { data, error }
  }
}

// AI Insights
export const insightService = {
  // Get insights for a user
  async getUserInsights(userId) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get team insights
  async getTeamInsights(teamId) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add an insight
  async addInsight(insightData) {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert([insightData])
      .select()
    return { data, error }
  }
}

// Meetings
export const meetingService = {
  // Get meetings for a team
  async getTeamMeetings(teamId) {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        teams (
          id,
          name,
          color
        )
      `)
      .eq('team_id', teamId)
      .order('uploaded_at', { ascending: false })
    return { data, error }
  },

  // Upload meeting recording
  async uploadMeeting(meetingData) {
    const { data, error } = await supabase
      .from('meetings')
      .insert([meetingData])
      .select()
    return { data, error }
  },

  // Update meeting analysis
  async updateMeetingAnalysis(meetingId, analysisData) {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        analyzed_at: new Date().toISOString(),
        analysis_data: analysisData
      })
      .eq('id', meetingId)
      .select()
    return { data, error }
  }
}

// Storage
export const storageService = {
  // Upload file to storage
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  // Get public URL for file
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file from storage
  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  }
} 