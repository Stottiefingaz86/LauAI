import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, billingService } from '../lib/supabaseService';
import { emailService } from '../lib/emailService'; // Added import for emailService

// Production URL configuration
const PRODUCTION_URL = 'https://lau-r6el3zy53-chris-projects-e99bc8f6.vercel.app';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState({
    plan: 'basic',
    seats: 1,
    usedSeats: 1,
    totalSeats: 1,
    monthlyCost: 20,
    nextBillingDate: null,
    inviteLink: '',
    trialDaysLeft: 14,
    subscriptionStatus: 'trial'
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Loading user session...');
        const { data: { session } } = await authService.getSession();
        
        console.log('Session data:', session);
        
        if (session?.user) {
          console.log('User found in session:', session.user);
          setUser(session.user);
          
          // Load billing info for admins
          if (session.user.user_metadata?.role === 'admin') {
            await loadBillingInfo(session.user.id);
          }
        } else {
          console.log('No user session found');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    loadUser();

    return () => clearTimeout(timeoutId);

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user);
        setUser(session.user);
        
        // Load billing info for admins
        if (session.user.user_metadata?.role === 'admin') {
          await loadBillingInfo(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setBillingInfo({
          plan: 'basic',
          seats: 1,
          usedSeats: 1,
          totalSeats: 1,
          monthlyCost: 20,
          nextBillingDate: null,
          inviteLink: '',
          trialDaysLeft: 14,
          subscriptionStatus: 'trial'
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadBillingInfo = async (userId) => {
    try {
      const { data, error } = await billingService.getBillingInfo(userId);
      
      if (error) {
        console.error('Error loading billing info:', error);
        return;
      }

      // Check if this is a master account
      const isMasterAccount = user?.email === 'christopher.hunt86@gmail.com';
      
      if (isMasterAccount) {
        const masterBillingData = {
          plan: 'master',
          seats: 999,
          usedSeats: 1,
          totalSeats: 999,
          monthlyCost: 0,
          nextBillingDate: null,
          inviteLink: `${PRODUCTION_URL}/invite/${userId}`,
          trialDaysLeft: 999,
          subscriptionStatus: 'active'
        };
        setBillingInfo(masterBillingData);
      } else {
        // This would typically fetch from your billing service
        // For now, we'll simulate the billing data
        const billingData = {
          plan: data.plan || 'basic',
          seats: data.seats || 1,
          usedSeats: data.used_seats || 1,
          totalSeats: data.total_seats || 1,
          monthlyCost: data.monthly_cost || 20,
          nextBillingDate: data.next_billing_date ? new Date(data.next_billing_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          inviteLink: data.invite_link || `${PRODUCTION_URL}/invite/${userId}`,
          trialDaysLeft: data.trial_days_left || 14,
          subscriptionStatus: data.subscription_status || 'trial'
        };
        setBillingInfo(billingData);
      }
    } catch (error) {
      console.error('Error loading billing info:', error);
    }
  };

  const signUp = async (email, password, firstName, lastName, role = 'member') => {
    try {
      console.log('Starting signup process for:', email);
      const { data, error } = await authService.signUp(email, password, firstName, lastName, role);
      
      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }
      
      console.log('Signup successful, user data:', data);
      
      // If user was created and auto-signed in (email confirmation disabled)
      if (data?.user && data.user.email_confirmed_at) {
        console.log('User created and auto-signed in');
        setUser(data.user);
        await loadBillingInfo(data.user.id);
        return { 
          data: { 
            message: 'Account created successfully! You are now signed in.',
            user: data.user,
            needsEmailVerification: false
          }, 
          error: null 
        };
      }
      
      // If user was created but needs email verification
      if (data?.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed');
        return { 
          data: { 
            message: 'Account created successfully! Please check your email to verify your account before signing in.',
            user: data.user,
            needsEmailVerification: true
          }, 
          error: null 
        };
      }
      
      return { 
        data: { 
          message: 'Account created successfully! Please check your email to verify your account.',
          user: data.user 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          return { 
            data: null, 
            error: { 
              message: 'Please check your email and click the verification link before signing in.' 
            } 
          };
        }
        return { data: null, error };
      }
      
      // If sign in successful, set the user
      if (data?.user) {
        setUser(data.user);
        await loadBillingInfo(data.user.id);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      const { error } = await authService.signOut();
      
      if (error) {
        console.error('Error during sign out:', error);
        return { error };
      }
      
      // Clear user state immediately
      setUser(null);
      setBillingInfo({
        plan: 'basic',
        seats: 1,
        usedSeats: 1,
        totalSeats: 1,
        monthlyCost: 20,
        nextBillingDate: null,
        inviteLink: '',
        trialDaysLeft: 14,
        subscriptionStatus: 'trial'
      });
      
      console.log('Sign out successful, user state cleared');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      return { error };
    }
  };

  const inviteUser = async (email, role) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    // Check seat limits for non-master accounts
    if (!isMasterAccount && billingInfo.usedSeats >= billingInfo.totalSeats) {
      return { error: { message: 'No available seats. Please upgrade your plan.' } };
    }

    try {
      // Create invitation record
      const { data, error } = await authService.inviteUser(email, role, user.email);
      
      if (!error) {
        // Generate invite link
        const inviteLink = emailService.generateInviteLink(data.id);
        
        // Send invitation email
        const emailResult = await emailService.sendInvitationEmail(
          email, 
          role, 
          user.email, 
          inviteLink
        );

        if (emailResult.success) {
          // Update used seats count
          setBillingInfo(prev => ({
            ...prev,
            usedSeats: prev.usedSeats + 1
          }));
          
          return { data, error: null };
        } else {
          return { error: { message: 'Failed to send invitation email' } };
        }
      }
      
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const upgradePlan = async (additionalSeats = 1) => {
    if (!user) return { error: { message: 'Not authenticated' } };

    try {
      // Create payment session
      const planData = {
        userId: user.id,
        customerEmail: user.email,
        plan: billingInfo.plan,
        seats: billingInfo.totalSeats + additionalSeats,
        amount: (billingInfo.monthlyCost + (additionalSeats * 9.99)) * 100, // Convert to cents
      };

      const { data, error } = await billingService.createPaymentSession(planData);
      
      if (error) {
        return { error };
      }

      // Redirect to payment page
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error upgrading plan:', error);
      return { error };
    }
  };

  const createPaymentSession = async (planData) => {
    try {
      const { data, error } = await billingService.createPaymentSession(planData);
      return { data, error };
    } catch (error) {
      console.error('Error creating payment session:', error);
      return { data: null, error };
    }
  };

  const getPaymentSession = async (sessionId) => {
    try {
      const { data, error } = await billingService.getPaymentSession(sessionId);
      return { data, error };
    } catch (error) {
      console.error('Error getting payment session:', error);
      return { data: null, error };
    }
  };

  const getPlans = async () => {
    try {
      const { data, error } = await billingService.getPlans();
      return { data, error };
    } catch (error) {
      console.error('Error getting plans:', error);
      return { data: null, error };
    }
  };

  // Role-based access control
  const isMasterAccount = user?.email === 'christopher.hunt86@gmail.com';
  const isAdmin = user?.user_metadata?.role === 'admin' || isMasterAccount;
  const isManager = user?.user_metadata?.role === 'manager';
  const isLeader = user?.user_metadata?.role === 'leader';
  const isMember = user?.user_metadata?.role === 'member';

  // Debug role detection
  console.log('AuthContext - user:', user);
  console.log('AuthContext - user_metadata:', user?.user_metadata);
  console.log('AuthContext - isMasterAccount:', isMasterAccount);
  console.log('AuthContext - isAdmin:', isAdmin);
  console.log('AuthContext - user role from metadata:', user?.user_metadata?.role);

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    inviteUser,
    upgradePlan,
    createPaymentSession,
    getPaymentSession,
    getPlans,
    isAdmin,
    isManager,
    isLeader,
    isMember,
    isMasterAccount,
    billingInfo,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 