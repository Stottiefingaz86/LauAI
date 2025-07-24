import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  UserPlus,
  Building,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { getAllMembers, addMemberToData } from '../data/teamData';

const Teams = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Add member form state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  // Mock data
  const [departments, setDepartments] = useState([
    { id: 'design', name: 'Design', memberCount: 6 },
    { id: 'engineering', name: 'Engineering', memberCount: 12 },
    { id: 'product', name: 'Product', memberCount: 4 },
    { id: 'marketing', name: 'Marketing', memberCount: 5 },
    { id: 'sales', name: 'Sales', memberCount: 8 }
  ]);

  const [teamMembers, setTeamMembers] = useState(getAllMembers());

  const addTeam = () => {
    if (newTeamName.trim()) {
      const newTeam = {
        id: newTeamName.toLowerCase().replace(/\s+/g, '-'),
        name: newTeamName,
        memberCount: 0
      };
      setDepartments([...departments, newTeam]);
      setNewTeamName('');
      setShowAddTeam(false);
    }
  };

  const deleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      setDepartments(departments.filter(dept => dept.id !== teamId));
      if (selectedDepartment === teamId) {
        setSelectedDepartment('all');
      }
    }
  };

  const deleteMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member? This action cannot be undone.')) {
      // In a real app, this would update the backend
      // For now, we'll just show a success message
      alert('Team member removed successfully!');
    }
  };

  const addMember = (e) => {
    e.preventDefault();
    
    if (!newMember.name || !newMember.email || !newMember.role || !newMember.department) {
      alert('Please fill in all fields');
      return;
    }

    // Create new member object with complete data for member page
    const member = {
      id: Date.now(), // Simple ID generation
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      department: departments.find(d => d.id === newMember.department)?.name || newMember.department,
      signals: 'New', // Show as "New" for members without surveys/interviews
      lastOneOne: 'Never',
      nextOneOne: 'Not scheduled',
      status: 'new',
      avatar: newMember.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      joinDate: new Date().toISOString().split('T')[0], // Today's date
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
    };

    // Add to shared data
    addMemberToData(member);

    // Add to team members array
    setTeamMembers([...teamMembers, member]);

    // Update department member count
    setDepartments(departments.map(dept => 
      dept.id === newMember.department 
        ? { ...dept, memberCount: dept.memberCount + 1 }
        : dept
    ));

    // Reset form and close modal
    setNewMember({ name: '', email: '', role: '', department: '' });
    setShowAddMember(false);
    
    alert('Team member added successfully! You can now view their profile page.');
  };

  const handleDropdownAction = (action, itemId, itemType) => {
    setOpenDropdown(null);
    
    switch (action) {
      case 'remove':
        if (itemType === 'team') {
          deleteTeam(itemId);
        } else {
          deleteMember(itemId);
        }
        break;
      case 'edit':
        // TODO: Implement edit functionality
        alert('Edit functionality coming soon!');
        break;
      case 'add':
        if (itemType === 'team') {
          setShowAddTeam(true);
        } else {
          setShowAddMember(true);
        }
        break;
      default:
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesDepartment = selectedDepartment === 'all' || member.department.toLowerCase() === selectedDepartment;
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'text-green-400';
      case 'yellow': return 'text-yellow-400';
      case 'red': return 'text-red-400';
      case 'new': return 'text-blue-400';
      default: return 'text-white/60';
    }
  };

  const getSignalGradient = (signals) => {
    if (typeof signals === 'string' && signals === 'New') return 'from-blue-400 to-cyan-400';
    if (signals >= 4.5) return 'from-green-400 to-emerald-400';
    if (signals >= 4.0) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  const getSignalGlow = (signals) => {
    if (typeof signals === 'string' && signals === 'New') return 'shadow-blue-400/50';
    if (signals >= 4.5) return 'shadow-green-400/50';
    if (signals >= 4.0) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-white/70 mt-1">Manage your team members and departments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddTeam(true)}
            className="glass-button bg-mint text-gray-900 hover:bg-mint-dark"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Team
          </button>
          <button
            onClick={() => setShowAddMember(true)}
            className="glass-button bg-mint text-gray-900 hover:bg-mint-dark"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="glass-input"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <button className="glass-button">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {departments.map(dept => (
          <div 
            key={dept.id} 
            className={`glass-card p-4 text-center cursor-pointer transition-all duration-200 hover:bg-white/10 ${
              selectedDepartment === dept.id ? 'ring-2 ring-mint bg-mint/10' : ''
            }`}
            onClick={() => setSelectedDepartment(dept.id)}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-mint/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Building className="w-6 h-6 text-mint" />
              </div>
              <div className="absolute -top-2 -right-2">
                                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newDropdown = openDropdown === `team-${dept.id}` ? null : `team-${dept.id}`;
                      console.log('Team dropdown clicked:', newDropdown);
                      setOpenDropdown(newDropdown);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs transition-colors backdrop-blur-sm ${
                      openDropdown === `team-${dept.id}` ? 'bg-mint/30 text-mint' : 'bg-white/10 hover:bg-white/20'
                    }`}
                    title="More options"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                
                {openDropdown === `team-${dept.id}` && (
                  <div className="absolute right-0 top-8 w-32 p-2 z-50 dropdown-container bg-black/80 border border-white/20 shadow-xl backdrop-blur-2xl rounded-xl">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownAction('edit', dept.id, 'team');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDropdownAction('remove', dept.id, 'team');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-white font-semibold">{dept.name}</h3>
            <p className="text-white/60 text-sm">{dept.memberCount} members</p>
          </div>
        ))}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <Link key={member.id} to={`/app/teams/${member.id}`} className="block">
            <div className="glass-card p-6 hover:bg-white/25 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-r ${getSignalGradient(member.signals)}`}>
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{member.name}</h3>
                      <p className="text-white/60 text-sm">{member.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    {typeof member.signals === 'number' ? (
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gradient-to-r ${getSignalGradient(member.signals)} ${getSignalGlow(member.signals)}`}>
                        <div className="w-2 h-2 rounded-full bg-white/80"></div>
                        <span className="text-white font-semibold text-sm">{member.signals}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-400/20 border border-blue-400/30">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-blue-400 font-semibold text-sm">New</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newDropdown = openDropdown === `member-${member.id}` ? null : `member-${member.id}`;
                        console.log('Member dropdown clicked:', newDropdown);
                        setOpenDropdown(newDropdown);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm ${
                        openDropdown === `member-${member.id}` ? 'bg-mint/30 text-mint' : 'bg-white/10 hover:bg-white/20'
                      }`}
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openDropdown === `member-${member.id}` && (
                      <div className="absolute right-0 top-10 w-32 p-2 z-50 dropdown-container bg-black/80 border border-white/20 shadow-xl backdrop-blur-2xl rounded-xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('edit', member.id, 'member');
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDropdownAction('remove', member.id, 'member');
                          }}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Department</span>
                    <span className="text-white">{member.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Last 1:1</span>
                    <span className="text-white">{member.lastOneOne}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Status</span>
                    <span className={`font-medium ${getStatusColor(member.status)}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Signal trend</span>
                    <div className="flex items-center">
                      {typeof member.signals === 'string' && member.signals === 'New' ? (
                        <div className="text-blue-400 text-xs font-medium">No data yet</div>
                      ) : member.signals > 4.5 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
          </Link>
        ))}
      </div>

      <>
        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Add Team Member</h2>
              
              <form className="space-y-4" onSubmit={addMember}>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="Enter full name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input 
                    type="email" 
                    className="glass-input w-full" 
                    placeholder="Enter email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Role</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="Enter role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Department</label>
                  <select 
                    className="glass-input w-full"
                    value={newMember.department}
                    onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false);
                      setNewMember({ name: '', email: '', role: '', department: '' });
                    }}
                    className="flex-1 glass-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Team Modal */}
        {showAddTeam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Add New Team</h2>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addTeam(); }}>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Team Name</label>
                  <input 
                    type="text" 
                    className="glass-input w-full" 
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTeam(false);
                      setNewTeamName('');
                    }}
                    className="flex-1 glass-button"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 glass-button bg-mint text-gray-900 hover:bg-mint-dark"
                  >
                    Add Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Teams; 