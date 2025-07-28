import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { memberService, teamService, surveyService } from '../lib/supabaseService';
import { emailService } from '../lib/emailService';
import { 
  ArrowLeft, 
  Mail, 
  Upload, 
  Activity, 
  FileText, 
  X,
  Send,
  Play,
  BarChart3,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Plus,
  Eye,
  Calendar,
  TrendingUp,
  MessageSquare,
  Star,
  Zap,
  Shield,
  Crown,
  Building2,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Heart,
  Frown,
  Smile,
  ThumbsUp,
  ThumbsDown,
  TrendingDown,
  UserCheck,
  UserX,
  Briefcase,
  GraduationCap,
  Users2,
  ActivitySquare,
  PieChart,
  LineChart,
  BarChart,
  Clock3,
  CalendarDays,
  MessageCircle,
  Video,
  Mic,
  Headphones,
  Settings,
  Zap as Lightning,
  Target as Bullseye,
  Award as Trophy,
  Star as StarIcon,
  Heart as HeartIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Lightbulb,
  Brain,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const TeamMember = () => {
  const { memberId } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('member');
  const [teams, setTeams] = useState([]);
  
  // Simplified insights state
  const [memberInsights, setMemberInsights] = useState({
    surveys: { sent: 0, completed: 0, responseRate: 0 },
    meetings: { total: 0, lastMeeting: null, averageDuration: 0 },
    emotions: { happy: 0, neutral: 0, unhappy: 0, angry: 0 },
    relationships: { positive: [], negative: [], neutral: [] },
    performance: { score: 0, trend: 'stable', recommendations: [] },
    career: { readiness: 0, potential: 0, suggestions: [] },
    signals: { current: 0, history: [], trend: 'stable' }
  });

  useEffect(() => {
    if (memberId) {
      loadMemberData();
    }
  }, [memberId]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading member data for ID:', memberId);
      
      // Use a simple query first to avoid join issues
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .single();
      
      console.log('Member query response:', { data, error });
      
      if (error) {
        console.error('Error loading member:', error);
        setError('Failed to load member data');
        return;
      }
      
      if (!data) {
        setError('Member not found');
        return;
      }
      
      setMember(data);
      
      // Load insights separately to avoid blocking the main data
      loadInsights();
      
    } catch (error) {
      console.error('Error loading member data:', error);
      setError('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      // Load basic survey data
      const { data: surveyInvitations } = await supabase
        .from('survey_invitations')
        .select('*')
        .eq('member_id', memberId);

      const { data: surveyCompletions } = await supabase
        .from('survey_completions')
        .select('*')
        .eq('member_id', memberId);

      const { data: signals } = await supabase
        .from('signals')
        .select('*')
        .eq('member_id', memberId);

      // Calculate basic insights
      const sent = (surveyInvitations?.length || 0) + (signals?.filter(s => s.signal_type === 'survey_sent')?.length || 0);
      const completed = surveyCompletions?.length || 0;
      const responseRate = sent > 0 ? Math.round((completed / sent) * 100) : 0;

      setMemberInsights(prev => ({
        ...prev,
        surveys: { sent, completed, responseRate }
      }));

    } catch (error) {
      console.error('Error loading insights:', error);
      // Continue with default insights
    }
  };

  const loadActiveSurveys = async () => {
    try {
      setLoadingSurveys(true);
      console.log('Loading active surveys...');
      
      const { data, error } = await surveyService.getSurveys();
      
      console.log('Surveys response:', { data, error });
      
      if (error) {
        console.error('Error loading surveys:', error);
        return;
      }
      
      // Filter for active surveys
      const active = data?.filter(survey => survey.status === 'active') || [];
      console.log('Active surveys:', active);
      
      setActiveSurveys(active);
    } catch (error) {
      console.error('Error loading active surveys:', error);
    } finally {
      setLoadingSurveys(false);
    }
  };

  const handleSendSurvey = async (surveyId, targetType, targetId) => {
    try {
      console.log('Starting handleSendSurvey with:', { surveyId, targetType, targetId });
      
      if (!surveyId) {
        alert('Please select a survey to send');
        return;
      }

      // Get survey details
      const { data: survey, error: surveyError } = await surveyService.getSurveyById(surveyId);
      
      if (surveyError || !survey) {
        console.error('Error fetching survey:', surveyError);
        alert('Survey not found or error loading survey');
        return;
      }

      console.log('Sending survey', surveyId, 'to member:', member.name, 'URL:', `${window.location.origin}/survey/${surveyId}/member/${memberId}`);
      console.log('Survey found:', survey);

      // Send the survey email
      const result = await memberService.sendSurveyEmail(surveyId, [memberId]);
      
      console.log('Survey send result:', result);
      
      if (result.error) {
        console.error('Error sending survey:', result.error);
        alert(`Failed to send survey: ${result.error.message}`);
        return;
      }

      console.log('Survey sent successfully:', result.data);
      alert(`Survey sent successfully to ${result.data.members_sent} member(s)`);
      
      // Reload insights to update counts
      loadInsights();
      
    } catch (error) {
      console.error('Error in handleSendSurvey:', error);
      alert('Failed to send survey. Please try again.');
    }
  };

  const getFilteredSurveys = () => {
    if (!activeSurveys.length) return [];
    
    return activeSurveys.filter(survey => {
      if (selectedTarget === 'member') {
        return true; // Show all surveys for member target
      }
      return survey.team_id === member?.team_id;
    });
  };

  const getSignalGradient = (value) => {
    if (value >= 8) return 'from-green-500 to-emerald-500';
    if (value >= 6) return 'from-blue-500 to-cyan-500';
    if (value >= 4) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return <Smile className="h-4 w-4 text-green-400" />;
      case 'neutral': return <MessageSquare className="h-4 w-4 text-gray-400" />;
      case 'unhappy': return <Frown className="h-4 w-4 text-yellow-400" />;
      case 'angry': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-red-400">Error Loading Member</h2>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <Link 
              to="/teams" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading member data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No member data
  if (!member) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-yellow-400">Member Not Found</h2>
            </div>
            <p className="text-yellow-300 mb-4">The requested member could not be found.</p>
            <Link 
              to="/teams" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/teams"
          className="glass-button p-2 hover:bg-white/10"
        >
          <ArrowLeft size={16} className="text-white" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{member.name}</h1>
          <div className="flex items-center gap-4 text-white/70">
            <span>{member.role} • {member.department}</span>
            <span>•</span>
            <span className="text-white/80">{member.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // TODO: Implement edit member functionality
              alert('Edit member functionality coming soon!');
            }}
            className="glass-button p-2 hover:bg-white/10"
            title="Edit member"
          >
            <Edit size={16} className="text-white" />
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getSignalGradient(memberInsights.signals.current)}`}>
            Signal: {memberInsights.signals.current}/10
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => {
            setShowSurveyModal(true);
            loadActiveSurveys();
          }}
          className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <Mail size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Send Survey</p>
              <p className="text-white/60 text-sm">Send feedback survey</p>
            </div>
          </div>
        </div>

        <Link 
          to="/entry"
          className="glass-card p-4 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Upload 1:1</p>
              <p className="text-white/60 text-sm">Upload meeting recording</p>
            </div>
          </div>
        </Link>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">Current Signal</p>
              <p className="text-white/60 text-sm">{memberInsights.signals.current}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Survey Analytics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-400" />
            Survey Analytics
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{memberInsights.surveys.sent}</p>
              <p className="text-white/60 text-sm">Sent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{memberInsights.surveys.completed}</p>
              <p className="text-white/60 text-sm">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{memberInsights.surveys.responseRate}%</p>
              <p className="text-white/60 text-sm">Response Rate</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Response Rate</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${memberInsights.surveys.responseRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-green-400" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Performance Score</span>
              <span className={`font-semibold ${getPerformanceColor(memberInsights.performance.score)}`}>
                {memberInsights.performance.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Career Readiness</span>
              <span className="text-white font-semibold">{memberInsights.career.readiness}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Growth Potential</span>
              <span className="text-white font-semibold">{memberInsights.career.potential}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signal History Chart */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LineChart size={20} className="text-green-400" />
          Signal History (Last 12 Months)
        </h3>
        <div className="flex items-end justify-between h-32">
          {memberInsights.signals.history.map((point, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-4 bg-gradient-to-t from-green-400 to-green-600 rounded-t"
                style={{ height: `${(point.value / 100) * 120}px` }}
              ></div>
              <span className="text-white/60 text-xs mt-2">{point.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-white/70 text-sm">Signal Trend: {memberInsights.signals.trend}</span>
          {getTrendIcon(memberInsights.signals.trend)}
        </div>
      </div>

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Send Survey</h3>
              <button
                onClick={() => setShowSurveyModal(false)}
                className="glass-button p-1 hover:bg-white/10"
              >
                <X size={16} className="text-white" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Survey</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleSendSurvey(e.target.value, selectedTarget, memberId);
                      setShowSurveyModal(false);
                    }
                  }}
                >
                  <option value="">Select a survey...</option>
                  {getFilteredSurveys().map(survey => (
                    <option key={survey.id} value={survey.id}>
                      {survey.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {loadingSurveys && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-white/60 text-sm mt-2">Loading surveys...</p>
                </div>
              )}
              
              {!loadingSurveys && getFilteredSurveys().length === 0 && (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm">No active surveys available</p>
                  <p className="text-white/40 text-xs mt-1">Create a survey first in the Surveys page</p>
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