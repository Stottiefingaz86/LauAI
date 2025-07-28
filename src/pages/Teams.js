import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { teamService, memberService } from '../lib/supabaseService';
import { 
  Plus, 
  Users, 
  Building2, 
  MoreVertical, 
  Trash2, 
  UserPlus, 
  X,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Modal states
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form data
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    team_id: ''
  });
  const [openDropdown, setOpenDropdown] = useState(null);

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

  // Load data on component mount
  useEffect(() => {
    loadTeamsAndMembers();
  }, []);

  const loadTeamsAndMembers = async () => {
    try {
      setLoading(true);
      
      // Load teams
      const { data: teamsData, error: teamsError } = await teamService.getTeams();
      if (teamsError) {
        console.error('Error loading teams:', teamsError);
      } else {
        setTeams(teamsData || []);
      }

      // Load team members
      const { data: membersData, error: membersError } = await teamService.getTeamMembers();
      if (membersError) {
        console.error('Error loading team members:', membersError);
      } else {
        console.log('Members loaded:', membersData);
        setTeamMembers(membersData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const teamData = {
        name: newTeamName,
        description: `Team for ${newTeamName}`
      };

      const { data, error } = await teamService.createTeam(teamData);

      if (!error) {
        setTeams(prev => [...prev, data]);
        setNewTeamName('');
        setShowAddTeam(false);
      } else {
        console.error('Error creating team:', error);
        alert(`Failed to create team: ${error.message}`);
      }
    } catch (error) {
      console.error('Unexpected error creating team:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const deleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      console.log('Deleting team:', selectedTeam.id);
      
      // First, delete all members associated with this team
      const { error: membersError } = await teamService.removeTeamMembersByTeamId(selectedTeam.id);
      
      if (membersError) {
        console.error('Error deleting team members:', membersError);
        // Even if member deletion fails, try to delete the team
        console.log('Continuing with team deletion despite member deletion error...');
      } else {
        console.log('Team members deleted successfully');
      }

      // Then delete the team
      const { error } = await teamService.deleteTeam(selectedTeam.id);
      if (!error) {
        // Update local state
        setTeams(prev => prev.filter(team => team.id !== selectedTeam.id));
        setTeamMembers(prev => prev.filter(member => member.team_id !== selectedTeam.id));
        setShowDeleteTeam(false);
        setSelectedTeam(null);
        alert(`Team "${selectedTeam.name}" and all its members have been deleted successfully.`);
      } else {
        console.error('Error deleting team:', error);
        alert('Failed to delete team. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('An unexpected error occurred while deleting the team.');
    }
  };

  const addMember = async () => {
    if (!newMemberData.name.trim() || !newMemberData.email.trim() || !newMemberData.role.trim()) {
      alert('Please fill in all required fields: Name, Email, and Role');
      return;
    }

    if (teams.length === 0) {
      alert('Please create a team first before adding members.');
      return;
    }

    try {
      // Ensure we have a valid team_id
      const teamId = newMemberData.team_id || teams[0]?.id;
      if (!teamId) {
        alert('Please select a team for this member.');
        return;
      }

      const memberData = {
        name: newMemberData.name,
        email: newMemberData.email,
        role: newMemberData.role,
        department: newMemberData.department || 'General',
        team_id: teamId
      };

      console.log('Adding member with data:', memberData);

      const { data, error } = await teamService.addTeamMember(memberData);

      if (!error) {
        console.log('Member added successfully:', data);
        
        // Reload all members to ensure UI is updated
        const { data: membersData, error: membersError } = await teamService.getTeamMembers();
        if (!membersError) {
          setTeamMembers(membersData || []);
          console.log('Members reloaded:', membersData);
        }
        
        setNewMemberData({ name: '', email: '', role: '', department: '', team_id: '' });
        setShowAddMember(false);
        alert('Member added successfully!');
      } else {
        console.error('Error adding member:', error);
        
        if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
          const userChoice = window.confirm(
            `A member with email "${newMemberData.email}" already exists.\n\n` +
            `Would you like to:\n` +
            `• Update the existing member's information (OK)\n` +
            `• Use a different email address (Cancel)`
          );
          
          if (userChoice) {
            await updateExistingMember(newMemberData);
          } else {
            alert('Please change the email address and try again.');
          }
        } else {
          alert(`Failed to add member: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Unexpected error adding member:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const updateExistingMember = async (memberData) => {
    try {
      const { data: existingMembers, error: findError } = await teamService.getTeamMembers();
      
      if (findError) {
        console.error('Error finding existing member:', findError);
        alert('Failed to find existing member');
        return;
      }
      
      const existingMember = existingMembers?.find(member => member.email === memberData.email);
      
      if (!existingMember) {
        alert('Existing member not found');
        return;
      }
      
      const { error: updateError } = await memberService.updateMember(existingMember.id, {
        name: memberData.name,
        role: memberData.role,
        department: memberData.department || 'General',
        team_id: memberData.team_id || teams[0]?.id
      });
      
      if (!updateError) {
        const { data: membersData, error: membersError } = await teamService.getTeamMembers();
        if (!membersError) {
          setTeamMembers(membersData || []);
        }
        
        setNewMemberData({ name: '', email: '', role: '', department: '', team_id: '' });
        setShowAddMember(false);
        alert('Existing member updated successfully!');
      } else {
        console.error('Error updating member:', updateError);
        alert(`Failed to update member: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Error updating existing member:', error);
      alert(`Failed to update member: ${error.message}`);
    }
  };

  const deleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log('Deleting member:', memberId);
      
      const { error } = await teamService.removeTeamMember(memberId);
      
      if (!error) {
        // Update local state
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        alert(`Member "${memberName}" has been deleted successfully.`);
      } else {
        console.error('Error deleting member:', error);
        alert('Failed to delete member. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('An unexpected error occurred while deleting the member.');
    }
  };

  const getSignalGradient = (value) => {
    if (typeof value !== 'number' || value === 'New') return 'from-gray-400 to-gray-500';
    if (value >= 8) return 'from-green-400 to-green-600';
    if (value >= 6) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getUniqueDepartments = () => {
    const departments = teams.map(team => team.department).filter(Boolean);
    return [...new Set(departments)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-32"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="h-6 bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teams</h1>
            <p className="text-gray-400">Manage your teams and members</p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => loadTeamsAndMembers()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddTeam(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Team
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus size={16} />
              Add Member
            </button>
          </div>
        </div>

        {/* Empty State */}
        {teams.length === 0 && (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Teams Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Create your first team and add members to get started.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowAddTeam(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Create Team
              </button>
              <button
                onClick={() => setShowAddMember(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <UserPlus size={20} />
                Add Member
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {teams.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-gray-300 font-medium">Filter by Department:</span>
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Departments</option>
                  {getUniqueDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="text-gray-400 text-sm">
                {teams.length} teams • {teamMembers.length} members
              </div>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams
              .filter(team => selectedDepartment === 'all' || team.department === selectedDepartment)
              .map((team) => {
                const teamMembersForThisTeam = teamMembers.filter(member => {
                  // Handle both string and UUID formats
                  const memberTeamId = member.team_id?.toString();
                  const teamId = team.id?.toString();
                  return memberTeamId === teamId;
                });
                
                return (
                  <div key={team.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200">
                    {/* Team Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                          <Building2 size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">{team.name}</h3>
                          <p className="text-gray-400 text-sm">{team.description}</p>
                        </div>
                      </div>
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === team.id ? null : team.id)}
                          className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        
                        {openDropdown === team.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  setSelectedTeam(team);
                                  setNewMemberData(prev => ({ ...prev, team_id: team.id }));
                                  setShowAddMember(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                              >
                                <UserPlus size={16} />
                                Add Member
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTeam(team);
                                  setShowDeleteTeam(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 flex items-center gap-3 transition-colors duration-200"
                              >
                                <Trash2 size={16} />
                                Delete Team
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-3">
                      {teamMembersForThisTeam.length > 0 ? (
                        teamMembersForThisTeam.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
                            <Link 
                              to={`/member/${member.id}`}
                              className="flex items-center gap-3 flex-1 cursor-pointer group"
                            >
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-400">
                                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium group-hover:text-blue-400 transition-colors duration-200">{member.name}</p>
                                <p className="text-gray-400 text-sm">{member.role}</p>
                              </div>
                            </Link>
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getSignalGradient(member.signals)}`}>
                                {member.signals || 'New'}
                              </div>
                              <button
                                onClick={() => deleteMember(member.id, member.name)}
                                className="p-1 text-red-400 hover:text-red-300 transition-colors duration-200"
                                title="Delete member"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={24} className="text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-sm">No members in this team yet</p>
                          <button
                            onClick={() => {
                              setSelectedTeam(team);
                              setNewMemberData(prev => ({ ...prev, team_id: team.id }));
                              setShowAddMember(true);
                            }}
                            className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                          >
                            Add first member
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Team</h3>
              <button
                onClick={() => setShowAddTeam(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter team name"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTeam(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addTeam}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Create Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Add New Member</h3>
              <button
                onClick={() => setShowAddMember(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newMemberData.name}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter member email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={newMemberData.role}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select role</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Job Role</label>
                <input
                  type="text"
                  value={newMemberData.department}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter job role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Assign to Team</label>
                <select
                  value={newMemberData.team_id}
                  onChange={(e) => setNewMemberData(prev => ({ ...prev, team_id: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addMember}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {showDeleteTeam && selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md border border-gray-700/50">
            <div className="text-center">
              <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} className="text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete Team</h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to delete "{selectedTeam.name}"? This action cannot be undone.
              </p>
              {(() => {
                const teamMemberCount = teamMembers.filter(member => member.team_id === selectedTeam.id).length;
                return teamMemberCount > 0 ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-400 text-sm font-medium mb-1">⚠️ Warning</p>
                    <p className="text-red-300 text-sm">
                      This will also delete {teamMemberCount} member{teamMemberCount !== 1 ? 's' : ''} from this team.
                    </p>
                  </div>
                ) : null;
              })()}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteTeam(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTeam}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Delete Team & Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams; 