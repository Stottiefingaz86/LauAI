import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Shield,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const InvitePage = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInviteData();
  }, [inviteId]);

  const loadInviteData = async () => {
    try {
      // This would typically fetch invite data from your backend
      // For now, we'll simulate the invite data
      const mockInviteData = {
        id: inviteId,
        email: 'invited@company.com',
        role: 'member',
        invitedBy: 'admin@company.com',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'pending'
      };

      setInviteData(mockInviteData);
    } catch (error) {
      console.error('Error loading invite data:', error);
      setError('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSigningUp(true);
    setError('');

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        inviteData.role
      );

      if (error) {
        setError(error.message);
      } else {
        // Redirect to the app
        navigate('/app/dashboard');
      }
    } catch (error) {
      setError('An error occurred during sign up');
    } finally {
      setSigningUp(false);
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

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-mint-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-4 border-mint-dark border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Invalid Invitation</h1>
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-mint to-mint-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">You're Invited!</h1>
          <p className="text-secondary">Join your team on LauAI</p>
        </div>

        {/* Invitation Details */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-mint-accent rounded-full flex items-center justify-center">
              <Users size={20} className="text-mint-dark" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-primary">Team Invitation</h3>
              <p className="text-xs text-secondary">You've been invited to join</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Role:</span>
              <span className="text-xs font-medium text-primary">{getRoleDisplayName(inviteData.role)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Invited by:</span>
              <span className="text-xs font-medium text-primary">{inviteData.invitedBy}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-secondary">Expires:</span>
              <span className="text-xs font-medium text-primary">
                {new Date(inviteData.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              inviteData.role === 'admin' ? 'bg-red-500' :
              inviteData.role === 'manager' ? 'bg-blue-500' :
              inviteData.role === 'leader' ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
            <h4 className="text-sm font-medium text-primary">{getRoleDisplayName(inviteData.role)}</h4>
          </div>
          <p className="text-xs text-secondary">{getRoleDescription(inviteData.role)}</p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="glass-input w-full"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="glass-input w-full"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="glass-input w-full"
              placeholder="john@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="glass-input w-full pr-10"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="glass-input w-full"
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={signingUp}
          >
            {signingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Accept Invitation
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-secondary">
            By accepting this invitation, you agree to our{' '}
            <a href="#" className="text-mint hover:text-mint-dark">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-mint hover:text-mint-dark">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvitePage; 