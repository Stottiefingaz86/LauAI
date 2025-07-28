import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Check environment variables
    console.log('Environment variables check:');
    console.log('REACT_APP_RESEND_API_KEY exists:', !!process.env.REACT_APP_RESEND_API_KEY);
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

    const resendApiKey = process.env.REACT_APP_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Resend API key not configured. Please set RESEND_API_KEY environment variable.' 
      });
    }

    console.log('Using Resend API key:', resendApiKey ? 'Key exists' : 'No key found');

    const resend = new Resend(resendApiKey);

    // Send a test email
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email || 'test@example.com'],
      subject: 'Test Email from SignalOS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Test Email</h2>
          <p>This is a test email from SignalOS to verify email sending functionality.</p>
          <p>If you receive this email, the email service is working correctly!</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log('Test email sent successfully:', data);
    return res.status(200).json({ 
      success: true, 
      messageId: data.id,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error in test-email API:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
} 