import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Send, 
  Eye, 
  BarChart3, 
  Copy, 
  Trash2, 
  Edit, 
  MoreVertical,
  Mail,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Target,
  Award,
  Play,
  FileText
} from 'lucide-react';
import { surveyService } from '../lib/supabaseService';
import { emailService } from '../lib/emailService';
import { useAuth } from '../contexts/AuthContext';

const Surveys = () => {
  const { user, isAdmin, isMember } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showSendSurvey, setShowSendSurvey] = useState(false);
  const [showSurveyPreview, setShowSurveyPreview] = useState(false);
  const [showSurveyResults, setShowSurveyResults] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
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

  const generateSurveyUrl = (surveyId, userId) => {
    return `${window.location.origin}/survey/${surveyId}/${userId}`;
  };

  const copySurveyUrl = async (surveyId, userId) => {
    const url = generateSurveyUrl(surveyId, userId);
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const sendSurveyInvitations = async () => {
    if (!selectedSurvey || !emailRecipients.trim()) return;

    setSendingEmail(true);
    const recipients = emailRecipients.split(',').map(email => email.trim());
    const surveyUrl = generateSurveyUrl(selectedSurvey.id, 'user-id'); // You'd get actual user IDs

    try {
      const emailPromises = recipients.map(email => 
        emailService.sendSurveyInvitation(email, selectedSurvey, surveyUrl)
      );

      const results = await Promise.all(emailPromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Some emails failed to send:', errors);
        // You could add error handling here
      } else {
        console.log('All survey invitations sent successfully');
        setShowSendSurvey(false);
        setEmailRecipients('');
        setEmailMessage('');
      }
    } catch (error) {
      console.error('Error sending survey invitations:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const getSurveyStatus = (survey) => {
    if (survey.status === 'draft') return { text: 'Draft', color: 'text-gray-500', bg: 'bg-gray-100' };
    if (survey.status === 'active') return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    if (survey.status === 'completed') return { text: 'Completed', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { text: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const getSurveyIcon = (survey) => {
    if (survey.status === 'draft') return <Clock size={16} />;
    if (survey.status === 'active') return <CheckCircle size={16} />;
    if (survey.status === 'completed') return <BarChart3 size={16} />;
    return <AlertCircle size={16} />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  // Admin view - show all surveys with management options
  if (surveys.length === 0) {
    return (
      <div className="p-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Create Your First Survey</h1>
          <p className="text-secondary text-lg">Start gathering team feedback and insights</p>
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <CheckCircle2 size={24} className="text-mint" />
              Get Started in 3 Steps
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus size={24} className="text-mint-dark" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">1. Create Survey</h3>
                <p className="text-secondary text-sm mb-4">Design your first survey with questions that matter to your team.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus size={16} />
                  Create Survey
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">2. Send to Team</h3>
                <p className="text-secondary text-sm mb-4">Invite your team members to complete the survey via email.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Send size={16} />
                  Send Survey
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">3. Analyze Results</h3>
                <p className="text-secondary text-sm mb-4">Get AI-powered insights and recommendations from responses.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Eye size={16} />
                  View Insights
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Clock size={20} />
                Quick Setup
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-mint-bg rounded-lg">
                  <div className="w-8 h-8 bg-mint-accent rounded-full flex items-center justify-center">
                    <BarChart3 size={16} className="text-mint-dark" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Use Survey Templates</p>
                    <p className="text-xs text-secondary">Start with proven question sets</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Bulk Send Invitations</p>
                    <p className="text-xs text-secondary">Send to multiple team members at once</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Target size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Set Response Goals</p>
                    <p className="text-xs text-secondary">Track completion rates and targets</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Lightbulb size={20} />
                What You'll Get
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Team Feedback Insights</p>
                    <p className="text-xs text-secondary">Understand team satisfaction and concerns</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Performance Trends</p>
                    <p className="text-xs text-secondary">Track changes over time</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">AI Recommendations</p>
                    <p className="text-xs text-secondary">Get actionable improvement suggestions</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Response Analytics</p>
                    <p className="text-xs text-secondary">Detailed breakdown of survey results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Survey Templates */}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Award size={20} />
              Popular Survey Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-mint-bg rounded-lg text-left hover:bg-mint-accent transition-colors">
                <h4 className="font-medium text-primary mb-1">📊 Team Check-in</h4>
                <p className="text-xs text-secondary">Quick weekly team pulse survey</p>
              </button>
              
              <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">🎯 Performance Review</h4>
                <p className="text-xs text-secondary">Comprehensive quarterly assessment</p>
              </button>
              
              <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">💡 Innovation Survey</h4>
                <p className="text-xs text-secondary">Gather ideas and feedback</p>
              </button>
            </div>
          </div>

          {/* Help Resources */}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Need Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 bg-mint-bg rounded-lg text-left hover:bg-mint-accent transition-colors">
                <h4 className="font-medium text-primary mb-1">📚 Survey Guide</h4>
                <p className="text-xs text-secondary">Learn best practices for survey design</p>
              </button>
              
              <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">🎥 Video Tutorials</h4>
                <p className="text-xs text-secondary">Watch step-by-step survey creation</p>
              </button>
              
              <button className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">💬 Support Chat</h4>
                <p className="text-xs text-secondary">Get help from our team</p>
              </button>
            </div>
          </div>
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
          <p className="text-secondary">Create and manage team surveys</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Create Survey
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Total Surveys</p>
              <p className="text-2xl font-bold text-primary">{surveys.length}</p>
            </div>
            <div className="p-2 bg-mint-accent rounded-lg">
              <BarChart3 size={20} className="text-mint-dark" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Active</p>
              <p className="text-2xl font-bold text-primary">
                {surveys.filter(s => s.status === 'active').length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Drafts</p>
              <p className="text-2xl font-bold text-primary">
                {surveys.filter(s => s.status === 'draft').length}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock size={20} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Completed</p>
              <p className="text-2xl font-bold text-primary">
                {surveys.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
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
                      <Calendar size={14} />
                      {new Date(survey.created_at).toLocaleDateString()}
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
                  
                  <button
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setShowSurveyResults(true);
                    }}
                    className="btn-secondary p-2"
                    title="View Results"
                  >
                    <BarChart3 size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedSurvey(survey);
                      setShowSendSurvey(true);
                    }}
                    className="btn-secondary p-2"
                    title="Send Survey"
                  >
                    <Mail size={16} />
                  </button>
                  
                  <button
                    onClick={() => copySurveyUrl(survey.id, 'user-id')}
                    className="btn-secondary p-2"
                    title="Copy Link"
                  >
                    <Copy size={16} />
                  </button>
                  
                  <div className="relative">
                    <button className="btn-secondary p-2">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Survey Modal */}
      {showSendSurvey && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Send Survey Invitation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Recipients (comma-separated emails)
                </label>
                <textarea
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="glass-textarea w-full"
                  placeholder="user1@company.com, user2@company.com"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Custom Message (optional)
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="glass-textarea w-full"
                  placeholder="Add a personal message to your survey invitation..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSendSurvey(false)}
                className="btn-secondary flex-1"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={sendSurveyInvitations}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={sendingEmail || !emailRecipients.trim()}
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Invitations
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
            </div>
          </div>
        </div>
      )}

      {/* Survey Results Modal */}
      {showSurveyResults && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Survey Results</h3>
              <button
                onClick={() => setShowSurveyResults(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{selectedSurvey.response_count || 0}</p>
                  <p className="text-sm text-secondary">Total Responses</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {selectedSurvey.avg_satisfaction || 'N/A'}
                  </p>
                  <p className="text-sm text-secondary">Avg Satisfaction</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {selectedSurvey.completion_rate || 'N/A'}%
                  </p>
                  <p className="text-sm text-secondary">Completion Rate</p>
                </div>
              </div>
              
              <div className="glass-card p-4">
                <h4 className="font-semibold text-primary mb-3">AI Insights</h4>
                <div className="space-y-2">
                  {selectedSurvey.insights?.map((insight, index) => (
                    <div key={index} className="p-3 bg-mint-bg rounded-lg">
                      <p className="text-sm text-primary">{insight}</p>
                    </div>
                  )) || (
                    <p className="text-muted text-sm">No insights available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Surveys; 