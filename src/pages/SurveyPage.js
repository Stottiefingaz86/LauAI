import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { surveyService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const SurveyPage = () => {
  const { surveyId, userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [surveyData, setSurveyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        // Load survey and questions
        const { data: survey, error: surveyError } = await surveyService.getSurveys();
        const surveyItem = survey?.find(s => s.id === surveyId);
        
        if (!surveyItem) {
          setError('Survey not found');
          return;
        }

        const { data: questions, error: questionsError } = await surveyService.getSurveyQuestions(surveyId);
        
        if (questionsError) {
          setError('Failed to load survey questions');
          return;
        }

        setSurveyData({
          ...surveyItem,
          questions: questions || []
        });

        // Load user data
        setUserData({
          id: userId,
          name: 'Survey Participant',
          email: 'participant@example.com'
        });

      } catch (error) {
        console.error('Error loading survey:', error);
        setError('Failed to load survey');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveyData();
  }, [surveyId, userId]);

  const handleResponse = (questionId, response) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleNext = () => {
    if (currentQuestion < surveyData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!surveyData || !user) {
      setError('Survey data or user not available');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Submit all responses
      const responsePromises = Object.entries(responses).map(([questionId, responseData]) =>
        surveyService.submitSurveyResponse({
          survey_id: surveyId,
          user_id: user.id,
          question_id: questionId,
          response_data: responseData
        })
      );

      const results = await Promise.all(responsePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        throw new Error('Failed to submit some responses');
      }

      // The database trigger will automatically call the process-survey edge function
      console.log('Survey submitted successfully. Analysis will be triggered automatically.');

      // Show success message and redirect
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      setError('Failed to submit survey responses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const currentResponse = responses[question.id] || '';

    switch (question.question_type) {
      case 'text':
        return (
          <textarea
            value={currentResponse}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="glass-textarea w-full h-32"
            placeholder="Type your response here..."
          />
        );

      case 'rating':
        return (
          <div className="flex justify-center space-x-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => handleResponse(question.id, rating)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                  currentResponse === rating
                    ? 'bg-mint text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleResponse(question.id, option)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  currentResponse === option
                    ? 'bg-mint text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentResponse}
            onChange={(e) => handleResponse(question.id, e.target.value)}
            className="glass-input w-full"
            placeholder="Type your response..."
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto mb-4"></div>
          <p className="text-muted">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Survey Not Found</h2>
          <p className="text-muted mb-6">{error || 'The survey you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="glass-button"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = surveyData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyData.questions.length) * 100;
  const isLastQuestion = currentQuestion === surveyData.questions.length - 1;
  const hasResponse = responses[currentQuestionData?.id];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass-topnav p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{surveyData.title}</h1>
              <p className="text-sm text-muted">
                {userData?.name} • Question {currentQuestion + 1} of {surveyData.questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-32 h-2 bg-white/10 rounded-full">
              <div 
                className="h-2 bg-mint rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-muted">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card p-8">
          {currentQuestionData && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  {currentQuestionData.question_text}
                </h2>
                {currentQuestionData.required && (
                  <p className="text-sm text-muted">* Required</p>
                )}
              </div>

              <div className="mb-8">
                {renderQuestion(currentQuestionData)}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center space-x-2 glass-button-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  {isLastQuestion ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !hasResponse}
                      className="flex items-center space-x-2 glass-button disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Submit Survey
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!hasResponse}
                      className="flex items-center space-x-2 glass-button disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyPage; 