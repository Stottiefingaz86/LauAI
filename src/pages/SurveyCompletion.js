import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Send,
  Star,
  Clock,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { surveyService } from '../lib/supabaseService';

const SurveyCompletion = () => {
  const { surveyId, memberId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [member, setMember] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadSurveyAndMember();
  }, [surveyId, memberId]);

  const loadSurveyAndMember = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load survey details
      const { data: surveyData, error: surveyError } = await surveyService.getSurveyById(surveyId);
      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      // Load member details
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();
      if (memberError) throw memberError;
      setMember(memberData);

      // Load survey questions
      const { data: questionsData, error: questionsError } = await surveyService.getSurveyQuestions(surveyId);
      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Initialize responses
      const initialResponses = {};
      (questionsData || []).forEach(question => {
        initialResponses[question.id] = '';
      });
      setResponses(initialResponses);

    } catch (error) {
      console.error('Error loading survey:', error);
      setError('Failed to load survey. Please check the link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateResponses = () => {
    const requiredQuestions = questions.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id] || responses[q.id].trim() === '');
    
    if (missingResponses.length > 0) {
      setError(`Please answer all required questions (${missingResponses.length} remaining)`);
      return false;
    }
    return true;
  };

  const analyzeResponse = async (question, response) => {
    // Real analysis based on question type and response
    let analysis = {
      sentiment: 'neutral',
      score: 0,
      insights: []
    };

    if (question.type === 'rating') {
      const rating = parseInt(response);
      analysis.score = rating;
      analysis.sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';
      analysis.insights.push(`Rating: ${rating}/5`);
    } else if (question.type === 'text') {
      const text = response.toLowerCase();
      
      // Sentiment analysis based on keywords
      const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'love', 'enjoy', 'positive'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'negative', 'poor', 'worst'];
      
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;
      
      analysis.sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral';
      analysis.score = positiveCount - negativeCount;
      analysis.insights.push(`Sentiment: ${analysis.sentiment}`);
    } else if (question.type === 'yes_no') {
      const isYes = response.toLowerCase().includes('yes');
      analysis.score = isYes ? 1 : 0;
      analysis.sentiment = isYes ? 'positive' : 'negative';
      analysis.insights.push(`Answer: ${response}`);
    }

    return analysis;
  };

  const submitSurvey = async () => {
    if (!validateResponses()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('🚀 Starting survey submission process...');

      // Save survey responses
      const responseData = Object.entries(responses).map(([questionId, response]) => ({
        survey_id: surveyId,
        member_id: memberId,
        question_id: questionId,
        response: response,
        submitted_at: new Date().toISOString()
      }));

      console.log('💾 Saving survey responses...');
      const { error: responsesError } = await supabase
        .from('survey_responses')
        .insert(responseData);

      if (responsesError) throw responsesError;
      console.log('✅ Survey responses saved successfully');

      // Analyze each response and save insights
      console.log('🧠 Analyzing responses...');
      const insights = [];
      for (const [questionId, response] of Object.entries(responses)) {
        const question = questions.find(q => q.id === questionId);
        if (question && response.trim()) {
          const analysis = await analyzeResponse(question, response);
          insights.push({
            survey_id: surveyId,
            member_id: memberId,
            question_id: questionId,
            response: response,
            sentiment: analysis.sentiment,
            score: analysis.score,
            insights: analysis.insights.join(', '),
            created_at: new Date().toISOString()
          });
        }
      }

      // Save insights
      if (insights.length > 0) {
        console.log('💾 Saving insights...');
        const { error: insightsError } = await supabase
          .from('survey_insights')
          .insert(insights);
        if (insightsError) throw insightsError;
        console.log('✅ Insights saved successfully');
      }

      // Calculate overall survey score
      const totalScore = insights.reduce((sum, insight) => sum + insight.score, 0);
      const averageScore = insights.length > 0 ? totalScore / insights.length : 0;

      // Update member's signals based on survey performance
      const currentSignals = member.signals || 0;
      const newSignals = Math.max(0, Math.min(10, currentSignals + (averageScore * 0.5)));

      console.log('📊 Updating member signals...');
      const { error: memberError } = await supabase
        .from('members')
        .update({ 
          signals: newSignals,
          last_survey: new Date().toISOString()
        })
        .eq('id', memberId);

      if (memberError) throw memberError;
      console.log('✅ Member signals updated');

      // Mark survey as completed
      console.log('✅ Marking survey as completed...');
      const { error: completionError } = await supabase
        .from('survey_completions')
        .insert({
          survey_id: surveyId,
          member_id: memberId,
          completed_at: new Date().toISOString(),
          total_score: averageScore,
          response_count: Object.keys(responses).length
        });

      if (completionError) throw completionError;
      console.log('✅ Survey completion recorded');

      // Trigger edge function for advanced AI analysis
      console.log('🤖 Triggering AI analysis...');
      try {
        const analysisResponse = await fetch('/api/analyze-survey', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            survey_id: surveyId,
            member_id: memberId,
            responses: Object.entries(responses).map(([questionId, response]) => ({
              question_id: questionId,
              response_data: response
            })),
            team_id: member.team_id
          })
        });

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();
          console.log('✅ AI analysis completed:', analysisResult);
        } else {
          console.warn('⚠️ AI analysis failed, but survey was completed successfully');
        }
      } catch (analysisError) {
        console.warn('⚠️ AI analysis error, but survey was completed:', analysisError);
      }

      setSubmitted(true);
      console.log('🎉 Survey submitted successfully with analysis');

    } catch (error) {
      console.error('❌ Error submitting survey:', error);
      setError('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Survey Completed!</h2>
          <p className="text-white/70 mb-6">
            Thank you for completing the survey. Your responses have been analyzed and saved.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 rounded-lg font-medium hover:from-green-500 hover:to-emerald-600 transition-all duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{survey?.title}</h1>
              <p className="text-white/70">Complete this survey to provide feedback</p>
            </div>
          </div>
          
          {member && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {member.name?.charAt(0).toUpperCase() || 'M'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-white/60 text-sm">{member.role} • {member.department}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Survey Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-white/50 text-sm">Question {index + 1}</span>
                  {question.required && (
                    <span className="text-red-400 text-xs">* Required</span>
                  )}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{question.question_text}</h3>
                {question.description && (
                  <p className="text-white/60 text-sm">{question.description}</p>
                )}
              </div>

              {/* Question Input */}
              {question.type === 'text' && (
                <textarea
                  value={responses[question.id] || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Enter your response..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 resize-none"
                  rows={4}
                />
              )}

              {question.type === 'rating' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleResponseChange(question.id, rating.toString())}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        responses[question.id] === rating.toString()
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Star size={20} className={responses[question.id] === rating.toString() ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'yes_no' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponseChange(question.id, 'Yes')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      responses[question.id] === 'Yes'
                        ? 'bg-green-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleResponseChange(question.id, 'No')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      responses[question.id] === 'No'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            onClick={submitSurvey}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-4 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Survey
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompletion; 