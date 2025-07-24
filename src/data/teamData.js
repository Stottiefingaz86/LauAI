// Shared team data that can be accessed by multiple components
export let teamMembersData = {
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
    nextOneOne: '2024-01-26',
    aiInsights: [
      {
        type: 'positive',
        title: 'Technical Excellence',
        description: 'Mike consistently delivers high-quality code and shows strong problem-solving skills.',
        icon: '💻',
        impact: 'High'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'Backend Skills',
        description: 'Consider expanding backend development skills for full-stack capabilities.',
        priority: 'Medium',
        timeline: 'Next quarter'
      }
    ]
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
    nextOneOne: '2024-01-24',
    aiInsights: [
      {
        type: 'opportunity',
        title: 'Product Strategy',
        description: 'Emma shows strong product thinking but could benefit from more strategic planning.',
        icon: '🎯',
        impact: 'Medium'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'Strategic Planning',
        description: 'Enroll in product strategy workshops to enhance long-term planning skills.',
        priority: 'Medium',
        timeline: 'This quarter'
      }
    ]
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
    nextOneOne: '2024-01-22',
    aiInsights: [
      {
        type: 'positive',
        title: 'Creative Campaigns',
        description: 'Alex consistently creates engaging marketing campaigns with strong ROI.',
        icon: '📢',
        impact: 'High'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'Digital Marketing',
        description: 'Expand digital marketing skills with advanced analytics training.',
        priority: 'Medium',
        timeline: 'Next month'
      }
    ]
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
    joinDate: '2023-02-15',
    lastOneOne: '2024-01-05',
    nextOneOne: '2024-01-19',
    aiInsights: [
      {
        type: 'warning',
        title: 'Performance Dip',
        description: 'Recent sales performance has declined. Consider additional support and training.',
        icon: '📉',
        impact: 'High'
      }
    ],
    recommendations: [
      {
        type: 'wellness',
        title: 'Sales Training',
        description: 'Enroll in advanced sales training to improve performance metrics.',
        priority: 'High',
        timeline: 'Immediate'
      }
    ]
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
    joinDate: '2023-08-10',
    lastOneOne: '2024-01-03',
    nextOneOne: '2024-01-17',
    aiInsights: [
      {
        type: 'warning',
        title: 'Skill Development',
        description: 'Lisa needs additional training in modern UX design tools and methodologies.',
        icon: '🎨',
        impact: 'Medium'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'UX Training',
        description: 'Enroll in comprehensive UX design bootcamp to enhance skills.',
        priority: 'High',
        timeline: 'This month'
      }
    ]
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
    joinDate: '2023-01-01',
    lastOneOne: '2024-01-01',
    nextOneOne: '2024-01-15',
    aiInsights: [
      {
        type: 'positive',
        title: 'Reliable Performance',
        description: 'John consistently delivers stable backend solutions with minimal bugs.',
        icon: '🔧',
        impact: 'High'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'System Architecture',
        description: 'Consider advanced system architecture training for senior role preparation.',
        priority: 'Medium',
        timeline: 'Next quarter'
      }
    ]
  },
  8: {
    id: 8,
    name: 'Maria Garcia',
    email: 'maria@company.com',
    role: 'Product Designer',
    department: 'Product',
    avatar: 'MG',
    signals: 'New',
    status: 'new',
    joinDate: '2024-01-20',
    lastOneOne: 'Never',
    nextOneOne: 'Not scheduled',
    aiInsights: [
      {
        type: 'opportunity',
        title: 'New Team Member',
        description: 'Welcome to the team! Schedule your first 1:1 meeting to establish goals and expectations.',
        icon: '👋',
        impact: 'Medium'
      }
    ],
    recommendations: [
      {
        type: 'development',
        title: 'Onboarding Plan',
        description: 'Create a comprehensive onboarding plan with clear milestones and objectives.',
        priority: 'High',
        timeline: 'This week'
      },
      {
        type: 'wellness',
        title: 'First 1:1 Meeting',
        description: 'Schedule your first 1:1 meeting to understand goals and provide support.',
        priority: 'High',
        timeline: 'This week'
      }
    ]
  }
};

// Function to add a new member to the data
export const addMemberToData = (member) => {
  teamMembersData[member.id] = member;
};

// Function to get all members as an array
export const getAllMembers = () => {
  return Object.values(teamMembersData);
};

// Function to get a specific member by ID
export const getMemberById = (id) => {
  return teamMembersData[id];
}; 