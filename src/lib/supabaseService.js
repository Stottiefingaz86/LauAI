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
  async getMembers() {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        teams:team_id(name),
        signals:signals(value, created_at),
        meetings:meetings(id, title, description, created_at, recording_url, analyzed_at, analysis_data),
        surveys:survey_responses(survey_id, response_data, submitted_at)
      `)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getMemberById(memberId) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        teams:team_id(name),
        signals:signals(value, created_at, signal_type, notes),
        meetings:meetings(
          id, 
          title, 
          description, 
          created_at, 
          recording_url, 
          analyzed_at, 
          analysis_data,
          duration,
          file_size
        ),
        surveys:survey_responses(
          survey_id, 
          response_data, 
          submitted_at,
          surveys:survey_id(title, description, status)
        ),
        insights:ai_insights(
          id,
          title,
          description,
          severity,
          action_items,
          created_at,
          insight_type
        )
      `)
      .eq('id', memberId)
      .single();

    if (data) {
      // Process the data to group surveys and add computed fields
      const processedData = {
        ...data,
        meetings: data.meetings || [],
        surveys: this.processSurveyData(data.surveys || []),
        insights: data.insights || [],
        signals: data.signals || []
      };

      return { data: processedData, error };
    }

    return { data, error };
  },

  processSurveyData(surveyResponses) {
    // Group survey responses by survey_id and add computed fields
    const surveyGroups = {};
    
    surveyResponses.forEach(response => {
      const surveyId = response.survey_id;
      if (!surveyGroups[surveyId]) {
        surveyGroups[surveyId] = {
          id: surveyId,
          title: response.surveys?.title || `Survey ${surveyId}`,
          description: response.surveys?.description || '',
          status: response.surveys?.status || 'completed',
          responses: [],
          completed_at: response.submitted_at,
          questions_count: 0,
          satisfaction_score: 0,
          response_count: 0
        };
      }
      
      surveyGroups[surveyId].responses.push({
        question: `Question ${surveyGroups[surveyId].responses.length + 1}`,
        answer: response.response_data
      });
    });

    // Calculate computed fields
    Object.values(surveyGroups).forEach(survey => {
      survey.questions_count = survey.responses.length;
      survey.response_count = survey.responses.length;
      
      // Calculate satisfaction score from responses
      const scores = survey.responses
        .map(r => {
          if (typeof r.answer === 'number') return r.answer;
          if (typeof r.answer === 'object' && r.answer.rating) return r.answer.rating;
          return null;
        })
        .filter(score => score !== null);
      
      survey.satisfaction_score = scores.length > 0 
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 'N/A';
    });

    return Object.values(surveyGroups);
  },

  async createMember(memberData) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(memberData)
      .select()
      .single();

    return { data, error };
  },

  async updateMember(memberId, updates) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    return { data, error };
  },

  async deleteMember(memberId) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId);

    return { error };
  }
};

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