import React, { useState } from 'react';
import { 
  CreditCard, 
  Users, 
  Plus, 
  Copy, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Euro,
  Calendar,
  Settings,
  Download,
  Eye,
  EyeOff,
  ChevronRight,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Billing = () => {
  const { user, isAdmin, billingInfo, inviteUser, upgradePlan } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setSendingInvite(true);
    try {
      const { error } = await inviteUser(inviteEmail, inviteRole);
      if (error) {
        console.error('Error inviting user:', error);
        // You could add a toast notification here
      } else {
        setInviteEmail('');
        setInviteRole('member');
        setShowInviteModal(false);
        // You could add a success notification here
      }
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleUpgradePlan = async () => {
    setUpgrading(true);
    try {
      const { error } = await upgradePlan(additionalSeats);
      if (error) {
        console.error('Error upgrading plan:', error);
        // You could add a toast notification here
      } else {
        setShowUpgradeModal(false);
        setAdditionalSeats(1);
        // You could add a success notification here
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(billingInfo.inviteLink);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'leader': return 'Team Leader';
      case 'member': return 'Team Member';
      default: return 'Member';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Full access to all features and billing';
      case 'manager': return 'Can view team analytics and manage members';
      case 'leader': return 'Can view team performance and insights';
      case 'member': return 'Can complete surveys and view personal data';
      default: return 'Basic member access';
    }
  };

  // Access control - only admins can see billing
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Access Denied</h1>
          <p className="text-secondary text-lg">You don't have permission to access billing.</p>
          <p className="text-muted text-sm mt-2">Only administrators can manage billing and invitations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Billing & Invitations</h1>
          <p className="text-secondary">Manage your subscription and team invitations</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowInviteModal(true)}
            className="btn-secondary flex items-center gap-2"
            disabled={billingInfo.usedSeats >= billingInfo.totalSeats}
          >
            <Plus size={16} />
            Invite User
          </button>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Current Plan</h2>
          <span className="px-3 py-1 bg-mint-accent text-mint-dark rounded-full text-sm font-medium">
            {billingInfo.plan.charAt(0).toUpperCase() + billingInfo.plan.slice(1)}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-2">
              <Users size={24} className="text-mint-dark" />
            </div>
            <p className="text-2xl font-bold text-primary">{billingInfo.usedSeats}/{billingInfo.totalSeats}</p>
            <p className="text-sm text-secondary">Seats Used</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Euro size={24} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-primary">€{billingInfo.monthlyCost}</p>
            <p className="text-sm text-secondary">Monthly Cost</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar size={24} className="text-green-600" />
            </div>
            <p className="text-lg font-bold text-primary">
              {billingInfo.nextBillingDate ? new Date(billingInfo.nextBillingDate).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-sm text-secondary">Next Billing</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield size={24} className="text-purple-600" />
            </div>
            <p className="text-lg font-bold text-primary">
              {billingInfo.totalSeats - billingInfo.usedSeats}
            </p>
            <p className="text-sm text-secondary">Available Seats</p>
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-3">
              <Star size={32} className="text-mint-dark" />
            </div>
            <h3 className="text-lg font-semibold text-primary">Basic Plan</h3>
            <p className="text-secondary text-sm">Perfect for small teams</p>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary">€20</p>
            <p className="text-sm text-secondary">per month</p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>1 Admin seat included</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Full dashboard access</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Team management</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Survey creation</span>
            </li>
          </ul>
          
          <div className="text-center">
            <p className="text-sm text-secondary mb-2">Additional seats: €9.99/month each</p>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="btn-primary w-full"
            >
              Add Seats
            </button>
          </div>
        </div>

        <div className="glass-card p-6 border-2 border-mint">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-primary">Pro Plan</h3>
            <p className="text-secondary text-sm">For growing organizations</p>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary">€50</p>
            <p className="text-sm text-secondary">per month</p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>5 seats included</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Custom integrations</span>
            </li>
          </ul>
          
          <div className="text-center">
            <button className="btn-secondary w-full opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield size={32} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-primary">Enterprise</h3>
            <p className="text-secondary text-sm">For large organizations</p>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-primary">Custom</p>
            <p className="text-sm text-secondary">pricing</p>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Unlimited seats</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Dedicated support</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>Custom features</span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className="text-green-500" />
              <span>SLA guarantee</span>
            </li>
          </ul>
          
          <div className="text-center">
            <button className="btn-secondary w-full opacity-50 cursor-not-allowed">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Invitation System */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Invitation System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-primary mb-3">Invite Link</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={billingInfo.inviteLink || ''}
                readOnly
                className="glass-input flex-1"
                placeholder="Generating invite link..."
              />
              <button
                onClick={copyInviteLink}
                className="btn-secondary p-2"
                title="Copy invite link"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-xs text-secondary">
              Share this link with team members to invite them to your organization
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-medium text-primary mb-3">Quick Invite</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={billingInfo.usedSeats >= billingInfo.totalSeats}
            >
              <Mail size={16} />
              Send Email Invitation
            </button>
            <p className="text-xs text-secondary mt-2">
              {billingInfo.usedSeats >= billingInfo.totalSeats 
                ? 'No available seats. Upgrade your plan to invite more users.'
                : `${billingInfo.totalSeats - billingInfo.usedSeats} seats available`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">User Roles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['admin', 'manager', 'leader', 'member'].map((role) => (
            <div key={role} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  role === 'admin' ? 'bg-red-500' :
                  role === 'manager' ? 'bg-blue-500' :
                  role === 'leader' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
                <h3 className="text-sm font-medium text-primary">{getRoleDisplayName(role)}</h3>
              </div>
              <p className="text-xs text-secondary">{getRoleDescription(role)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="glass-input w-full"
                  placeholder="colleague@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="glass-select w-full"
                >
                  <option value="member">Team Member</option>
                  <option value="leader">Team Leader</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              
              <div className="bg-mint-bg p-3 rounded-lg">
                <p className="text-sm text-primary font-medium mb-1">Current Usage</p>
                <p className="text-xs text-secondary">
                  {billingInfo.usedSeats} of {billingInfo.totalSeats} seats used
                  {billingInfo.usedSeats >= billingInfo.totalSeats && (
                    <span className="text-red-500 block mt-1">
                      ⚠️ No available seats. Please upgrade your plan.
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="btn-secondary flex-1"
                disabled={sendingInvite}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={sendingInvite || !inviteEmail.trim() || billingInfo.usedSeats >= billingInfo.totalSeats}
              >
                {sendingInvite ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={16} />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-modal w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Add Seats</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Additional Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={additionalSeats}
                  onChange={(e) => setAdditionalSeats(parseInt(e.target.value) || 1)}
                  className="glass-input w-full"
                />
              </div>
              
              <div className="bg-mint-bg p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-primary">Current Cost</span>
                  <span className="text-sm font-medium text-primary">€{billingInfo.monthlyCost}/month</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-primary">Additional Cost</span>
                  <span className="text-sm font-medium text-primary">€{(additionalSeats * 9.99).toFixed(2)}/month</span>
                </div>
                <div className="border-t border-white/20 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-primary">New Total</span>
                    <span className="text-lg font-bold text-primary">
                      €{(billingInfo.monthlyCost + (additionalSeats * 9.99)).toFixed(2)}/month
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="btn-secondary flex-1"
                disabled={upgrading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpgradePlan}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={upgrading}
              >
                {upgrading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Upgrading...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} />
                    Upgrade Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing; 