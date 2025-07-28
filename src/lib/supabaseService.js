import { supabase } from './supabase'
import { paymentService, plans } from './paymentService'
import { emailService } from './emailService';

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
      // Test if the issue is with the specific email
      console.log('Testing signup with email:', email);
      
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
        
        // If it's a database error, let's try with a different email to test
        if (error.message.includes('Database error')) {
          console.log('Database error detected, testing with different email...');
          const testEmail = 'testuser123@example.com';
          
          const { data: testData, error: testError } = await supabase.auth.signUp({
            email: testEmail,
            password: 'TestPassword123!',
            options: {
              data: {
                first_name: 'Test',
                last_name: 'User',
                role: 'member'
              }
            }
          });
          
          console.log('Test signup result:', { testData, testError });
          
          if (testError && testError.message.includes('Database error')) {
            console.error('Database error also occurs with test email - this is a system issue');
          } else if (!testError) {
            console.log('Test signup succeeded - issue is specific to the original email');
            // Clean up test user
            await supabase.auth.signOut();
          }
        }
        
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
    try {
      console.log('authService: Starting sign out...');
      
      // Clear any stored auth tokens
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-REACT_APP_SUPABASE_URL-auth-token');
      sessionStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('sb-REACT_APP_SUPABASE_URL-auth-token');
      
      // Call Supabase sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('authService: Supabase sign out error:', error);
        return { error };
      }
      
      console.log('authService: Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('authService: Unexpected error during sign out:', error);
      return { error };
    }
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
  },

  async getTeamMembers() {
    const { data, error } = await supabase
      .from('members')
      .select(`
        *,
        team:teams(name)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async addTeamMember(memberData) {
    const { data, error } = await supabase
      .from('members')
      .insert(memberData)
      .select()
      .single()

    return { data, error }
  },

  async removeTeamMember(memberId) {
    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('id', memberId)

    return { data, error }
  },

  async removeTeamMembersByTeamId(teamId) {
    const { data, error } = await supabase
      .from('members')
      .delete()
      .eq('team_id', teamId)

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
    // First get the basic member data
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (memberError) {
      return { data: null, error: memberError };
    }

    // Load related data
    const [insightsData, signalsData, meetingsData, surveyResponsesData] = await Promise.all([
      // Get insights for this member
      supabase
        .from('insights')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),
      
      // Get signals for this member
      supabase
        .from('signals')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),
      
      // Get meetings for this member
      supabase
        .from('meetings')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false }),
      
      // Get survey responses for this member
      supabase
        .from('survey_responses')
        .select(`
          *,
          survey:surveys(title, description)
        `)
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
    ]);

    // Combine all data
    const enrichedMember = {
      ...member,
      insights: insightsData.data || [],
      signals: signalsData.data || [],
      meetings: meetingsData.data || [],
      survey_responses: surveyResponsesData.data || []
    };

    return { data: enrichedMember, error: null };
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
    try {
      console.log('📊 Loading surveys...');
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Surveys loaded:', data?.length || 0, 'surveys');
      if (data) {
        data.forEach(survey => {
          console.log('📋 Survey:', survey.id, survey.title, survey.status);
        });
      }

      return { data, error }
    } catch (error) {
      console.error('❌ Error loading surveys:', error);
      return { data: null, error }
    }
  },

  async getSurveyById(surveyId) {
    try {
      // First get the survey
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) {
        console.error('Error fetching survey:', surveyError);
        return { data: null, error: surveyError };
      }

      if (!survey) {
        console.error('Survey not found:', surveyId);
        return { data: null, error: { message: 'Survey not found' } };
      }

      // Then get the questions separately to avoid join issues
      const { data: questions, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('order_index', { ascending: true });

      if (questionsError) {
        console.error('Error fetching survey questions:', questionsError);
        // Continue with empty questions array
      }

      // Combine the data
      const surveyWithQuestions = {
        ...survey,
        questions: questions || []
      };

      return { data: surveyWithQuestions, error: null };
    } catch (error) {
      console.error('Error in getSurveyById:', error);
      return { data: null, error };
    }
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
    try {
      console.log('🗑️ Starting comprehensive survey deletion for:', surveyId);
      
      // First, verify the survey exists
      const { data: existingSurvey, error: checkError } = await supabase
        .from('surveys')
        .select('id, title')
        .eq('id', surveyId)
        .single();

      if (checkError || !existingSurvey) {
        console.error('❌ Survey not found for deletion:', surveyId);
        return { data: null, error: { message: 'Survey not found' } };
      }

      console.log('✅ Found survey to delete:', existingSurvey.title);
      
      // Delete in the correct order to avoid foreign key constraint issues
      const deletionSteps = [
        // 1. Delete survey responses first (they reference questions and members)
        async () => {
          console.log('📝 Deleting survey responses...');
          const { count: responseCount, error } = await supabase
            .from('survey_responses')
            .delete()
            .eq('survey_id', surveyId);
          if (error) throw error;
          console.log('✅ Survey responses deleted:', responseCount, 'responses');
        },
        
        // 2. Delete survey insights
        async () => {
          console.log('🧠 Deleting survey insights...');
          const { count: insightCount, error } = await supabase
            .from('survey_insights')
            .delete()
            .eq('survey_id', surveyId);
          if (error) throw error;
          console.log('✅ Survey insights deleted:', insightCount, 'insights');
        },
        
        // 3. Delete survey completions
        async () => {
          console.log('✅ Deleting survey completions...');
          const { count: completionCount, error } = await supabase
            .from('survey_completions')
            .delete()
            .eq('survey_id', surveyId);
          if (error) throw error;
          console.log('✅ Survey completions deleted:', completionCount, 'completions');
        },
        
        // 4. Delete survey invitations
        async () => {
          console.log('📧 Deleting survey invitations...');
          const { count: invitationCount, error } = await supabase
            .from('survey_invitations')
            .delete()
            .eq('survey_id', surveyId);
          if (error) throw error;
          console.log('✅ Survey invitations deleted:', invitationCount, 'invitations');
        },
        
        // 5. Delete survey questions
        async () => {
          console.log('❓ Deleting survey questions...');
          const { count: questionCount, error } = await supabase
            .from('survey_questions')
            .delete()
            .eq('survey_id', surveyId);
          if (error) throw error;
          console.log('✅ Survey questions deleted:', questionCount, 'questions');
        },
        
        // 6. Finally delete the survey itself
        async () => {
          console.log('📊 Deleting survey...');
          const { error } = await supabase
            .from('surveys')
            .delete()
            .eq('id', surveyId);
          if (error) throw error;
          console.log('✅ Survey deleted');
        }
      ];

      // Execute all deletion steps
      for (const step of deletionSteps) {
        await step();
      }

      // Verify the survey is actually deleted
      const { data: verifySurvey, error: verifyError } = await supabase
        .from('surveys')
        .select('id')
        .eq('id', surveyId)
        .single();

      if (verifySurvey) {
        console.error('❌ Survey still exists after deletion!');
        return { data: null, error: { message: 'Survey deletion failed - survey still exists' } };
      }

      console.log('🎉 Survey deletion completed successfully');
      return { data: { success: true, surveyId }, error: null };
      
    } catch (error) {
      console.error('❌ Error deleting survey:', error);
      return { data: null, error };
    }
  },

  async createSurveyQuestion(questionData) {
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(questionData)
      .select()
      .single()

    return { data, error }
  },

  async getSurveyQuestions(surveyId) {
    const { data, error } = await supabase
      .from('survey_questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('order_index', { ascending: true })

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
        member:members(name, email, role),
        survey:surveys(title)
      `)
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getMemberSurveyResponses(memberId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        survey:surveys(title, description)
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async sendSurveyEmail(surveyId, memberIds) {
    try {
      console.log('Starting sendSurveyEmail with:', { surveyId, memberIds });
      
      // First, verify the survey exists
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError || !survey) {
        console.error('Survey not found:', surveyId, surveyError);
        return { data: null, error: { message: 'Survey not found' } };
      }

      console.log('Survey found:', survey);

      // Get the member details
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, email, name')
        .in('id', memberIds);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return { data: null, error: membersError };
      }

      if (!members || members.length === 0) {
        console.error('No members found for IDs:', memberIds);
        return { data: null, error: { message: 'No members found' } };
      }

      console.log('Members found:', members);

      // Create survey invitations for tracking
      const invitations = members.map(member => ({
        survey_id: surveyId,
        member_id: member.id,
        email: member.email,
        status: 'sent',
        sent_at: new Date().toISOString()
      }));

      console.log('Creating invitations:', invitations);

      // Try to insert into survey_invitations table
      let surveyInvitationsResult = null;
      try {
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('survey_invitations')
          .insert(invitations)
          .select();

        if (invitationsError) {
          console.error('Error creating survey invitations:', invitationsError);
          // Continue with fallback tracking
        } else {
          surveyInvitationsResult = invitationsData;
          console.log('Survey invitations created successfully:', invitationsData);
        }
      } catch (error) {
        console.error('Exception creating survey invitations:', error);
        // Continue with fallback tracking
      }

      // Fallback: Create tracking records in a different table or log
      if (!surveyInvitationsResult) {
        console.log('Using fallback tracking system...');
        
        // Try to create a simple tracking record in the signals table
        const trackingSignals = members.map(member => ({
          user_id: member.id,
          signal_type: 'survey_sent',
          value: 1,
          source_id: surveyId,
          source_type: 'survey',
          notes: `Survey "${survey.title}" sent to ${member.name} (${member.email})`,
          created_at: new Date().toISOString()
        }));

        try {
          const { data: signalsData, error: signalsError } = await supabase
            .from('signals')
            .insert(trackingSignals)
            .select();

          if (signalsError) {
            console.error('Error creating tracking signals:', signalsError);
          } else {
            console.log('Tracking signals created successfully:', signalsData);
          }
        } catch (error) {
          console.error('Exception creating tracking signals:', error);
        }
      }

      // Send actual emails
      const emailPromises = members.map(async (member) => {
        try {
          const surveyUrl = `${window.location.origin}/survey/${surveyId}?member=${member.id}`;
          
          const emailResult = await emailService.sendSurveyInvitationEmail(
            member.email,
            survey.title,
            surveyUrl,
            member.name
          );

          console.log(`Email result for ${member.email}:`, emailResult);
          return { member, emailResult };
        } catch (error) {
          console.error(`Error sending email to ${member.email}:`, error);
          return { member, emailResult: { success: false, error: error.message } };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const successfulEmails = emailResults.filter(result => result.emailResult.success);
      const failedEmails = emailResults.filter(result => !result.emailResult.success);

      console.log('Email sending results:', {
        total: emailResults.length,
        successful: successfulEmails.length,
        failed: failedEmails.length,
        failedEmails: failedEmails.map(r => ({ email: r.member.email, error: r.emailResult.error }))
      });

      return { 
        data: { 
          message: `Survey sent successfully to ${successfulEmails.length} members`,
          members_sent: successfulEmails.length,
          survey_title: survey.title,
          successful_emails: successfulEmails.map(r => r.member.email),
          failed_emails: failedEmails.map(r => ({ email: r.member.email, error: r.emailResult.error }))
        }, 
        error: failedEmails.length > 0 ? { message: `Failed to send to ${failedEmails.length} members` } : null
      };
    } catch (error) {
      console.error('Error in sendSurveyEmail:', error);
      return { data: null, error };
    }
  },

  async getSurveyInvitations(surveyId) {
    const { data, error } = await supabase
      .from('survey_invitations')
      .select('*')
      .eq('survey_id', surveyId)

    return { data, error }
  },



  async analyzeSurveyResponse(responseId) {
    // This would trigger AI analysis of the survey response
    // For now, we'll create a placeholder insight
    const { data: response } = await supabase
      .from('survey_responses')
      .select(`
        *,
        member:members(name, email, role),
        survey:surveys(title)
      `)
      .eq('id', responseId)
      .single();

    if (response) {
      // Analyze responses for performance indicators
      const analysis = analyzePerformanceFromResponses(response.responses);
      
      // Create insight based on survey response
      const insightData = {
        member_id: response.member_id,
        source: 'survey',
        source_id: responseId,
        title: `Survey Response Analysis - ${response.survey.title}`,
        description: `Performance assessment for ${response.member.name}: ${analysis.summary}`,
        severity: analysis.severity,
        insight_type: 'survey_feedback',
        action_items: analysis.actionItems,
        performance_color: analysis.color,
        created_at: new Date().toISOString()
      };

      const { data: insight, error: insightError } = await insightService.createInsight(insightData);
      
      if (!insightError) {
        // Update member's signals based on survey response
        const signalData = {
          member_id: response.member_id,
          signal_type: 'survey_satisfaction',
          value: analysis.signalValue,
          source: 'survey',
          source_id: responseId,
          performance_color: analysis.color,
          created_at: new Date().toISOString()
        };

        await signalService.createSignal(signalData);
      }

      return { data: insight, error: insightError };
    }

    return { data: null, error: 'Response not found' };
  },

  async getMemberById(memberId) {
    // Simple member lookup for survey completion
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single();

    return { data, error };
  }
}

// Helper function for analyzing survey responses
function analyzePerformanceFromResponses(responses) {
  // Simple analysis based on response patterns
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let totalResponses = 0;
  const actionItems = [];

  // Analyze each response
  Object.entries(responses).forEach(([questionId, answer]) => {
    totalResponses++;
    
    // Simple keyword analysis for text responses
    if (typeof answer === 'string') {
      const lowerAnswer = answer.toLowerCase();
      
      // Positive indicators
      if (lowerAnswer.includes('proud') || lowerAnswer.includes('achievement') || 
          lowerAnswer.includes('value') || lowerAnswer.includes('enjoy') ||
          lowerAnswer.includes('improved') || lowerAnswer.includes('learned')) {
        positiveCount++;
      }
      // Negative indicators
      else if (lowerAnswer.includes('struggle') || lowerAnswer.includes('difficult') ||
               lowerAnswer.includes('draining') || lowerAnswer.includes('exhausted') ||
               lowerAnswer.includes('challenge') || lowerAnswer.includes('hard')) {
        negativeCount++;
        actionItems.push(`Address concerns in: ${questionId}`);
      }
      else {
        neutralCount++;
      }
    }
    // Analyze rating responses
    else if (typeof answer === 'number' || !isNaN(answer)) {
      const rating = parseInt(answer);
      if (rating >= 7) positiveCount++;
      else if (rating <= 4) negativeCount++;
      else neutralCount++;
    }
    // Analyze yes/no responses
    else if (answer === 'Yes') {
      positiveCount++;
    } else if (answer === 'No') {
      negativeCount++;
      actionItems.push(`Follow up on: ${questionId}`);
    }
  });

  // Calculate performance metrics
  const positiveRatio = positiveCount / totalResponses;
  const negativeRatio = negativeCount / totalResponses;

  // Determine color and severity
  let color, severity, signalValue, summary;
  
  if (positiveRatio >= 0.6 && negativeRatio <= 0.2) {
    color = 'green';
    severity = 'low';
    signalValue = 8;
    summary = 'Strong performance with clear progress and positive engagement';
  } else if (positiveRatio >= 0.4 && negativeRatio <= 0.3) {
    color = 'yellow';
    severity = 'medium';
    signalValue = 6;
    summary = 'Good performance with some areas needing attention';
  } else {
    color = 'red';
    severity = 'high';
    signalValue = 4;
    summary = 'Performance concerns identified, requires immediate attention';
  }

  // Add default action items if none generated
  if (actionItems.length === 0) {
    if (color === 'green') {
      actionItems.push('Continue current support and development');
      actionItems.push('Document best practices for team sharing');
    } else if (color === 'yellow') {
      actionItems.push('Schedule follow-up 1:1 to discuss concerns');
      actionItems.push('Provide additional support and resources');
    } else {
      actionItems.push('Schedule urgent 1:1 meeting');
      actionItems.push('Develop improvement plan with clear milestones');
      actionItems.push('Consider additional support or role adjustment');
    }
  }

  return {
    color,
    severity,
    signalValue,
    summary,
    actionItems,
    positiveCount,
    negativeCount,
    neutralCount
  };
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

// Workflow Service for automated processes
const workflowService = {
  // Automated survey scheduling
  async scheduleRecurringSurveys() {
    try {
      const { data: surveys, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('status', 'active')
        .eq('is_recurring', true);
      
      if (error) throw error;
      
      // Process recurring surveys
      for (const survey of surveys || []) {
        const shouldSend = this.shouldSendRecurringSurvey(survey);
        if (shouldSend) {
          await this.sendRecurringSurvey(survey);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error scheduling recurring surveys:', error);
      return { success: false, error: error.message };
    }
  },

  shouldSendRecurringSurvey(survey) {
    const now = new Date();
    const lastSent = new Date(survey.last_sent || 0);
    const interval = survey.recurring_interval || 7; // days
    
    return (now - lastSent) >= (interval * 24 * 60 * 60 * 1000);
  },

  async sendRecurringSurvey(survey) {
    try {
      // Get team members
      const { data: members, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      
      // Send to all members
      for (const member of members || []) {
        await emailService.sendSurveyInvitationEmail(
          member.email,
          survey.title,
          `${window.location.origin}/survey/${survey.id}/member/${member.id}`,
          member.name
        );
      }
      
      // Update last sent date
      await supabase
        .from('surveys')
        .update({ last_sent: new Date().toISOString() })
        .eq('id', survey.id);
      
    } catch (error) {
      console.error('Error sending recurring survey:', error);
    }
  },

  // Performance monitoring and alerts
  async checkPerformanceAlerts() {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      
      const alerts = [];
      
      for (const member of members || []) {
        const signals = member.signals || 0;
        
        if (signals < 3) {
          alerts.push({
            type: 'low_performance',
            member_id: member.id,
            member_name: member.name,
            message: `${member.name} has low performance signals (${signals}/10)`,
            severity: 'high'
          });
        }
        
        if (signals === 0) {
          alerts.push({
            type: 'no_activity',
            member_id: member.id,
            member_name: member.name,
            message: `${member.name} has no recent activity`,
            severity: 'critical'
          });
        }
      }
      
      // Store alerts
      if (alerts.length > 0) {
        await supabase
          .from('alerts')
          .insert(alerts);
      }
      
      return { success: true, alerts };
    } catch (error) {
      console.error('Error checking performance alerts:', error);
      return { success: false, error: error.message };
    }
  },

  // Automated 1:1 reminders
  async sendOneOnOneReminders() {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      
      for (const member of members || []) {
        const lastMeeting = new Date(member.last_meeting || 0);
        const daysSinceLastMeeting = (new Date() - lastMeeting) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastMeeting > 14) { // 2 weeks
          await emailService.sendOneOnOneReminder(
            member.email,
            member.name
          );
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error sending 1:1 reminders:', error);
      return { success: false, error: error.message };
    }
  },

  // Team health monitoring
  async analyzeTeamHealth() {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      
      const teamHealth = {
        total_members: members?.length || 0,
        active_members: members?.filter(m => (m.signals || 0) > 0).length || 0,
        high_performers: members?.filter(m => (m.signals || 0) >= 8).length || 0,
        needs_attention: members?.filter(m => (m.signals || 0) < 5).length || 0,
        average_signals: members?.reduce((sum, m) => sum + (m.signals || 0), 0) / (members?.length || 1) || 0
      };
      
      // Store team health data
      await supabase
        .from('team_health')
        .upsert({
          id: 1,
          data: teamHealth,
          updated_at: new Date().toISOString()
        });
      
      return { success: true, teamHealth };
    } catch (error) {
      console.error('Error analyzing team health:', error);
      return { success: false, error: error.message };
    }
  },

  // Automated insights generation
  async generateInsights() {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*');
      
      if (error) throw error;
      
      const insights = [];
      
      for (const member of members || []) {
        const signals = member.signals || 0;
        
        if (signals >= 8) {
          insights.push({
            type: 'high_performer',
            member_id: member.id,
            member_name: member.name,
            message: `${member.name} is performing exceptionally well`,
            recommendation: 'Consider recognition or promotion discussion'
          });
        }
        
        if (signals < 5 && signals > 0) {
          insights.push({
            type: 'needs_support',
            member_id: member.id,
            member_name: member.name,
            message: `${member.name} may need additional support`,
            recommendation: 'Schedule a 1:1 meeting to discuss challenges'
          });
        }
      }
      
      // Store insights
      if (insights.length > 0) {
        await supabase
          .from('insights')
          .insert(insights);
      }
      
      return { success: true, insights };
    } catch (error) {
      console.error('Error generating insights:', error);
      return { success: false, error: error.message };
    }
  }
}; 