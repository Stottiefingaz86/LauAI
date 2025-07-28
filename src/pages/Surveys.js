import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Play, 
  Pause, 
  Send, 
  Trash2, 
  MoreHorizontal, 
  Clock, 
  CheckCircle, 
  Filter,
  X,
  Users,
  Search,
  Check,
  Activity,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { surveyService, teamService } from '../lib/supabaseService';

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [showSendSurvey, setShowSendSurvey] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Send survey states
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [sendTarget, setSendTarget] = useState('members'); // 'members' or 'teams'
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingSurvey, setSendingSurvey] = useState(false);
  
  // Activity states
  const [surveyActivity, setSurveyActivity] = useState([]);
  
  // Form data
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    status: 'draft',
    template: null
  });
  const [surveyQuestions, setSurveyQuestions] = useState([]);

  // Survey templates
  const surveyTemplates = [
    {
      id: 'performance',
      name: 'Performance Review',
      description: 'Comprehensive performance evaluation survey',
      icon: '📊',
      questions: [
        { question_text: 'How would you rate your overall performance this quarter?', question_type: 'rating', required: true, category: 'performance' },
        { question_text: 'What are your main achievements this period?', question_type: 'text', required: true, category: 'performance' },
        { question_text: 'What challenges did you face and how did you overcome them?', question_type: 'text', required: false, category: 'performance' },
        { question_text: 'How well do you feel supported by your manager?', question_type: 'rating', required: true, category: 'performance' },
        { question_text: 'What skills would you like to develop in the next quarter?', question_type: 'text', required: false, category: 'performance' },
        { question_text: 'How satisfied are you with your current role and responsibilities?', question_type: 'rating', required: true, category: 'performance' },
        { question_text: 'What feedback do you have for your manager or team?', question_type: 'text', required: false, category: 'performance' },
        { question_text: 'Rate your work-life balance this quarter', question_type: 'rating', required: true, category: 'performance' }
      ]
    },
    {
      id: 'team-feedback',
      name: 'Team Feedback',
      description: 'Gather feedback on team collaboration and dynamics',
      icon: '👥',
      questions: [
        { question_text: 'How well does your team collaborate on projects?', question_type: 'rating', required: true, category: 'feedback' },
        { question_text: 'How effective is communication within your team?', question_type: 'rating', required: true, category: 'feedback' },
        { question_text: 'What could improve team communication and collaboration?', question_type: 'text', required: false, category: 'feedback' },
        { question_text: 'How well do team members support each other?', question_type: 'rating', required: true, category: 'feedback' },
        { question_text: 'Rate the overall team morale and culture', question_type: 'rating', required: true, category: 'feedback' },
        { question_text: 'What team activities or initiatives would you like to see?', question_type: 'text', required: false, category: 'feedback' },
        { question_text: 'How well does the team handle conflicts and disagreements?', question_type: 'rating', required: true, category: 'feedback' },
        { question_text: 'What suggestions do you have for improving team dynamics?', question_type: 'text', required: false, category: 'feedback' }
      ]
    },
    {
      id: 'satisfaction',
      name: 'Employee Satisfaction',
      description: 'Measure overall employee satisfaction and engagement',
      icon: '😊',
      questions: [
        { question_text: 'How satisfied are you with your current role?', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'How engaged do you feel at work?', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'What would make you more engaged at work?', question_type: 'text', required: false, category: 'satisfaction' },
        { question_text: 'How satisfied are you with your compensation and benefits?', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'Rate your satisfaction with company culture and values', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'How likely are you to recommend this company to others?', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'What aspects of the company culture do you value most?', question_type: 'text', required: false, category: 'satisfaction' },
        { question_text: 'How satisfied are you with your work-life balance?', question_type: 'rating', required: true, category: 'satisfaction' },
        { question_text: 'What would improve your overall job satisfaction?', question_type: 'text', required: false, category: 'satisfaction' },
        { question_text: 'How well do you feel your contributions are recognized?', question_type: 'rating', required: true, category: 'satisfaction' }
      ]
    },
    {
      id: 'custom',
      name: 'Custom Survey',
      description: 'Create your own survey from scratch',
      icon: '✏️',
      questions: []
    }
  ];

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      const { data, error } = await surveyService.getSurveys();
      if (error) {
        console.error('Error loading surveys:', error);
      } else {
        console.log('Loaded surveys:', data);
        setSurveys(data || []);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await teamService.getTeamMembers();
      if (error) {
        console.error('Error loading members:', error);
      } else {
        setMembers(data || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await teamService.getTeams();
      if (error) {
        console.error('Error loading teams:', error);
      } else {
        setTeams(data || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadSurveyActivity = async (surveyId) => {
    try {
      // Load survey invitations and responses
      const { data: invitations, error: invitationsError } = await surveyService.getSurveyInvitations(surveyId);
      const { data: responses, error: responsesError } = await surveyService.getSurveyResponses(surveyId);
      
      if (!invitationsError && !responsesError) {
        const activity = (invitations || []).map(invitation => {
          const response = (responses || []).find(r => r.member_id === invitation.member_id);
          return {
            ...invitation,
            member: members.find(m => m.id === invitation.member_id),
            hasResponded: !!response,
            response: response
          };
        });
        setSurveyActivity(activity);
      }
    } catch (error) {
      console.error('Error loading survey activity:', error);
    }
  };

  const createSurvey = async () => {
    if (!newSurvey.title.trim()) {
      alert('Please enter a survey title');
      return;
    }

    if (!newSurvey.template) {
      alert('Please select a survey template');
      return;
    }

    try {
      const { data: survey, error: surveyError } = await surveyService.createSurvey({
        title: newSurvey.title,
        description: newSurvey.description || '',
        status: newSurvey.status || 'draft'
      });

      if (surveyError) {
        console.error('Error creating survey:', surveyError);
        alert(`Failed to create survey: ${surveyError.message}`);
        return;
      }

      // Add questions if any
      if (surveyQuestions.length > 0) {
        for (const question of surveyQuestions) {
          if (question.question_text.trim()) {
            await surveyService.createSurveyQuestion({
              survey_id: survey.id,
              question_text: question.question_text,
              question_type: question.question_type,
              required: question.required,
              options: question.options,
              category: question.category
            });
          }
        }
      }

      setSurveys(prev => [...prev, survey]);
      setNewSurvey({ title: '', description: '', status: 'draft', template: null });
      setSurveyQuestions([]);
      setShowCreateSurvey(false);
      alert('Survey created successfully!');
    } catch (error) {
      console.error('Error creating survey:', error);
      alert(`Failed to create survey: ${error.message}`);
    }
  };

  const deleteSurvey = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;

    try {
      const { error } = await surveyService.deleteSurvey(surveyId);
      if (error) {
        console.error('Error deleting survey:', error);
        alert(`Failed to delete survey: ${error.message}`);
      } else {
        setSurveys(prev => prev.filter(s => s.id !== surveyId));
        alert('Survey deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      alert(`Failed to delete survey: ${error.message}`);
    }
  };

  const activateSurvey = async (surveyId) => {
    try {
      const { error } = await surveyService.updateSurvey(surveyId, { status: 'active' });
      if (error) {
        console.error('Error activating survey:', error);
        alert(`Failed to activate survey: ${error.message}`);
      } else {
        setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, status: 'active' } : s));
        alert('Survey activated successfully!');
      }
    } catch (error) {
      console.error('Error activating survey:', error);
      alert(`Failed to activate survey: ${error.message}`);
    }
  };

  const deactivateSurvey = async (surveyId) => {
    try {
      const { error } = await surveyService.updateSurvey(surveyId, { status: 'draft' });
      if (error) {
        console.error('Error deactivating survey:', error);
        alert(`Failed to deactivate survey: ${error.message}`);
      } else {
        setSurveys(prev => prev.map(s => s.id === surveyId ? { ...s, status: 'draft' } : s));
        alert('Survey deactivated successfully!');
      }
    } catch (error) {
      console.error('Error deactivating survey:', error);
      alert(`Failed to deactivate survey: ${error.message}`);
    }
  };

  const selectTemplate = (template) => {
    setNewSurvey(prev => ({ ...prev, template }));
    setSurveyQuestions(template.questions || []);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play size={14} />;
      case 'draft': return <FileText size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getFilteredSurveys = () => {
    if (selectedStatus === 'all') return surveys;
    return surveys.filter(survey => survey.status === selectedStatus);
  };

  const handleSendSurvey = async () => {
    let targetMembers = [];
    
    if (sendTarget === 'members') {
      if (selectedMembers.length === 0) {
        alert('Please select at least one member to send the survey to.');
        return;
      }
      targetMembers = selectedMembers;
    } else if (sendTarget === 'teams') {
      if (selectedTeams.length === 0) {
        alert('Please select at least one team to send the survey to.');
        return;
      }
      // Get all members from selected teams
      targetMembers = members.filter(member => 
        selectedTeams.includes(member.team_id)
      ).map(member => member.id);
    }

    if (targetMembers.length === 0) {
      alert('No members found to send the survey to.');
      return;
    }

    // Validate that we have a selected survey
    if (!selectedSurvey || !selectedSurvey.id) {
      alert('No survey selected. Please try again.');
      return;
    }

    console.log('Sending survey:', {
      surveyId: selectedSurvey.id,
      surveyTitle: selectedSurvey.title,
      targetMembers: targetMembers,
      sendTarget: sendTarget
    });

    setSendingSurvey(true);
    try {
      console.log('Calling sendSurveyEmail with survey ID:', selectedSurvey.id);
      
      const { data, error } = await surveyService.sendSurveyEmail(selectedSurvey.id, targetMembers);
      
      if (error) {
        console.error('Error sending survey:', error);
        
        if (error.message === 'Survey not found') {
          alert(`Survey "${selectedSurvey.title}" not found in database. Please refresh the page and try again.`);
        } else if (error.message === 'No members found') {
          alert('No members found for the selected IDs. Please check your member selection.');
        } else {
          alert(`Failed to send survey: ${error.message}`);
        }
      } else {
        console.log('Survey sent successfully:', data);
        
        const successMessage = data.message || `Survey "${selectedSurvey.title}" sent successfully to ${targetMembers.length} member(s)!`;
        alert(successMessage);
        
        setShowSendSurvey(false);
        setSelectedMembers([]);
        setSelectedTeams([]);
        setSearchTerm('');
        setSendTarget('members');
      }
    } catch (error) {
      console.error('Unexpected error sending survey:', error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setSendingSurvey(false);
    }
  };

  const handleOpenSendModal = async (survey) => {
    console.log('Opening send modal for survey:', survey);
    setSelectedSurvey(survey);
    setSelectedMembers([]);
    setSelectedTeams([]);
    setSearchTerm('');
    setSendTarget('members');
    await Promise.all([loadMembers(), loadTeams()]);
    setShowSendSurvey(true);
  };

  const handleOpenActivityModal = async (survey) => {
    setSelectedSurvey(survey);
    await loadSurveyActivity(survey.id);
    setShowActivity(true);
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleTeamSelection = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getFilteredMembers = () => {
    if (!searchTerm) return members;
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getFilteredTeams = () => {
    if (!searchTerm) return teams;
    return teams.filter(team => 
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleDropdownAction = (survey, action) => {
    setOpenDropdown(null);
    
    switch (action) {
      case 'activate':
        activateSurvey(survey.id);
        break;
      case 'deactivate':
        deactivateSurvey(survey.id);
        break;
      case 'send':
        handleOpenSendModal(survey);
        break;
      case 'activity':
        handleOpenActivityModal(survey);
        break;
      case 'delete':
        deleteSurvey(survey.id);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Surveys</h1>
            <p className="text-gray-400">Create and manage team surveys</p>
          </div>
          <button
            onClick={() => setShowCreateSurvey(true)}
            className="glass-button px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 mt-4 sm:mt-0"
          >
            <Plus size={20} />
            Create Survey
          </button>
        </div>

        {/* Empty State */}
        {surveys.length === 0 && (
          <div className="text-center py-16">
            <div className="h-24 w-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Surveys Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first survey to start gathering feedback from your team.
            </p>
            <button
              onClick={() => setShowCreateSurvey(true)}
              className="glass-button px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Survey
            </button>
          </div>
        )}

        {/* Surveys Grid */}
        {surveys.length > 0 && (
          <>
            {/* Filters */}
            <div className="glass-card p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <span className="text-gray-300 font-medium">Filter by Status:</span>
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="glass-input"
                  >
                    <option value="all">All Surveys</option>
                    <option value="draft">Drafts</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="text-gray-400 text-sm">
                  {getFilteredSurveys().length} surveys
                </div>
              </div>
            </div>

            {/* Surveys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredSurveys().map((survey) => (
                <div key={survey.id} className="glass-card p-6 hover:border-gray-600/50 transition-all duration-200">
                  {/* Survey Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{survey.title}</h3>
                        <p className="text-gray-400 text-sm">{survey.description}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === survey.id ? null : survey.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                      >
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === survey.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700/50 shadow-xl z-10">
                          <div className="py-2">
                            {survey.status === 'draft' && (
                              <button
                                onClick={() => handleDropdownAction(survey, 'activate')}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                              >
                                <Play size={14} />
                                Activate
                              </button>
                            )}
                            {survey.status === 'active' && (
                              <button
                                onClick={() => handleDropdownAction(survey, 'deactivate')}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                              >
                                <Pause size={14} />
                                Stop
                              </button>
                            )}
                            <button
                              onClick={() => handleDropdownAction(survey, 'send')}
                              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                            >
                              <Send size={14} />
                              Send
                            </button>
                            <button
                              onClick={() => handleDropdownAction(survey, 'activity')}
                              className="w-full px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2"
                            >
                              <Activity size={14} />
                              Activity
                            </button>
                            <div className="border-t border-gray-700/50 my-1"></div>
                            <button
                              onClick={() => handleDropdownAction(survey, 'delete')}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Survey Stats */}
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(survey.status)} flex items-center gap-1`}>
                      {getStatusIcon(survey.status)}
                      {survey.status}
                    </div>
                    <div className="text-gray-400 text-sm">
                      <Clock size={12} className="inline mr-1" />
                      {new Date(survey.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create Survey Modal */}
      {showCreateSurvey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Survey</h3>
              <button
                onClick={() => setShowCreateSurvey(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Choose Template</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveyTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        newSurvey.template?.id === template.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div>
                          <h4 className="text-white font-medium">{template.name}</h4>
                          <p className="text-gray-400 text-sm">{template.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Survey Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Survey Title</label>
                  <input
                    type="text"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="glass-input"
                    placeholder="Enter survey title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={newSurvey.status}
                    onChange={(e) => setNewSurvey(prev => ({ ...prev, status: e.target.value }))}
                    className="glass-input"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-input"
                  rows={3}
                  placeholder="Enter survey description"
                />
              </div>

              {/* Questions Preview */}
              {newSurvey.template && surveyQuestions.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Questions</h4>
                  <div className="space-y-3">
                    {surveyQuestions.map((question, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                        <p className="text-gray-300 text-sm">{question.question_text}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-gray-400 text-xs">Type: {question.question_type}</span>
                          <span className="text-gray-400 text-xs">Required: {question.required ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowCreateSurvey(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={createSurvey}
                className="flex-1 glass-button font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Create Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Survey Modal */}
      {showSendSurvey && selectedSurvey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Send Survey</h3>
              <button
                onClick={() => setShowSendSurvey(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Survey Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">{selectedSurvey.title}</h4>
                <p className="text-gray-400 text-sm">{selectedSurvey.description}</p>
              </div>

              {/* Send Target Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Send Target</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSendTarget('members')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      sendTarget === 'members'
                        ? 'glass-button'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    Specific Members
                  </button>
                  <button
                    onClick={() => setSendTarget('teams')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      sendTarget === 'teams'
                        ? 'glass-button'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    <Users size={16} className="inline mr-2" />
                    Entire Teams
                  </button>
                </div>
              </div>

              {/* Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select {sendTarget === 'members' ? 'Members' : 'Teams'}
                </label>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-input pl-10"
                    placeholder={`Search ${sendTarget === 'members' ? 'members' : 'teams'}...`}
                  />
                </div>

                {/* List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {sendTarget === 'members' ? (
                    getFilteredMembers().map((member) => (
                      <div
                        key={member.id}
                        onClick={() => toggleMemberSelection(member.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedMembers.includes(member.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-gray-400 text-sm">{member.email}</p>
                          </div>
                          {selectedMembers.includes(member.id) && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    getFilteredTeams().map((team) => (
                      <div
                        key={team.id}
                        onClick={() => toggleTeamSelection(team.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedTeams.includes(team.id)
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{team.name}</p>
                            <p className="text-gray-400 text-sm">{team.description}</p>
                          </div>
                          {selectedTeams.includes(team.id) && (
                            <Check size={16} className="text-blue-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {(sendTarget === 'members' ? getFilteredMembers() : getFilteredTeams()).length === 0 && (
                  <div className="text-center py-8">
                    <Users size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No {sendTarget === 'members' ? 'members' : 'teams'} found</p>
                  </div>
                )}
              </div>

              {/* Selected Count */}
              {(sendTarget === 'members' ? selectedMembers.length : selectedTeams.length) > 0 && (
                <div className="text-center">
                  <p className="text-gray-300">
                    Selected {sendTarget === 'members' ? selectedMembers.length : selectedTeams.length} {sendTarget === 'members' ? 'member' : 'team'}{(sendTarget === 'members' ? selectedMembers.length : selectedTeams.length) !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSendSurvey(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSurvey}
                disabled={(sendTarget === 'members' ? selectedMembers.length : selectedTeams.length) === 0 || sendingSurvey}
                className="flex-1 glass-button font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingSurvey ? 'Sending...' : `Send to ${sendTarget === 'members' ? selectedMembers.length : selectedTeams.length} ${sendTarget === 'members' ? 'member' : 'team'}${(sendTarget === 'members' ? selectedMembers.length : selectedTeams.length) !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivity && selectedSurvey && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Survey Activity</h3>
              <button
                onClick={() => setShowActivity(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Survey Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-medium mb-2">{selectedSurvey.title}</h4>
                <p className="text-gray-400 text-sm">{selectedSurvey.description}</p>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{surveyActivity.length}</div>
                  <div className="text-gray-400 text-sm">Sent</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {surveyActivity.filter(item => item.hasResponded).length}
                  </div>
                  <div className="text-gray-400 text-sm">Completed</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {surveyActivity.filter(item => !item.hasResponded).length}
                  </div>
                  <div className="text-gray-400 text-sm">Pending</div>
                </div>
              </div>

              {/* Activity List */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Member Activity</h4>
                <div className="space-y-3">
                  {surveyActivity.map((item) => (
                    <div key={item.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {item.member?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.member?.name || 'Unknown Member'}</p>
                            <p className="text-gray-400 text-sm">{item.member?.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.hasResponded 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.hasResponded ? 'Completed' : 'Pending'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {new Date(item.sent_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {surveyActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No activity found for this survey</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowActivity(false)}
                className="flex-1 glass-button font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys; 