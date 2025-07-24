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
  Clock
} from 'lucide-react';
import { signalService, insightService, realtimeService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom'; // Added Link import

const Dashboard = () => {
  const { user, isAdmin, isManager, isLeader, isMember } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    signals: [],
    insights: [],
    topPerformers: [],
    teamConcerns: [],
    signalTrends: [],
    topIssues: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showIssuesModal, setShowIssuesModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load signals
      const { data: signalsData, error: signalsError } = await signalService.getSignals();
      if (signalsError) {
        console.warn('Signals loading error:', signalsError);
      }
      
      // Load insights
      const { data: insightsData, error: insightsError } = await insightService.getInsights();
      if (insightsError) {
        console.warn('Insights loading error:', insightsError);
      }
      
      // Load real-time updates
      const unsubscribe = realtimeService.subscribeToUserSignals(user?.id, (payload) => {
        console.log('Real-time signal update:', payload);
        loadDashboardData(); // Refresh data
      });

      setDashboardData({
        signals: signalsData || [],
        insights: insightsData || [],
        topPerformers: signalsData?.filter(s => s.value >= 8) || [],
        teamConcerns: signalsData?.filter(s => s.value < 6) || [],
        signalTrends: signalsData?.slice(0, 5) || [],
        topIssues: insightsData?.filter(i => i.severity === 'high') || [],
        recommendations: insightsData?.filter(i => i.action_items?.length > 0) || []
      });

      return () => unsubscribe?.();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
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

  const hasData = dashboardData.signals.length > 0 || dashboardData.insights.length > 0;

  // If user is not admin/manager/leader, show access denied
  if (!isAdmin && !isManager && !isLeader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300 mb-6">You don't have permission to view the dashboard.</p>
          <Link 
            to="/app/surveys" 
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-6 py-3 rounded-lg font-medium hover:from-green-500 hover:to-emerald-600 transition-all duration-200"
          >
            Go to Surveys
          </Link>
          
          {/* Debug: Show user info */}
          <div className="mt-8 p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <p className="text-white/70 text-sm">User ID: {user?.id || 'None'}</p>
            <p className="text-white/70 text-sm">Email: {user?.email || 'None'}</p>
            <p className="text-white/70 text-sm">Role: {user?.user_metadata?.role || 'None'}</p>
            <button
              onClick={async () => {
                try {
                  const { supabase } = await import('../lib/supabase');
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Force Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
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

  // Show welcome screen when no data
  if (!hasData) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to LauAI Dashboard</h1>
          <p className="text-white/70">Get started by setting up your team and sending your first survey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Set Up Team</h3>
            </div>
            <p className="text-white/70 mb-4">Add team members and organize them by departments.</p>
            <button className="bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:from-green-500 hover:to-emerald-600 transition-all duration-200">
              Go to Teams
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Create Survey</h3>
            </div>
            <p className="text-white/70 mb-4">Send surveys to gather employee feedback and insights.</p>
            <button className="bg-gradient-to-r from-blue-400 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-500 hover:to-blue-600 transition-all duration-200">
              Create Survey
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Upload 1:1</h3>
            </div>
            <p className="text-white/70 mb-4">Upload meeting recordings for AI analysis.</p>
            <button className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-500 hover:to-purple-600 transition-all duration-200">
              Upload Recording
            </button>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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

  // Rest of the dashboard with data...
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/70">Monitor team performance and insights</p>
      </div>

      {/* Department Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'engineering', 'marketing', 'sales'].map((dept) => (
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Signals</p>
              <p className="text-2xl font-bold text-white">{dashboardData.signals.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Top Performers</p>
              <p className="text-2xl font-bold text-white">{dashboardData.topPerformers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Team Concerns</p>
              <p className="text-2xl font-bold text-white">{dashboardData.teamConcerns.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400/20 to-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Active Insights</p>
              <p className="text-2xl font-bold text-white">{dashboardData.insights.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Signal Trends */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Signal Trends</h3>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.signalTrends.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.signalTrends.map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSignalGradient(signal.value)}`}></div>
                    <div>
                      <p className="text-white font-medium">{signal.member?.first_name || 'Unknown'}</p>
                      <p className="text-white/60 text-sm">{signal.signal_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{signal.value}/10</p>
                    <p className="text-white/60 text-sm">{signal.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400/20 to-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-white/70">No signal data available yet</p>
            </div>
          )}
        </div>

        {/* Top Issues & Recommendations */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Top Issues & Recommendations</h3>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              View All
            </button>
          </div>
          
          {dashboardData.topIssues.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.topIssues.slice(0, 3).map((issue, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{issue.title}</p>
                      <p className="text-white/60 text-sm">{issue.description}</p>
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
              <p className="text-white/70">No issues or recommendations yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 