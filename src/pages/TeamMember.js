import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  X,
  BarChart3,
  UserCheck,
  Award,
  BookOpen,
  Heart
} from 'lucide-react';
import { getMemberById } from '../data/teamData';
const teamMembersData = {
  1: {
    id: 1,
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Senior Designer',
    department: 'Design',
    avatar: 'SC',
    signals: 4.8,
    status: 'green',
    joinDate: '2023-03-15',
    lastOneOne: '2024-01-15',
    nextOneOne: '2024-01-29',
    aiInsights: [
      {
        type: 'positive',
        title: 'Strong Performance Trend',
        description: 'Sarah shows consistent improvement in collaboration and ownership signals over the past 3 months.',
        icon: '📈',
        impact: 'High'
      },
      {
        type: 'opportunity',
        title: 'Leadership Potential',
        description: 'Ready for senior design responsibilities. Consider mentorship opportunities.',
        icon: '👑',
        impact: 'Medium'
      },
      {
        type: 'warning',
        title: 'Work-Life Balance',
        description: 'Recent signals suggest potential burnout. Consider workload adjustment.',
        icon: '⚖️',
        impact: 'Medium'
      }
    ],
    recommendations: [
      {
        type: 'promotion',
        title: 'Consider Senior Role',
        description: 'Ready for senior designer position with team leadership responsibilities.',
        priority: 'High',
        timeline: 'Next quarter'
      },
      {
        type: 'development',
        title: 'Advanced Training',
        description: 'Enroll in advanced UX/UI design courses to enhance skills.',
        priority: 'Medium',
        timeline: 'This month'
      },
      {
        type: 'wellness',
        title: 'Workload Review',
        description: 'Schedule regular check-ins to monitor work-life balance.',
        priority: 'Medium',
        timeline: 'Ongoing'
      }
    ]
  },
  2: {
    id: 2,
    name: 'Mike Johnson',
    email: 'mike@company.com',
    role: 'Frontend Engineer',
    department: 'Engineering',
    avatar: 'MJ',
    signals: 4.6,
    status: 'green',
    joinDate: '2023-01-10',
    lastOneOne: '2024-01-12',
    nextOneOne: '2024-01-26'
  },
  3: {
    id: 3,
    name: 'Emma Davis',
    email: 'emma@company.com',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'ED',
    signals: 4.5,
    status: 'yellow',
    joinDate: '2023-06-20',
    lastOneOne: '2024-01-10',
    nextOneOne: '2024-01-24'
  },
  4: {
    id: 4,
    name: 'Alex Kim',
    email: 'alex@company.com',
    role: 'Marketing Specialist',
    department: 'Marketing',
    avatar: 'AK',
    signals: 4.4,
    status: 'green',
    joinDate: '2023-04-12',
    lastOneOne: '2024-01-08',
    nextOneOne: '2024-01-22'
  },
  5: {
    id: 5,
    name: 'David Wilson',
    email: 'david@company.com',
    role: 'Sales Manager',
    department: 'Sales',
    avatar: 'DW',
    signals: 4.3,
    status: 'red',
    joinDate: '2023-02-28',
    lastOneOne: '2024-01-05',
    nextOneOne: '2024-01-19'
  },
  6: {
    id: 6,
    name: 'Lisa Brown',
    email: 'lisa@company.com',
    role: 'UX Designer',
    department: 'Design',
    avatar: 'LB',
    signals: 3.8,
    status: 'red',
    joinDate: '2023-08-15',
    lastOneOne: '2024-01-03',
    nextOneOne: '2024-01-17'
  },
  7: {
    id: 7,
    name: 'John Smith',
    email: 'john@company.com',
    role: 'Backend Engineer',
    department: 'Engineering',
    avatar: 'JS',
    signals: 4.2,
    status: 'green',
    joinDate: '2023-05-08',
    lastOneOne: '2024-01-14',
    nextOneOne: '2024-01-28'
  },
  8: {
    id: 8,
    name: 'Maria Garcia',
    email: 'maria@company.com',
    role: 'Product Designer',
    department: 'Product',
    avatar: 'MG',
    signals: 4.7,
    status: 'green',
    joinDate: '2023-07-22',
    lastOneOne: '2024-01-11',
    nextOneOne: '2024-01-25'
  }
};

const TeamMember = () => {
  const { memberId } = useParams();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showSurveyResultsModal, setShowSurveyResultsModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [member, setMember] = useState(null);

  useEffect(() => {
    const memberData = getMemberById(parseInt(memberId));
    if (memberData) {
      setMember(memberData);
    }
  }, [memberId]);

  // Check if member is new (has 'New' signals or status is 'new')
  const isNewMember = member && (member.signals === 'New' || member.status === 'new');
  
  const signalHistory = isNewMember ? [] : [
    { date: '2024-01-15', motivation: 'green', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'yellow', wellbeing: 'green' },
    { date: '2024-01-08', motivation: 'green', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'green', wellbeing: 'green' },
    { date: '2024-01-01', motivation: 'yellow', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'green', wellbeing: 'green' },
    { date: '2023-12-25', motivation: 'green', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'green', wellbeing: 'green' },
    { date: '2023-12-18', motivation: 'green', impact: 'green', ownership: 'yellow', collaboration: 'green', growth: 'green', wellbeing: 'green' }
  ];

  const timeline = isNewMember ? [] : [
    { 
      id: 1, 
      type: 'one-one', 
      title: '1:1 Meeting', 
      date: '2024-01-15', 
      description: 'Discussed Q1 goals and career development opportunities. Sarah showed strong enthusiasm for leadership roles.',
      signals: { motivation: 'green', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'yellow', wellbeing: 'green' },
      detailedSummary: {
        agenda: ['Q1 Goal Review', 'Career Development Discussion', 'Leadership Opportunities', 'Skill Development Plan'],
        keyPoints: [
          'Sarah exceeded Q1 targets by 15%',
          'Expressed strong interest in senior designer role',
          'Demonstrated excellent leadership in recent project',
          'Identified areas for advanced UX training',
          'Discussed mentorship opportunities for junior designers'
        ],
        actionItems: [
          'Schedule follow-up meeting in 2 weeks',
          'Research advanced UX training programs',
          'Prepare senior role requirements document',
          'Set up mentorship program structure'
        ],
        mood: 'Enthusiastic and engaged',
        duration: '45 minutes',
        nextSteps: 'Review training options and prepare promotion timeline'
      }
    },
    { 
      id: 2, 
      type: 'survey', 
      title: 'Monthly Survey', 
      date: '2024-01-08', 
      description: 'Completed monthly check-in survey. Positive feedback on team collaboration and project ownership.',
      signals: { motivation: 'green', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'green', wellbeing: 'green' },
      surveyResults: {
        questions: [
          { question: 'How satisfied are you with your current role?', answer: 'Very Satisfied (5/5)', category: 'motivation' },
          { question: 'How would you rate your work-life balance?', answer: 'Good (4/5)', category: 'wellbeing' },
          { question: 'How supported do you feel by your team?', answer: 'Very Supported (5/5)', category: 'collaboration' },
          { question: 'How clear are your career growth opportunities?', answer: 'Clear (4/5)', category: 'growth' },
          { question: 'How would you rate your workload?', answer: 'Manageable (4/5)', category: 'wellbeing' }
        ],
        overallScore: 4.4,
        completionTime: '8 minutes',
        submittedAt: '2024-01-08 14:30',
        insights: [
          'Strong satisfaction with role and team support',
          'Clear career growth opportunities identified',
          'Good work-life balance maintained',
          'High engagement with current projects'
        ]
      }
    },
    { 
      id: 3, 
      type: 'one-one', 
      title: '1:1 Meeting', 
      date: '2024-01-01', 
      description: 'Year-end review and goal setting for 2024. Identified areas for skill development.',
      signals: { motivation: 'yellow', impact: 'green', ownership: 'green', collaboration: 'green', growth: 'green', wellbeing: 'green' },
      detailedSummary: {
        agenda: ['Year-end Review', '2024 Goal Setting', 'Skill Assessment', 'Performance Discussion'],
        keyPoints: [
          'Successfully completed all 2023 objectives',
          'Expressed some concerns about workload balance',
          'Identified need for advanced design skills',
          'Discussed potential for leadership role',
          'Set clear goals for Q1 2024'
        ],
        actionItems: [
          'Schedule advanced training sessions',
          'Review workload distribution',
          'Prepare leadership development plan',
          'Set up quarterly goal check-ins'
        ],
        mood: 'Thoughtful and determined',
        duration: '60 minutes',
        nextSteps: 'Implement training plan and monitor workload'
      }
    }
  ];

  const handleRecommendationClick = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationModal(true);
  };

  const handleTimelineClick = (item) => {
    setSelectedTimelineItem(item);
    setShowTimelineModal(true);
  };

  const handleSurveyResultsClick = (item) => {
    setSelectedTimelineItem(item);
    setShowSurveyResultsModal(true);
  };

  const getRecommendationDetails = (recommendation) => {
    const details = {
      'Consider Senior Role': {
        background: 'Sarah has consistently demonstrated leadership qualities and technical excellence over the past 6 months. Her signal scores show strong performance in collaboration (4.8/5) and ownership (4.7/5), with positive trends in all areas.',
        evidence: [
          'Led 3 major design projects with cross-functional teams',
          'Mentored 2 junior designers successfully',
          'Received 4.8/5 average signal score over 6 months',
          'Demonstrated initiative in process improvements'
        ],
        benefits: [
          'Increased team productivity by 25%',
          'Improved design system adoption by 40%',
          'Reduced project delivery time by 30%',
          'Enhanced team collaboration scores'
        ],
        actionPlan: [
          'Schedule promotion discussion with HR',
          'Define senior role responsibilities',
          'Create transition timeline (3 months)',
          'Set up mentorship program for junior designers'
        ],
        timeline: 'Next quarter',
        successMetrics: [
          'Team leadership feedback scores',
          'Project delivery efficiency',
          'Junior designer growth metrics',
          'Cross-functional collaboration scores'
        ]
      },
      'Advanced Training': {
        background: 'Analysis of recent projects and feedback indicates Sarah would benefit from advanced UX/UI training to enhance her technical skills and stay current with industry trends.',
        evidence: [
          'Expressed interest in advanced prototyping tools',
          'Shows potential for complex interaction design',
          'Feedback indicates need for advanced animation skills',
          'Market research shows skill gaps in advanced UX'
        ],
        benefits: [
          'Enhanced design capabilities',
          'Improved project delivery quality',
          'Better user experience outcomes',
          'Increased client satisfaction'
        ],
        actionPlan: [
          'Research advanced UX/UI courses',
          'Allocate training budget ($2,500)',
          'Schedule training during Q2',
          'Set up skill assessment post-training'
        ],
        timeline: 'This month',
        successMetrics: [
          'Training completion rate',
          'Skill assessment scores',
          'Project quality improvements',
          'Client feedback scores'
        ]
      },
      'Workload Review': {
        background: 'Recent signal analysis shows potential stress indicators in wellbeing scores. Sarah has been taking on additional responsibilities which may be affecting work-life balance.',
        evidence: [
          'Wellbeing signals declined 15% in last month',
          'Working 10+ hours overtime weekly',
          'Expressed feeling overwhelmed in recent 1:1',
          'Declining motivation signals (4.2 vs 4.8 avg)'
        ],
        benefits: [
          'Improved work-life balance',
          'Reduced burnout risk',
          'Enhanced productivity and creativity',
          'Better team morale'
        ],
        actionPlan: [
          'Schedule weekly check-ins for next month',
          'Review current workload distribution',
          'Implement flexible work arrangements',
          'Set clear boundaries and expectations'
        ],
        timeline: 'Ongoing',
        successMetrics: [
          'Wellbeing signal improvements',
          'Work-life balance satisfaction',
          'Overtime hours reduction',
          'Stress level assessments'
        ]
      }
    };
    
    return details[recommendation.title] || {
      background: 'No detailed information available.',
      evidence: [],
      benefits: [],
      actionPlan: [],
      timeline: 'TBD',
      successMetrics: []
    };
  };

  const getSignalIcon = (status) => {
    switch (status) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  const getSignalColor = (status) => {
    switch (status) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getSignalGradient = (signals) => {
    if (typeof signals === 'string' && signals === 'New') return 'from-blue-400 to-cyan-400';
    if (typeof signals === 'number' && signals >= 4.5) return 'from-green-400 to-emerald-400';
    if (typeof signals === 'number' && signals >= 4.0) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  const getSignalGlow = (signals) => {
    if (typeof signals === 'string' && signals === 'New') return 'shadow-blue-400/50';
    if (typeof signals === 'number' && signals >= 4.5) return 'shadow-green-400/50';
    if (typeof signals === 'number' && signals >= 4.0) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-mint" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Member Not Found</h2>
          <p className="text-white/70 mb-4">The team member you're looking for doesn't exist.</p>
          <Link to="/app/teams" className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/app/teams" className="glass-button">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xl bg-gradient-to-r ${getSignalGradient(member.signals)}`}>
              {member.avatar}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{member.name}</h1>
              <p className="text-white/70">{member.role} • {member.department}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="glass-button"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload 1:1
          </button>
          <button
            onClick={() => setShowSurveyModal(true)}
            className="glass-button bg-mint text-gray-900 hover:bg-mint-dark"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Send Survey
          </button>
        </div>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Current Signals</p>
              <p className="text-3xl font-bold text-white mt-1">{member.signals}</p>
            </div>
            <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-mint" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {member.signals > 4.5 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ml-1 ${
              member.signals > 4.5 ? 'text-green-400' : 'text-red-400'
            }`}>
              {member.signals > 4.5 ? 'Improving' : 'Declining'}
            </span>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Last 1:1</p>
              <p className="text-lg font-semibold text-white mt-1">{member.lastOneOne}</p>
            </div>
            <div className="w-12 h-12 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Next 1:1</p>
              <p className="text-lg font-semibold text-white mt-1">{member.nextOneOne}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-400/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Member Since</p>
              <p className="text-lg font-semibold text-white mt-1">{member.joinDate}</p>
            </div>
            <div className="w-12 h-12 bg-green-400/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Signal History */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Signal History</h2>
        {isNewMember ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Signal History Yet</h3>
            <p className="text-white/70 mb-6">This team member hasn't completed any surveys or 1:1 meetings yet.</p>
            <div className="flex items-center justify-center space-x-4">
              <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                <Upload className="w-4 h-4 mr-2" />
                Upload 1:1
              </button>
              <button className="glass-button">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Survey
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-white/60 font-medium pb-3">Date</th>
                  <th className="text-center text-white/60 font-medium pb-3">Motivation</th>
                  <th className="text-center text-white/60 font-medium pb-3">Impact</th>
                  <th className="text-center text-white/60 font-medium pb-3">Ownership</th>
                  <th className="text-center text-white/60 font-medium pb-3">Collaboration</th>
                  <th className="text-center text-white/60 font-medium pb-3">Growth</th>
                  <th className="text-center text-white/60 font-medium pb-3">Well-being</th>
                </tr>
              </thead>
              <tbody>
                {signalHistory.map((entry, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="py-3 text-white">{entry.date}</td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.motivation === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.motivation === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.motivation === 'green' ? 'Good' : entry.motivation === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.impact === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.impact === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.impact === 'green' ? 'Good' : entry.impact === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.ownership === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.ownership === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.ownership === 'green' ? 'Good' : entry.ownership === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.collaboration === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.collaboration === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.collaboration === 'green' ? 'Good' : entry.collaboration === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.growth === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.growth === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.growth === 'green' ? 'Good' : entry.growth === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        entry.wellbeing === 'green' ? 'bg-green-400/20 text-green-400' :
                        entry.wellbeing === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {entry.wellbeing === 'green' ? 'Good' : entry.wellbeing === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-mint" />
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {member.aiInsights?.map((insight, index) => (
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
      </div>

      {/* Recommendations */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">AI Recommendations</h2>
        <div className="space-y-4">
          {member.recommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                rec.type === 'promotion' ? 'bg-green-400/20' :
                rec.type === 'development' ? 'bg-blue-400/20' :
                'bg-yellow-400/20'
              }`}>
                {rec.type === 'promotion' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : rec.type === 'development' ? (
                  <Target className="w-4 h-4 text-blue-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold">{rec.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'High' ? 'bg-red-400/20 text-red-400' :
                    rec.priority === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-green-400/20 text-green-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-white/70 text-sm mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">Timeline: {rec.timeline}</span>
                  <button 
                    onClick={() => handleRecommendationClick(rec)}
                    className="text-xs text-mint hover:text-mint-dark transition-colors"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Timeline</h2>
        {isNewMember ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
            <p className="text-white/70 mb-6">This team member hasn't had any 1:1 meetings or completed surveys yet.</p>
            <div className="flex items-center justify-center space-x-4">
              <button className="glass-button bg-mint text-gray-900 hover:bg-mint-dark">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule 1:1
              </button>
              <button className="glass-button">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Survey
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {timeline.map((item) => (
              <div 
                key={item.id} 
                className="flex space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
                onClick={() => item.type === 'survey' ? handleSurveyResultsClick(item) : handleTimelineClick(item)}
              >
                <div className="w-12 h-12 bg-mint/20 rounded-full flex items-center justify-center">
                  {item.type === 'one-one' ? (
                    <Calendar className="w-6 h-6 text-mint" />
                  ) : (
                    <MessageSquare className="w-6 h-6 text-mint" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <span className="text-white/60 text-sm">{item.date}</span>
                  </div>
                  <p className="text-white/70 mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.signals).map(([category, status]) => (
                      <div key={category} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'green' ? 'bg-green-400/20 text-green-400' :
                        status === 'yellow' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}: {status === 'green' ? 'Good' : status === 'yellow' ? 'Fair' : 'Poor'}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-mint hover:text-mint-dark transition-colors">
                    Click to view details →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Upload 1:1 Meeting</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Meeting Date</label>
                <input type="date" className="glass-input w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Upload Video/Notes</label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/60">Drop video file here or click to browse</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Notes (Optional)</label>
                <textarea className="glass-input w-full h-24" placeholder="Add any additional notes..."></textarea>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 glass-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark"
                >
                  Upload & Analyze
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Survey Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Send Survey to {member.name}</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Survey Template</label>
                <select className="glass-input w-full">
                  <option value="">Select a survey template</option>
                  <option value="monthly">Monthly Check-in</option>
                  <option value="quarterly">Quarterly Review</option>
                  <option value="custom">Custom Survey</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Due Date</label>
                <input type="date" className="glass-input w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Message (Optional)</label>
                <textarea className="glass-input w-full h-20" placeholder="Add a personal message..."></textarea>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="flex-1 glass-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark"
                >
                  Send Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recommendation Details Modal */}
      {showRecommendationModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRecommendation.type === 'promotion' ? 'bg-green-400/20' :
                  selectedRecommendation.type === 'development' ? 'bg-blue-400/20' :
                  'bg-yellow-400/20'
                }`}>
                  {selectedRecommendation.type === 'promotion' ? (
                    <Award className="w-5 h-5 text-green-400" />
                  ) : selectedRecommendation.type === 'development' ? (
                    <BookOpen className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Heart className="w-5 h-5 text-yellow-400" />
                  )}
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

            {/* Priority and Timeline */}
            <div className="flex items-center space-x-4 mb-6">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedRecommendation.priority === 'High' ? 'bg-red-400/20 text-red-400' :
                selectedRecommendation.priority === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                'bg-green-400/20 text-green-400'
              }`}>
                {selectedRecommendation.priority} Priority
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Timeline: {selectedRecommendation.timeline}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Background Analysis</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{getRecommendationDetails(selectedRecommendation).background}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <UserCheck className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Supporting Evidence</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {getRecommendationDetails(selectedRecommendation).evidence.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Expected Benefits</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {getRecommendationDetails(selectedRecommendation).benefits.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Action Plan</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {getRecommendationDetails(selectedRecommendation).actionPlan.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold text-white">Success Metrics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getRecommendationDetails(selectedRecommendation).successMetrics.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 text-sm">{item}</span>
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
                Share with HR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Details Modal */}
      {showTimelineModal && selectedTimelineItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedTimelineItem.type === 'one-one' ? 'bg-blue-400/20' : 'bg-mint-400/20'
                }`}>
                  {selectedTimelineItem.type === 'one-one' ? (
                    <Calendar className="w-5 h-5 text-blue-400" />
                  ) : (
                    <MessageSquare className="w-5 h-5 text-mint-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTimelineItem.title}</h2>
                  <p className="text-white/60 text-sm">{selectedTimelineItem.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTimelineModal(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Detailed Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Detailed Summary</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span>Date: {selectedTimelineItem.date}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span>Mood: {selectedTimelineItem.detailedSummary.mood}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span>Duration: {selectedTimelineItem.detailedSummary.duration}</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Key Points</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {selectedTimelineItem.detailedSummary.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Action Items</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {selectedTimelineItem.detailedSummary.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Agenda</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {selectedTimelineItem.detailedSummary.agenda.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-mint rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t border-white/20 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="w-5 h-5 text-mint" />
                <h3 className="text-lg font-semibold text-white">Next Steps</h3>
              </div>
              <p className="text-white/70 text-sm">{selectedTimelineItem.detailedSummary.nextSteps}</p>
            </div>
          </div>
        </div>
      )}

      {/* Survey Results Details Modal */}
      {showSurveyResultsModal && selectedTimelineItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedTimelineItem.type === 'survey' ? 'bg-mint-400/20' : 'bg-blue-400/20'
                }`}>
                  {selectedTimelineItem.type === 'survey' ? (
                    <MessageSquare className="w-5 h-5 text-mint-400" />
                  ) : (
                    <Calendar className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTimelineItem.title}</h2>
                  <p className="text-white/60 text-sm">Survey Results: {selectedTimelineItem.surveyResults.overallScore}/5</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSurveyResultsModal(false)} 
                className="glass-button p-2 hover:bg-white/30"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Survey Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Survey Questions</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {selectedTimelineItem.surveyResults.questions.map((question, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{question.question} - {question.answer}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Insights</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  {selectedTimelineItem.surveyResults.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-white/60 flex-shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Completion Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Completion Details</h3>
                </div>
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span>Submitted at: {selectedTimelineItem.surveyResults.submittedAt}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <span>Completion Time: {selectedTimelineItem.surveyResults.completionTime}</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <BarChart3 className="w-5 h-5 text-mint" />
                  <h3 className="text-lg font-semibold text-white">Overall Score</h3>
                </div>
                <div className="flex items-center space-x-2 text-white/60">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Score: {selectedTimelineItem.surveyResults.overallScore}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMember; 