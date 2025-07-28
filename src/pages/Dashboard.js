import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Target, 
  Award,
  AlertCircle,
  Plus,
  Play,
  FileText,
  BarChart3,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Clock,
  Building2,
  Star,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  UserX,
  MessageCircle,
  Heart,
  Frown,
  Smile,
  Zap,
  Shield,
  Crown,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  Trophy,
  GraduationCap,
  Briefcase,
  Calendar,
  Video,
  Mail,
  Eye,
  Edit,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Database,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { signalService, insightService, realtimeService, teamService, memberService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const { user, isAdmin, isManager, isLeader } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    signals: [],
    insights: [],
    topPerformers: [],
    teamConcerns: [],
    signalTrends: [],
    topIssues: [],
    recommendations: [],
    teams: [],
    teamMembers: [],
    underperformingMembers: [],
    praiseWorthyMembers: [],
    teamPerformance: [],
    urgentActions: [],
    recentActivities: [],
    storage: {
      used: 0,
      limit: 0,
      percentage: 0,
      isOverLimit: false
    },
    surveys: [],
    surveyCompletions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});

  console.log('Dashboard component is rendering!');
  console.log('Dashboard render - user email:', user?.email);
  console.log('Dashboard render - user id:', user?.id);
  console.log('Dashboard render - isAdmin:', isAdmin);
  console.log('Dashboard render - isManager:', isManager);
  console.log('Dashboard render - isLeader:', isLeader);

  useEffect(() => {
    console.log('Dashboard useEffect - user changed:', user);
    if (user) {
      loadDashboardData();
    } else {
      console.log('Dashboard useEffect - no user, setting loading false');
      setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('🚀 Loading dashboard data for user:', user?.id);
      setLoading(true);
      setError(null);
      
      // Load all real data
      const [signalsData, insightsData, teamsData, membersData, surveyData, completionData, responsesData, insightsData2] = await Promise.all([
        signalService.getSignals(),
        insightService.getInsights(),
        teamService.getTeams(),
        teamService.getTeamMembers(),
        supabase.from('surveys').select('*'),
        supabase.from('survey_completions').select('*'),
        supabase.from('survey_responses').select('*'),
        supabase.from('survey_insights').select('*')
      ]);
      
      console.log('📊 Data loaded:', {
        signals: signalsData.data?.length || 0,
        insights: insightsData.data?.length || 0,
        teams: teamsData.data?.length || 0,
        members: membersData.data?.length || 0,
        surveys: surveyData.data?.length || 0,
        completions: completionData.data?.length || 0,
        responses: responsesData.data?.length || 0,
        surveyInsights: insightsData2.data?.length || 0
      });
      
      // Organize members by team for the teams section
      const teamsWithMembers = (teamsData.data || []).map(team => ({
        ...team,
        members: (membersData.data || []).filter(member => member.team_id === team.id)
      }));
      
      // Calculate performance insights from real data
      const performanceData = calculatePerformanceInsights(membersData.data || [], completionData.data || [], responsesData.data || [], insightsData2.data || []);
      
      // Generate actionable insights from real data
      const actionableInsights = generateActionableInsights(performanceData);
      
      // Calculate storage usage and limits
      const storageData = calculateStorageUsage(membersData.data || []);
      
      setDashboardData({
        signals: signalsData.data || [],
        insights: insightsData.data || [],
        teams: teamsWithMembers, // Use teams with members
        teamMembers: membersData.data || [],
        surveys: surveyData.data || [],
        surveyCompletions: completionData.data || [],
        surveyResponses: responsesData.data || [],
        surveyInsights: insightsData2.data || [],
        ...performanceData,
        ...actionableInsights,
        storage: storageData
      });
      
      console.log('✅ Dashboard data loaded successfully');
      
      // Load real-time updates
      const unsubscribe = realtimeService.subscribeToUserSignals(user?.id, (payload) => {
        console.log('🔄 Real-time signal update:', payload);
        loadDashboardData(); // Refresh data
      });

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceInsights = (members, completions, responses, insights) => {
    console.log('🧮 Calculating performance insights from real data...');
    
    // Calculate real performance data from actual survey completions
    const performanceData = members.map(member => {
      const memberCompletions = completions.filter(c => c.member_id === member.id);
      const memberResponses = responses.filter(r => r.member_id === member.id);
      const memberInsights = insights.filter(i => i.member_id === member.id);
      
      // Calculate average score from real completions
      const averageScore = memberCompletions.length > 0 
        ? memberCompletions.reduce((sum, c) => sum + (c.total_score || 0), 0) / memberCompletions.length
        : 0;
      
      // Calculate trend based on recent completions
      let trend = 'stable';
      if (memberCompletions.length >= 2) {
        const recentScores = memberCompletions.slice(0, 3).map(c => c.total_score);
        const avgRecent = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        if (avgRecent > averageScore * 1.1) trend = 'improving';
        else if (avgRecent < averageScore * 0.9) trend = 'declining';
      }

      // Calculate sentiment from real insights
      const sentimentCounts = memberInsights.reduce((counts, insight) => {
        const sentiment = insight.sentiment || 'neutral';
        counts[sentiment] = (counts[sentiment] || 0) + 1;
        return counts;
      }, { positive: 0, negative: 0, neutral: 0 });

      return {
        ...member,
        performance: {
          score: member.signals || 0,
          trend: trend,
          signals: member.signals || 0,
          surveys: memberCompletions.length,
          meetings: 0, // Will be calculated when meeting system is implemented
          averageSurveyScore: averageScore,
          lastSurvey: memberCompletions[0]?.completed_at || null,
          responseCount: memberResponses.length,
          insightCount: memberInsights.length,
          emotions: {
            happy: sentimentCounts.positive || 0,
            neutral: sentimentCounts.neutral || 0,
            unhappy: sentimentCounts.negative || 0,
            angry: 0 // Will be calculated when emotion analysis is implemented
          },
          relationships: {
            positive: sentimentCounts.positive || 0,
            negative: sentimentCounts.negative || 0,
            neutral: sentimentCounts.neutral || 0
          }
        }
      };
    });

    console.log('📈 Performance data calculated:', performanceData.length, 'members');

    // Calculate top performers based on real data
    const topPerformers = performanceData
      .filter(member => member.performance.score > 7)
      .sort((a, b) => b.performance.score - a.performance.score)
      .slice(0, 5);

    // Calculate underperforming members based on real data
    const underperformingMembers = performanceData
      .filter(member => member.performance.score < 5)
      .sort((a, b) => a.performance.score - b.performance.score)
      .slice(0, 5);

    // Calculate team performance
    const teamPerformance = teamsWithMembers.map(team => {
      const teamMembers = performanceData.filter(member => member.team_id === team.id);
      const avgScore = teamMembers.length > 0 
        ? teamMembers.reduce((sum, member) => sum + member.performance.score, 0) / teamMembers.length
        : 0;
      
      return {
        ...team,
        averageScore: avgScore,
        memberCount: teamMembers.length,
        activeMembers: teamMembers.filter(m => m.performance.surveys > 0).length
      };
    });

    return {
      topPerformers,
      underperformingMembers,
      teamPerformance,
      performanceData
    };
  };

  const generateActionableInsights = (performanceData) => {
    const urgentActions = [];
    const recommendations = [];

    // Generate urgent actions based on real data
    performanceData.underperformingMembers.forEach(member => {
      if (member.performance.surveys === 0) {
        urgentActions.push({
          action: 'schedule_survey',
          title: `Send survey to ${member.name}`,
          description: `${member.name} hasn't completed any surveys yet`,
          priority: 'high'
        });
      } else if (member.performance.averageSurveyScore < 3) {
        urgentActions.push({
          action: 'schedule_meeting',
          title: `Schedule 1:1 with ${member.name}`,
          description: `${member.name} has low survey scores (${member.performance.averageSurveyScore.toFixed(1)}/5)`,
          priority: 'high'
        });
      }
    });

    // Generate recommendations based on real data
    performanceData.topPerformers.forEach(member => {
      if (member.performance.trend === 'improving') {
        recommendations.push({
          action: 'recognize',
          title: `Recognize ${member.name}'s improvement`,
          description: `${member.name} is showing consistent improvement`,
          priority: 'medium'
        });
      }
    });

    // Team-level recommendations
    if (performanceData.underperformingMembers.length > 2) {
      recommendations.push({
        action: 'team_meeting',
        title: 'Schedule team performance review',
        description: `${performanceData.underperformingMembers.length} team members need attention`,
        priority: 'high'
      });
    }

    return {
      urgentActions,
      recommendations
    };
  };

  const calculateStorageUsage = (members) => {
    // Simulate storage usage based on team size and activities
    const baseStorage = 0.2; // 200MB base storage
    const perMemberStorage = 0.1; // 100MB per member
    const perMeetingStorage = 0.05; // 50MB per meeting recording
    const perSurveyStorage = 0.01; // 10MB per survey response
    
    // Calculate used storage
    const memberCount = members.length;
    const estimatedMeetings = memberCount * 2; // Assume 2 meetings per member
    const estimatedSurveys = memberCount * 3; // Assume 3 surveys per member
    
    const usedStorage = baseStorage + 
      (memberCount * perMemberStorage) + 
      (estimatedMeetings * perMeetingStorage) + 
      (estimatedSurveys * perSurveyStorage);
    
    // Calculate storage limit (1GB base + 1GB per member)
    const storageLimit = 1 + memberCount;
    
    const percentage = Math.min((usedStorage / storageLimit) * 100, 100);
    const isOverLimit = usedStorage > storageLimit;
    
    return {
      used: Math.round(usedStorage * 100) / 100, // Round to 2 decimal places
      limit: storageLimit,
      percentage: Math.round(percentage * 100) / 100,
      isOverLimit
    };
  };

  const getSignalGradient = (value) => {
    if (typeof value !== 'number') return 'from-gray-400 to-gray-500';
    if (value >= 8) return 'from-green-400 to-green-600';
    if (value >= 6) return 'from-yellow-400 to-yellow-600';
    if (value >= 4) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getPerformanceColor = (score) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUpIcon className="text-green-400" size={16} />;
      case 'declining': return <TrendingDownIcon className="text-red-400" size={16} />;
      default: return <Activity className="text-blue-400" size={16} />;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'schedule_meeting': return <Calendar size={16} />;
      case 'check_in': return <MessageCircle size={16} />;
      case 'recognize': return <Trophy size={16} />;
      case 'team_intervention': return <Users size={16} />;
      default: return <Info size={16} />;
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading comprehensive dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircleIcon size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-emerald-600 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Check if user has teams and members
  const hasData = dashboardData.teams.length > 0 && dashboardData.teamMembers.length > 0;

  if (!hasData) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to SignalOS</h1>
          <p className="text-white/70">Let's get started with your team insights</p>
        </div>

        {/* Teams and Members Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Teams & Members</h3>
            </div>
            <Link 
              to="/teams"
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 flex items-center gap-2"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Teams Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first team and add members to start tracking performance signals and insights.
            </p>
            <Link 
              to="/teams"
              className="glass-button px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create Team
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">1</div>
              <div>
                <h4 className="font-medium text-white mb-1">Add Team Members</h4>
                <p className="text-white/70 text-sm">Go to Teams page and add your team members with their roles.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">2</div>
              <div>
                <h4 className="font-medium text-white mb-1">Create Your First Survey</h4>
                <p className="text-white/70 text-sm">Send surveys to gather initial feedback from your team.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">3</div>
              <div>
                <h4 className="font-medium text-white mb-1">Upload Meeting Recordings</h4>
                <p className="text-white/70 text-sm">Upload 1:1 meeting recordings for AI-powered analysis.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">4</div>
              <div>
                <h4 className="font-medium text-white mb-1">View Insights</h4>
                <p className="text-white/70 text-sm">Monitor performance signals and get actionable recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full dashboard with data
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h1>
        <p className="text-white/70">Monitor team performance, identify issues, and celebrate success</p>
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'engineering', 'marketing', 'sales', 'design'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedDepartment === dept
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept.charAt(0).toUpperCase() + dept.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Actions Alert */}
      {dashboardData.urgentActions.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">⚠️ Urgent Actions Required</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.urgentActions.slice(0, 3).map((action, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  {getActionIcon(action.action)}
                  <div>
                    <p className="text-white font-medium">{action.title}</p>
                    <p className="text-white/70 text-sm">{action.description}</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30">
                  Take Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white">{dashboardData.teamMembers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Top Performers</p>
              <p className="text-2xl font-bold text-white">{dashboardData.topPerformers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Award size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Needs Attention</p>
              <p className="text-2xl font-bold text-white">{dashboardData.underperformingMembers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Praise Worthy</p>
              <p className="text-2xl font-bold text-white">{dashboardData.praiseWorthyMembers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <Star size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Teams and Members Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Teams & Members</h3>
          </div>
          <Link 
            to="/teams"
            className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 flex items-center gap-2"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData.teams.slice(0, 5).map((team) => (
            <div key={team.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">{team.name}</h4>
                <div className="text-gray-400 text-sm">{team.members?.length || 0} members</div>
              </div>
              
              {team.members && team.members.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{member.name}</p>
                      <p className="text-gray-400 text-xs">{member.role}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getSignalGradient(member.signals || 0)}`}>
                    {member.signals || 0}/10
                  </div>
                </div>
              ))}
              
              {team.members && team.members.length > 3 && (
                <div className="text-center pt-2">
                  <span className="text-gray-400 text-xs">+{team.members.length - 3} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {dashboardData.teams.length === 0 && (
          <div className="text-center py-8">
            <Users size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No teams found</p>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Underperforming Members */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Needs Attention</h3>
            </div>
            <button 
              onClick={() => toggleSection('underperforming')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {expandedSections.underperforming ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {dashboardData.underperformingMembers.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.underperformingMembers.slice(0, expandedSections.underperforming ? 10 : 3).map((member, index) => (
                <div key={member.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-full flex items-center justify-center">
                        <UserX size={16} className="text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-white/60 text-sm">{member.role} • {member.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getPerformanceColor(member.performance.score)}`}>
                        {member.performance.score}/10
                      </p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(member.performance.trend)}
                        <span className="text-white/60 text-xs">{member.performance.trend}</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections.underperforming && (
                    <div className="mt-3 space-y-2">
                      <div className="text-center text-xs text-white/60 mb-2">
                        <p>Performance signals: {member.performance.signals}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">
                          Schedule 1:1
                        </button>
                        <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30">
                          Send Survey
                        </button>
                        <Link to={`/member/${member.id}`} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white/70">No underperforming members detected</p>
              <p className="text-white/50 text-sm mt-2">Great job managing your team!</p>
            </div>
          )}
        </div>

        {/* Praise Worthy Members */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Praise Worthy</h3>
            </div>
            <button 
              onClick={() => toggleSection('praise')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {expandedSections.praise ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {dashboardData.praiseWorthyMembers.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.praiseWorthyMembers.slice(0, expandedSections.praise ? 10 : 3).map((member, index) => (
                <div key={member.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                        <UserCheck size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-white/60 text-sm">{member.role} • {member.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getPerformanceColor(member.performance.score)}`}>
                        {member.performance.score}/10
                      </p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(member.performance.trend)}
                        <span className="text-white/60 text-xs">{member.performance.trend}</span>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSections.praise && (
                    <div className="mt-3 space-y-2">
                      <div className="text-center text-xs text-white/60 mb-2">
                        <p>Performance signals: {member.performance.signals}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30">
                          Recognize
                        </button>
                        <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">
                          Discuss Promotion
                        </button>
                        <Link to={`/member/${member.id}`} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white/70">No praise-worthy members identified</p>
              <p className="text-white/50 text-sm mt-2">Continue monitoring team performance</p>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Top Performers</h3>
            </div>
            <Link to="/teams" className="text-green-400 hover:text-green-300 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {dashboardData.topPerformers.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topPerformers.slice(0, 5).map((member, index) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full flex items-center justify-center">
                      <Crown size={16} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-white/60 text-sm">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getPerformanceColor(member.performance.score)}`}>
                      {member.performance.score}/10
                    </p>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(member.performance.trend)}
                      <span className="text-white/60 text-xs">{member.performance.trend}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white/70">No top performers identified yet</p>
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Recommendations</h3>
            </div>
            <button 
              onClick={() => toggleSection('recommendations')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {expandedSections.recommendations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          {dashboardData.recommendations.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recommendations.slice(0, expandedSections.recommendations ? 10 : 3).map((rec, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-start gap-3">
                    <Sparkles size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{rec.title}</p>
                      <p className="text-white/70 text-sm">{rec.description}</p>
                      {expandedSections.recommendations && (
                        <div className="mt-2 flex gap-2">
                          <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30">
                            Implement
                          </button>
                          <button className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-xs hover:bg-gray-500/30">
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white/70">No recommendations available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Create Survey</h3>
          </div>
          <p className="text-white/70 mb-4">Send targeted surveys to gather specific insights.</p>
          <Link 
            to="/surveys"
            className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200 inline-block"
          >
            Create Survey
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Upload 1:1</h3>
          </div>
          <p className="text-white/70 mb-4">Upload meeting recordings for AI analysis.</p>
          <Link 
            to="/entry"
            className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-purple-600 transition-all duration-200 inline-block"
          >
            Upload Recording
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white">Manage Team</h3>
          </div>
          <p className="text-white/70 mb-4">Add new members and manage team structure.</p>
          <Link 
            to="/teams"
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:from-green-500 hover:to-emerald-600 transition-all duration-200 inline-block"
          >
            Manage Team
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 