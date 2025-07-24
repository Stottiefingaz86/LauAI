import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Lightbulb,
  Calendar,
  X,
  User,
  MessageSquare,
  Clock,
  BarChart3,
  Target,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Mock data for all departments
  const allDepartmentsData = {
    all: {
      kpiData: {
        totalMembers: 24,
        greenSignals: 68,
        yellowSignals: 22,
        redSignals: 10,
        avgSignals: 4.2,
        lastWeekChange: 12,
        completionRate: 85
      },
      topPerformers: [
        { id: 1, name: 'Sarah Chen', department: 'Design', signals: 4.8, change: 0.3, avatar: 'SC' },
        { id: 2, name: 'Mike Johnson', department: 'Engineering', signals: 4.6, change: 0.2, avatar: 'MJ' },
        { id: 3, name: 'Emma Davis', department: 'Product', signals: 4.5, change: 0.1, avatar: 'ED' },
        { id: 4, name: 'Alex Kim', department: 'Marketing', signals: 4.4, change: -0.1, avatar: 'AK' },
        { id: 5, name: 'David Wilson', department: 'Sales', signals: 4.3, change: 0.2, avatar: 'DW' }
      ],
      concerns: [
        { id: 6, name: 'Lisa Brown', department: 'Marketing', signals: 2.1, change: -0.8, avatar: 'LB', issues: ['Low motivation', 'Communication gaps'] },
        { id: 7, name: 'Tom Garcia', department: 'Sales', signals: 2.3, change: -0.5, avatar: 'TG', issues: ['Declining performance', 'Missing 1:1s'] },
        { id: 8, name: 'John Smith', department: 'Engineering', signals: 2.8, change: -0.3, avatar: 'JS', issues: ['Workload stress', 'No recent 1:1s'] },
        { id: 9, name: 'Rachel Green', department: 'Marketing', signals: 2.5, change: -0.4, avatar: 'RG', issues: ['Team conflicts', 'Low engagement'] },
        { id: 10, name: 'Emily Davis', department: 'Engineering', signals: 2.9, change: -0.2, avatar: 'ED', issues: ['Burnout signs', 'Work-life balance'] }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'No 1:1 in 30+ days', member: 'John Smith', department: 'Engineering' },
        { id: 2, type: 'danger', message: '2+ 🔴 signals', member: 'Lisa Brown', department: 'Marketing' },
        { id: 3, type: 'warning', message: 'Declining motivation', member: 'Tom Garcia', department: 'Sales' }
      ],
      aiInsights: [
        {
          type: 'positive',
          title: 'Design Team Excellence',
          description: 'Design team shows 15% improvement in collaboration signals. Sarah Chen leads with 4.8 avg signals.',
          icon: '🎨',
          impact: 'High'
        },
        {
          type: 'warning',
          title: 'Engineering Workload',
          description: '3 engineers showing stress signals. Consider workload redistribution and support.',
          icon: '⚙️',
          impact: 'Medium'
        },
        {
          type: 'opportunity',
          title: 'Sales Team Growth',
          description: 'Sales team ready for advanced training. 80% show growth potential signals.',
          icon: '📈',
          impact: 'High'
        }
      ]
    },
    design: {
      kpiData: {
        totalMembers: 6,
        greenSignals: 75,
        yellowSignals: 20,
        redSignals: 5,
        avgSignals: 4.6,
        lastWeekChange: 8,
        completionRate: 92
      },
      topPerformers: [
        { id: 1, name: 'Sarah Chen', department: 'Design', signals: 4.8, change: 0.3, avatar: 'SC' },
        { id: 6, name: 'Lisa Brown', department: 'Design', signals: 3.8, change: -0.2, avatar: 'LB' },
        { id: 9, name: 'James Wilson', department: 'Design', signals: 4.2, change: 0.1, avatar: 'JW' }
      ],
      concerns: [
        { id: 15, name: 'Lisa Brown', department: 'Design', signals: 2.8, change: -0.2, avatar: 'LB', issues: ['Career growth concerns', 'Low confidence'] },
        { id: 16, name: 'Mark Thompson', department: 'Design', signals: 2.5, change: -0.4, avatar: 'MT', issues: ['Creative block', 'Team isolation'] }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'Career growth concerns', member: 'Lisa Brown', department: 'Design' }
      ],
      aiInsights: [
        {
          type: 'positive',
          title: 'Design Team Excellence',
          description: 'Design team shows 15% improvement in collaboration signals. Sarah Chen leads with 4.8 avg signals.',
          icon: '🎨',
          impact: 'High'
        },
        {
          type: 'opportunity',
          title: 'Career Development',
          description: 'Lisa Brown shows interest in advanced design techniques. Consider mentorship program.',
          icon: '📚',
          impact: 'Medium'
        }
      ]
    },
    engineering: {
      kpiData: {
        totalMembers: 12,
        greenSignals: 68,
        yellowSignals: 25,
        redSignals: 7,
        avgSignals: 4.3,
        lastWeekChange: 15,
        completionRate: 78
      },
      topPerformers: [
        { id: 2, name: 'Mike Johnson', department: 'Engineering', signals: 4.6, change: 0.2, avatar: 'MJ' },
        { id: 7, name: 'John Smith', department: 'Engineering', signals: 4.2, change: 0.1, avatar: 'JS' },
        { id: 10, name: 'Emily Davis', department: 'Engineering', signals: 4.0, change: -0.1, avatar: 'ED' }
      ],
      concerns: [
        { id: 17, name: 'John Smith', department: 'Engineering', signals: 2.8, change: -0.3, avatar: 'JS', issues: ['Workload stress', 'No recent 1:1s'] },
        { id: 18, name: 'Emily Davis', department: 'Engineering', signals: 2.9, change: -0.2, avatar: 'ED', issues: ['Burnout signs', 'Work-life balance'] },
        { id: 19, name: 'Chris Lee', department: 'Engineering', signals: 2.3, change: -0.6, avatar: 'CL', issues: ['Team conflicts', 'Low engagement'] }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'No 1:1 in 30+ days', member: 'John Smith', department: 'Engineering' },
        { id: 2, type: 'danger', message: 'Workload stress', member: 'Emily Davis', department: 'Engineering' }
      ],
      aiInsights: [
        {
          type: 'warning',
          title: 'Engineering Workload',
          description: '3 engineers showing stress signals. Consider workload redistribution and support.',
          icon: '⚙️',
          impact: 'High'
        },
        {
          type: 'positive',
          title: 'Frontend Excellence',
          description: 'Mike Johnson leads frontend team with 4.6 avg signals. Ready for senior role.',
          icon: '💻',
          impact: 'Medium'
        }
      ]
    },
    product: {
      kpiData: {
        totalMembers: 4,
        greenSignals: 72,
        yellowSignals: 23,
        redSignals: 5,
        avgSignals: 4.5,
        lastWeekChange: 5,
        completionRate: 88
      },
      topPerformers: [
        { id: 3, name: 'Emma Davis', department: 'Product', signals: 4.5, change: 0.1, avatar: 'ED' },
        { id: 8, name: 'Maria Garcia', department: 'Product', signals: 4.7, change: 0.3, avatar: 'MG' }
      ],
      concerns: [
        { id: 20, name: 'Emma Davis', department: 'Product', signals: 2.7, change: -0.3, avatar: 'ED', issues: ['Work-life balance', 'Burnout signs'] },
        { id: 21, name: 'Alex Chen', department: 'Product', signals: 2.4, change: -0.5, avatar: 'AC', issues: ['Low confidence', 'Team isolation'] }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'Work-life balance', member: 'Emma Davis', department: 'Product' }
      ],
      aiInsights: [
        {
          type: 'positive',
          title: 'Product Team Growth',
          description: 'Product team shows strong collaboration. Maria Garcia excels in stakeholder management.',
          icon: '📊',
          impact: 'High'
        },
        {
          type: 'warning',
          title: 'Work-Life Balance',
          description: 'Emma Davis showing signs of burnout. Consider workload adjustment.',
          icon: '⚖️',
          impact: 'Medium'
        }
      ]
    },
    marketing: {
      kpiData: {
        totalMembers: 5,
        greenSignals: 65,
        yellowSignals: 28,
        redSignals: 7,
        avgSignals: 4.1,
        lastWeekChange: -3,
        completionRate: 72
      },
      topPerformers: [
        { id: 4, name: 'Alex Kim', department: 'Marketing', signals: 4.4, change: -0.1, avatar: 'AK' },
        { id: 11, name: 'Rachel Green', department: 'Marketing', signals: 3.9, change: -0.2, avatar: 'RG' }
      ],
      concerns: [
        { id: 22, name: 'Lisa Brown', department: 'Marketing', signals: 2.1, change: -0.8, avatar: 'LB', issues: ['Low motivation', 'Communication gaps'] },
        { id: 23, name: 'Rachel Green', department: 'Marketing', signals: 2.5, change: -0.4, avatar: 'RG', issues: ['Team conflicts', 'Low engagement'] },
        { id: 24, name: 'Sam Wilson', department: 'Marketing', signals: 2.3, change: -0.6, avatar: 'SW', issues: ['Performance decline', 'Missing deadlines'] }
      ],
      alerts: [
        { id: 1, type: 'danger', message: '2+ 🔴 signals', member: 'Lisa Brown', department: 'Marketing' },
        { id: 2, type: 'warning', message: 'Team communication', member: 'Rachel Green', department: 'Marketing' }
      ],
      aiInsights: [
        {
          type: 'warning',
          title: 'Communication Issues',
          description: 'Marketing team shows communication gaps. Consider team building activities.',
          icon: '💬',
          impact: 'High'
        },
        {
          type: 'opportunity',
          title: 'Campaign Performance',
          description: 'Alex Kim leads successful campaigns. Ready for leadership role.',
          icon: '📈',
          impact: 'Medium'
        }
      ]
    },
    sales: {
      kpiData: {
        totalMembers: 8,
        greenSignals: 58,
        yellowSignals: 32,
        redSignals: 10,
        avgSignals: 3.9,
        lastWeekChange: -5,
        completionRate: 65
      },
      topPerformers: [
        { id: 5, name: 'David Wilson', department: 'Sales', signals: 4.3, change: 0.2, avatar: 'DW' },
        { id: 12, name: 'Tom Garcia', department: 'Sales', signals: 3.5, change: -0.3, avatar: 'TG' }
      ],
      concerns: [
        { id: 25, name: 'Tom Garcia', department: 'Sales', signals: 2.3, change: -0.5, avatar: 'TG', issues: ['Declining performance', 'Missing 1:1s'] },
        { id: 26, name: 'Sarah Miller', department: 'Sales', signals: 2.0, change: -0.7, avatar: 'SM', issues: ['Low motivation', 'Poor performance'] },
        { id: 27, name: 'Mike Brown', department: 'Sales', signals: 2.4, change: -0.4, avatar: 'MB', issues: ['Team conflicts', 'Communication issues'] }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'Declining motivation', member: 'Tom Garcia', department: 'Sales' },
        { id: 2, type: 'danger', message: 'Low completion rate', member: 'Sales Team', department: 'Sales' }
      ],
      aiInsights: [
        {
          type: 'warning',
          title: 'Sales Performance',
          description: 'Sales team showing declining motivation. Consider recognition program.',
          icon: '💰',
          impact: 'High'
        },
        {
          type: 'opportunity',
          title: 'Leadership Potential',
          description: 'David Wilson shows strong leadership. Consider promotion opportunities.',
          icon: '👑',
          impact: 'Medium'
        }
      ]
    }
  };

  const departments = [
    { id: 'all', name: 'All Departments', color: 'from-purple-500 to-blue-500' },
    { id: 'design', name: 'Design', color: 'from-pink-500 to-purple-500' },
    { id: 'engineering', name: 'Engineering', color: 'from-blue-500 to-cyan-500' },
    { id: 'product', name: 'Product', color: 'from-green-500 to-emerald-500' },
    { id: 'marketing', name: 'Marketing', color: 'from-orange-500 to-red-500' },
    { id: 'sales', name: 'Sales', color: 'from-indigo-500 to-purple-500' }
  ];

  const signalTrends = [
    { category: 'Motivation', green: 75, yellow: 20, red: 5 },
    { category: 'Impact', green: 68, yellow: 25, red: 7 },
    { category: 'Ownership', green: 72, yellow: 22, red: 6 },
    { category: 'Collaboration', green: 80, yellow: 15, red: 5 },
    { category: 'Growth', green: 65, yellow: 28, red: 7 },
    { category: 'Well-being', green: 70, yellow: 25, red: 5 }
  ];

  // Reports data
  const reportData = {
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
      { 
        issue: 'Workload balance', 
        count: 8, 
        department: 'Engineering',
        members: [
          { name: 'John Smith', avatar: 'JS', role: 'Backend Engineer', signals: 2.8, mentionDate: '2024-01-15', context: 'Expressed feeling overwhelmed with current sprint workload', severity: 'High' },
          { name: 'Emily Davis', avatar: 'ED', role: 'Frontend Engineer', signals: 2.9, mentionDate: '2024-01-12', context: 'Working overtime consistently for past 3 weeks', severity: 'High' },
          { name: 'Chris Lee', avatar: 'CL', role: 'DevOps Engineer', signals: 2.3, mentionDate: '2024-01-10', context: 'Multiple projects overlapping causing stress', severity: 'Medium' },
          { name: 'Mike Johnson', avatar: 'MJ', role: 'Senior Engineer', signals: 3.2, mentionDate: '2024-01-08', context: 'Team needs better workload distribution', severity: 'Medium' },
          { name: 'Sarah Wilson', avatar: 'SW', role: 'QA Engineer', signals: 2.5, mentionDate: '2024-01-05', context: 'Testing workload increased without additional resources', severity: 'High' },
          { name: 'David Brown', avatar: 'DB', role: 'Full Stack Engineer', signals: 2.7, mentionDate: '2024-01-03', context: 'Backend and frontend responsibilities overwhelming', severity: 'Medium' },
          { name: 'Lisa Chen', avatar: 'LC', role: 'Mobile Engineer', signals: 2.4, mentionDate: '2024-01-01', context: 'iOS and Android development simultaneously', severity: 'Medium' },
          { name: 'Tom Garcia', avatar: 'TG', role: 'Data Engineer', signals: 2.6, mentionDate: '2023-12-28', context: 'Data pipeline maintenance taking too much time', severity: 'Low' }
        ],
        trend: 'Increasing',
        impact: 'High',
        recommendations: [
          'Implement workload review meetings',
          'Hire additional engineering resources',
          'Improve project prioritization process',
          'Consider flexible work arrangements'
        ]
      },
      { 
        issue: 'Career growth', 
        count: 6, 
        department: 'Design',
        members: [
          { name: 'Sarah Chen', avatar: 'SC', role: 'Senior Designer', signals: 4.2, mentionDate: '2024-01-14', context: 'Ready for design leadership role', severity: 'Medium' },
          { name: 'Lisa Brown', avatar: 'LB', role: 'UX Designer', signals: 2.8, mentionDate: '2024-01-12', context: 'Seeking advancement opportunities', severity: 'High' },
          { name: 'James Wilson', avatar: 'JW', role: 'UI Designer', signals: 3.1, mentionDate: '2024-01-10', context: 'Wants to learn advanced prototyping', severity: 'Medium' },
          { name: 'Maria Garcia', avatar: 'MG', role: 'Product Designer', signals: 3.5, mentionDate: '2024-01-08', context: 'Interested in design system leadership', severity: 'Medium' },
          { name: 'Alex Kim', avatar: 'AK', role: 'Visual Designer', signals: 2.9, mentionDate: '2024-01-05', context: 'Looking for skill development opportunities', severity: 'High' },
          { name: 'Emma Davis', avatar: 'ED', role: 'Designer', signals: 3.2, mentionDate: '2024-01-03', context: 'Wants to expand into UX research', severity: 'Medium' }
        ],
        trend: 'Stable',
        impact: 'Medium',
        recommendations: [
          'Create career development paths',
          'Implement mentorship programs',
          'Provide advanced training opportunities',
          'Establish design leadership track'
        ]
      },
      { 
        issue: 'Team communication', 
        count: 5, 
        department: 'Marketing',
        members: [
          { name: 'Rachel Green', avatar: 'RG', role: 'Marketing Specialist', signals: 2.5, mentionDate: '2024-01-13', context: 'Cross-team communication gaps', severity: 'High' },
          { name: 'Sam Wilson', avatar: 'SW', role: 'Content Manager', signals: 2.3, mentionDate: '2024-01-11', context: 'Feedback loops too slow', severity: 'Medium' },
          { name: 'Lisa Brown', avatar: 'LB', role: 'Marketing Coordinator', signals: 2.1, mentionDate: '2024-01-09', context: 'Unclear project ownership', severity: 'High' },
          { name: 'Tom Garcia', avatar: 'TG', role: 'Digital Marketing', signals: 2.7, mentionDate: '2024-01-07', context: 'Remote communication challenges', severity: 'Medium' },
          { name: 'Emma Davis', avatar: 'ED', role: 'Brand Manager', signals: 2.4, mentionDate: '2024-01-05', context: 'Stakeholder alignment issues', severity: 'Medium' }
        ],
        trend: 'Decreasing',
        impact: 'Medium',
        recommendations: [
          'Implement regular team sync meetings',
          'Improve communication tools',
          'Create clear project ownership matrix',
          'Establish feedback protocols'
        ]
      },
      { 
        issue: 'Recognition', 
        count: 4, 
        department: 'Sales',
        members: [
          { name: 'David Wilson', avatar: 'DW', role: 'Sales Manager', signals: 3.3, mentionDate: '2024-01-12', context: 'Team achievements not celebrated', severity: 'Medium' },
          { name: 'Sarah Miller', avatar: 'SM', role: 'Account Executive', signals: 2.0, mentionDate: '2024-01-10', context: 'Individual contributions overlooked', severity: 'High' },
          { name: 'Mike Brown', avatar: 'MB', role: 'Sales Representative', signals: 2.4, mentionDate: '2024-01-08', context: 'No recognition for extra effort', severity: 'Medium' },
          { name: 'Lisa Chen', avatar: 'LC', role: 'Sales Development', signals: 2.8, mentionDate: '2024-01-06', context: 'Qualified leads not acknowledged', severity: 'Medium' }
        ],
        trend: 'Stable',
        impact: 'Medium',
        recommendations: [
          'Implement recognition program',
          'Create achievement milestones',
          'Regular team celebrations',
          'Individual performance recognition'
        ]
      },
      { 
        issue: 'Work-life balance', 
        count: 3, 
        department: 'Product',
        members: [
          { name: 'Emma Davis', avatar: 'ED', role: 'Product Manager', signals: 2.7, mentionDate: '2024-01-11', context: 'Working late consistently', severity: 'High' },
          { name: 'Alex Chen', avatar: 'AC', role: 'Product Designer', signals: 2.4, mentionDate: '2024-01-09', context: 'Weekend work becoming common', severity: 'Medium' },
          { name: 'Maria Garcia', avatar: 'MG', role: 'Product Analyst', signals: 2.9, mentionDate: '2024-01-07', context: 'Struggling to disconnect from work', severity: 'High' }
        ],
        trend: 'Increasing',
        impact: 'High',
        recommendations: [
          'Implement flexible work hours',
          'Establish work boundaries',
          'Promote time-off culture',
          'Reduce after-hours expectations'
        ]
      }
    ],
    recommendations: [
      {
        title: 'Schedule team building activities',
        description: 'Engineering team shows communication gaps',
        type: 'team-building',
        priority: 'High',
        department: 'Engineering',
        impact: 'High',
        timeline: 'Next 2 weeks',
        actionItems: [
          'Organize weekly team lunches',
          'Implement pair programming sessions',
          'Create cross-functional project teams',
          'Schedule regular team retrospectives'
        ],
        successMetrics: [
          'Team collaboration scores',
          'Cross-team communication',
          'Project delivery efficiency',
          'Employee satisfaction scores'
        ]
      },
      {
        title: 'Review career development paths',
        description: 'Design team seeking growth opportunities',
        type: 'career-development',
        priority: 'Medium',
        department: 'Design',
        impact: 'Medium',
        timeline: 'Next month',
        actionItems: [
          'Create individual development plans',
          'Establish mentorship programs',
          'Provide advanced training opportunities',
          'Define career progression tracks'
        ],
        successMetrics: [
          'Employee retention rates',
          'Career advancement satisfaction',
          'Skill development progress',
          'Leadership pipeline growth'
        ]
      },
      {
        title: 'Implement recognition program',
        description: 'Sales team needs more appreciation',
        type: 'recognition',
        priority: 'Medium',
        department: 'Sales',
        impact: 'Medium',
        timeline: 'Next quarter',
        actionItems: [
          'Create achievement recognition system',
          'Implement peer nomination program',
          'Establish milestone celebrations',
          'Provide performance-based rewards'
        ],
        successMetrics: [
          'Employee motivation scores',
          'Team performance metrics',
          'Recognition satisfaction',
          'Retention rates'
        ]
      }
    ]
  };

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setShowIssueModal(true);
  };

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationModal(true);
  };

  const currentData = allDepartmentsData[selectedDepartment] || allDepartmentsData.all;

  const handleDepartmentChange = (deptId) => {
    setIsLoading(true);
    setSelectedDepartment(deptId);
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const getSignalGlow = (signals) => {
    if (signals >= 4.5) return 'shadow-green-400/50';
    if (signals >= 4.0) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  const getSignalGradient = (signals) => {
    if (signals >= 4.5) return 'from-green-400 to-emerald-400';
    if (signals >= 4.0) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
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

  // Skeleton loading component
  const SkeletonCard = () => (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-white/20 rounded w-20 mb-2"></div>
          <div className="h-8 bg-white/20 rounded w-16"></div>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
        <div>
          <div className="h-4 bg-white/20 rounded w-24 mb-1"></div>
          <div className="h-3 bg-white/20 rounded w-16"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-6 bg-white/20 rounded w-12 mb-1"></div>
        <div className="h-3 bg-white/20 rounded w-8"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70 mt-1">
            {selectedDepartment === 'all' 
              ? 'Team performance overview & analytics' 
              : `${departments.find(d => d.id === selectedDepartment)?.name} performance & analytics`
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-mint/20 border border-mint/30 rounded-lg text-mint hover:bg-mint/30 transition-all duration-200 text-sm font-medium">
            Export Report
          </button>
        </div>
      </div>

      {/* Department Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-white/60" />
          <span className="text-white/60 text-sm">Filter by:</span>
          <div className="flex space-x-2">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.id)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedDepartment === dept.id
                    ? 'bg-mint text-gray-900'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Members</p>
                  <p className="text-3xl font-bold text-white mt-1">{currentData.kpiData.totalMembers}</p>
                </div>
                <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-mint" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Green Signals</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">{currentData.kpiData.greenSignals}%</p>
                </div>
                <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Signals</p>
                  <p className="text-3xl font-bold text-white mt-1">{currentData.kpiData.avgSignals}</p>
                </div>
                <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-mint" />
                </div>
              </div>
              <div className="flex items-center mt-2">
                {currentData.kpiData.lastWeekChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm ml-1 ${
                  currentData.kpiData.lastWeekChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {Math.abs(currentData.kpiData.lastWeekChange)}%
                </span>
                <span className="text-white/60 text-sm ml-1">vs last week</span>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">{currentData.kpiData.completionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-mint" />
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentData.aiInsights.map((insight, index) => (
              <div key={index} className="glass-card p-4 border-l-4 border-mint">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{insight.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">{insight.title}</h3>
                    <p className="text-white/70 text-xs mt-1">{insight.description}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-mint/20 text-mint">
                        {insight.impact} Impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Top Performers</h2>
              <Link to="/app/teams" className="text-mint hover:text-mint-dark text-sm">
                View all →
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.topPerformers.map((member, index) => (
                  <Link key={member.id} to={`/app/teams/${member.id}`}>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r ${getSignalGradient(member.signals)}`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-white/60 text-sm">{member.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getSignalGradient(member.signals)} ${getSignalGlow(member.signals)}`}>
                          <div className="w-2 h-2 rounded-full bg-white/80"></div>
                          <span className="text-white font-semibold text-sm">{member.signals}</span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          {member.change > 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                          )}
                          <span className={member.change > 0 ? 'text-green-400' : 'text-red-400'}>
                            {Math.abs(member.change)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Concerns */}
        <div>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Team Concerns</h2>
              <Link to="/app/teams" className="text-red-400 hover:text-red-300 text-sm">
                View all →
              </Link>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <div className="space-y-4">
                {currentData.concerns?.map((member, index) => (
                  <Link key={member.id} to={`/app/teams/${member.id}`}>
                    <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all duration-200 cursor-pointer border-l-4 border-red-400">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r ${getSignalGradient(member.signals)}`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-white/60 text-sm">{member.department}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.issues?.slice(0, 2).map((issue, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 rounded-full bg-red-400/20 text-red-300">
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getSignalGradient(member.signals)} ${getSignalGlow(member.signals)}`}>
                          <div className="w-2 h-2 rounded-full bg-white/80"></div>
                          <span className="text-white font-semibold text-sm">{member.signals}</span>
                        </div>
                        <div className="flex items-center text-sm mt-1">
                          {member.change > 0 ? (
                            <ArrowUpRight className="w-3 h-3 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                          )}
                          <span className={member.change > 0 ? 'text-green-400' : 'text-red-400'}>
                            {Math.abs(member.change)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Alerts */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Alerts</h2>
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-red-400">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{alert.message}</p>
                    <p className="text-white/60 text-xs mt-1">{alert.member} • {alert.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Performance - Only show for "all" */}
      {selectedDepartment === 'all' && (
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
      )}

      {/* Signal Trends */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Signal Trends by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signalTrends.map((trend) => (
            <div key={trend.category} className="glass-card p-4 bg-white/5 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-mint to-green-400"></div>
                <h3 className="text-white font-semibold">{trend.category}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-400/10 rounded-lg border border-green-400/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-white/80 text-sm font-medium">Green</span>
                  </div>
                  <span className="text-green-400 font-bold text-lg">{trend.green}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <span className="text-white/80 text-sm font-medium">Yellow</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">{trend.yellow}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-400/10 rounded-lg border border-red-400/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <span className="text-white/80 text-sm font-medium">Red</span>
                  </div>
                  <span className="text-red-400 font-bold text-lg">{trend.red}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues & Recommendations - Only show for "all" */}
      {selectedDepartment === 'all' && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Top Issues & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-4">Most Common Issues</h3>
              <div className="space-y-3">
                {reportData.topIssues.map((issue, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                    onClick={() => handleIssueClick(issue)}
                  >
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
                {reportData.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-green-400/10 border border-green-400/30 rounded-lg hover:bg-green-400/20 transition-all duration-200 cursor-pointer"
                    onClick={() => handleRecommendationClick(rec)}
                  >
                    <p className="text-green-400 font-medium text-sm">✅ {rec.title}</p>
                    <p className="text-white/70 text-xs mt-1">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Issue Details Modal */}
      {showIssueModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-400/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedIssue.issue}</h2>
                  <p className="text-white/60 text-sm">{selectedIssue.department} • {selectedIssue.count} mentions</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIssueModal(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Issue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Trend</span>
                </div>
                <p className="text-white font-semibold">{selectedIssue.trend}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Impact</span>
                </div>
                <p className="text-white font-semibold">{selectedIssue.impact}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Affected</span>
                </div>
                <p className="text-white font-semibold">{selectedIssue.members.length} members</p>
              </div>
            </div>

            {/* Members Who Mentioned */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold text-white">Members Who Mentioned This Issue</h3>
              </div>
              <div className="space-y-3">
                {selectedIssue.members.map((member, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r ${
                          member.signals >= 4.0 ? 'from-green-400 to-emerald-400' :
                          member.signals >= 3.0 ? 'from-yellow-400 to-orange-400' :
                          'from-red-400 to-pink-400'
                        }`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-white/60 text-sm">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.severity === 'High' ? 'bg-red-400/20 text-red-400' :
                          member.severity === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-green-400/20 text-green-400'
                        }`}>
                          {member.severity}
                        </div>
                        <p className="text-white/60 text-xs mt-1">{member.mentionDate}</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">{member.context}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedIssue.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-mint/10 border border-mint/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-mint mt-0.5 flex-shrink-0" />
                      <span className="text-white/70 text-sm">{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {showRecommendationModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedRecommendation.title}</h2>
                  <p className="text-white/60 text-sm">{selectedRecommendation.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecommendationModal(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Recommendation Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Priority</span>
                </div>
                <p className="text-white font-semibold">{selectedRecommendation.priority}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Impact</span>
                </div>
                <p className="text-white font-semibold">{selectedRecommendation.impact}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Department</span>
                </div>
                <p className="text-white font-semibold">{selectedRecommendation.department}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-mint" />
                  <span className="text-white/60 text-sm">Timeline</span>
                </div>
                <p className="text-white font-semibold">{selectedRecommendation.timeline}</p>
              </div>
            </div>

            {/* Action Items */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Action Items</h3>
              </div>
              <div className="space-y-3">
                {selectedRecommendation.actionItems.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-white/70 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Metrics */}
            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold text-white">Success Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedRecommendation.successMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 text-sm">{metric}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6 pt-6 border-t border-white/20">
              <button className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Started
              </button>
              <button className="flex-1 glass-button">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Follow-up
              </button>
              <button className="flex-1 glass-button">
                <MessageSquare className="w-4 h-4 mr-2" />
                Share with Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 