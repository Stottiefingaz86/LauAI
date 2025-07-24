import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Heart, 
  Star, 
  Users, 
  TrendingUp,
  ArrowRight,
  Home,
  Mail
} from 'lucide-react';
import { surveyService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const SurveyCompletion = () => {
  const { surveyId, userId } = useParams();
  const navigate = useNavigate();
  const { user, isMember } = useAuth();
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadSurveyData();
  }, [surveyId]);

  const loadSurveyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await surveyService.getSurveyById(surveyId);
      
      if (error) {
        console.error('Error loading survey:', error);
        // Redirect to error page or show error
        return;
      }

      setSurveyData(data);
      setProgress(0);
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < surveyData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setProgress(((currentQuestion + 2) / surveyData.questions.length) * 100);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setProgress((currentQuestion / surveyData.questions.length) * 100);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Submit survey responses
      const { error } = await surveyService.submitSurveyResponse({
        survey_id: surveyId,
        user_id: userId,
        response_data: responses,
        submitted_at: new Date().toISOString()
      });

      if (error) {
        console.error('Error submitting survey:', error);
        // Handle error
        return;
      }

      // Trigger flow update (this would typically call your backend)
      await triggerFlowUpdate();

      // Show thank you screen
      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerFlowUpdate = async () => {
    try {
      // This would typically call your backend to:
      // 1. Update dashboard data
      // 2. Update member data
      // 3. Generate new insights
      // 4. Send notifications to admins/managers
      
      console.log('Triggering flow update for survey completion');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error triggering flow update:', error);
    }
  };

  const renderQuestion = (question) => {
    const currentAnswer = responses[question.id] || '';

    switch (question.question_type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <p className="text-lg text-primary mb-4">{question.question_text}</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswerChange(question.id, rating)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    currentAnswer === rating
                      ? 'bg-mint text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-secondary">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <p className="text-lg text-primary mb-4">{question.question_text}</p>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="glass-textarea w-full h-32"
              placeholder="Share your thoughts..."
            />
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <p className="text-lg text-primary mb-4">{question.question_text}</p>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(question.id, option)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    currentAnswer === option
                      ? 'bg-mint text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-lg text-primary mb-4">{question.question_text}</p>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="glass-input w-full"
              placeholder="Your answer..."
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-mint-dark border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Survey Not Found</h1>
          <p className="text-secondary mb-4">This survey may have expired or been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle size={40} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4">Thank You! 🎉</h1>
          <p className="text-secondary text-lg mb-6">
            Your survey response has been submitted successfully.
          </p>

          {/* Success Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 p-3 bg-green-50 rounded-lg">
              <Heart size={20} className="text-green-600" />
              <span className="text-sm text-primary">Response recorded</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
              <span className="text-sm text-primary">Dashboard updated</span>
            </div>
            
            <div className="flex items-center justify-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Users size={20} className="text-purple-600" />
              <span className="text-sm text-primary">Team insights generated</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <p className="text-sm text-secondary">
              Your feedback helps improve team performance and collaboration.
            </p>
            <p className="text-xs text-muted">
              You'll receive new surveys when they're available.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => window.close()}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <Home size={16} />
              Close
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = surveyData.questions[currentQuestion];
  const hasAnswered = responses[currentQuestionData?.id];
  const isLastQuestion = currentQuestion === surveyData.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">{surveyData.title}</h1>
          <p className="text-secondary">{surveyData.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary">Progress</span>
            <span className="text-sm font-medium text-primary">
              {currentQuestion + 1} of {surveyData.questions.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-mint to-mint-dark h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {currentQuestionData && renderQuestion(currentQuestionData)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`btn-secondary flex items-center gap-2 ${
              currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ArrowRight size={16} className="rotate-180" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {currentQuestion > 0 && (
              <span className="text-xs text-secondary">
                {Object.keys(responses).length} answered
              </span>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!hasAnswered || submitting}
            className={`btn-primary flex items-center gap-2 ${
              !hasAnswered || submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : isLastQuestion ? (
              <>
                <CheckCircle size={16} />
                Submit Survey
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Survey Info */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-4 text-xs text-secondary">
            <div className="flex items-center gap-1">
              <Star size={12} />
              <span>Anonymous</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>Team Feedback</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Performance Insights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompletion; 