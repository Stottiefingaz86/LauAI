import { supabase } from './supabase'

// Authentication
export const authService = {
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

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return { session }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Teams
export const teamService = {
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createTeam(teamData) {
    const { data, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single()
    return { data, error }
  },

  async updateTeam(teamId, updates) {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single()
    return { data, error }
  },

  async deleteTeam(teamId) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)
    return { error }
  },

  async addMemberToTeam(teamId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role
      })
      .select()
      .single()
    return { data, error }
  },

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
          role,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
    return { data, error }
  },

  async getMemberProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateMemberProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// Surveys
export const surveyService = {
  async getSurveys() {
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createSurvey(surveyData) {
    const { data, error } = await supabase
      .from('surveys')
      .insert(surveyData)
      .select()
      .single()
    return { data, error }
  },

  async updateSurvey(surveyId, updates) {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', surveyId)
      .select()
      .single()
    return { data, error }
  },

  async deleteSurvey(surveyId) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId)
    return { error }
  },

  async getSurveyQuestions(surveyId) {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true })
    return { data, error }
  },

  async addSurveyQuestion(questionData) {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(questionData)
      .select()
      .single()
    return { data, error }
  },

  async submitSurveyResponse(responseData) {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert(responseData)
      .select()
      .single()
    return { data, error }
  },

  async getSurveyResponses(surveyId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
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
  async getUserSignals(userId) {
    const { data, error } = await supabase
      .from('signals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async addSignal(signalData) {
    const { data, error } = await supabase
      .from('signals')
      .insert(signalData)
      .select()
      .single()
    return { data, error }
  },

  async updateSignal(signalId, updates) {
    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', signalId)
      .select()
      .single()
    return { data, error }
  }
}

// AI Insights
export const insightService = {
  async getUserInsights(userId) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getTeamInsights(teamId) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async addInsight(insightData) {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insightData)
      .select()
      .single()
    return { data, error }
  }
}

// Meetings
export const meetingService = {
  async getTeamMeetings(teamId) {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('team_id', teamId)
      .order('uploaded_at', { ascending: false })
    return { data, error }
  },

  async uploadMeeting(meetingData) {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single()
    return { data, error }
  },

  async updateMeetingAnalysis(meetingId, analysisData) {
    const { data, error } = await supabase
      .from('meetings')
      .update({
        analyzed_at: new Date().toISOString(),
        analysis_data: analysisData
      })
      .eq('id', meetingId)
      .select()
      .single()
    return { data, error }
  }
}

// Storage
export const storageService = {
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    return { data, error }
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { error }
  }
}

// Real-time subscriptions
export const realtimeService = {
  subscribeToUserSignals(userId, callback) {
    return supabase
      .channel(`user-signals-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signals',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToUserInsights(userId, callback) {
    return supabase
      .channel(`user-insights-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToTeamInsights(teamId, callback) {
    return supabase
      .channel(`team-insights-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights',
          filter: `team_id=eq.${teamId}`
        },
        callback
      )
      .subscribe()
  },

  subscribeToMeetings(teamId, callback) {
    return supabase
      .channel(`team-meetings-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
          filter: `team_id=eq.${teamId}`
        },
        callback
      )
      .subscribe()
  }
}

// Edge function calls
export const edgeFunctionService = {
  async analyzeMeeting(meetingData) {
    const { data, error } = await supabase.functions.invoke('analyze-meeting', {
      body: meetingData
    })
    return { data, error }
  },

  async processSurvey(surveyData) {
    const { data, error } = await supabase.functions.invoke('process-survey', {
      body: surveyData
    })
    return { data, error }
  }
} 