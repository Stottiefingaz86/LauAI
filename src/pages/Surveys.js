import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Send,
  Eye,
  X,
  User,
  Calendar,
  BarChart3,
  Link,
  Copy,
  Users,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

const Surveys = () => {
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const [showSendSurvey, setShowSendSurvey] = useState(false);
  const [previewSurvey, setPreviewSurvey] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyToSend, setSurveyToSend] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  // Mock data with dynamic URLs
  const surveyTemplates = [
    {
      id: 1,
      name: 'Monthly Check-in',
      description: 'Standard monthly team survey to track ongoing performance and well-being',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'What achievement are you most proud of this month?',
          required: true
        },
        {
          id: 2,
          type: 'rating',
          question: 'How would you rate your collaboration with the team?',
          required: true,
          scale: 5
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
          required: false
        },
        {
          id: 5,
          type: 'rating',
          question: 'How supported do you feel in your role?',
          required: true,
          scale: 5
        }
      ],
      category: 'Monthly',
      usage: 24,
      activeSurveys: 3,
      responseRate: 87,
      avgCompletionTime: '4.2 minutes',
      status: 'active',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20'
    },
    {
      id: 2,
      name: 'Quarterly Review',
      description: 'Comprehensive quarterly assessment for career development and goal setting',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'What are your biggest accomplishments this quarter?',
          required: true
        },
        {
          id: 2,
          type: 'text',
          question: 'What challenges did you face and how did you overcome them?',
          required: true
        },
        {
          id: 3,
          type: 'text',
          question: 'What are your goals for the next quarter?',
          required: true
        },
        {
          id: 4,
          type: 'rating',
          question: 'How would you rate your overall performance this quarter?',
          required: true,
          scale: 5
        },
        {
          id: 5,
          type: 'text',
          question: 'What support do you need to achieve your goals?',
          required: false
        }
      ],
      category: 'Quarterly',
      usage: 8,
      activeSurveys: 1,
      responseRate: 92,
      avgCompletionTime: '8.5 minutes',
      status: 'active',
      createdAt: '2024-01-10',
      lastModified: '2024-01-18'
    },
    {
      id: 3,
      name: 'Well-being Check',
      description: 'Focused survey on mental health and work-life balance',
      questions: [
        {
          id: 1,
          type: 'rating',
          question: 'How would you rate your current stress level?',
          required: true,
          scale: 5
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'How is your work-life balance?',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
        },
        {
          id: 3,
          type: 'text',
          question: 'What would help improve your well-being at work?',
          required: false
        },
        {
          id: 4,
          type: 'rating',
          question: 'How supported do you feel by your manager?',
          required: true,
          scale: 5
        }
      ],
      category: 'Well-being',
      usage: 12,
      activeSurveys: 2,
      responseRate: 78,
      avgCompletionTime: '3.8 minutes',
      status: 'active',
      createdAt: '2024-01-12',
      lastModified: '2024-01-19'
    },
    {
      id: 4,
      name: 'Team Collaboration Assessment',
      description: 'Evaluate team dynamics and collaboration effectiveness',
      questions: [
        {
          id: 1,
          type: 'rating',
          question: 'How effective is communication within your team?',
          required: true,
          scale: 5
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'What is the biggest challenge in team collaboration?',
          required: true,
          options: ['Communication gaps', 'Conflicting priorities', 'Remote work challenges', 'Lack of resources', 'Other']
        },
        {
          id: 3,
          type: 'text',
          question: 'What would improve team collaboration?',
          required: false
        },
        {
          id: 4,
          type: 'rating',
          question: 'How well do team members support each other?',
          required: true,
          scale: 5
        }
      ],
      category: 'Team',
      usage: 0,
      activeSurveys: 0,
      responseRate: 0,
      avgCompletionTime: '0 minutes',
      status: 'draft',
      createdAt: '2024-01-22',
      lastModified: '2024-01-22'
    },
    {
      id: 5,
      name: 'Career Development Goals',
      description: 'Assess career aspirations and development needs',
      questions: [
        {
          id: 1,
          type: 'text',
          question: 'What are your career goals for the next 1-2 years?',
          required: true
        },
        {
          id: 2,
          type: 'multiple_choice',
          question: 'What type of growth opportunities interest you most?',
          required: true,
          options: ['Leadership roles', 'Technical skills', 'Cross-functional projects', 'Mentoring others', 'Industry expertise']
        },
        {
          id: 3,
          type: 'rating',
          question: 'How satisfied are you with current learning opportunities?',
          required: true,
          scale: 5
        },
        {
          id: 4,
          type: 'text',
          question: 'What skills would you like to develop?',
          required: false
        }
      ],
      category: 'Career',
      usage: 0,
      activeSurveys: 0,
      responseRate: 0,
      avgCompletionTime: '0 minutes',
      status: 'draft',
      createdAt: '2024-01-21',
      lastModified: '2024-01-21'
    }
  ];

  const activeSurveys = surveyTemplates.filter(survey => survey.status === 'active');
  const draftSurveys = surveyTemplates.filter(survey => survey.status === 'draft');

  const generateSurveyUrl = (surveyId, userId) => {
    return `${window.location.origin}/survey/${surveyId}/${userId}`;
  };

  const handlePreviewSurvey = (survey) => {
    setPreviewSurvey(survey);
    setShowSurveyPreview(true);
  };

  const handleViewResults = (survey) => {
    setSelectedSurvey(survey);
    setShowSurveyResults(true);
  };

  const copySurveyUrl = (surveyId, userId) => {
    const url = generateSurveyUrl(surveyId, userId);
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleSendSurvey = (survey) => {
    setSurveyToSend(survey);
    setShowSendSurvey(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Activity className="w-3 h-3" />;
      case 'draft':
        return <Clock className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Surveys</h1>
          <p className="text-white/70 text-lg">Create and manage team surveys</p>
        </div>
        <button
          onClick={() => setShowCreateSurvey(true)}
          className="glass-button bg-mint text-gray-900 hover:bg-mint-dark px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Total Surveys</p>
              <p className="text-2xl font-bold text-white">{surveyTemplates.length}</p>
            </div>
            <div className="w-12 h-12 bg-mint/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-mint" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Active Surveys</p>
              <p className="text-2xl font-bold text-white">{activeSurveys.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Draft Surveys</p>
              <p className="text-2xl font-bold text-white">{draftSurveys.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Avg Response Rate</p>
              <p className="text-2xl font-bold text-white">
                {activeSurveys.length > 0 ? Math.round(activeSurveys.reduce((acc, s) => acc + s.responseRate, 0) / activeSurveys.length) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Total Responses</p>
              <p className="text-2xl font-bold text-white">
                {activeSurveys.reduce((acc, s) => acc + (s.activeSurveys * 10), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Surveys */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Active Surveys</h2>
            <p className="text-white/60">Currently running surveys and their performance</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {activeSurveys.length > 0 ? (
            activeSurveys.map((survey) => (
            <div key={survey.id} className="group relative p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-6 flex-1">
                  <div className="w-16 h-16 bg-mint/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-8 h-8 text-mint" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-white">{survey.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)} flex items-center space-x-1`}>
                        {getStatusIcon(survey.status)}
                        <span className="capitalize">{survey.status}</span>
                      </span>
                    </div>
                    
                    <p className="text-white/70 text-base mb-4 leading-relaxed">{survey.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Category</p>
                        <p className="text-white font-semibold">{survey.category}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Usage</p>
                        <p className="text-white font-semibold">{survey.usage} uses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Active</p>
                        <p className="text-white font-semibold">{survey.activeSurveys}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Response Rate</p>
                        <p className="text-white font-semibold">{survey.responseRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Avg Time</p>
                        <p className="text-white font-semibold">{survey.avgCompletionTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-4">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewResults(survey)}
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="View Results"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePreviewSurvey(survey)}
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Preview Survey"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleSendSurvey(survey)}
                      className="glass-button bg-mint text-gray-900 hover:bg-mint-dark px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Survey
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white/60 text-lg font-medium mb-2">No Active Surveys</h3>
              <p className="text-white/40 text-sm">Create a survey or activate a draft to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Draft Surveys */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Draft Surveys</h2>
            <p className="text-white/60">Surveys in development - edit and activate when ready</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {draftSurveys.length > 0 ? (
            draftSurveys.map((survey) => (
              <div key={survey.id} className="group relative p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6 flex-1">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-8 h-8 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{survey.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)} flex items-center space-x-1`}>
                          {getStatusIcon(survey.status)}
                          <span className="capitalize">{survey.status}</span>
                        </span>
                      </div>
                      
                      <p className="text-white/70 text-base mb-4 leading-relaxed">{survey.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Category</p>
                          <p className="text-white font-semibold">{survey.category}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Questions</p>
                          <p className="text-white font-semibold">{survey.questions.length}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Created</p>
                          <p className="text-white font-semibold">{new Date(survey.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Last Modified</p>
                          <p className="text-white font-semibold">{new Date(survey.lastModified).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-4">
                                      <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePreviewSurvey(survey)}
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Preview Survey"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                    
                    <div className="flex space-x-3">
                      <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105">
                        <Send className="w-4 h-4 mr-2" />
                        Activate Survey
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-white/60 text-lg font-medium mb-2">No Draft Surveys</h3>
              <p className="text-white/40 text-sm">Create a new survey to start drafting</p>
            </div>
          )}
        </div>
      </div>

      {/* Survey Templates */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Survey Templates</h2>
            <p className="text-white/60">Ready-to-use survey templates for different purposes</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {surveyTemplates.slice(0, 3).map((template) => (
            <div key={template.id} className="group glass-card p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-mint/20 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-mint" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{template.name}</h3>
                      <p className="text-white/60 text-sm">{template.category}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">{template.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-white/60 mb-4">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{template.usage} uses</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Activity className="w-4 h-4" />
                      <span>{template.responseRate}% response rate</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <h4 className="text-white font-semibold text-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mint rounded-full"></div>
                  <span>Sample Questions:</span>
                </h4>
                <ul className="text-white/70 text-sm space-y-2">
                  {template.questions.slice(0, 3).map((question, index) => (
                    <li key={question.id} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-mint rounded-full mt-2 flex-shrink-0"></div>
                      <span className="truncate">{question.question}</span>
                    </li>
                  ))}
                  {template.questions.length > 3 && (
                    <li className="text-mint text-xs font-medium">+{template.questions.length - 3} more questions</li>
                  )}
                </ul>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviewSurvey(template)}
                    className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                    title="Preview Survey"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
                
                <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Create from Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Survey Modal */}
      {showCreateSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Survey</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Survey Name</label>
                  <input type="text" className="glass-input w-full" placeholder="Enter survey name" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Category</label>
                  <select className="glass-input w-full">
                    <option value="">Select category</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="well-being">Well-being</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea className="glass-input w-full h-20" placeholder="Describe the purpose of this survey..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Questions</label>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="flex items-center space-x-3">
                      <span className="text-white/60 text-sm w-8">{num}.</span>
                      <input 
                        type="text" 
                        className="glass-input flex-1" 
                        placeholder={`Question ${num}`}
                      />
                      <button type="button" className="glass-button p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="glass-button w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Assign To</label>
                  <select className="glass-input w-full">
                    <option value="">Select recipients</option>
                    <option value="all">All Team Members</option>
                    <option value="design">Design Team</option>
                    <option value="engineering">Engineering Team</option>
                    <option value="product">Product Team</option>
                    <option value="marketing">Marketing Team</option>
                    <option value="sales">Sales Team</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                  <input type="date" className="glass-input w-full" />
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSurvey(false)}
                  className="flex-1 glass-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark"
                >
                  Create & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Survey Modal */}
      {showSendSurvey && surveyToSend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Send Survey</h2>
                  <p className="text-white/60 text-sm">{surveyToSend.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSendSurvey(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Survey Preview */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-mint/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-mint" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{surveyToSend.name}</h3>
                  <p className="text-white/60 text-sm">{surveyToSend.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-xs text-white/60">
                <span>{surveyToSend.questions.length} questions</span>
                <span>•</span>
                <span>Estimated time: {Math.ceil(surveyToSend.questions.length * 1.5)} minutes</span>
              </div>
            </div>

            {/* Send Options */}
            <div className="space-y-6">
              {/* Send by Team */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-mint" />
                  <span>Send by Team</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'all', name: 'All Teams', members: 24, color: 'bg-blue-500/20' },
                    { id: 'engineering', name: 'Engineering', members: 12, color: 'bg-green-500/20' },
                    { id: 'design', name: 'Design', members: 6, color: 'bg-purple-500/20' },
                    { id: 'product', name: 'Product', members: 4, color: 'bg-orange-500/20' },
                    { id: 'marketing', name: 'Marketing', members: 8, color: 'bg-pink-500/20' },
                    { id: 'sales', name: 'Sales', members: 10, color: 'bg-red-500/20' }
                  ].map((team) => (
                    <button
                      key={team.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 ${team.color} rounded-lg flex items-center justify-center`}>
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm">{team.name}</p>
                          <p className="text-white/60 text-xs">{team.members} members</p>
                        </div>
                      </div>
                      <div className="text-white/40">
                        <Send className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Send by Individual */}
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <User className="w-5 h-5 text-mint" />
                  <span>Send by Individual</span>
                </h3>
                
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="glass-input w-full pl-10 pr-4"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(() => {
                    const members = [
                      { id: 1, name: 'Sarah Johnson', role: 'Senior Engineer', team: 'Engineering', avatar: 'SJ' },
                      { id: 2, name: 'Mike Chen', role: 'Product Manager', team: 'Product', avatar: 'MC' },
                      { id: 3, name: 'Emma Davis', role: 'UX Designer', team: 'Design', avatar: 'ED' },
                      { id: 4, name: 'Alex Rodriguez', role: 'Marketing Manager', team: 'Marketing', avatar: 'AR' },
                      { id: 5, name: 'Lisa Wang', role: 'Sales Director', team: 'Sales', avatar: 'LW' },
                      { id: 6, name: 'David Kim', role: 'Frontend Developer', team: 'Engineering', avatar: 'DK' },
                      { id: 7, name: 'Rachel Green', role: 'UI Designer', team: 'Design', avatar: 'RG' },
                      { id: 8, name: 'Tom Wilson', role: 'Backend Developer', team: 'Engineering', avatar: 'TW' },
                      { id: 9, name: 'Jennifer Lee', role: 'Data Scientist', team: 'Engineering', avatar: 'JL' },
                      { id: 10, name: 'Carlos Martinez', role: 'DevOps Engineer', team: 'Engineering', avatar: 'CM' },
                      { id: 11, name: 'Sophie Turner', role: 'Product Designer', team: 'Design', avatar: 'ST' },
                      { id: 12, name: 'Ryan Thompson', role: 'UX Researcher', team: 'Design', avatar: 'RT' },
                      { id: 13, name: 'Amanda Foster', role: 'Content Strategist', team: 'Marketing', avatar: 'AF' },
                      { id: 14, name: 'James Wilson', role: 'Digital Marketing Specialist', team: 'Marketing', avatar: 'JW' },
                      { id: 15, name: 'Maria Garcia', role: 'Account Executive', team: 'Sales', avatar: 'MG' },
                      { id: 16, name: 'Kevin Zhang', role: 'Sales Development Rep', team: 'Sales', avatar: 'KZ' },
                      { id: 17, name: 'Nina Patel', role: 'Product Owner', team: 'Product', avatar: 'NP' },
                      { id: 18, name: 'Chris Anderson', role: 'Scrum Master', team: 'Product', avatar: 'CA' },
                      { id: 19, name: 'Zoe Williams', role: 'QA Engineer', team: 'Engineering', avatar: 'ZW' },
                      { id: 20, name: 'Marcus Johnson', role: 'Technical Lead', team: 'Engineering', avatar: 'MJ' }
                    ];
                    
                    const filteredMembers = members.filter(member => 
                      member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      member.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
                      member.team.toLowerCase().includes(memberSearch.toLowerCase())
                    );
                    
                    if (filteredMembers.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-white/40" />
                          </div>
                          <p className="text-white/60 text-sm">No team members found</p>
                          <p className="text-white/40 text-xs mt-1">Try adjusting your search terms</p>
                        </div>
                      );
                    }
                    
                    return filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/10 hover:border-white/20 w-full"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-mint/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{member.avatar}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium text-sm">{member.name}</p>
                            <p className="text-white/60 text-xs">{member.role} • {member.team}</p>
                          </div>
                        </div>
                        <div className="text-white/40">
                          <Send className="w-4 h-4" />
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSendSurvey(false)}
                  className="flex-1 glass-button"
                >
                  Cancel
                </button>
                <button className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Preview Modal */}
      {showSurveyPreview && previewSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Survey Preview</h2>
                  <p className="text-white/60 text-sm">{previewSurvey.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSurveyPreview(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Survey Header */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">{previewSurvey.name}</h3>
              <p className="text-white/70 text-sm mb-3">{previewSurvey.description}</p>
              <div className="flex items-center space-x-4 text-xs text-white/60">
                <span>Category: {previewSurvey.category}</span>
                <span>•</span>
                <span>{previewSurvey.questions.length} questions</span>
                <span>•</span>
                <span>Estimated time: {Math.ceil(previewSurvey.questions.length * 1.5)} minutes</span>
              </div>
            </div>

            {/* Survey Questions */}
            <div className="space-y-6">
              {previewSurvey.questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-6 h-6 bg-mint/20 rounded-full flex items-center justify-center text-xs font-semibold text-mint">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{question.question}</h4>
                      
                      {/* Response Options */}
                      <div className="space-y-2">
                        {question.type === 'rating' ? (
                          // Rating scale for satisfaction questions
                          <div className="flex items-center space-x-3">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name={`question-${question.id}`} className="hidden" />
                                <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center text-sm hover:bg-white/10 transition-colors">
                                  {rating}
                                </div>
                              </label>
                            ))}
                            <span className="text-white/60 text-xs ml-2">1 = Poor, 5 = Excellent</span>
                          </div>
                        ) : question.type === 'multiple_choice' ? (
                          // Multiple choice for balance/stress questions
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name={`question-${question.id}`} className="hidden" />
                                <div className="w-4 h-4 border border-white/30 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-mint rounded-full hidden"></div>
                                </div>
                                <span className="text-white/70 text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          // Text area for open-ended questions
                          <div>
                            <textarea 
                              className="glass-input w-full h-20 resize-none" 
                              placeholder="Type your response here..."
                              disabled
                            ></textarea>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Survey Footer */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-white/60 text-sm">
                  <p>This survey will be sent to team members</p>
                  <p>Responses are anonymous and confidential</p>
                </div>
                <div className="flex space-x-3">
                  <button className="glass-button">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Survey
                  </button>
                  <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                    <Send className="w-4 h-4 mr-2" />
                    Send Survey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Results Modal */}
      {showSurveyResults && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-mint/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Survey Results</h2>
                  <p className="text-white/60 text-sm">{selectedSurvey.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSurveyResults(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Survey Overview</h3>
              <div className="flex items-center space-x-4 text-xs text-white/60">
                <span>Category: {selectedSurvey.category}</span>
                <span>•</span>
                <span>{selectedSurvey.questions.length} questions</span>
                <span>•</span>
                <span>Total Responses: {selectedSurvey.activeSurveys * 10}</span>
                <span>•</span>
                <span>Response Rate: {selectedSurvey.responseRate}%</span>
                <span>•</span>
                <span>Avg Completion Time: {selectedSurvey.avgCompletionTime}</span>
              </div>
            </div>

            <div className="space-y-6">
              {selectedSurvey.questions.map((question, index) => (
                <div key={question.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-6 h-6 bg-mint/20 rounded-full flex items-center justify-center text-xs font-semibold text-mint">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{question.question}</h4>
                      
                      {/* Response Options */}
                      <div className="space-y-2">
                        {question.type === 'rating' ? (
                          <div className="flex items-center space-x-3">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex items-center space-x-2 text-sm">
                                <span>{rating}</span>
                                <div className="w-full bg-white/10 h-1 rounded-full">
                                  <div 
                                    className="h-full bg-mint rounded-full" 
                                    style={{ width: `${(selectedSurvey.activeSurveys * 10) / 50}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : question.type === 'multiple_choice' ? (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div key={option} className="flex items-center space-x-2 text-sm">
                                <span>{option}</span>
                                <div className="w-full bg-white/10 h-1 rounded-full">
                                  <div 
                                    className="h-full bg-mint rounded-full" 
                                    style={{ width: `${(selectedSurvey.activeSurveys * 10) / 50}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-white/70 text-sm">Average Response: {selectedSurvey.activeSurveys * 10} responses</p>
                            <p className="text-white/70 text-sm">Average Time: {selectedSurvey.avgCompletionTime}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Link className="w-5 h-5 text-mint" />
                <span className="text-white/60 text-sm">Share Survey Link</span>
                <input 
                  type="text" 
                  className="glass-input flex-1 text-sm" 
                  value={generateSurveyUrl(selectedSurvey.id, '123')} // Replace with actual user ID
                  readOnly
                />
                <button 
                  onClick={() => copySurveyUrl(selectedSurvey.id, '123')} // Replace with actual user ID
                  className="glass-button p-2 hover:bg-white/30"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys; 