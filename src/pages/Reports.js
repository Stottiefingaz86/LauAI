import React, { useState } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download as DownloadIcon
} from 'lucide-react';

const Reports = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock data
  const reportData = {
    overview: {
      totalMembers: 24,
      avgSignals: 4.2,
      greenSignals: 68,
      yellowSignals: 22,
      redSignals: 10,
      completionRate: 85
    },
    departmentStats: [
      { name: 'Design', avgSignals: 4.6, greenRate: 75, memberCount: 6 },
      { name: 'Engineering', avgSignals: 4.3, greenRate: 68, memberCount: 12 },
      { name: 'Product', avgSignals: 4.5, greenRate: 72, memberCount: 4 },
      { name: 'Marketing', avgSignals: 4.1, greenRate: 65, memberCount: 5 },
      { name: 'Sales', avgSignals: 3.9, greenRate: 58, memberCount: 8 }
    ],
    signalTrends: [
      { month: 'Oct', motivation: 75, impact: 68, ownership: 72, collaboration: 80, growth: 65, wellbeing: 70 },
      { month: 'Nov', motivation: 78, impact: 70, ownership: 75, collaboration: 82, growth: 68, wellbeing: 72 },
      { month: 'Dec', motivation: 72, impact: 65, ownership: 68, collaboration: 75, growth: 62, wellbeing: 68 },
      { month: 'Jan', motivation: 75, impact: 68, ownership: 72, collaboration: 80, growth: 65, wellbeing: 70 }
    ],
    topIssues: [
      { issue: 'Workload balance', count: 8, department: 'Engineering' },
      { issue: 'Career growth', count: 6, department: 'Design' },
      { issue: 'Team communication', count: 5, department: 'Marketing' },
      { issue: 'Recognition', count: 4, department: 'Sales' },
      { issue: 'Work-life balance', count: 3, department: 'Product' }
    ]
  };

  const getSignalColor = (value) => {
    if (value >= 75) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-white/70 mt-1">Analytics and insights for your team</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="glass-input"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="glass-input"
          >
            <option value="all">All Departments</option>
            <option value="design">Design</option>
            <option value="engineering">Engineering</option>
            <option value="product">Product</option>
            <option value="marketing">Marketing</option>
            <option value="sales">Sales</option>
          </select>
          <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Members</p>
              <p className="text-3xl font-bold text-white mt-1">{reportData.overview.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-mint" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Avg Signals</p>
              <p className="text-3xl font-bold text-white mt-1">{reportData.overview.avgSignals}</p>
            </div>
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Green Signals</p>
              <p className="text-3xl font-bold text-green-400 mt-1">{reportData.overview.greenSignals}%</p>
            </div>
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
              <PieChart className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-white mt-1">{reportData.overview.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Department Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/60 font-medium pb-3">Department</th>
                <th className="text-center text-white/60 font-medium pb-3">Members</th>
                <th className="text-center text-white/60 font-medium pb-3">Avg Signals</th>
                <th className="text-center text-white/60 font-medium pb-3">Green Rate</th>
                <th className="text-center text-white/60 font-medium pb-3">Trend</th>
              </tr>
            </thead>
            <tbody>
              {reportData.departmentStats.map((dept, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-3 text-white font-medium">{dept.name}</td>
                  <td className="py-3 text-center text-white">{dept.memberCount}</td>
                  <td className="py-3 text-center text-white">{dept.avgSignals}</td>
                  <td className="py-3 text-center">
                    <span className={getSignalColor(dept.greenRate)}>{dept.greenRate}%</span>
                  </td>
                  <td className="py-3 text-center">
                    {getTrendIcon(dept.avgSignals, 4.0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signal Trends Chart */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Signal Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-4">Motivation & Impact</h3>
            <div className="space-y-3">
              {reportData.signalTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-xs">Motivation</span>
                      <span className={getSignalColor(trend.motivation)}>{trend.motivation}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-xs">Impact</span>
                      <span className={getSignalColor(trend.impact)}>{trend.impact}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Collaboration & Growth</h3>
            <div className="space-y-3">
              {reportData.signalTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-xs">Collaboration</span>
                      <span className={getSignalColor(trend.collaboration)}>{trend.collaboration}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-xs">Growth</span>
                      <span className={getSignalColor(trend.growth)}>{trend.growth}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Issues */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Top Issues & Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-4">Most Common Issues</h3>
            <div className="space-y-3">
              {reportData.topIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{issue.issue}</p>
                    <p className="text-white/60 text-sm">{issue.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{issue.count}</p>
                    <p className="text-white/60 text-xs">mentions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-white font-medium mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
                <p className="text-green-400 font-medium text-sm">✅ Schedule team building activities</p>
                <p className="text-white/70 text-xs mt-1">Engineering team shows communication gaps</p>
              </div>
              <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
                <p className="text-yellow-400 font-medium text-sm">⚠️ Review career development paths</p>
                <p className="text-white/70 text-xs mt-1">Design team seeking growth opportunities</p>
              </div>
              <div className="p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
                <p className="text-blue-400 font-medium text-sm">💡 Implement recognition program</p>
                <p className="text-white/70 text-xs mt-1">Sales team needs more appreciation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="glass-button text-center">
            <DownloadIcon className="w-5 h-5 mr-2" />
            PDF Report
          </button>
          <button className="glass-button text-center">
            <DownloadIcon className="w-5 h-5 mr-2" />
            CSV Data
          </button>
          <button className="glass-button text-center">
            <DownloadIcon className="w-5 h-5 mr-2" />
            Executive Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports; 