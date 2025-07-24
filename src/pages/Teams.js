import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Building2, 
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Award
} from 'lucide-react';
import { teamService, memberService } from '../lib/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });

  useEffect(() => {
    loadTeamsAndMembers();
  }, []);

  const loadTeamsAndMembers = async () => {
    try {
      setLoading(true);
      const [teamsResponse, membersResponse] = await Promise.all([
        teamService.getTeams(),
        memberService.getMembers()
      ]);

      setTeams(teamsResponse.data || []);
      setMembers(membersResponse.data || []);
    } catch (error) {
      console.error('Error loading teams and members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { data, error } = await teamService.createTeam({
        name: newTeamName,
        description: `Team for ${newTeamName}`,
        created_by: user?.id
      });

      if (!error) {
        setTeams(prev => [...prev, data]);
        setNewTeamName('');
        setShowAddTeam(false);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const deleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await teamService.deleteTeam(selectedTeam.id);
      if (!error) {
        setTeams(prev => prev.filter(team => team.id !== selectedTeam.id));
        setShowDeleteTeam(false);
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const addMember = async () => {
    if (!newMemberData.name.trim() || !newMemberData.email.trim()) return;

    try {
      const { data, error } = await memberService.createMember({
        ...newMemberData,
        signals: 'New',
        created_by: user?.id
      });

      if (!error) {
        setMembers(prev => [...prev, data]);
        setNewMemberData({ name: '', email: '', role: '', department: '' });
        setShowAddMember(false);
      }
    } catch (error) {
      console.error('Error creating member:', error);
    }
  };

  const deleteMember = async (memberId) => {
    try {
      const { error } = await memberService.deleteMember(memberId);
      if (!error) {
        setMembers(prev => prev.filter(member => member.id !== memberId));
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const getFilteredMembers = () => {
    if (selectedDepartment === 'all') return members;
    return members.filter(member => member.department === selectedDepartment);
  };

  const getSignalGradient = (value) => {
    if (typeof value !== 'number' || value === 'New') return 'from-gray-400 to-gray-500';
    if (value >= 8) return 'from-green-400 to-green-600';
    if (value >= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getSignalGlow = (value) => {
    if (typeof value !== 'number' || value === 'New') return 'shadow-gray-400/50';
    if (value >= 8) return 'shadow-green-400/50';
    if (value >= 6) return 'shadow-yellow-400/50';
    return 'shadow-red-400/50';
  };

  const hasData = teams.length > 0 || members.length > 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state for new users
  if (!hasData) {
    return (
      <div className="p-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Build Your Team</h1>
          <p className="text-secondary text-lg">Start by creating teams and adding members</p>
        </div>

        {/* Onboarding Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 mb-6">
            <h2 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <CheckCircle size={24} className="text-mint" />
              Get Started in 2 Steps
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 size={24} className="text-mint-dark" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">1. Create Teams</h3>
                <p className="text-secondary text-sm mb-4">Organize your team by departments or projects to track performance effectively.</p>
                <button 
                  onClick={() => setShowAddTeam(true)}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Create First Team
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2">2. Add Team Members</h3>
                <p className="text-secondary text-sm mb-4">Add your team members to start tracking their performance and insights.</p>
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <Plus size={16} />
                  Add First Member
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
                    <Building2 size={16} className="text-mint-dark" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Import Team Structure</p>
                    <p className="text-xs text-secondary">Upload CSV or connect your HR system</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Bulk Add Members</p>
                    <p className="text-xs text-secondary">Add multiple team members at once</p>
                  </div>
                  <ArrowRight size={16} className="text-muted" />
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Target size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary">Set Performance Goals</p>
                    <p className="text-xs text-secondary">Define team and individual objectives</p>
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
                    <p className="text-sm font-medium text-primary">Team Performance Tracking</p>
                    <p className="text-xs text-secondary">Monitor individual and team signals</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Department Insights</p>
                    <p className="text-xs text-secondary">Compare performance across teams</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Individual Profiles</p>
                    <p className="text-xs text-secondary">Detailed member performance history</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-primary">Growth Opportunities</p>
                    <p className="text-xs text-secondary">Identify development needs and potential</p>
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
                <h4 className="font-medium text-primary mb-1">📚 Team Setup Guide</h4>
                <p className="text-xs text-secondary">Learn best practices for team organization</p>
              </button>
              
              <button className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors">
                <h4 className="font-medium text-primary mb-1">🎥 Video Tutorials</h4>
                <p className="text-xs text-secondary">Watch step-by-step setup guides</p>
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Teams</h1>
          <p className="text-secondary">Manage teams and team members</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddMember(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Member
          </button>
          <button 
            onClick={() => setShowAddTeam(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Team
          </button>
        </div>
      </div>

      {/* Department Filter */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Filter by Department</h3>
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
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {teams.map((team) => (
          <div key={team.id} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-mint-accent rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-mint-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">{team.name}</h3>
                  <p className="text-sm text-secondary">{team.description}</p>
                </div>
              </div>
              <div className="relative">
                <button className="btn-secondary p-2">
                  <MoreVertical size={16} />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Edit size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowDeleteTeam(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Members</span>
                <span className="text-sm font-medium text-primary">
                  {members.filter(m => m.team_id === team.id).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Avg Signal</span>
                <span className="text-sm font-medium text-primary">
                  {(() => {
                    const teamMembers = members.filter(m => m.team_id === team.id);
                    if (teamMembers.length === 0) return 'N/A';
                    const avg = teamMembers.reduce((acc, m) => acc + (m.signals || 0), 0) / teamMembers.length;
                    return avg.toFixed(1);
                  })()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Members List */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Team Members</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredMembers().map((member) => (
            <Link 
              key={member.id} 
              to={`/app/member/${member.id}`}
              className="glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getSignalGradient(member.signals)} ${getSignalGlow(member.signals)} flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">
                      {member.name?.charAt(0) || 'T'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-primary">{member.name}</h4>
                    <p className="text-xs text-secondary">{member.role}</p>
                  </div>
                </div>
                <div className="relative">
                  <button className="btn-secondary p-1">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">{member.department}</span>
                <span className="text-xs font-medium text-primary">
                  {member.signals === 'New' ? 'New' : `${member.signals}/10`}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {getFilteredMembers().length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-mint-dark" />
            </div>
            <p className="text-secondary text-sm">No members found</p>
            <p className="text-muted text-xs">Add team members to get started</p>
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Create New Team</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Enter team name"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddTeam(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={addTeam}
                className="btn-primary flex-1"
                disabled={!newTeamName.trim()}
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Add Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newMemberData.name}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="Enter member name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={newMemberData.role}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, role: e.target.value }))}
                  className="glass-input w-full"
                  placeholder="Enter role"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Department
                </label>
                <select
                  value={newMemberData.department}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, department: e.target.value }))}
                  className="glass-select w-full"
                >
                  <option value="">Select department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="product">Product</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMember(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={addMember}
                className="btn-primary flex-1"
                disabled={!newMemberData.name.trim() || !newMemberData.email.trim()}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {showDeleteTeam && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Delete Team</h3>
            
            <p className="text-secondary mb-6">
              Are you sure you want to delete "{selectedTeam.name}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteTeam(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={deleteTeam}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams; 