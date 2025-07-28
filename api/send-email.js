import { Resend } from 'resend';

// Debug environment variables
console.log('=== SEND-EMAIL API DEBUG ===');
console.log('Environment variables check:');
console.log('REACT_APP_RESEND_API_KEY exists:', !!process.env.REACT_APP_RESEND_API_KEY);
console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);

const resendApiKey = process.env.REACT_APP_RESEND_API_KEY || process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('❌ No Resend API key found in environment variables');
} else {
  console.log('✅ Resend API key found, length:', resendApiKey.length);
}

const resend = new Resend(resendApiKey);

export default async function handler(req, res) {
  console.log('=== SEND-EMAIL API HANDLER START ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.keys(req.headers));
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, surveyTitle, surveyLink, memberName, subject, template, alertType, message, teamHealth } = req.body;

    console.log('📧 Request body:', req.body);
    console.log('🔑 API Key check:', resendApiKey ? 'Present' : 'Missing');

    // Validate required fields
    if (!email) {
      console.error('❌ Missing email address');
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    if (!surveyTitle && template === 'survey_invitation') {
      console.error('❌ Missing survey title');
      return res.status(400).json({ success: false, error: 'Survey title is required' });
    }

    if (!resendApiKey) {
      console.error('❌ No Resend API key configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.',
        debug: {
          envVars: {
            REACT_APP_RESEND_API_KEY: !!process.env.REACT_APP_RESEND_API_KEY,
            RESEND_API_KEY: !!process.env.RESEND_API_KEY
          }
        }
      });
    }

    let emailSubject = subject;
    let emailHtml = '';

    // Handle different email templates
    switch (template) {
      case 'survey_invitation':
        emailSubject = `Survey Invitation: ${surveyTitle}`;
        emailHtml = generateSurveyInvitationEmail(memberName, surveyTitle, surveyLink);
        break;
      
      case 'one_on_one_reminder':
        emailSubject = '1:1 Meeting Reminder';
        emailHtml = generateOneOnOneReminderEmail(memberName);
        break;
      
      case 'performance_alert':
        emailSubject = `Performance Alert: ${memberName}`;
        emailHtml = generatePerformanceAlertEmail(memberName, alertType, message);
        break;
      
      case 'team_health_report':
        emailSubject = 'Weekly Team Health Report';
        emailHtml = generateTeamHealthReportEmail(teamHealth);
        break;
      
      default:
        // Default survey invitation (backward compatibility)
        emailSubject = `Survey Invitation: ${surveyTitle}`;
        emailHtml = generateSurveyInvitationEmail(memberName, surveyTitle, surveyLink);
    }

    console.log('📤 Preparing to send email with Resend...');
    console.log('📧 Email details:', {
      from: 'onboarding@resend.dev',
      to: [email],
      subject: emailSubject,
      hasHtml: !!emailHtml
    });

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: emailSubject,
      html: emailHtml
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        debug: {
          resendError: error,
          apiKeyConfigured: !!resendApiKey
        }
      });
    }

    console.log('✅ Email sent successfully via Resend:', data);
    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('❌ Error in send-email API:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorStack: error.stack
      }
    });
  }
}

function generateSurveyInvitationEmail(memberName, surveyTitle, surveyLink) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Survey Invitation</h2>
      <p>Hello ${memberName},</p>
      <p>You have been invited to complete a survey: <strong>${surveyTitle}</strong></p>
      <p>Please click the button below to access the survey:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${surveyLink}" 
           style="background: linear-gradient(135deg, #10b981, #059669); 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: bold;">
          Take Survey
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If the button doesn't work, you can copy and paste this link into your browser:<br>
        <a href="${surveyLink}" style="color: #10b981;">${surveyLink}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This email was sent from SignalOS. If you have any questions, please contact your administrator.
      </p>
    </div>
  `;
}

function generateOneOnOneReminderEmail(memberName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">1:1 Meeting Reminder</h2>
      <p>Hello ${memberName},</p>
      <p>It's been a while since your last 1:1 meeting. Regular check-ins are important for your growth and team success.</p>
      <p>Please schedule a 1:1 meeting with your manager to discuss:</p>
      <ul style="color: #666;">
        <li>Your recent progress and achievements</li>
        <li>Any challenges you're facing</li>
        <li>Goals and development opportunities</li>
        <li>Feedback and support needs</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}" 
           style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: bold;">
          Schedule Meeting
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This reminder was sent from SignalOS. Regular 1:1 meetings help ensure your success and growth.
      </p>
    </div>
  `;
}

function generatePerformanceAlertEmail(memberName, alertType, message) {
  const alertColor = alertType === 'critical' ? '#dc2626' : '#f59e0b';
  const alertTitle = alertType === 'critical' ? 'Critical Alert' : 'Performance Alert';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${alertColor};">${alertTitle}</h2>
      <p>Hello,</p>
      <p>This is an automated alert regarding <strong>${memberName}</strong>:</p>
      <div style="background: #fef2f2; border-left: 4px solid ${alertColor}; padding: 15px; margin: 20px 0;">
        <p style="color: #dc2626; margin: 0;"><strong>${message}</strong></p>
      </div>
      <p>Recommended actions:</p>
      <ul style="color: #666;">
        <li>Schedule a 1:1 meeting to discuss the situation</li>
        <li>Provide additional support and resources</li>
        <li>Set clear expectations and goals</li>
        <li>Monitor progress closely</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/member/${memberName}" 
           style="background: linear-gradient(135deg, ${alertColor}, ${alertColor}); 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: bold;">
          View Profile
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This alert was generated by SignalOS. Please take appropriate action to support your team member.
      </p>
    </div>
  `;
}

function generateTeamHealthReportEmail(teamHealth) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Weekly Team Health Report</h2>
      <p>Hello,</p>
      <p>Here's your weekly team health summary:</p>
      
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">Team Overview</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${teamHealth.total_members}</div>
            <div style="color: #666; font-size: 14px;">Total Members</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${teamHealth.active_members}</div>
            <div style="color: #666; font-size: 14px;">Active Members</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${teamHealth.high_performers}</div>
            <div style="color: #666; font-size: 14px;">High Performers</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${teamHealth.needs_attention}</div>
            <div style="color: #666; font-size: 14px;">Need Attention</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <div style="font-size: 20px; font-weight: bold; color: #333;">
            Average Performance: ${teamHealth.average_signals.toFixed(1)}/10
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://signalos.com'}/dashboard" 
           style="background: linear-gradient(135deg, #10b981, #059669); 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  display: inline-block;
                  font-weight: bold;">
          View Full Dashboard
        </a>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This report was generated by SignalOS. Regular monitoring helps maintain team health and performance.
      </p>
    </div>
  `;
} 