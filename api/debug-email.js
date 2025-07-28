import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    console.log('=== DEBUG EMAIL ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Environment variables:');
    console.log('REACT_APP_RESEND_API_KEY exists:', !!process.env.REACT_APP_RESEND_API_KEY);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    const resendApiKey = process.env.REACT_APP_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('No Resend API key found');
      return res.status(500).json({ 
        success: false, 
        error: 'Resend API key not configured',
        debug: {
          envVars: {
            REACT_APP_RESEND_API_KEY: !!process.env.REACT_APP_RESEND_API_KEY,
            RESEND_API_KEY: !!process.env.RESEND_API_KEY
          }
        }
      });
    }

    console.log('API key length:', resendApiKey.length);
    console.log('API key starts with:', resendApiKey.substring(0, 10) + '...');

    const resend = new Resend(resendApiKey);

    // Test email sending
    console.log('Attempting to send test email...');
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email || 'test@example.com'],
      subject: 'Debug Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Debug Test Email</h2>
          <p>This is a debug test email to verify email sending functionality.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>API Key configured: ${resendApiKey ? 'Yes' : 'No'}</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        debug: {
          resendError: error,
          apiKeyConfigured: !!resendApiKey
        }
      });
    }

    console.log('Test email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      messageId: data.id,
      message: 'Debug test email sent successfully',
      debug: {
        resendData: data,
        apiKeyConfigured: !!resendApiKey
      }
    });
  } catch (error) {
    console.error('Error in debug-email API:', error);
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