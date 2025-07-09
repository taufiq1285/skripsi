// src/pages/shared/Unauthorized.tsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface UnauthorizedProps {
  requiredRoles?: string[]
  message?: string
}

const Unauthorized: React.FC<UnauthorizedProps> = ({ 
  requiredRoles = [],
  message 
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const getRoleInfo = (role: string) => {
    const roleMap: Record<string, { color: string; description: string }> = {
      'Admin': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Full system administration access'
      },
      'Dosen': { 
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Teaching and student management'
      },
      'Laboran': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        description: 'Laboratory equipment management'
      },
      'Mahasiswa': { 
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        description: 'Student learning portal'
      }
    }
    return roleMap[role] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      description: 'Unknown role'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              {message || 'You don\'t have permission to access this resource'}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            
            {/* Attempted Access Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Access Attempt Details:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested Page:</span>
                  <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {location.pathname}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-gray-900">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Email:</span>
                  <span className="text-gray-900">
                    {user?.email || 'Not authenticated'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Role:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${
                    user?.role ? getRoleInfo(user.role).color : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {user?.role || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Required Roles */}
            {requiredRoles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Roles:</h3>
                <div className="space-y-2">
                  {requiredRoles.map((role, index) => {
                    const roleInfo = getRoleInfo(role)
                    const hasRole = user?.role === role
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            hasRole ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <div className={`text-sm font-medium px-2 py-1 rounded border ${roleInfo.color}`}>
                              {role}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {roleInfo.description}
                            </div>
                          </div>
                        </div>
                        {hasRole && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Your Role
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* What You Can Do */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">What you can do:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Contact your administrator to request access</li>
                <li>• Return to dashboard and use available features</li>
                <li>• Log in with a different account that has proper permissions</li>
                {user?.role && (
                  <li>• Check available features for {user.role} role</li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Go to Dashboard
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Go Back
                </button>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Switch User
                </button>
              </div>
            </div>

            {/* Auto Redirect Notice */}
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-yellow-800">
                  You will be redirected to dashboard automatically in 10 seconds
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Contact system administrator
          </p>
          <div className="text-xs text-gray-400">
            Akbid Mega Buana - Sistem Informasi Praktikum
          </div>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized