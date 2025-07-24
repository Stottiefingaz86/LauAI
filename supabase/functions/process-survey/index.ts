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

    // Analyze survey responses with OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const analysis = await analyzeSurveyResponsesWithAI(responses, openaiApiKey)

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
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', survey_id)
      .select()
      .single()

    if (surveyError) {
      console.error('Error updating survey status:', surveyError)
    }

    // Send email notification if survey data is available
    if (surveyData) {
      try {
        // Get user email
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', user_id)
          .single()

        if (userData?.email) {
          await sendSurveyCompletionEmail(userData.email, surveyData, analysis)
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError)
      }
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

async function sendSurveyCompletionEmail(recipientEmail: string, surveyData: any, analysis: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.error('Resend API key not configured')
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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
                  ${analysis.key_themes?.map((theme: string) => `<li>${theme}</li>`).join('') || '<li>Your feedback has been processed</li>'}
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
      })
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    console.log('Survey completion email sent successfully');
  } catch (error) {
    console.error('Error sending survey completion email:', error);
  }
}

async function analyzeSurveyResponsesWithAI(responses: any[], apiKey?: string) {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key not available');
    }

    // Format responses for analysis
    const responseText = responses.map((r, index) => 
      `Question ${index + 1}: ${JSON.stringify(r.response_data)}`
    ).join('\n');

    // Use OpenAI to analyze the responses
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
            content: `You are an AI assistant that analyzes survey responses. 
            Provide insights on satisfaction score, sentiment, key themes, and recommendations.
            Return your analysis as a JSON object with the following structure:
            {
              "satisfaction_score": 8.5,
              "overall_sentiment": "positive|negative|neutral",
              "key_themes": ["theme1", "theme2"],
              "recommendations": ["recommendation1", "recommendation2"],
              "response_count": 5,
              "summary": "Brief summary of the survey analysis"
            }`
          },
          {
            role: 'user',
            content: `Analyze these survey responses: ${responseText}`
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
      satisfaction_score: analysis.satisfaction_score || 7.5,
      overall_sentiment: analysis.overall_sentiment || 'neutral',
      key_themes: analysis.key_themes || [],
      recommendations: analysis.recommendations || [],
      response_count: responses.length,
      summary: analysis.summary || 'Survey analysis completed successfully.'
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    
    // Fallback to basic analysis if OpenAI fails
    return analyzeSurveyResponses(responses);
  }
}

async function analyzeSurveyResponses(responses: any[]) {
  // Basic analysis without OpenAI
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
