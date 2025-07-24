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
        } else {
          setUserRole(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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

  const isAdmin = userRole === 'admin'
  const isMember = userRole === 'member'

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isMember,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 