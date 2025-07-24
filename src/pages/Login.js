import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: 'admin' // Default to admin for master account
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      const userRole = user?.user_metadata?.role || 'member';
      if (userRole === 'member') {
        navigate('/app/surveys');
      } else {
        navigate('/app/dashboard');
      }
    }
  }, [user, navigate]);

  // If user is already authenticated, don't render the form
  if (user) {
    return null;
  }

  const validateForm = () => {
    const errors = {};

    if (isSignUp) {
      // First name validation
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      } else if (formData.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      }

      // Last name validation
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      } else if (formData.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      // Company validation
      if (!formData.company.trim()) {
        errors.company = 'Company name is required';
      }

      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Login validation
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      }
      if (!formData.password) {
        errors.password = 'Password is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up logic
        console.log('Starting signup process...', { email: formData.email });
        const { data, error } = await signUp(
          formData.email, 
          formData.password, 
          formData.firstName, 
          formData.lastName,
          formData.role
        );
        
        console.log('Signup result:', { data, error });
        
        if (error) {
          console.error('Signup error:', error);
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please try signing in instead.');
          } else if (error.message.includes('password')) {
            setError('Password is too weak. Please choose a stronger password.');
          } else {
            setError(error.message || 'Failed to create account. Please try again.');
          }
        } else {
          console.log('Signup successful, showing success message');
          
          // Handle different success scenarios
          if (data?.needsEmailVerification === false) {
            setSuccess('Account created successfully! You can now sign in.');
            // Auto-navigate to dashboard if user is already confirmed
            setTimeout(() => {
              navigate('/app/dashboard');
            }, 2000);
          } else {
            setSuccess('Account created successfully! Please check your email to verify your account before signing in.');
          }
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            company: '',
            role: 'admin'
          });
          setFormErrors({});
        }
      } else {
        // Sign in logic
        console.log('Starting signin process...', { email: formData.email });
        const { data, error } = await signIn(formData.email, formData.password);
        console.log('Signin result:', { data, error });
        
        if (error) {
          console.error('Signin error:', error);
          if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and click the verification link before signing in.');
          } else if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message || 'Failed to sign in. Please try again.');
          }
        } else {
          console.log('Signin successful, navigating to dashboard');
          navigate('/app/dashboard');
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (isSignUp) {
      return formData.firstName && 
             formData.lastName && 
             formData.email && 
             formData.password && 
             formData.confirmPassword && 
             formData.company && 
             formData.role &&
             formData.password === formData.confirmPassword &&
             Object.keys(formErrors).length === 0;
    }
    return formData.email && formData.password;
  };

  const isMasterAccount = formData.email === 'christopher.hunt86@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Back to home */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        {/* Auth form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-white/70">
              {isSignUp 
                ? 'Start your free trial and transform your team management'
                : 'Sign in to your account to continue'
              }
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Account Created Successfully!</p>
                  <p className="text-green-300/80 text-sm mt-1">
                    Please check your email and click the verification link before signing in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 ${
                        formErrors.firstName ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Enter your first name"
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 ${
                        formErrors.lastName ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Enter your last name"
                      required
                    />
                    {formErrors.lastName && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 ${
                      formErrors.email ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                  )}
                  {isMasterAccount && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <Shield size={14} />
                        <span>Master account detected - Full access granted</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                      Company
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 ${
                        formErrors.company ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Enter your company"
                      required
                    />
                    {formErrors.company && (
                      <p className="text-red-400 text-sm mt-1">{formErrors.company}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="leader">Team Leader</option>
                      <option value="member">Team Member</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 pr-12 ${
                        formErrors.password ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 pr-12 ${
                        formErrors.confirmPassword ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {!isSignUp && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 ${
                      formErrors.email ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white/10 backdrop-blur-xl border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400 pr-12 ${
                        formErrors.password ? 'border-red-400' : 'border-white/20'
                      }`}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 hover:from-green-500 hover:to-emerald-600 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </button>

            <div className="text-center">
              <p className="text-white/70">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                    setFormErrors({});
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      company: '',
                      role: 'admin'
                    });
                  }}
                  className="ml-1 text-green-400 hover:text-green-300 font-medium"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
              
              {/* Debug: Force sign out */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Clear all storage
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    // Force sign out from Supabase
                    const { supabase } = await import('../lib/supabase');
                    await supabase.auth.signOut();
                    
                    // Reload page
                    window.location.reload();
                  } catch (error) {
                    console.error('Error clearing auth:', error);
                    // Fallback: just reload
                    window.location.reload();
                  }
                }}
                className="mt-4 text-xs text-red-400 hover:text-red-300 underline"
              >
                Debug: Clear Auth & Reload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 