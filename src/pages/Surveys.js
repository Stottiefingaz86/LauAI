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
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Send survey states
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sendingSurvey, setSendingSurvey] = useState(false);
  
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
        { question_text: 'How would you rate your overall performance this quarter?', question_type: 'rating', required: true },
        { question_text: 'What are your main achievements this period?', question_type: 'text', required: true },
        { question_text: 'What challenges did you face and how did you overcome them?', question_type: 'text', required: false },
        { question_text: 'How well do you feel supported by your manager?', question_type: 'rating', required: true },
        { question_text: 'What skills would you like to develop in the next quarter?', question_type: 'text', required: false }
      ]
    },
    {
      id: 'team-feedback',
      name: 'Team Feedback',
      description: 'Gather feedback on team collaboration and dynamics',
      icon: '👥',
      questions: [
        { question_text: 'How well does your team collaborate on projects?', question_type: 'rating', required: true },
        { question_text: 'How effective is communication within your team?', question_type: 'rating', required: true },
        { question_text: 'What could improve team communication and collaboration?', question_type: 'text', required: false },
        { question_text: 'How well do team members support each other?', question_type: 'rating', required: true },
        { question_text: 'Rate the overall team morale and culture', question_type: 'rating', required: true }
      ]
    },
    {
      id: 'satisfaction',
      name: 'Employee Satisfaction',
      description: 'Measure overall employee satisfaction and engagement',
      icon: '😊',
      questions: [
        { question_text: 'How satisfied are you with your current role?', question_type: 'rating', required: true },
        { question_text: 'How engaged do you feel at work?', question_type: 'rating', required: true },
        { question_text: 'What would make you more engaged at work?', question_type: 'text', required: false },
        { question_text: 'How satisfied are you with your work-life balance?', question_type: 'rating', required: true },
        { question_text: 'What suggestions do you have for improving the workplace?', question_type: 'text', required: false }
      ]
    }
  ];

  useEffect(() => {
    loadSurveys();
    loadMembers();
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
              order_index: question.order_index || 0
            });
          }
        }
      }

      alert('Survey created successfully!');
      setShowCreateSurvey(false);
      setNewSurvey({ title: '', description: '', status: 'draft', template: null });
      setSurveyQuestions([]);
      loadSurveys();
    } catch (error) {
      console.error('Error creating survey:', error);
      alert(`Failed to create survey: ${error.message}`);
    }
  };

  const deleteSurvey = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) return;

    try {
      console.log('🗑️ Deleting survey:', surveyId);
      
      const { error } = await surveyService.deleteSurvey(surveyId);
      if (error) {
        console.error('❌ Error deleting survey:', error);
        alert(`Failed to delete survey: ${error.message}`);
      } else {
        console.log('✅ Survey deleted successfully');
        setSurveys(prev => prev.filter(s => s.id !== surveyId));
        alert('Survey deleted successfully!');
      }
    } catch (error) {
      console.error('❌ Error deleting survey:', error);
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
    if (selectedMembers.length === 0) {
      alert('Please select at least one member to send the survey to.');
      return;
    }

    try {
      setSendingSurvey(true);
      console.log('🚀 Sending survey to members:', selectedMembers);

      const result = await surveyService.sendSurveyEmail(selectedSurvey.id, selectedMembers);
      
      console.log('📤 Send result:', result);
      
      if (result.error) {
        console.error('❌ Error sending survey:', result.error);
        alert(`Failed to send survey: ${result.error.message}`);
      } else {
        console.log('✅ Survey sent successfully:', result.data);
        alert(`Survey sent successfully to ${result.data.members_sent} member(s)`);
        setShowSendSurvey(false);
        setSelectedMembers([]);
      }
    } catch (error) {
      console.error('❌ Error in handleSendSurvey:', error);
      alert('Failed to send survey. Please try again.');
    } finally {
      setSendingSurvey(false);
    }
  };

  const handleOpenSendModal = async (survey) => {
    setSelectedSurvey(survey);
    setShowSendSurvey(true);
    setSelectedMembers([]);
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
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
      case 'delete':
        deleteSurvey(survey.id);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Surveys</h1>
            <p className="text-gray-400 mt-2">Create and manage feedback surveys</p>
          </div>
          <button
            onClick={() => setShowCreateSurvey(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create Survey
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['all', 'draft', 'active', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Surveys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredSurveys().map(survey => (
            <div key={survey.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{survey.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{survey.description}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(survey.status)}`}>
                    {getStatusIcon(survey.status)}
                    {survey.status}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === survey.id ? null : survey.id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  
                  {openDropdown === survey.id && (
                    <div className="absolute right-0 top-full mt-2 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10 min-w-[160px]">
                      {survey.status === 'draft' && (
                        <button
                          onClick={() => handleDropdownAction(survey, 'activate')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Play size={14} />
                          Activate
                        </button>
                      )}
                      {survey.status === 'active' && (
                        <button
                          onClick={() => handleDropdownAction(survey, 'deactivate')}
                          className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2"
                        >
                          <Pause size={14} />
                          Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleDropdownAction(survey, 'send')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-600 flex items-center gap-2"
                      >
                        <Send size={14} />
                        Send
                      </button>
                      <button
                        onClick={() => handleDropdownAction(survey, 'delete')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-600 text-red-400 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-400">
                Created {new Date(survey.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {getFilteredSurveys().length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No surveys found</h3>
            <p className="text-gray-400">Create your first survey to get started</p>
          </div>
        )}
      </div>

      {/* Create Survey Modal */}
      {showCreateSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Survey</h2>
              <button
                onClick={() => setShowCreateSurvey(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Survey Title</label>
                <input
                  type="text"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter survey title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newSurvey.description}
                  onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Enter survey description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {surveyTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        newSurvey.template?.id === template.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <h3 className="font-semibold mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {newSurvey.template && (
                <div>
                  <label className="block text-sm font-medium mb-2">Questions ({surveyQuestions.length})</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {surveyQuestions.map((question, index) => (
                      <div key={index} className="p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-gray-600 px-2 py-1 rounded">{question.question_type}</span>
                          {question.required && <span className="text-xs bg-red-600 px-2 py-1 rounded">Required</span>}
                        </div>
                        <p className="text-sm">{question.question_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={createSurvey}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create Survey
                </button>
                <button
                  onClick={() => setShowCreateSurvey(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Survey Modal */}
      {showSendSurvey && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Send Survey</h2>
              <button
                onClick={() => setShowSendSurvey(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedSurvey.title}</h3>
                <p className="text-gray-400 text-sm">{selectedSurvey.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Members</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {members.map(member => (
                    <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-400">{member.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSendSurvey}
                  disabled={sendingSurvey || selectedMembers.length === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors flex-1"
                >
                  {sendingSurvey ? 'Sending...' : `Send to ${selectedMembers.length} member(s)`}
                </button>
                <button
                  onClick={() => setShowSendSurvey(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
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