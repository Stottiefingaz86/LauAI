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

interface SurveyResponse {
  survey_id: string
  user_id: string
  responses: {
    question_id: string
    response_data: any
  }[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { survey_id, user_id, responses, team_id } = await req.json()

    if (!survey_id || !user_id || !responses) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Store survey responses
    const responsePromises = responses.map((response: any) =>
      supabase
        .from('survey_responses')
        .insert({
          survey_id,
          user_id,
          question_id: response.question_id,
          response_data: response.response_data,
          submitted_at: new Date().toISOString()
        })
    )

    const responseResults = await Promise.all(responsePromises)
    const responseErrors = responseResults.filter(result => result.error)
    
    if (responseErrors.length > 0) {
      console.error('Error storing survey responses:', responseErrors)
      return new Response(
        JSON.stringify({ error: 'Failed to store survey responses' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze survey responses
    const analysis = await analyzeSurveyResponses(responses)

    // Store analysis insights
    const { data: insightData, error: insightError } = await supabase
      .from('ai_insights')
      .insert({
        user_id,
        team_id,
        insight_type: 'survey_analysis',
        title: 'Survey Response Analysis',
        description: analysis.summary,
        severity: analysis.overall_sentiment === 'negative' ? 'high' : 'medium',
        action_items: analysis.recommendations,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insightError) {
      console.error('Error storing survey analysis:', insightError)
    }

    // Calculate and store performance signal
    const signalValue = calculateSurveySignal(analysis)
    const { error: signalError } = await supabase
      .from('signals')
      .insert({
        user_id,
        signal_type: 'survey',
        value: signalValue,
        source_id: survey_id,
        source_type: 'survey',
        notes: `Survey analysis: ${analysis.summary}`,
        created_at: new Date().toISOString()
      })

    if (signalError) {
      console.error('Error adding survey signal:', signalError)
    }

    // Update survey completion status
    const { error: surveyError } = await supabase
      .from('surveys')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', survey_id)

    if (surveyError) {
      console.error('Error updating survey status:', surveyError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        signal_value: signalValue,
        insight_id: insightData?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-survey function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeSurveyResponses(responses: any[]) {
  // Analyze survey responses and generate insights
  const totalResponses = responses.length
  const positiveResponses = responses.filter(r => 
    r.response_data?.rating > 7 || 
    r.response_data?.sentiment === 'positive'
  ).length

  const satisfactionScore = (positiveResponses / totalResponses) * 10
  const overallSentiment = satisfactionScore >= 7 ? 'positive' : 
                          satisfactionScore >= 4 ? 'neutral' : 'negative'

  // Extract key themes from text responses
  const textResponses = responses
    .filter(r => typeof r.response_data === 'string')
    .map(r => r.response_data)

  const themes = extractThemes(textResponses)
  const recommendations = generateRecommendations(satisfactionScore, themes)

  return {
    satisfaction_score: satisfactionScore,
    overall_sentiment: overallSentiment,
    key_themes: themes,
    recommendations: recommendations,
    response_count: totalResponses,
    summary: `Survey completed with ${satisfactionScore.toFixed(1)}/10 satisfaction score. ${recommendations.length} recommendations generated.`
  }
}

function extractThemes(textResponses: string[]): string[] {
  // Simple theme extraction (replace with more sophisticated analysis)
  const themes = new Set<string>()
  
  textResponses.forEach(response => {
    const lowerResponse = response.toLowerCase()
    if (lowerResponse.includes('communication')) themes.add('Communication')
    if (lowerResponse.includes('workload')) themes.add('Workload Management')
    if (lowerResponse.includes('growth')) themes.add('Career Growth')
    if (lowerResponse.includes('team')) themes.add('Team Collaboration')
    if (lowerResponse.includes('support')) themes.add('Support & Resources')
  })

  return Array.from(themes)
}

function generateRecommendations(satisfactionScore: number, themes: string[]): string[] {
  const recommendations: string[] = []

  if (satisfactionScore < 6) {
    recommendations.push('Schedule follow-up discussion to address concerns')
    recommendations.push('Implement immediate support measures')
  }

  if (themes.includes('Communication')) {
    recommendations.push('Improve communication channels and frequency')
  }

  if (themes.includes('Workload Management')) {
    recommendations.push('Review and optimize workload distribution')
  }

  if (themes.includes('Career Growth')) {
    recommendations.push('Develop career development plan')
  }

  if (satisfactionScore >= 8) {
    recommendations.push('Maintain current positive practices')
    recommendations.push('Share best practices with team')
  }

  return recommendations
}

function calculateSurveySignal(analysis: any): number {
  // Calculate signal value based on survey analysis
  const baseScore = analysis.satisfaction_score
  const sentimentMultiplier = analysis.overall_sentiment === 'positive' ? 1.1 : 
                             analysis.overall_sentiment === 'negative' ? 0.9 : 1.0
  
  return Math.min(10, Math.max(1, Math.round(baseScore * sentimentMultiplier)))
}
