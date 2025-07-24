import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Send,
  X
} from 'lucide-react';

const SurveyPage = () => {
  const { surveyId, userId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [user, setUser] = useState(null);

  // Mock survey data - in real app, this would come from API
  const surveyData = {
    1: {
      id: 1,
      name: 'Monthly Check-in',
      description: 'Help us understand your experience this month',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'What achievement are you most proud of this month?',
          required: true,
          placeholder: 'Share your biggest accomplishment...'
        },
        {
          id: 2,
          type: 'rating',
          question: 'How would you rate your collaboration with the team?',
          required: true,
          scale: 5,
          labels: {
            1: 'Poor',
            2: 'Fair', 
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
          }
        },
        {
          id: 3,
          type: 'multiple_choice',
          question: 'Any energy drain or motivation issues you\'d like to discuss?',
          required: false,
          options: ['Yes, significant issues', 'Yes, minor issues', 'No issues', 'Prefer not to say']
        },
        {
          id: 4,
          type: 'text',
          question: 'What did you learn recently that excites you?',
          required: false,
          placeholder: 'Share something new you learned...'
        },
        {
          id: 5,
          type: 'rating',
          question: 'How supported do you feel in your role?',
          required: true,
          scale: 5,
          labels: {
            1: 'Not Supported',
            2: 'Somewhat Supported',
            3: 'Supported',
            4: 'Well Supported',
            5: 'Very Well Supported'
          }
        }
      ]
    },
    2: {
      id: 2,
      name: 'Quarterly Review',
      description: 'Comprehensive assessment for career development and goal setting',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'What are your biggest accomplishments this quarter?',
          required: true,
          placeholder: 'Describe your key achievements...'
        },
        {
          id: 2,
          type: 'text',
          question: 'What challenges did you face and how did you overcome them?',
          required: true,
          placeholder: 'Share your challenges and solutions...'
        },
        {
          id: 3,
          type: 'text',
          question: 'What are your goals for the next quarter?',
          required: true,
          placeholder: 'What would you like to achieve?'
        },
        {
          id: 4,
          type: 'text',
          question: 'How can we better support your growth and development?',
          required: false,
          placeholder: 'What support do you need?'
        },
        {
          id: 5,
          type: 'text',
          question: 'What feedback do you have for the team or leadership?',
          required: false,
          placeholder: 'Share your thoughts and suggestions...'
        }
      ]
    },
    3: {
      id: 3,
      name: 'Well-being Check',
      description: 'Focused survey on mental health and work-life balance',
      questions: [
        {
          id: 1,
          type: 'rating',
          question: 'How would you rate your current stress level?',
          required: true,
          scale: 5,
          labels: {
            1: 'Very Low',
            2: 'Low',
            3: 'Moderate',
            4: 'High',
            5: 'Very High'
          }
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'Are you experiencing any burnout symptoms?',
          required: true,
          options: ['Yes, severe', 'Yes, moderate', 'Yes, mild', 'No', 'Not sure']
        },
        {
          id: 3,
          type: 'text',
          question: 'What would help improve your work-life balance?',
          required: false,
          placeholder: 'Share your suggestions...'
        },
        {
          id: 4,
          type: 'rating',
          question: 'How supported do you feel in managing your workload?',
          required: true,
          scale: 5,
          labels: {
            1: 'Not Supported',
            2: 'Somewhat Supported',
            3: 'Supported',
            4: 'Well Supported',
            5: 'Very Well Supported'
          }
        },
        {
          id: 5,
          type: 'text',
          question: 'What activities help you recharge outside of work?',
          required: false,
          placeholder: 'Share your favorite activities...'
        }
      ]
    }
  };

  // Mock user data - in real app, this would come from API
  const userData = {
    '123': { name: 'Sarah Chen', role: 'Senior Designer', department: 'Design' },
    '456': { name: 'Mike Johnson', role: 'Frontend Engineer', department: 'Engineering' },
    '789': { name: 'Emma Davis', role: 'Product Manager', department: 'Product' }
  };

  useEffect(() => {
    // Load survey and user data
    const survey = surveyData[surveyId];
    const user = userData[userId];
    
    if (!survey || !user) {
      // Redirect to error page or show error
      navigate('/');
      return;
    }
    
    setSurvey(survey);
    setUser(user);
  }, [surveyId, userId, navigate]);

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In real app, send responses to backend
      console.log('Survey responses:', {
        surveyId,
        userId,
        responses,
        submittedAt: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      // Redirect to thank you page or show success message
      navigate('/survey/thank-you');
    }, 2000);
  };

  const currentQ = survey?.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey?.questions.length) * 100;
  const canProceed = currentQ?.required ? responses[currentQ.id] : true;

  if (!survey || !user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Survey Not Found</h2>
          <p className="text-white/60">This survey link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 glass-topnav">
        <div className="flex items-center justify-between h-16 px-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-mint" />
            </div>
            <div>
              <p className="text-white font-medium">{user.name}</p>
              <p className="text-white/60 text-xs">{user.role} • {user.department}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">Question {currentQuestion + 1} of {survey.questions.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white/5">
        <div className="h-1 bg-white/10">
          <div 
            className="h-full bg-mint transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Survey Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">{survey.name}</h1>
            <p className="text-xl text-white/70">{survey.description}</p>
          </div>

          {/* Question */}
          <div className="glass-card p-8 mb-8">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                  <span className="text-mint font-semibold text-sm">{currentQuestion + 1}</span>
                </div>
                <span className="text-white/60 text-sm">
                  {currentQ?.required ? 'Required' : 'Optional'}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">{currentQ?.question}</h2>
            </div>

            {/* Response Input */}
            <div className="space-y-4">
              {currentQ?.type === 'text' && (
                <textarea
                  className="glass-input w-full h-32 resize-none"
                  placeholder={currentQ.placeholder || 'Type your response...'}
                  value={responses[currentQ.id] || ''}
                  onChange={(e) => handleResponse(currentQ.id, e.target.value)}
                />
              )}

              {currentQ?.type === 'rating' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    {Array.from({ length: currentQ.scale }, (_, i) => i + 1).map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleResponse(currentQ.id, rating)}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-200 ${
                          responses[currentQ.id] === rating
                            ? 'bg-mint text-gray-900 shadow-lg scale-110'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  {currentQ.labels && responses[currentQ.id] && (
                    <p className="text-center text-mint font-medium">
                      {currentQ.labels[responses[currentQ.id]]}
                    </p>
                  )}
                </div>
              )}

              {currentQ?.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleResponse(currentQ.id, option)}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                        responses[currentQ.id] === option
                          ? 'bg-mint text-gray-900 shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                currentQuestion === 0
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentQuestion === survey.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  canProceed && !isSubmitting
                    ? 'bg-mint text-gray-900 hover:bg-mint-dark'
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Survey</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  canProceed
                    ? 'bg-mint text-gray-900 hover:bg-mint-dark'
                    : 'bg-white/20 text-white/60 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage; 