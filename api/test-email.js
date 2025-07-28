import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 TEST EMAIL ENDPOINT');
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

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address required' });
    }

    console.log('📧 Sending test email to:', email);

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Test Email from SignalOS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from SignalOS to verify email functionality is working.</p>
          <p>If you received this email, the email system is properly configured!</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0;"><strong>✅ Email system is working!</strong></p>
          </div>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Test email failed:', error);
      return res.status(500).json({ 
        error: 'Failed to send test email',
        details: error.message 
      });
    }

    console.log('✅ Test email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      messageId: data.id,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('❌ Error in test email:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 