// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role: string
  name: string
  isAuthenticated: boolean
  loginTime: string
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  clearError: () => void
  refreshAuth: () => Promise<void>
}

type UseAuthReturn = AuthState & AuthActions

// Role mapping for test users
const TEST_USERS = {
  'admin@akbid.ac.id': { 
    role: 'Admin', 
    name: 'Administrator System',
    password: 'admin123'
  },
  'dosen@akbid.ac.id': { 
    role: 'Dosen', 
    name: 'Dr. Siti Nurhaliza, M.Keb',
    password: 'dosen123'
  },
  'laboran@akbid.ac.id': { 
    role: 'Laboran', 
    name: 'Andi Pratama, A.Md.Keb',
    password: 'laboran123'
  },
  'mahasiswa@akbid.ac.id': { 
    role: 'Mahasiswa', 
    name: 'Fitri Handayani',
    password: 'mahasiswa123'
  }
} as const

const STORAGE_KEY = 'akbid_auth_user'

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Helper function to create AuthUser from test data
  const createAuthUser = useCallback((email: string): AuthUser => {
    const testUser = TEST_USERS[email as keyof typeof TEST_USERS]
    return {
      id: `test_${email.split('@')[0]}`,
      email,
      role: testUser.role,
      name: testUser.name,
      isAuthenticated: true,
      loginTime: new Date().toISOString()
    }
  }, [])

  // Load user from localStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))
        
        // Check localStorage first
        const storedUser = localStorage.getItem(STORAGE_KEY)
        if (storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser)
          
          // Validate stored user data
          if (parsedUser.email && parsedUser.role && parsedUser.isAuthenticated) {
            console.log('✅ Auth: Loaded user from storage:', parsedUser.email)
            setState(prev => ({
              ...prev,
              user: parsedUser,
              loading: false
            }))
            return
          }
        }

        // Try Supabase session (for future implementation)
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('⚠️ Auth: Supabase session error:', error.message)
        }

        setState(prev => ({
          ...prev,
          session,
          loading: false
        }))

      } catch (error) {
        console.error('❌ Auth: Error loading stored auth:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load authentication state'
        }))
      }
    }

    loadStoredAuth()
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Validate test credentials
      const testUser = TEST_USERS[email as keyof typeof TEST_USERS]
      if (!testUser) {
        setState(prev => ({ ...prev, loading: false, error: 'Invalid email address' }))
        return { success: false, error: 'Invalid email address' }
      }

      if (testUser.password !== password) {
        setState(prev => ({ ...prev, loading: false, error: 'Invalid password' }))
        return { success: false, error: 'Invalid password' }
      }

      // Create authenticated user
      const authUser = createAuthUser(email)
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
      
      console.log('✅ Auth: Login successful for:', email, 'Role:', authUser.role)
      
      setState(prev => ({
        ...prev,
        user: authUser,
        loading: false,
        error: null
      }))

      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      console.error('❌ Auth: Login error:', error)
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      return { success: false, error: errorMessage }
    }
  }, [createAuthUser])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY)
      
      // Sign out from Supabase (for future)
      await supabase.auth.signOut()
      
      console.log('✅ Auth: Logout successful')
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('❌ Auth: Logout error:', error)
      
      // Force clear state even if error
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Refresh auth state
  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        const parsedUser: AuthUser = JSON.parse(storedUser)
        setState(prev => ({
          ...prev,
          user: parsedUser,
          loading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          loading: false
        }))
      }
    } catch (error) {
      console.error('❌ Auth: Refresh error:', error)
      setState(prev => ({
        ...prev,
        user: null,
        loading: false
      }))
    }
  }, [])

  return {
    ...state,
    login,
    logout,
    clearError,
    refreshAuth
  }
}