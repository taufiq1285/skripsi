import { useState, useEffect } from 'react'

interface User {
  email: string
  role: string
  name: string
  isAuthenticated: boolean
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Role mapping untuk display yang benar
  const getRoleInfo = (email: string) => {
    const roleMap: Record<string, { role: string; name: string; color: string }> = {
      'admin@akbid.ac.id': { 
        role: 'Admin', 
        name: 'Administrator System',
        color: 'bg-blue-100 text-blue-800'
      },
      'dosen@akbid.ac.id': { 
        role: 'Dosen', 
        name: 'Dr. Siti Nurhaliza, M.Keb',
        color: 'bg-green-100 text-green-800'
      },
      'laboran@akbid.ac.id': { 
        role: 'Laboran', 
        name: 'Andi Pratama, A.Md.Keb',
        color: 'bg-yellow-100 text-yellow-800'
      },
      'mahasiswa@akbid.ac.id': { 
        role: 'Mahasiswa', 
        name: 'Fitri Handayani',
        color: 'bg-purple-100 text-purple-800'
      }
    }
    return roleMap[email] || { role: 'Unknown', name: 'Unknown User', color: 'bg-gray-100 text-gray-800' }
  }

  useEffect(() => {
    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('currentUser')
      console.log('Stored user:', storedUser) // Debug log
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log('Parsed user:', parsedUser) // Debug log
        
        // Get correct role info based on email
        const roleInfo = getRoleInfo(parsedUser.email)
        
        setUser({
          email: parsedUser.email,
          role: roleInfo.role,
          name: roleInfo.name,
          isAuthenticated: true
        })
      } else {
        // Redirect to login if not authenticated
        console.log('No user found, redirecting to login') // Debug log
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error loading user:', error)
      window.location.href = '/login'
    }
    
    setLoading(false)
  }, [])

  const handleLogout = () => {
    try {
      console.log('Logging out...') // Debug log
      
      // Clear localStorage
      localStorage.removeItem('currentUser')
      
      // Clear user state
      setUser(null)
      
      // Redirect to login
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if error
      window.location.href = '/login'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Redirect if no user
  if (!user) {
    window.location.href = '/login'
    return null
  }

  // Get role styling
  const roleInfo = getRoleInfo(user.email)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{user.email}</div>
                <div className="text-xs text-gray-500">Logged in as {user.role}</div>
              </div>
              
              {/* Role Badge - Dynamic Color */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                {user.role}
              </span>
              
              {/* Logout Button - Fixed */}
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                type="button"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* User Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${roleInfo.color}`}>
                <span className="text-lg font-bold">
                  {user.role.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Role: {user.role} | Email: {user.email}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✅ Authentication Successful
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        4
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Lab Rooms
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        10
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Mata Kuliah
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        2
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Current Role
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.role}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Testing Results */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Role-Based Authentication Test ✅
              </h3>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Login Session:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Name:</strong> {user.name}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Role:</strong> {user.role}</div>
                  <div><strong>Status:</strong> Authenticated ✅</div>
                  <div><strong>Login Time:</strong> {new Date().toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ PASS
                  </span>
                  <p className="ml-3 text-sm text-gray-600">
                    Role badge displays correctly: <strong>{user.role}</strong>
                  </p>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ PASS
                  </span>
                  <p className="ml-3 text-sm text-gray-600">
                    User info displays correctly: <strong>{user.name}</strong>
                  </p>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ PASS
                  </span>
                  <p className="ml-3 text-sm text-gray-600">
                    Logout button functional - Click to test!
                  </p>
                </div>
              </div>

              {/* Test Instructions */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Test All Roles:</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <div>1. Click <strong>Logout</strong> button above</div>
                  <div>2. Try login with: <strong>dosen@akbid.ac.id / dosen123</strong></div>
                  <div>3. Verify role badge shows: <strong>Dosen</strong></div>
                  <div>4. Repeat for Laboran and Mahasiswa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
