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

    // Simulate OpenAI analysis (replace with actual OpenAI API call)
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
  // TODO: Replace with actual OpenAI API call
  // For now, return mock analysis
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
  }
}

function calculateSignalValue(analysis: any): number {
  // Calculate signal value based on analysis scores
  const baseScore = (analysis.engagement_score + analysis.communication_score) / 2
  const sentimentMultiplier = analysis.sentiment === 'positive' ? 1.2 : 
                             analysis.sentiment === 'negative' ? 0.8 : 1.0
  
  return Math.min(10, Math.max(1, Math.round(baseScore * sentimentMultiplier)))
}
