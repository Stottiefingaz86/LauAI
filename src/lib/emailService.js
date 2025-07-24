import { Resend } from 'resend';

const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY || 're_eLwxaHQE_L659dJPNuxeQNwL5bnPk9Xgw');

export const emailService = {
  // Send survey invitation
  async sendSurveyInvitation(recipientEmail, surveyData, surveyUrl) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'LauAI <noreply@lauai.com>',
        to: [recipientEmail],
        subject: `Survey Invitation: ${surveyData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">LauAI Survey</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Team Performance Analytics</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">You've been invited to complete a survey</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4ade80;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">${surveyData.title}</h3>
                <p style="color: #6b7280; margin: 0;">${surveyData.description || 'Help us understand your experience and improve team performance.'}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${surveyUrl}" style="background: #4ade80; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Start Survey
                </a>
              </div>
              
              <div style="background: #e5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <strong>Why this matters:</strong> Your feedback helps us create a better work environment and support your growth.
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                This survey will take approximately 5-10 minutes to complete. Your responses are confidential and will be used to improve team performance.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© 2024 LauAI. All rights reserved.</p>
              <p>If you have any questions, please contact your team manager.</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending email:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error sending survey invitation:', error);
      return { error };
    }
  },

  // Send survey completion notification
  async sendSurveyCompletionNotification(recipientEmail, surveyData, analysis) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'LauAI <noreply@lauai.com>',
        to: [recipientEmail],
        subject: `Survey Completed: ${surveyData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Survey Completed</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your feedback!</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your survey has been submitted successfully</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">${surveyData.title}</h3>
                <p style="color: #6b7280; margin: 0;">Your responses have been analyzed and insights have been generated.</p>
              </div>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h4 style="color: #1e40af; margin: 0 0 10px 0;">AI Analysis Summary</h4>
                <p style="color: #1e40af; margin: 0; font-size: 14px;">${analysis.summary}</p>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">Key Insights</h4>
                <ul style="color: #166534; margin: 0; padding-left: 20px;">
                  ${analysis.key_themes?.map(theme => `<li>${theme}</li>`).join('') || '<li>Your feedback has been processed</li>'}
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Your feedback is valuable and will help improve team performance. You can view detailed insights in your LauAI dashboard.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© 2024 LauAI. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending completion email:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error sending survey completion notification:', error);
      return { error };
    }
  },

  // Send meeting analysis notification
  async sendMeetingAnalysisNotification(recipientEmail, meetingData, analysis) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'LauAI <noreply@lauai.com>',
        to: [recipientEmail],
        subject: `Meeting Analysis Complete: ${meetingData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Meeting Analysis</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-powered insights ready</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your 1:1 meeting has been analyzed</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">${meetingData.title}</h3>
                <p style="color: #6b7280; margin: 0;">${meetingData.description || '1:1 Meeting Analysis'}</p>
              </div>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h4 style="color: #1e40af; margin: 0 0 10px 0;">AI Analysis Summary</h4>
                <p style="color: #1e40af; margin: 0; font-size: 14px;">${analysis.summary}</p>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">Action Items</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                  ${analysis.action_items?.map(item => `<li>${item}</li>`).join('') || '<li>No specific action items identified</li>'}
                </ul>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">Recommendations</h4>
                <ul style="color: #166534; margin: 0; padding-left: 20px;">
                  ${analysis.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>Continue current practices</li>'}
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                View detailed insights and performance signals in your LauAI dashboard.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© 2024 LauAI. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending meeting analysis email:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error sending meeting analysis notification:', error);
      return { error };
    }
  },

  // Send team performance report
  async sendTeamPerformanceReport(recipientEmail, teamData, insights) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'LauAI <noreply@lauai.com>',
        to: [recipientEmail],
        subject: `Team Performance Report: ${teamData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); padding: 30px; border-radius: 12px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Team Performance Report</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${teamData.name}</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-bottom: 20px;">Your team's performance insights</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 10px 0;">Key Metrics</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${teamData.avgSignal || '8.2'}</div>
                    <div style="font-size: 12px; color: #6b7280;">Avg Signal</div>
                  </div>
                  <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: bold; color: #166534;">${teamData.activeMembers || '12'}</div>
                    <div style="font-size: 12px; color: #6b7280;">Active Members</div>
                  </div>
                </div>
              </div>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">Top Insights</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                  ${insights?.map(insight => `<li>${insight.title}: ${insight.description}</li>`).join('') || '<li>No new insights this period</li>'}
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                View detailed analytics and recommendations in your LauAI dashboard.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>© 2024 LauAI. All rights reserved.</p>
            </div>
          </div>
        `
      });

      if (error) {
        console.error('Error sending team report:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error sending team performance report:', error);
      return { error };
    }
  }
}; 