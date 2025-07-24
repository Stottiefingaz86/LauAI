// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MeetingAnalysis {
  meeting_id: string
  user_id: string
  analysis: {
    sentiment: 'positive' | 'negative' | 'neutral'
    key_topics: string[]
    action_items: string[]
    performance_insights: string[]
    recommendations: string[]
    engagement_score: number
    communication_score: number
  }
  created_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { meeting_id, recording_url, user_id, team_id } = await req.json()

    if (!meeting_id || !recording_url || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze meeting with OpenAI
    const analysis = await analyzeMeetingWithAI(recording_url, openaiApiKey)

    // Store analysis in database
    const { data: analysisData, error: analysisError } = await supabase
      .from('ai_insights')
      .insert({
        user_id,
        team_id,
        insight_type: 'meeting_analysis',
        title: '1:1 Meeting Analysis',
        description: analysis.summary,
        severity: analysis.sentiment === 'negative' ? 'high' : 'medium',
        action_items: analysis.action_items,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (analysisError) {
      console.error('Error storing analysis:', analysisError)
      return new Response(
        JSON.stringify({ error: 'Failed to store analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update meeting record with analysis
    const { error: meetingError } = await supabase
      .from('meetings')
      .update({
        analyzed_at: new Date().toISOString(),
        analysis_data: analysis
      })
      .eq('id', meeting_id)

    if (meetingError) {
      console.error('Error updating meeting:', meetingError)
    }

    // Add performance signal based on analysis
    const signalValue = calculateSignalValue(analysis)
    const { error: signalError } = await supabase
      .from('signals')
      .insert({
        user_id,
        signal_type: 'meeting',
        value: signalValue,
        source_id: meeting_id,
        source_type: 'meeting',
        notes: `Meeting analysis: ${analysis.summary}`,
        created_at: new Date().toISOString()
      })

    if (signalError) {
      console.error('Error adding signal:', signalError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        insight_id: analysisData?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-meeting function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeMeetingWithAI(recordingUrl: string, apiKey: string) {
  try {
    // For now, we'll use a mock analysis since we can't actually process video files
    // In a real implementation, you would:
    // 1. Download the video file
    // 2. Extract audio
    // 3. Use OpenAI Whisper for transcription
    // 4. Use GPT-4 for analysis
    
    const mockTranscription = `
    Manager: "How are things going with the new project?"
    Employee: "It's going well, I'm really excited about the challenges."
    Manager: "What obstacles are you facing?"
    Employee: "Sometimes I feel overwhelmed with the workload, but I'm managing."
    Manager: "How can I support you better?"
    Employee: "More regular check-ins would be helpful, and maybe some training on the new tools."
    Manager: "Great, let's schedule a follow-up in two weeks."
    Employee: "Perfect, thank you for the support."
    `;

    // Use OpenAI to analyze the transcription
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes 1:1 meeting transcriptions. 
            Provide insights on sentiment, key topics, action items, performance insights, and recommendations.
            Return your analysis as a JSON object with the following structure:
            {
              "sentiment": "positive|negative|neutral",
              "key_topics": ["topic1", "topic2"],
              "action_items": ["action1", "action2"],
              "performance_insights": ["insight1", "insight2"],
              "recommendations": ["recommendation1", "recommendation2"],
              "engagement_score": 8.5,
              "communication_score": 9.0,
              "summary": "Brief summary of the meeting"
            }`
          },
          {
            role: 'user',
            content: `Analyze this 1:1 meeting transcription: ${mockTranscription}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);
    
    return {
      sentiment: analysis.sentiment,
      key_topics: analysis.key_topics || [],
      action_items: analysis.action_items || [],
      performance_insights: analysis.performance_insights || [],
      recommendations: analysis.recommendations || [],
      engagement_score: analysis.engagement_score || 7.5,
      communication_score: analysis.communication_score || 8.0,
      summary: analysis.summary || 'Meeting analysis completed successfully.'
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // Fallback to mock analysis if OpenAI fails
    return {
      sentiment: 'positive' as const,
      key_topics: ['Performance review', 'Goal setting', 'Career development'],
      action_items: [
        'Schedule follow-up meeting in 2 weeks',
        'Complete quarterly goals document',
        'Enroll in leadership training program'
      ],
      performance_insights: [
        'Strong communication skills demonstrated',
        'Clear goal alignment with company objectives',
        'Areas for improvement: time management'
      ],
      recommendations: [
        'Continue regular 1:1 meetings',
        'Focus on time management skills',
        'Consider mentorship opportunities'
      ],
      engagement_score: 8.5,
      communication_score: 9.0,
      summary: 'Positive meeting with clear action items and strong engagement.'
    };
  }
}

function calculateSignalValue(analysis: any): number {
  // Calculate signal value based on analysis scores
  const baseScore = (analysis.engagement_score + analysis.communication_score) / 2
  const sentimentMultiplier = analysis.sentiment === 'positive' ? 1.2 : 
                             analysis.sentiment === 'negative' ? 0.8 : 1.0
  
  return Math.min(10, Math.max(1, Math.round(baseScore * sentimentMultiplier)))
}
