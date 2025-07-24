import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../lib/supabaseService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [billingInfo, setBillingInfo] = useState({
    plan: 'basic',
    seats: 1,
    usedSeats: 0,
    totalSeats: 1,
    monthlyCost: 20,
    nextBillingDate: null,
    inviteLink: null
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session } = await authService.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        
        // Get user role from metadata or default to 'member'
        if (session?.user) {
          const role = session.user.user_metadata?.role || 'member'
          setUserRole(role)
          
          // Load billing info for admins
          if (role === 'admin') {
            await loadBillingInfo(session.user.id)
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Get user role from metadata or default to 'member'
        if (session?.user) {
          const role = session.user.user_metadata?.role || 'member'
          setUserRole(role)
          
          // Load billing info for admins
          if (role === 'admin') {
            await loadBillingInfo(session.user.id)
          }
        } else {
          setUserRole(null)
          setBillingInfo({
            plan: 'basic',
            seats: 1,
            usedSeats: 0,
            totalSeats: 1,
            monthlyCost: 20,
            nextBillingDate: null,
            inviteLink: null
          })
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadBillingInfo = async (userId) => {
    try {
      // This would typically fetch from your billing service
      // For now, we'll simulate the billing data
      const billingData = {
        plan: 'basic',
        seats: 1,
        usedSeats: 1, // Current admin
        totalSeats: 1,
        monthlyCost: 20,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        inviteLink: `${window.location.origin}/invite/${userId}`
      }
      setBillingInfo(billingData)
    } catch (error) {
      console.error('Error loading billing info:', error)
    }
  }

  const signUp = async (email, password, firstName, lastName, role = 'member') => {
    try {
      const { data, error } = await authService.signUp(email, password, firstName, lastName, role)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await authService.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await authService.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const inviteUser = async (email, role = 'member') => {
    try {
      // Check if we have available seats
      if (billingInfo.usedSeats >= billingInfo.totalSeats) {
        throw new Error('No available seats. Please upgrade your plan.')
      }

      // Generate invitation
      const { data, error } = await authService.inviteUser(email, role, user.id)
      if (error) throw error

      // Update billing info
      setBillingInfo(prev => ({
        ...prev,
        usedSeats: prev.usedSeats + 1
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const upgradePlan = async (additionalSeats) => {
    try {
      const newTotalSeats = billingInfo.totalSeats + additionalSeats
      const additionalCost = additionalSeats * 9.99
      const newMonthlyCost = 20 + additionalCost

      // This would typically update your billing service
      const updatedBilling = {
        ...billingInfo,
        totalSeats: newTotalSeats,
        monthlyCost: newMonthlyCost
      }

      setBillingInfo(updatedBilling)
      return { data: updatedBilling, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const isAdmin = userRole === 'admin'
  const isMember = userRole === 'member'
  const isManager = userRole === 'manager'
  const isLeader = userRole === 'leader'

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isMember,
    isManager,
    isLeader,
    billingInfo,
    signUp,
    signIn,
    signOut,
    inviteUser,
    upgradePlan,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 