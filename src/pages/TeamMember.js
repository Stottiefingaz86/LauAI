import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Users, 
  Target, 
  Award,
  AlertCircle,
  Play,
  FileText,
  BarChart3,
  Eye,
  Download,
  Clock,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { memberService, meetingService, surveyService, insightService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const TeamMember = () => {
  const { memberId } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showSurveyResponses, setShowSurveyResponses] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState({});

  useEffect(() => {
    if (memberId) {
      loadMemberData();
    }
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const { data, error } = await memberService.getMemberById(memberId);
      if (error) {
        console.error('Error loading member:', error);
      } else {
        setMember(data);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSignalGradient = (value) => {
    if (typeof value !== 'number') return 'from-gray-400 to-gray-500';
    if (value >= 8) return 'from-green-400 to-green-600';
    if (value >= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getSignalGlow = (value) => {
    if (typeof value !== 'number') return 'shadow-gray-400/50';
    if (value >= 8) return 'shadow-green-400/50';
    if (value >= 6) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  const isNewMember = member && (!member.signals || member.signals === 'New');

  const toggleTimelineItem = (itemId) => {
    setExpandedTimeline(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const playVideo = (meeting) => {
    setSelectedMeeting(meeting);
    setShowVideoModal(true);
  };

  const viewSurveyResponses = (survey) => {
    setSelectedSurvey(survey);
    setShowSurveyResponses(true);
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

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Member Not Found</h2>
          <p className="text-secondary">The requested team member could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()}
          className="btn-secondary p-2"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{member.name}</h1>
          <p className="text-secondary">{member.role} • {member.department}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Current Signal</p>
              <p className="text-2xl font-bold text-primary">
                {isNewMember ? 'New' : member.signals || 'N/A'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getSignalGradient(member.signals)} ${getSignalGlow(member.signals)} flex items-center justify-center`}>
              <Activity size={20} className="text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Meetings</p>
              <p className="text-2xl font-bold text-primary">{member.meetings?.length || 0}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Surveys</p>
              <p className="text-2xl font-bold text-primary">{member.surveys?.length || 0}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Insights</p>
              <p className="text-2xl font-bold text-primary">{member.insights?.length || 0}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target size={20} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Target size={20} />
            AI Insights
          </h3>
          <div className="space-y-3">
            {member.insights?.map((insight, index) => (
              <div 
                key={index} 
                className="p-3 bg-mint-bg rounded-lg cursor-pointer hover:bg-mint-accent transition-colors"
                onClick={() => setSelectedInsight(insight)}
              >
                <p className="text-sm text-primary font-medium">{insight.title}</p>
                <p className="text-xs text-secondary mt-1">{insight.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted">Source: {insight.source}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{new Date(insight.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )) || (
              <p className="text-muted text-sm">No AI insights available yet.</p>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Award size={20} />
            Recommendations
          </h3>
          <div className="space-y-3">
            {member.recommendations?.map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-primary font-medium">{rec.title}</p>
                <p className="text-xs text-secondary mt-1">{rec.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted">Priority: {rec.priority}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{rec.category}</span>
                </div>
              </div>
            )) || (
              <p className="text-muted text-sm">No recommendations available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline with Raw Data */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Activity size={20} />
          Timeline & Raw Data
        </h3>
        
        <div className="space-y-4">
          {/* Meetings Timeline */}
          {member.meetings?.map((meeting, index) => (
            <div key={meeting.id} className="border-l-2 border-mint-accent pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-mint-accent rounded-full"></div>
                  <div>
                    <h4 className="text-primary font-medium">{meeting.title}</h4>
                    <p className="text-sm text-secondary">{new Date(meeting.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {meeting.recording_url && (
                    <button
                      onClick={() => playVideo(meeting)}
                      className="btn-secondary p-2"
                      title="Play Video"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleTimelineItem(`meeting-${meeting.id}`)}
                    className="btn-secondary p-2"
                  >
                    {expandedTimeline[`meeting-${meeting.id}`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              
              {expandedTimeline[`meeting-${meeting.id}`] && (
                <div className="mt-4 space-y-3">
                  {/* Raw Meeting Data */}
                  <div className="glass-card p-4">
                    <h5 className="font-medium text-primary mb-2">Raw Meeting Data</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-secondary">Duration:</span>
                        <span className="ml-2 text-primary">{meeting.duration || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary">File Size:</span>
                        <span className="ml-2 text-primary">{meeting.file_size || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary">Upload Date:</span>
                        <span className="ml-2 text-primary">{new Date(meeting.created_at).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-secondary">Analysis Status:</span>
                        <span className="ml-2 text-primary">{meeting.analyzed_at ? 'Completed' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis Results */}
                  {meeting.analysis_data && (
                    <div className="glass-card p-4">
                      <h5 className="font-medium text-primary mb-2">AI Analysis Results</h5>
                      <div className="space-y-2">
                        <div>
                          <span className="text-secondary">Sentiment:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            meeting.analysis_data.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            meeting.analysis_data.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.analysis_data.sentiment}
                          </span>
                        </div>
                        <div>
                          <span className="text-secondary">Engagement Score:</span>
                          <span className="ml-2 text-primary">{meeting.analysis_data.engagement_score}/10</span>
                        </div>
                        <div>
                          <span className="text-secondary">Communication Score:</span>
                          <span className="ml-2 text-primary">{meeting.analysis_data.communication_score}/10</span>
                        </div>
                        {meeting.analysis_data.action_items && (
                          <div>
                            <span className="text-secondary">Action Items:</span>
                            <ul className="ml-2 mt-1">
                              {meeting.analysis_data.action_items.map((item, idx) => (
                                <li key={idx} className="text-sm text-primary">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Surveys Timeline */}
          {member.surveys?.map((survey, index) => (
            <div key={survey.id} className="border-l-2 border-green-400 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div>
                    <h4 className="text-primary font-medium">{survey.title}</h4>
                    <p className="text-sm text-secondary">{new Date(survey.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewSurveyResponses(survey)}
                    className="btn-secondary p-2"
                    title="View Responses"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => toggleTimelineItem(`survey-${survey.id}`)}
                    className="btn-secondary p-2"
                  >
                    {expandedTimeline[`survey-${survey.id}`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              
              {expandedTimeline[`survey-${survey.id}`] && (
                <div className="mt-4 space-y-3">
                  {/* Raw Survey Data */}
                  <div className="glass-card p-4">
                    <h5 className="font-medium text-primary mb-2">Raw Survey Data</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-secondary">Questions:</span>
                        <span className="ml-2 text-primary">{survey.questions_count || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary">Completion Time:</span>
                        <span className="ml-2 text-primary">{survey.completion_time || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary">Satisfaction Score:</span>
                        <span className="ml-2 text-primary">{survey.satisfaction_score || 'N/A'}/10</span>
                      </div>
                      <div>
                        <span className="text-secondary">Response Count:</span>
                        <span className="ml-2 text-primary">{survey.response_count || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Survey Responses */}
                  {survey.responses && (
                    <div className="glass-card p-4">
                      <h5 className="font-medium text-primary mb-2">Survey Responses</h5>
                      <div className="space-y-2">
                        {survey.responses.map((response, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-primary">{response.question}</p>
                            <p className="text-sm text-secondary mt-1">{response.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-4xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Meeting Recording</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-muted hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-96 object-cover"
                  src={selectedMeeting.recording_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="glass-card p-4">
                <h4 className="font-medium text-primary mb-2">{selectedMeeting.title}</h4>
                <p className="text-sm text-secondary mb-3">{selectedMeeting.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Duration:</span>
                    <span className="ml-2 text-primary">{selectedMeeting.duration || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Upload Date:</span>
                    <span className="ml-2 text-primary">{new Date(selectedMeeting.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Responses Modal */}
      {showSurveyResponses && selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Survey Responses</h3>
              <button
                onClick={() => setShowSurveyResponses(false)}
                className="text-muted hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h4 className="font-medium text-primary mb-2">{selectedSurvey.title}</h4>
                <p className="text-sm text-secondary mb-3">{selectedSurvey.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Completion Date:</span>
                    <span className="ml-2 text-primary">{new Date(selectedSurvey.completed_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Satisfaction Score:</span>
                    <span className="ml-2 text-primary">{selectedSurvey.satisfaction_score || 'N/A'}/10</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedSurvey.responses?.map((response, index) => (
                  <div key={index} className="glass-card p-4">
                    <h5 className="font-medium text-primary mb-2">Question {index + 1}</h5>
                    <p className="text-sm text-secondary mb-2">{response.question}</p>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-sm text-primary">{response.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">AI Insight Details</h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-muted hover:text-primary"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h4 className="font-medium text-primary mb-2">{selectedInsight.title}</h4>
                <p className="text-sm text-secondary mb-3">{selectedInsight.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Source:</span>
                    <span className="ml-2 text-primary">{selectedInsight.source}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Severity:</span>
                    <span className="ml-2 text-primary">{selectedInsight.severity}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Generated:</span>
                    <span className="ml-2 text-primary">{new Date(selectedInsight.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Type:</span>
                    <span className="ml-2 text-primary">{selectedInsight.insight_type}</span>
                  </div>
                </div>
              </div>
              
              {selectedInsight.action_items && (
                <div className="glass-card p-4">
                  <h5 className="font-medium text-primary mb-2">Action Items</h5>
                  <ul className="space-y-2">
                    {selectedInsight.action_items.map((item, index) => (
                      <li key={index} className="text-sm text-primary flex items-start gap-2">
                        <span className="text-mint-dark mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMember; 