import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, 
  Download, 
  TrendingUp, 
  Users, 
  HardDrive, 
  FileText, 
  Calendar,
  CheckCircle,
  X,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Crown,
  Building2,
  BarChart3,
  Activity,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';

const Billing = () => {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [usage, setUsage] = useState({
    members: 0,
    storage: 0,
    surveys: 0,
    meetings: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Import supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Load real usage data from database
      const [membersResult, surveysResult, meetingsResult, billingResult] = await Promise.all([
        supabase.from('members').select('id').count(),
        supabase.from('surveys').select('id').count(),
        supabase.from('meetings').select('id').count(),
        supabase.from('billing_info').select('*').single()
      ]);
      
      // Calculate real usage
      const realUsage = {
        members: membersResult.count || 0,
        storage: calculateStorageUsage(membersResult.count || 0), // Calculate based on members
        surveys: surveysResult.count || 0,
        meetings: meetingsResult.count || 0
      };
      
      setUsage(realUsage);
      
      // Set current plan from database or default to basic
      if (billingResult.data) {
        setCurrentPlan(billingResult.data.plan || 'basic');
      }
      
      // Load real invoices from payment_sessions
      const { data: paymentSessions } = await supabase
        .from('payment_sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      const realInvoices = paymentSessions?.map(session => ({
        id: session.id,
        date: new Date(session.created_at).toISOString().split('T')[0],
        amount: session.amount || 0,
        status: session.status,
        description: `Payment - ${session.status}`
      })) || [];
      
      setInvoices(realInvoices);
      
    } catch (error) {
      console.error('Error loading billing data:', error);
      // Set default values if database fails
      setUsage({
        members: 0,
        storage: 0,
        surveys: 0,
        meetings: 0
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate storage usage based on members (1GB base + 1GB per member)
  const calculateStorageUsage = (memberCount) => {
    const baseStorage = 1; // 1GB base
    const perMemberStorage = memberCount; // 1GB per member
    return Math.min(baseStorage + perMemberStorage, 5); // Cap at 5GB for basic plan
  };

  const upgradePlan = async (newPlan) => {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { error } = await supabase
        .from('billing_info')
        .upsert({
          plan: newPlan,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error upgrading plan:', error);
        alert('Failed to upgrade plan');
      } else {
        setCurrentPlan(newPlan);
        alert(`Successfully upgraded to ${newPlan} plan!`);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to upgrade plan');
    }
  };

  const getPlanDetails = (plan) => {
    const plans = {
      basic: {
        name: 'Basic',
        price: '$29',
        period: '/mo',
        members: 10,
        storage: 5,
        surveys: 50,
        meetings: 100,
        features: [
          'Up to 10 team members',
          '5GB storage',
          'Basic surveys',
          'Email support'
        ]
      },
      professional: {
        name: 'Professional',
        price: '$99',
        period: '/mo',
        members: 50,
        storage: 25,
        surveys: 200,
        meetings: 500,
        features: [
          'Up to 50 team members',
          '25GB storage',
          'Advanced surveys',
          'Priority support',
          'Analytics dashboard'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: '$299',
        period: '/mo',
        members: 'Unlimited',
        storage: 100,
        surveys: 'Unlimited',
        meetings: 'Unlimited',
        features: [
          'Unlimited team members',
          '100GB storage',
          'Unlimited surveys',
          '24/7 support',
          'Advanced analytics',
          'Custom integrations'
        ]
      }
    };
    return plans[plan] || plans.basic;
  };

  const getUsagePercentage = (current, limit) => {
    if (limit === 'Unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'from-green-400 to-green-600';
    if (percentage < 80) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-32"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

  const currentPlanDetails = getPlanDetails(currentPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Billing</h1>
            <p className="text-gray-400">Manage your subscription, payment methods, and usage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Current Plan</h2>
                  <p className="text-gray-400">You're currently on the {currentPlanDetails.name} plan</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{currentPlanDetails.price}</div>
                  <div className="text-gray-400 text-sm">{currentPlanDetails.period}</div>
                </div>
              </div>

              {/* Usage Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                    <Users size={14} />
                    <span className="text-xs">Members</span>
                  </div>
                  <p className="text-white font-semibold">{usage.members}/{currentPlanDetails.members}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                    <HardDrive size={14} />
                    <span className="text-xs">Storage</span>
                  </div>
                  <p className="text-white font-semibold">{usage.storage}GB/{currentPlanDetails.storage}GB</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                    <FileText size={14} />
                    <span className="text-xs">Surveys</span>
                  </div>
                  <p className="text-white font-semibold">{usage.surveys}/{currentPlanDetails.surveys}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-1">
                    <Calendar size={14} />
                    <span className="text-xs">Meetings</span>
                  </div>
                  <p className="text-white font-semibold">{usage.meetings}/{currentPlanDetails.meetings}</p>
                </div>
              </div>

              {/* Usage Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Team Members</span>
                    <span className="text-gray-400">{getUsagePercentage(usage.members, currentPlanDetails.members).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getUsageColor(getUsagePercentage(usage.members, currentPlanDetails.members))}`}
                      style={{ width: `${getUsagePercentage(usage.members, currentPlanDetails.members)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Storage</span>
                    <span className="text-gray-400">{getUsagePercentage(usage.storage, currentPlanDetails.storage).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getUsageColor(getUsagePercentage(usage.storage, currentPlanDetails.storage))}`}
                      style={{ width: `${getUsagePercentage(usage.storage, currentPlanDetails.storage)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Surveys</span>
                    <span className="text-gray-400">{getUsagePercentage(usage.surveys, currentPlanDetails.surveys).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getUsageColor(getUsagePercentage(usage.surveys, currentPlanDetails.surveys))}`}
                      style={{ width: `${getUsagePercentage(usage.surveys, currentPlanDetails.surveys)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <CreditCard size={16} />
                  Manage Subscription
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <Download size={16} />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Invoices</h3>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{invoice.description}</p>
                          <p className="text-gray-400 text-sm">{invoice.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${invoice.amount}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-500" />
                  </div>
                  <p className="text-gray-500">No invoices yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Plan Upgrade */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Upgrade Your Plan</h3>
              
              {/* Basic Plan */}
              <div className={`p-4 rounded-xl border-2 mb-4 transition-all duration-200 ${
                currentPlan === 'basic' 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Basic</h4>
                    <p className="text-gray-400 text-sm">Perfect for small teams</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$29</div>
                    <div className="text-gray-400 text-sm">/mo</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {getPlanDetails('basic').features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => upgradePlan('basic')}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    currentPlan === 'basic'
                      ? 'bg-blue-600 text-white cursor-default'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  disabled={currentPlan === 'basic'}
                >
                  {currentPlan === 'basic' ? 'Current Plan' : 'Select Basic'}
                </button>
              </div>

              {/* Professional Plan */}
              <div className={`p-4 rounded-xl border-2 mb-4 transition-all duration-200 ${
                currentPlan === 'professional' 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Professional</h4>
                    <p className="text-gray-400 text-sm">For growing organizations</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$99</div>
                    <div className="text-gray-400 text-sm">/mo</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {getPlanDetails('professional').features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => upgradePlan('professional')}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    currentPlan === 'professional'
                      ? 'bg-blue-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                  }`}
                  disabled={currentPlan === 'professional'}
                >
                  {currentPlan === 'professional' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                currentPlan === 'enterprise' 
                  ? 'border-blue-500/50 bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Enterprise</h4>
                    <p className="text-gray-400 text-sm">For large organizations</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">$299</div>
                    <div className="text-gray-400 text-sm">/mo</div>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {getPlanDetails('enterprise').features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => upgradePlan('enterprise')}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    currentPlan === 'enterprise'
                      ? 'bg-blue-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                  }`}
                  disabled={currentPlan === 'enterprise'}
                >
                  {currentPlan === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Billing Support</p>
                    <p className="text-gray-400 text-xs">Get help with payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                  <div className="h-8 w-8 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Security</p>
                    <p className="text-gray-400 text-xs">Your data is protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing; 