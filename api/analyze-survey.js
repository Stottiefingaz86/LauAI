import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { survey_id, member_id, responses, team_id } = req.body;

    console.log('🔍 Starting survey analysis...');
    console.log('📊 Analysis data:', { survey_id, member_id, team_id, responseCount: responses.length });

    // Validate required fields
    if (!survey_id || !member_id || !responses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the Supabase edge function
    console.log('🚀 Calling Supabase edge function...');
    const { data, error } = await supabase.functions.invoke('process-survey', {
      body: {
        survey_id,
        user_id: member_id, // Edge function expects user_id
        responses,
        team_id
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      return res.status(500).json({ 
        error: 'Analysis failed', 
        details: error.message 
      });
    }

    console.log('✅ Analysis completed successfully:', data);
    return res.status(200).json({
      success: true,
      analysis: data.analysis,
      signal_value: data.signal_value,
      insight_id: data.insight_id
    });

  } catch (error) {
    console.error('❌ Error in analyze-survey API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 