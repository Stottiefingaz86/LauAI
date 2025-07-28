import React, { useState } from 'react';
import { X, Mail, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const InviteModal = ({ isOpen, onClose }) => {
  const { user, isAdmin, isManager, isLeader, billingInfo, inviteUser } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setSendingInvite(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await inviteUser(inviteEmail, inviteRole);
      
      if (error) {
        setError(error.message || 'Failed to send invitation');
      } else {
        setSuccess('Invitation sent successfully!');
        setInviteEmail('');
        setInviteRole('member');
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setSendingInvite(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Full access to all features and billing';
      case 'manager': return 'Can view team analytics and manage members';
      case 'leader': return 'Can view team performance and insights';
      case 'member': return 'Can participate in surveys and view own data';
      default: return 'Basic member access';
    }
  };

  const canInvite = isAdmin || isManager || isLeader;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-modal w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
              <p className="text-white/60 text-sm">Send invitation to join your team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!canInvite ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-red-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Insufficient Permissions</h4>
            <p className="text-white/60 text-sm">You need admin, manager, or leader permissions to invite team members.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="glass-input w-full"
                placeholder="team@company.com"
                disabled={sendingInvite}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="glass-select w-full"
                disabled={sendingInvite}
              >
                <option value="member">Team Member</option>
                <option value="leader">Team Leader</option>
                <option value="manager">Manager</option>
                {isAdmin && <option value="admin">Administrator</option>}
              </select>
              <p className="text-xs text-white/50 mt-1">{getRoleDescription(inviteRole)}</p>
            </div>

            {billingInfo && (
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Available Seats:</span>
                  <span className="text-white">
                    {billingInfo.totalSeats - billingInfo.usedSeats} / {billingInfo.totalSeats}
                  </span>
                </div>
                {billingInfo.usedSeats >= billingInfo.totalSeats && (
                  <p className="text-red-400 text-xs mt-1">
                    No seats available. Please upgrade your plan.
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="glass-button flex-1"
                disabled={sendingInvite}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                disabled={sendingInvite || !inviteEmail.trim() || (billingInfo && billingInfo.usedSeats >= billingInfo.totalSeats)}
                className="glass-button bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 hover:from-green-500 hover:to-emerald-600 flex-1 flex items-center justify-center gap-2"
              >
                {sendingInvite ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteModal; 