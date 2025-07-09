// src/pages/auth/Login.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface LocationState {
  from?: {
    pathname: string
  }
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError, user } = useAuth()
  
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState

  // Test credentials
  const testCredentials = [
    { 
      email: 'admin@akbid.ac.id', 
      password: 'admin123', 
      role: 'Admin',
      name: 'Administrator System'
    },
    { 
      email: 'dosen@akbid.ac.id', 
      password: 'dosen123', 
      role: 'Dosen',
      name: 'Dr. Siti Nurhaliza, M.Keb'
    },
    { 
      email: 'laboran@akbid.ac.id', 
      password: 'laboran123', 
      role: 'Laboran',
      name: 'Andi Pratama, A.Md.Keb'
    },
    { 
      email: 'mahasiswa@akbid.ac.id', 
      password: 'mahasiswa123', 
      role: 'Mahasiswa',
      name: 'Fitri Handayani'
    }
  ]

  // Redirect if already authenticated
  useEffect(() => {
    if (user?.isAuthenticated) {
      const from = state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, state?.from?.pathname])

  // Clear error when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [email, password, clearError])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      return
    }

    try {
      const result = await login(email.trim(), password)
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...')
        
        // Determine redirect path based on role or previous location
        const from = state?.from?.pathname || '/dashboard'
        
        // Small delay for better UX
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 100)
      }
      // Error is handled by the useAuth hook
    } catch (err) {
      console.error('❌ Login submission error:', err)
    }
  }

  const quickLogin = (credential: typeof testCredentials[0]) => {
    setEmail(credential.email)
    setPassword(credential.password)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Akbid Lab System
            </h2>
            <p className="text-gray-600 mb-8">
              Sistem Informasi Praktikum
            </p>
            {state?.from && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  Please log in to access {state.from.pathname}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                placeholder="Enter your email"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3 text-center">
              Quick Login (Click to fill credentials):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {testCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => quickLogin(cred)}
                  disabled={loading}
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Test Credentials:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <div><strong>Admin:</strong> admin@akbid.ac.id / admin123</div>
              <div><strong>Dosen:</strong> dosen@akbid.ac.id / dosen123</div>
              <div><strong>Laboran:</strong> laboran@akbid.ac.id / laboran123</div>
              <div><strong>Mahasiswa:</strong> mahasiswa@akbid.ac.id / mahasiswa123</div>
            </div>
          </div>

          {/* Phase 2 Status */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">🔐 Phase 2: Auth Core ✅</p>
            <div className="space-y-1 text-xs text-green-700">
              <div>✅ useAuth hook implemented</div>
              <div>✅ Direct hook usage (no context)</div>
              <div>✅ Login/logout functional</div>
              <div>✅ Session persistence enabled</div>
              <div>✅ Role detection working</div>
              <div>✅ Error handling implemented</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login