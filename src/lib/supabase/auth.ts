// src/lib/supabase/auth.ts
import { supabase } from './client'
import type { User, Session, AuthError } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  metadata?: {
    full_name?: string
    role?: string
  }
}

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn({ email, password }: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Auth Service: Sign in error:', error.message)
        return { user: null, session: null, error }
      }

      console.log('✅ Auth Service: Sign in successful:', email)
      return { user: data.user, session: data.session, error: null }

    } catch (error) {
      console.error('❌ Auth Service: Sign in exception:', error)
      return { 
        user: null, 
        session: null, 
        error: error as AuthError 
      }
    }
  }

  /**
   * Sign up new user
   */
  async signUp({ email, password, metadata }: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        console.error('❌ Auth Service: Sign up error:', error.message)
        return { user: null, session: null, error }
      }

      console.log('✅ Auth Service: Sign up successful:', email)
      return { user: data.user, session: data.session, error: null }

    } catch (error) {
      console.error('❌ Auth Service: Sign up exception:', error)
      return { 
        user: null, 
        session: null, 
        error: error as AuthError 
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Auth Service: Sign out error:', error.message)
        return { error }
      }

      console.log('✅ Auth Service: Sign out successful')
      return { error: null }

    } catch (error) {
      console.error('❌ Auth Service: Sign out exception:', error)
      return { error: error as AuthError }
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ Auth Service: Get session error:', error.message)
        return { session: null, error }
      }

      return { session: data.session, error: null }

    } catch (error) {
      console.error('❌ Auth Service: Get session exception:', error)
      return { session: null, error: error as AuthError }
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ Auth Service: Get user error:', error.message)
        return { user: null, error }
      }

      return { user: data.user, error: null }

    } catch (error) {
      console.error('❌ Auth Service: Get user exception:', error)
      return { user: null, error: error as AuthError }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Test authentication system
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.getSession()
      
      if (error) {
        console.error('❌ Auth Service: Connection test failed:', error.message)
        return false
      }

      console.log('✅ Auth Service: Connection test successful')
      return true

    } catch (error) {
      console.error('❌ Auth Service: Connection test exception:', error)
      return false
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export for testing
export { AuthService }