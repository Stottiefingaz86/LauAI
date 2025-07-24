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
      
      // Load signals
      const { data: signalsData } = await signalService.getSignals();
      
      // Load insights
      const { data: insightsData } = await insightService.getInsights();
      
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

  // Access control - only admins, managers, and leaders can see dashboard
  if (isMember) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Access Denied</h1>
          <p className="text-secondary text-lg">You don't have permission to view the dashboard.</p>
          <p className="text-muted text-sm mt-2">Team members can only access surveys assigned to them.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state for new users (only show for admins)
  if (!hasData && isAdmin) {
    return (
      <div className="p-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to LauAI</h1>
          <p className="text-secondary text-lg">Your AI-powered team performance platform</p>
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <CheckCircle size={24} className="text-mint" />
              Get Started in 3 Steps
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={24} className="text-mint-dark" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">1. Add Team Members</h3>
                <p className="text-secondary text-sm mb-4">Create your team structure and add members to start tracking performance.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus size={16} />
                  Add Team Members
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">2. Upload 1:1 Meetings</h3>
                <p className="text-secondary text-sm mb-4">Record and upload your team meetings for AI-powered analysis.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus size={16} />
                  Upload Meeting
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">3. Send Surveys</h3>
                <p className="text-secondary text-sm mb-4">Create and send surveys to gather team feedback and insights.</p>
                <button className="btn-primary flex items-center gap-2 mx-auto">
                  <Plus size={16} />
                  Create Survey
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
                    <Users size={16} className="text-mint-dark" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Import Team Data</p>
                    <p className="text-xs text-secondary">Upload CSV or connect your HR system</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Play size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Schedule First 1:1</p>
                    <p className="text-xs text-secondary">Set up recurring meetings with your team</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <BarChart3 size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Create First Survey</p>
                    <p className="text-xs text-secondary">Send a team check-in survey</p>
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
                    <p className="text-sm font-medium text-primary">AI Performance Insights</p>
                    <p className="text-xs text-secondary">Automated analysis of meetings and surveys</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Real-time Signals</p>
                    <p className="text-xs text-secondary">Track team performance trends over time</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Actionable Recommendations</p>
                    <p className="text-xs text-secondary">Get specific suggestions for team improvement</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Team Development</p>
                    <p className="text-xs text-secondary">Identify growth opportunities and concerns</p>
                  </div>
                </div>
              </div>
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
                <h4 className="font-medium text-primary mb-1">📚 Documentation</h4>
                <p className="text-xs text-secondary">Learn how to use LauAI effectively</p>
              </button>
              
              <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">🎥 Video Tutorials</h4>
                <p className="text-xs text-secondary">Watch step-by-step guides</p>
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

  // For managers and leaders, show a simplified dashboard
  if (!hasData && (isManager || isLeader)) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">No Data Available</h1>
          <p className="text-secondary text-lg">Your team hasn't generated any performance data yet.</p>
          <p className="text-muted text-sm mt-2">Once team members complete surveys and meetings are uploaded, you'll see insights here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary">Team performance overview and insights</p>
        </div>
        
        {/* Department Filter - Only show for admins */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="glass-select"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="design">Design</option>
              <option value="product">Product</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Avg Signal</p>
              <p className="text-2xl font-bold text-primary">
                {dashboardData.signals.length > 0 
                  ? (dashboardData.signals.reduce((acc, s) => acc + s.value, 0) / dashboardData.signals.length).toFixed(1)
                  : 'N/A'
                }
              </p>
            </div>
            <div className="p-2 bg-mint-accent rounded-lg">
              <Activity size={20} className="text-mint-dark" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Team Members</p>
              <p className="text-2xl font-bold text-primary">
                {dashboardData.signals.length > 0 ? dashboardData.signals.length : 0}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Insights</p>
              <p className="text-2xl font-bold text-primary">{dashboardData.insights.length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Recommendations</p>
              <p className="text-2xl font-bold text-primary">{dashboardData.recommendations.length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Award size={20} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Top Performers
          </h3>
          <div className="space-y-3">
            {dashboardData.topPerformers.length > 0 ? (
              dashboardData.topPerformers.slice(0, 3).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-mint-bg rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getSignalGradient(member.value)} ${getSignalGlow(member.value)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{member.name || 'Team Member'}</p>
                      <p className="text-xs text-secondary">{member.role || 'Role'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{member.value}/10</p>
                    <p className="text-xs text-secondary">Signal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={24} className="text-mint-dark" />
                </div>
                <p className="text-secondary text-sm">No top performers yet</p>
                <p className="text-muted text-xs">Start tracking performance to see results</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            Team Concerns
          </h3>
          <div className="space-y-3">
            {dashboardData.teamConcerns.length > 0 ? (
              dashboardData.teamConcerns.slice(0, 3).map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getSignalGradient(member.value)} ${getSignalGlow(member.value)} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{member.name || 'Team Member'}</p>
                      <p className="text-xs text-secondary">{member.role || 'Role'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{member.value}/10</p>
                    <p className="text-xs text-secondary">Signal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
                <p className="text-secondary text-sm">No concerns detected</p>
                <p className="text-muted text-xs">Your team is performing well!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signal Trends */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Activity size={20} />
          Signal Trends
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-secondary text-sm font-medium pb-3">Member</th>
                <th className="text-left text-secondary text-sm font-medium pb-3">Department</th>
                <th className="text-left text-secondary text-sm font-medium pb-3">Signal</th>
                <th className="text-left text-secondary text-sm font-medium pb-3">Trend</th>
                <th className="text-left text-secondary text-sm font-medium pb-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.signalTrends.length > 0 ? (
                dashboardData.signalTrends.map((signal, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getSignalGradient(signal.value)} ${getSignalGlow(signal.value)} flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">{signal.name?.charAt(0) || 'T'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">{signal.name || 'Team Member'}</p>
                          <p className="text-xs text-secondary">{signal.role || 'Role'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-secondary">{signal.department || 'Department'}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSignalGradient(signal.value)}`}></div>
                        <span className="text-sm font-medium text-primary">{signal.value}/10</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {signal.value >= 8 ? (
                          <TrendingUp size={16} className="text-green-500" />
                        ) : signal.value >= 6 ? (
                          <Activity size={16} className="text-yellow-500" />
                        ) : (
                          <TrendingDown size={16} className="text-red-500" />
                        )}
                        <span className="text-xs text-secondary">
                          {signal.value >= 8 ? 'Improving' : signal.value >= 6 ? 'Stable' : 'Declining'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-secondary">
                        {signal.created_at ? new Date(signal.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <div className="w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity size={24} className="text-mint-dark" />
                    </div>
                    <p className="text-secondary text-sm">No signal data yet</p>
                    <p className="text-muted text-xs">Start tracking performance to see trends</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights - Only show for admins and managers */}
      {(isAdmin || isManager) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Target size={20} />
                Top Issues & Recommendations
              </h3>
              <button
                onClick={() => setShowIssuesModal(true)}
                className="text-sm text-mint hover:text-mint-dark transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.topIssues.length > 0 ? (
                dashboardData.topIssues.slice(0, 3).map((insight, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <p className="text-sm font-medium text-primary">{insight.title}</p>
                    <p className="text-xs text-secondary mt-1">{insight.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-red-600 font-medium">High Priority</span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <p className="text-secondary text-sm">No critical issues detected</p>
                  <p className="text-muted text-xs">Your team is performing well!</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Award size={20} />
                AI Recommendations
              </h3>
              <button
                onClick={() => setShowRecommendationsModal(true)}
                className="text-sm text-mint hover:text-mint-dark transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recommendations.length > 0 ? (
                dashboardData.recommendations.slice(0, 3).map((rec, index) => (
                  <div 
                    key={index} 
                    className="p-3 bg-mint-bg rounded-lg cursor-pointer hover:bg-mint-accent transition-colors"
                    onClick={() => setSelectedInsight(rec)}
                  >
                    <p className="text-sm font-medium text-primary">{rec.title}</p>
                    <p className="text-xs text-secondary mt-1">{rec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-mint-dark font-medium">Actionable</span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">{new Date(rec.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb size={24} className="text-blue-600" />
                  </div>
                  <p className="text-secondary text-sm">No recommendations yet</p>
                  <p className="text-muted text-xs">AI will suggest actions as data grows</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Insight Details</h3>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="glass-card p-4">
                <h4 className="font-medium text-primary mb-2">{selectedInsight.title}</h4>
                <p className="text-sm text-secondary mb-3">{selectedInsight.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Severity:</span>
                    <span className="ml-2 text-primary">{selectedInsight.severity}</span>
                  </div>
                  <div>
                    <span className="text-secondary">Generated:</span>
                    <span className="ml-2 text-primary">{new Date(selectedInsight.created_at).toLocaleString()}</span>
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

      {showIssuesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">All Issues & Recommendations</h3>
              <button
                onClick={() => setShowIssuesModal(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.topIssues.map((insight, index) => (
                <div key={index} className="glass-card p-4">
                  <h4 className="font-medium text-primary mb-2">{insight.title}</h4>
                  <p className="text-sm text-secondary mb-3">{insight.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-red-600 font-medium">High Priority</span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{new Date(insight.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRecommendationsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">All AI Recommendations</h3>
              <button
                onClick={() => setShowRecommendationsModal(false)}
                className="text-muted hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {dashboardData.recommendations.map((rec, index) => (
                <div key={index} className="glass-card p-4">
                  <h4 className="font-medium text-primary mb-2">{rec.title}</h4>
                  <p className="text-sm text-secondary mb-3">{rec.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-mint-dark font-medium">Actionable</span>
                    <span className="text-muted">•</span>
                    <span className="text-muted">{new Date(rec.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 