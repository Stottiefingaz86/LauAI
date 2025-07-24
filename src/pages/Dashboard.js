import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Download,
  Filter
} from 'lucide-react';
import { signalService, insightService, realtimeService, useAuth } from '../lib/supabaseService';

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [signals, setSignals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [user, selectedTimeframe, selectedDepartment]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const signalsSubscription = realtimeService.subscribeToUserSignals(user.id, (payload) => {
      console.log('Real-time signal update:', payload);
      if (payload.eventType === 'INSERT') {
        setSignals(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setSignals(prev => prev.map(signal => 
          signal.id === payload.new.id ? payload.new : signal
        ));
      }
    });

    const insightsSubscription = realtimeService.subscribeToUserInsights(user.id, (payload) => {
      console.log('Real-time insight update:', payload);
      if (payload.eventType === 'INSERT') {
        setInsights(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setInsights(prev => prev.map(insight => 
          insight.id === payload.new.id ? payload.new : insight
        ));
      }
    });

    return () => {
      signalsSubscription?.unsubscribe();
      insightsSubscription?.unsubscribe();
    };
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user signals
      const { data: signalsData, error: signalsError } = await signalService.getUserSignals(user.id);
      if (!signalsError && signalsData) {
        setSignals(signalsData);
      }

      // Load user insights
      const { data: insightsData, error: insightsError } = await insightService.getUserInsights(user.id);
      if (!insightsError && insightsData) {
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setIsLoading(true);
    // Simulate loading for department filter
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationModal(true);
  };

  // Calculate KPIs from signals
  const calculateKPIs = () => {
    if (!signals.length) return { avgSignal: 0, totalSignals: 0, trend: 'neutral' };
    
    const avgSignal = signals.reduce((sum, signal) => sum + signal.value, 0) / signals.length;
    const recentSignals = signals.slice(0, 5);
    const recentAvg = recentSignals.reduce((sum, signal) => sum + signal.value, 0) / recentSignals.length;
    
    let trend = 'neutral';
    if (recentAvg > avgSignal + 1) trend = 'up';
    else if (recentAvg < avgSignal - 1) trend = 'down';
    
    return {
      avgSignal: Math.round(avgSignal * 10) / 10,
      totalSignals: signals.length,
      trend
    };
  };

  const kpis = calculateKPIs();

  // Mock data for demonstration
  const currentData = {
    kpiData: {
      avgSignal: kpis.avgSignal,
      totalSignals: kpis.totalSignals,
      activeMembers: 24,
      surveysCompleted: 18
    },
    departments: [
      { name: 'Engineering', members: 12, avgSignal: 8.2 },
      { name: 'Design', members: 8, avgSignal: 7.8 },
      { name: 'Product', members: 6, avgSignal: 8.5 },
      { name: 'Marketing', members: 4, avgSignal: 7.2 }
    ],
    signalTrends: signals.slice(0, 10).map(signal => ({
      date: new Date(signal.created_at).toLocaleDateString(),
      value: signal.value,
      type: signal.signal_type
    })),
    topIssues: insights.filter(insight => insight.insight_type === 'concern').slice(0, 5),
    recommendations: insights.filter(insight => insight.insight_type === 'recommendation').slice(0, 5),
    teamConcerns: [
      { name: 'Sarah Chen', department: 'Design', signal: 4.2, issues: ['Burnout symptoms', 'Workload stress'] },
      { name: 'Mike Johnson', department: 'Engineering', signal: 5.8, issues: ['Communication gaps'] },
      { name: 'Emma Davis', department: 'Product', signal: 6.1, issues: ['Career stagnation'] }
    ]
  };

  const SkeletonCard = () => (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-white/10 rounded mb-4"></div>
      <div className="h-8 bg-white/10 rounded mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
    </div>
  );

  const SkeletonRow = () => (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <div className="w-10 h-10 bg-white/10 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-white/10 rounded mb-2"></div>
        <div className="h-3 bg-white/10 rounded w-1/2"></div>
      </div>
      <div className="h-6 bg-white/10 rounded w-16"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-muted">Team performance overview and insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="glass-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button className="glass-button-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-mint" />
                </div>
                <div className={`flex items-center space-x-1 ${
                  kpis.trend === 'up' ? 'text-green-400' : 
                  kpis.trend === 'down' ? 'text-red-400' : 'text-muted'
                }`}>
                  {kpis.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                   kpis.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                   <div className="w-4 h-4" />}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentData.kpiData.avgSignal}</h3>
              <p className="text-muted text-sm">Average Signal</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentData.kpiData.activeMembers}</h3>
              <p className="text-muted text-sm">Active Members</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentData.kpiData.surveysCompleted}</h3>
              <p className="text-muted text-sm">Surveys Completed</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{currentData.kpiData.totalSignals}</h3>
              <p className="text-muted text-sm">Total Signals</p>
            </div>
          </>
        )}
      </div>

      {/* Department Filter */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Filter by Department</h2>
          <Filter className="w-5 h-5 text-muted" />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDepartmentChange('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedDepartment === 'all' 
                ? 'bg-mint text-black' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Departments
          </button>
          {currentData.departments.map(dept => (
            <button
              key={dept.name}
              onClick={() => handleDepartmentChange(dept.name.toLowerCase())}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedDepartment === dept.name.toLowerCase()
                  ? 'bg-mint text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {dept.name} ({dept.members})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Trends */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Signal Trends</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.signalTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        trend.value >= 8 ? 'bg-green-400' :
                        trend.value >= 6 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">{trend.date}</p>
                        <p className="text-muted text-sm capitalize">{trend.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{trend.value}/10</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Concerns */}
        <div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Team Concerns</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.teamConcerns.map((member, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-muted text-sm">{member.department}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          member.signal >= 6 ? 'text-green-400' :
                          member.signal >= 4 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {member.signal}/10
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {member.issues.map((issue, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <p className="text-muted text-xs">{issue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Issues */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Issues & Recommendations</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {currentData.topIssues.map((issue, index) => (
                <div 
                  key={index}
                  onClick={() => handleIssueClick(issue)}
                  className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-white font-medium">{issue.title}</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-muted" />
                  </div>
                  <p className="text-muted text-sm">{issue.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-4">AI Recommendations</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {currentData.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  onClick={() => handleRecommendationClick(rec)}
                  className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <p className="text-white font-medium">{rec.title}</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-muted" />
                  </div>
                  <p className="text-muted text-sm">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue Details Modal */}
      {showIssueModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Issue Details</h2>
              <button
                onClick={() => setShowIssueModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{selectedIssue.title}</h3>
                <p className="text-muted">{selectedIssue.description}</p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Action Items</h4>
                <ul className="space-y-2">
                  {selectedIssue.action_items?.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-muted text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <button className="glass-button flex-1">Mark as Resolved</button>
                <button className="glass-button-secondary flex-1">Schedule Follow-up</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {showRecommendationModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Recommendation Details</h2>
              <button
                onClick={() => setShowRecommendationModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{selectedRecommendation.title}</h3>
                <p className="text-muted">{selectedRecommendation.description}</p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Success Metrics</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-muted text-sm">Improved team communication</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-muted text-sm">Increased signal scores by 15%</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-muted text-sm">Reduced turnover by 20%</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex space-x-4">
                <button className="glass-button flex-1">Implement Now</button>
                <button className="glass-button-secondary flex-1">Schedule for Later</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 