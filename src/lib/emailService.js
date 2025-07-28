// Email Service for sending invitations and notifications
export const emailService = {
  async sendInvitationEmail(email, role, invitedBy, inviteLink) {
    try {
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      // For now, we'll simulate the email sending process
      
      const emailData = {
        to: email,
        subject: `You're invited to join SignalOS - ${invitedBy} has invited you`,
        template: 'invitation',
        data: {
          invitedBy,
          role,
          inviteLink,
          roleDescription: this.getRoleDescription(role),
          companyName: 'SignalOS Team'
        }
      };

      // Simulate API call to email service
      console.log('Sending invitation email:', emailData);
      
      // In production, this would be:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // });

      // Simulate success
      return { success: true, messageId: `invite_${Date.now()}` };
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendSurveyInvitationEmail(email, surveyTitle, surveyLink, memberName) {
    try {
      console.log('=== EMAIL SERVICE DEBUG ===');
      console.log('Starting email send process...');
      console.log('Email:', email);
      console.log('Survey Title:', surveyTitle);
      console.log('Survey Link:', surveyLink);
      console.log('Member Name:', memberName);
      console.log('Current origin:', window.location.origin);
      
      // Validate inputs
      if (!email || !surveyTitle || !surveyLink || !memberName) {
        console.error('Missing required email parameters:', { email, surveyTitle, surveyLink, memberName });
        return { success: false, error: 'Missing required email parameters' };
      }
      
      // Call the API route to send real email
      const apiUrl = `${window.location.origin}/api/send-email`;
      console.log('Calling API URL:', apiUrl);
      
      const requestBody = {
        email,
        surveyTitle,
        surveyLink,
        memberName,
        template: 'survey_invitation'
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);
      console.log('API response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Email sent successfully via API:', result);
        return { success: true, messageId: result.messageId };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API route error:', errorData);
        
        // Provide specific error messages
        if (response.status === 500) {
          return { success: false, error: 'Email service temporarily unavailable. Please try again later.' };
        } else if (response.status === 400) {
          return { success: false, error: 'Invalid email parameters. Please check the email address.' };
        } else {
          return { success: false, error: errorData.error || 'Failed to send email' };
        }
      }
    } catch (error) {
      console.error('Error sending survey invitation email:', error);
      
      // Provide fallback for network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Network error. Please check your connection and try again.' };
      }
      
      return { success: false, error: error.message };
    }
  },

  async sendWelcomeEmail(email, firstName, role) {
    try {
      const emailData = {
        to: email,
        subject: 'Welcome to SignalOS!',
        template: 'welcome',
        data: {
          firstName,
          role,
          roleDescription: this.getRoleDescription(role),
          loginUrl: `${window.location.origin}/login`,
          companyName: 'SignalOS Team'
        }
      };

      console.log('Sending welcome email:', emailData);
      
      // Simulate success
      return { success: true, messageId: `welcome_${Date.now()}` };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  },

  async sendOneOnOneReminder(email, memberName) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject: '1:1 Meeting Reminder',
          template: 'one_on_one_reminder',
          memberName
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, messageId: result.messageId };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to send reminder' };
      }
    } catch (error) {
      console.error('Error sending 1:1 reminder:', error);
      return { success: false, error: error.message };
    }
  },

  async sendPerformanceAlert(email, memberName, alertType, message) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject: `Performance Alert: ${memberName}`,
          template: 'performance_alert',
          memberName,
          alertType,
          message
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, messageId: result.messageId };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to send alert' };
      }
    } catch (error) {
      console.error('Error sending performance alert:', error);
      return { success: false, error: error.message };
    }
  },

  async sendTeamHealthReport(email, teamHealth) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          subject: 'Weekly Team Health Report',
          template: 'team_health_report',
          teamHealth
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, messageId: result.messageId };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to send report' };
      }
    } catch (error) {
      console.error('Error sending team health report:', error);
      return { success: false, error: error.message };
    }
  },

  getRoleDescription(role) {
    switch (role) {
      case 'admin': 
        return 'Administrator - Full access to all features, team management, and billing';
      case 'manager': 
        return 'Manager - Can view team analytics, manage members, and create surveys';
      case 'leader': 
        return 'Team Leader - Can view team performance, insights, and manage surveys';
      case 'member': 
        return 'Team Member - Can participate in surveys and view personal data';
      default: 
        return 'Team Member - Basic access to surveys and personal data';
    }
  },

  generateInviteLink(inviteId) {
    return `${window.location.origin}/invite/${inviteId}`;
  },

  generateSurveyLink(surveyId, memberId) {
    return `${window.location.origin}/survey/${surveyId}/member/${memberId}`;
  }
}; 