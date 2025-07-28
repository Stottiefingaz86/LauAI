import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 TEST SURVEY EMAIL ENDPOINT');
    console.log('Environment check:');
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('REACT_APP_RESEND_API_KEY exists:', !!process.env.REACT_APP_RESEND_API_KEY);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const resendApiKey = process.env.REACT_APP_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({ 
        error: 'No Resend API key found',
        debug: {
          envVars: {
            RESEND_API_KEY: !!process.env.RESEND_API_KEY,
            REACT_APP_RESEND_API_KEY: !!process.env.REACT_APP_RESEND_API_KEY
          }
        }
      });
    }

    const { email, surveyTitle, surveyLink, memberName } = req.body;

    if (!email || !surveyTitle || !surveyLink || !memberName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'surveyTitle', 'surveyLink', 'memberName'],
        received: { email, surveyTitle, surveyLink, memberName }
      });
    }

    console.log('📧 Sending test survey email to:', email);
    console.log('📋 Survey details:', { surveyTitle, surveyLink, memberName });

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: `Survey Invitation: ${surveyTitle}`,
      html: `
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
      `
    });

    if (error) {
      console.error('❌ Test survey email failed:', error);
      return res.status(500).json({ 
        error: 'Failed to send test survey email',
        details: error.message 
      });
    }

    console.log('✅ Test survey email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      messageId: data.id,
      message: 'Test survey email sent successfully'
    });

  } catch (error) {
    console.error('❌ Error in test survey email:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 