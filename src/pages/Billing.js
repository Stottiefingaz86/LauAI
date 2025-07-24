import React, { useState, useEffect } from 'react';
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
  Shield,
  Crown,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const Billing = () => {
  const { user, isAdmin, isMasterAccount, billingInfo, inviteUser, upgradePlan, createPaymentSession, getPaymentSession } = useAuth();
  const [searchParams] = useSearchParams();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [additionalSeats, setAdditionalSeats] = useState(1);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Check for payment success/failure from URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Handle successful payment
      handlePaymentSuccess(sessionId);
    } else if (canceled === 'true') {
      // Handle canceled payment
      console.log('Payment was canceled');
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (sessionId) => {
    try {
      const { data, error } = await getPaymentSession(sessionId);
      if (!error && data?.status === 'completed') {
        // Update billing info and show success message
        console.log('Payment successful:', data);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

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
    if (!selectedPlan) return;

    setUpgrading(true);
    try {
      const planData = {
        userId: user.id,
        customerEmail: user.email,
        plan: selectedPlan.id,
        seats: selectedPlan.seats,
        amount: selectedPlan.price * 100, // Convert to cents
      };

      const { data, error } = await createPaymentSession(planData);
      
      if (error) {
        console.error('Error creating payment session:', error);
        // You could add a toast notification here
      } else if (data?.checkout_url) {
        // Redirect to payment page
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      // For now, we'll use local plans since the API might not be available
      const localPlans = [
        {
          id: 'basic',
          name: 'Basic',
          price: 20,
          seats: 5,
          features: ['Team Management', 'Basic Analytics', 'Survey System'],
          description: 'Perfect for small teams getting started'
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 50,
          seats: 20,
          features: ['Advanced Analytics', 'Custom Surveys', 'Priority Support'],
          description: 'Ideal for growing teams'
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 100,
          seats: 100,
          features: ['Unlimited Seats', 'Custom Integrations', 'Dedicated Support'],
          description: 'For large organizations'
        }
      ];
      setPlans(localPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
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
      case 'member': return 'Can participate in surveys and view own data';
      default: return 'Basic team member access';
    }
  };

  // Access control - only admins can see billing
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-secondary text-lg">You don't have permission to access billing.</p>
          <p className="text-muted text-sm mt-2">Only administrators can manage billing and invitations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Billing & Invitations</h1>
          <p className="text-muted mt-2">Manage your subscription and team invitations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary">Current Plan</h2>
                  <p className="text-muted text-sm">Your active subscription</p>
                </div>
                {isMasterAccount && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm">
                    <Crown className="w-4 h-4" />
                    <span>Master Account</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-muted text-sm">Plan</p>
                    <p className="text-primary font-semibold">
                      {isMasterAccount ? 'Master' : billingInfo.plan.charAt(0).toUpperCase() + billingInfo.plan.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted text-sm">Seats Used</p>
                    <p className="text-primary font-semibold">
                      {isMasterAccount ? '∞' : `${billingInfo.usedSeats}/${billingInfo.totalSeats}`}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted text-sm">Monthly Cost</p>
                    <p className="text-primary font-semibold">
                      {isMasterAccount ? 'Free' : `€${billingInfo.monthlyCost}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted text-sm">Next Billing</p>
                    <p className="text-primary font-semibold">
                      {isMasterAccount ? 'Lifetime' : (billingInfo.nextBillingDate ? new Date(billingInfo.nextBillingDate).toLocaleDateString() : 'N/A')}
                    </p>
                  </div>
                </div>
              </div>

              {!isMasterAccount && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted text-sm">Available Seats</p>
                      <p className="text-primary font-semibold">
                        {billingInfo.totalSeats - billingInfo.usedSeats}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      disabled={billingInfo.usedSeats >= billingInfo.totalSeats}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {billingInfo.usedSeats >= billingInfo.totalSeats ? 'No Seats Available' : 'Upgrade Plan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Invite Link */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Invite Link</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <input
                    type="text"
                    value={billingInfo.inviteLink || ''}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-primary outline-none"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="text-muted hover:text-primary transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  disabled={!isMasterAccount && billingInfo.usedSeats >= billingInfo.totalSeats}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isMasterAccount && billingInfo.usedSeats >= billingInfo.totalSeats
                    ? 'No Seats Available'
                    : 'Invite Team Member'}
                </button>
              </div>
            </div>

            {/* Plan Status */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Plan Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Status</span>
                  <span className={`text-sm font-medium ${
                    isMasterAccount ? 'text-green-400' : 
                    billingInfo.subscriptionStatus === 'active' ? 'text-green-400' :
                    billingInfo.subscriptionStatus === 'trial' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {isMasterAccount ? 'Active' : billingInfo.subscriptionStatus?.charAt(0).toUpperCase() + billingInfo.subscriptionStatus?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-sm">Seats Used</span>
                  <span className="text-primary text-sm font-medium">
                    {isMasterAccount ? '∞' : `${billingInfo.usedSeats} of ${billingInfo.totalSeats} seats used`}
                  </span>
                </div>
                {!isMasterAccount && billingInfo.usedSeats >= billingInfo.totalSeats && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">You've reached your seat limit. Upgrade to add more team members.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        {!isMasterAccount && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-primary">Available Plans</h2>
                <p className="text-muted text-sm">Choose the plan that fits your team</p>
              </div>
              <button
                onClick={() => setShowPlansModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                View All Plans
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary placeholder-muted focus:outline-none focus:border-blue-500"
                  placeholder="team@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
                >
                  <option value="member">Team Member</option>
                  <option value="leader">Team Leader</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
                <p className="text-xs text-muted mt-1">{getRoleDescription(inviteRole)}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={sendingInvite || !inviteEmail.trim() || (!isMasterAccount && billingInfo.usedSeats >= billingInfo.totalSeats)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingInvite ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-primary mb-4">Upgrade Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Additional Seats</label>
                <input
                  type="number"
                  min="1"
                  value={additionalSeats}
                  onChange={(e) => setAdditionalSeats(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm text-muted">New Monthly Cost</p>
                <p className="text-lg font-semibold text-primary">
                  €{(billingInfo.monthlyCost + (additionalSeats * 9.99)).toFixed(2)}/month
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgradePlan}
                  disabled={upgrading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {upgrading ? 'Processing...' : 'Upgrade Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Modal */}
      {showPlansModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary">Choose Your Plan</h3>
              <button
                onClick={() => setShowPlansModal(false)}
                className="text-muted hover:text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white/5 border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
                    selectedPlan?.id === plan.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-primary">{plan.name}</h4>
                    <p className="text-muted text-sm">{plan.description}</p>
                  </div>
                  <div className="text-center mb-6">
                    <span className="text-3xl font-bold text-primary">€{plan.price}</span>
                    <span className="text-muted text-sm">/month</span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-muted">Up to {plan.seats} team members</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-primary">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowPlansModal(false);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    Choose {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing; 