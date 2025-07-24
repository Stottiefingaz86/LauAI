import { supabase } from './supabase'
import { paymentService, plans } from './paymentService'

// Production URL configuration
const PRODUCTION_URL = 'https://lau-r6el3zy53-chris-projects-e99bc8f6.vercel.app';

// Authentication
export const authService = {
  async getSession() {
    return await supabase.auth.getSession()
  },

  async signUp(email, password, firstName, lastName, role = 'member') {
    console.log('Starting signup process...', { email, firstName, lastName, role });
    
    try {
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
      });
      
      console.log('Supabase signup response:', { data, error });
      
      if (error) {
        console.error('Detailed signup error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error.details,
          hint: error.hint
        });
        return { data, error };
      }
      
      // If signup successful and email confirmation is disabled, auto-sign in
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed, attempting auto-signin');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error('Auto-signin failed:', signInError);
          return { data, error: signInError };
        }
        
        console.log('Auto-signin successful:', signInData);
        return { data: signInData, error: null };
      }
      
      return { data, error };
    } catch (err) {
      console.error('Unexpected error in signUp:', err);
      return { data: null, error: err };
    }
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

// Storage Service for file uploads
export const storageService = {
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  async deleteFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { data, error }
  },

  async listFiles(bucket, path = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path)
    return { data, error }
  }
}

// Billing and Subscription with Payment API Integration
export const billingService = {
  async getBillingInfo(userId) {
    try {
      // First try to get billing info from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('billing_info')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        console.error('Supabase billing error:', supabaseError)
      }

      // If we have billing info with a customer_id, try to get updated info from payment API
      if (supabaseData?.customer_id) {
        const { data: paymentData, error: paymentError } = await paymentService.getCustomerBilling(supabaseData.customer_id)
        
        if (!paymentError && paymentData) {
          // Update Supabase with latest payment API data
          const updatedBillingInfo = {
            ...supabaseData,
            plan: paymentData.plan || supabaseData.plan,
            seats: paymentData.seats || supabaseData.seats,
            used_seats: paymentData.used_seats || supabaseData.used_seats,
            total_seats: paymentData.total_seats || supabaseData.total_seats,
            monthly_cost: paymentData.monthly_cost || supabaseData.monthly_cost,
            next_billing_date: paymentData.next_billing_date || supabaseData.next_billing_date,
            subscription_status: paymentData.status || supabaseData.subscription_status,
            updated_at: new Date().toISOString()
          }

          await this.updateBillingInfo(userId, updatedBillingInfo)
          return { data: updatedBillingInfo, error: null }
        }
      }

      // Return Supabase data or default billing info
      return {
        data: supabaseData || {
          plan: 'basic',
          seats: 1,
          used_seats: 1,
          total_seats: 1,
          monthly_cost: 20,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          invite_link: `${PRODUCTION_URL}/invite/${userId}`,
          subscription_status: 'trial'
        },
        error: null
      }
    } catch (error) {
      console.error('Error getting billing info:', error)
      return {
        data: {
          plan: 'basic',
          seats: 1,
          used_seats: 1,
          total_seats: 1,
          monthly_cost: 20,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          invite_link: `${PRODUCTION_URL}/invite/${userId}`,
          subscription_status: 'trial'
        },
        error: null
      }
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

  async createPaymentSession(planData) {
    try {
      const { data, error } = await paymentService.createPaymentSession(planData)
      
      if (error) {
        return { data: null, error }
      }

      // Store session info in Supabase for tracking
      await supabase
        .from('payment_sessions')
        .insert({
          session_id: data.session_id,
          user_id: planData.userId,
          plan: planData.plan,
          seats: planData.seats,
          amount: planData.amount,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      return { data, error: null }
    } catch (error) {
      console.error('Error creating payment session:', error)
      return { data: null, error }
    }
  },

  async getPaymentSession(sessionId) {
    try {
      const { data, error } = await paymentService.getPaymentSession(sessionId)
      
      if (error) {
        return { data: null, error }
      }

      // Update session status in Supabase
      await supabase
        .from('payment_sessions')
        .update({ 
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      return { data, error: null }
    } catch (error) {
      console.error('Error getting payment session:', error)
      return { data: null, error }
    }
  },

  async createCustomer(customerData) {
    try {
      const { data, error } = await paymentService.createCustomer(customerData)
      
      if (error) {
        return { data: null, error }
      }

      // Store customer info in Supabase
      await supabase
        .from('customers')
        .insert({
          customer_id: data.customer_id,
          user_id: customerData.userId,
          email: customerData.email,
          name: customerData.name,
          created_at: new Date().toISOString()
        })

      return { data, error: null }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { data: null, error }
    }
  },

  async getPlans() {
    try {
      const { data, error } = await paymentService.getPlans()
      
      if (error) {
        // Fallback to local plans if API fails
        return { data: Object.values(plans), error: null }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error getting plans:', error)
      return { data: Object.values(plans), error: null }
    }
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
      .eq('status', 'pending')
      .single()

    return { data, error }
  }
}

// Team Management
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
    const { data, error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId)

    return { data, error }
  }
}

// Member Management
export const memberService = {
  async getMembers() {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams(name)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getMemberById(memberId) {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams(name),
        signals:signals(*),
        insights:insights(*),
        meetings:meetings(*),
        survey_responses:survey_responses(*)
      `)
      .eq('id', memberId)
      .single()

    return { data, error }
  },

  async createMember(memberData) {
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single()

    return { data, error }
  },

  async updateMember(memberId, updates) {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single()

    return { data, error }
  },

  async deleteMember(memberId) {
    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)

    return { data, error }
  }
}

// Survey Management
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

// Signal and Insight Management
export const signalService = {
  async getSignals() {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        member:members(name, email, role)
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

export const insightService = {
  async getInsights() {
    const { data, error } = await supabase
      .from('insights')
      .select(`
        *,
        member:members(name, email)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async createInsight(insightData) {
    const { data, error } = await supabase
      .from('insights')
      .insert(insightData)
      .select()
      .single()

    return { data, error }
  }
}

// Real-time updates
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
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }
}

// Meeting Management
export const meetingService = {
  async getMeetings() {
    const { data, error } = await supabase
      .from('meetings')
      .select(`
        *,
        member:members(name, email)
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