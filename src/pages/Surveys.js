import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Play, 
  Eye, 
  Clock, 
  Calendar, 
  Users, 
  BarChart3,
  CheckCircle2,
  Target,
  Award,
  FileText,
  AlertCircle,
  Mail,
  Copy,
  Trash2,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { surveyService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const Surveys = () => {
  const { user, isAdmin, isMember, isManager, isLeader } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

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
        setSurveys(data || []);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSurveyStatus = (survey) => {
    if (survey.status === 'active') {
      return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (survey.status === 'draft') {
      return { text: 'Draft', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { text: 'Completed', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getSurveyIcon = (survey) => {
    const status = getSurveyStatus(survey);
    if (status.text === 'Active') {
      return <Play size={14} />;
    } else if (status.text === 'Draft') {
      return <Edit size={14} />;
    } else {
      return <CheckCircle2 size={14} />;
    }
  };

  const generateSurveyUrl = (surveyId, userId) => {
    return `${window.location.origin}/survey-completion/${surveyId}/${userId}`;
  };

  const copySurveyLink = async (surveyId, userId) => {
    try {
      const surveyUrl = generateSurveyUrl(surveyId, userId);
      await navigator.clipboard.writeText(surveyUrl);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy survey link:', error);
    }
  };

  const hasData = surveys.length > 0;

  // Member view - only show surveys they can take
  if (isMember) {
    const availableSurveys = surveys.filter(survey => survey.status === 'active');

    if (availableSurveys.length === 0) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">No Surveys Available</h1>
            <p className="text-secondary text-lg">You don't have any surveys to complete at the moment.</p>
            <p className="text-muted text-sm mt-2">Your administrator will send you surveys when they're ready.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">My Surveys</h1>
          <p className="text-secondary">Complete your assigned surveys</p>
        </div>

        {/* Available Surveys */}
        <div className="space-y-4">
          {availableSurveys.map((survey) => {
            const status = getSurveyStatus(survey);
            const statusIcon = getSurveyIcon(survey);

            return (
              <div key={survey.id} className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-primary">{survey.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg} flex items-center`}>
                        {statusIcon}
                        <span className="ml-1">{status.text}</span>
                      </span>
                    </div>
                    <p className="text-secondary text-sm mb-3">{survey.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        Estimated time: {survey.estimated_time || '5-10 minutes'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due: {survey.due_date ? new Date(survey.due_date).toLocaleDateString() : 'No deadline'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setShowSurveyPreview(true);
                      }}
                      className="btn-secondary p-2"
                      title="Preview Survey"
                    >
                      <Eye size={16} />
                    </button>

                    <a
                      href={generateSurveyUrl(survey.id, user?.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center gap-2"
                    >
                      <Play size={16} />
                      Start Survey
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Survey Preview Modal */}
        {showSurveyPreview && selectedSurvey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-modal w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">Survey Preview</h3>
                <button
                  onClick={() => setShowSurveyPreview(false)}
                  className="text-muted hover:text-primary"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-primary">{selectedSurvey.title}</h4>
                <p className="text-secondary">{selectedSurvey.description}</p>

                <div className="space-y-3">
                  {selectedSurvey.questions?.map((question, index) => (
                    <div key={question.id} className="glass-card p-4">
                      <p className="font-medium text-primary mb-2">
                        {index + 1}. {question.question_text}
                      </p>
                      <p className="text-sm text-muted">{question.question_type}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowSurveyPreview(false)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                  <a
                    href={generateSurveyUrl(selectedSurvey.id, user?.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 flex-1 justify-center"
                  >
                    <Play size={16} />
                    Start Survey
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/Manager/Leader view - show all surveys with management options
  if (!hasData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">No Surveys Yet</h1>
          <p className="text-secondary text-lg">Create your first survey to start gathering team feedback.</p>
          <p className="text-muted text-sm mt-2">Surveys help you understand team performance and satisfaction.</p>
          
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary mt-6 flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Create First Survey
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Surveys</h1>
          <p className="text-secondary">Manage and track team surveys</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Mail size={16} />
              Send Survey
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Create Survey
            </button>
          </div>
        )}
      </div>

      {/* Surveys List */}
      <div className="space-y-4">
        {surveys.map((survey) => {
          const status = getSurveyStatus(survey);
          const statusIcon = getSurveyIcon(survey);

          return (
            <div key={survey.id} className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-primary">{survey.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg} flex items-center`}>
                      {statusIcon}
                      <span className="ml-1">{status.text}</span>
                    </span>
                  </div>
                  <p className="text-secondary text-sm mb-3">{survey.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {survey.response_count || 0} responses
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 size={14} />
                      {survey.questions_count || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Created: {new Date(survey.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => copySurveyLink(survey.id, user?.id)}
                        className="btn-secondary p-2"
                        title="Copy Survey Link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSurvey(survey);
                          setShowSurveyPreview(true);
                        }}
                        className="btn-secondary p-2"
                        title="Preview Survey"
                      >
                        <Eye size={16} />
                      </button>
                      <div className="relative">
                        <button className="btn-secondary p-2">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </>
                  )}
                  
                  {(isManager || isLeader) && (
                    <button
                      onClick={() => {
                        setSelectedSurvey(survey);
                        setShowSurveyPreview(true);
                      }}
                      className="btn-secondary p-2"
                      title="Preview Survey"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Survey Preview Modal */}
      {showSurveyPreview && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Survey Preview</h3>
              <button
                onClick={() => setShowSurveyPreview(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-primary">{selectedSurvey.title}</h4>
              <p className="text-secondary">{selectedSurvey.description}</p>

              <div className="space-y-3">
                {selectedSurvey.questions?.map((question, index) => (
                  <div key={question.id} className="glass-card p-4">
                    <p className="font-medium text-primary mb-2">
                      {index + 1}. {question.question_text}
                    </p>
                    <p className="text-sm text-muted">{question.question_type}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSurveyPreview(false)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
                {isAdmin && (
                  <button className="btn-primary flex items-center gap-2 flex-1 justify-center">
                    <Edit size={16} />
                    Edit Survey
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Survey Modal - Only for admins */}
      {showCreateModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Create New Survey</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Survey Title
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  placeholder="e.g., Team Performance Check-in"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Description
                </label>
                <textarea
                  className="glass-textarea w-full"
                  placeholder="Brief description of the survey purpose..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <Plus size={16} />
                  Create Survey
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Survey Modal - Only for admins */}
      {showInviteModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Send Survey</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Select Survey
                </label>
                <select className="glass-select w-full">
                  <option value="">Choose a survey...</option>
                  {surveys.filter(s => s.status === 'active').map(survey => (
                    <option key={survey.id} value={survey.id}>{survey.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Team Members
                </label>
                <textarea
                  className="glass-textarea w-full"
                  placeholder="Enter email addresses, one per line..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn-primary flex items-center gap-2 flex-1 justify-center">
                  <Mail size={16} />
                  Send Survey
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