import { supabase } from './supabase'

// Authentication
export const authService = {
  async getSession() {
    return await supabase.auth.getSession()
  },

  async signUp(email, password, firstName, lastName, role = 'member') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role
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
    return await supabase.auth.signOut()
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  async inviteUser(email, role, invitedBy) {
    // This would typically create an invitation record in your database
    // For now, we'll simulate the invitation process
    const inviteData = {
      email,
      role,
      invited_by: invitedBy,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      created_at: new Date().toISOString()
    }

    // In a real implementation, you would:
    // 1. Create an invitation record in your database
    // 2. Send an email with the invitation link
    // 3. Track invitation status

    return { data: inviteData, error: null }
  }
}

// Billing and Subscription
export const billingService = {
  async getBillingInfo(userId) {
    // This would typically fetch from your billing service (Stripe, etc.)
    const { data, error } = await supabase
      .from('billing_info')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return { data: null, error }
    }

    // Return default billing info if none exists
    return {
      data: data || {
        plan: 'basic',
        seats: 1,
        used_seats: 1,
        total_seats: 1,
        monthly_cost: 20,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        invite_link: `${window.location.origin}/invite/${userId}`
      },
      error: null
    }
  },

  async updateBillingInfo(userId, updates) {
    const { data, error } = await supabase
      .from('billing_info')
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    return { data, error }
  },

  async getInvitations(userId) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('invited_by', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createInvitation(invitationData) {
    const { data, error } = await supabase
      .from('invitations')
      .insert(invitationData)
      .select()
      .single()

    return { data, error }
  },

  async getInvitation(inviteId) {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', inviteId)
      .single()

    return { data, error }
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

  async getSurveyById(surveyId) {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        questions:survey_questions(*)
      `)
      .eq('id', surveyId)
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
  }
}

// Signals
export const signalService = {
  async getSignals() {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        team_members:team_member_id(name, email, role, department)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createSignal(signalData) {
    const { data, error } = await supabase
      .from('signals')
      .insert(signalData)
      .select()
      .single()

    return { data, error }
  }
}

// Insights
export const insightService = {
  async getInsights() {
    const { data, error } = await supabase
      .from('ai_insights')
      .select(`
        *,
        team_members:team_member_id(name, email)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createInsight(insightData) {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insightData)
      .select()
      .single()

    return { data, error }
  }
}

// Realtime
export const realtimeService = {
  subscribeToUserSignals(userId, callback) {
    return supabase
      .channel('user_signals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signals',
          filter: `team_member_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// Meetings
export const meetingService = {
  async getMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        team_members:team_member_id(name, email)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createMeeting(meetingData) {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select()
      .single()

    return { data, error }
  },

  async updateMeeting(meetingId, updates) {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single()

    return { data, error }
  }
} 