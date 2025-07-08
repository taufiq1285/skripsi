import { useState } from 'react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Test credentials dengan role mapping yang benar
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check credentials against our test users
      const validCredential = testCredentials.find(
        cred => cred.email === email && cred.password === password
      )

      if (validCredential) {
        // Simulate successful login
        console.log('✅ Login successful:', validCredential)
        
        // Store user info in localStorage dengan role yang benar
        const userSession = {
          email: validCredential.email,
          role: validCredential.role,
          name: validCredential.name,
          isAuthenticated: true,
          loginTime: new Date().toISOString()
        }
        
        localStorage.setItem('currentUser', JSON.stringify(userSession))
        console.log('Stored user session:', userSession) // Debug log

        // Small delay for better UX
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    }

    setLoading(false)
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
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
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
                  className="text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border transition-colors duration-200"
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
        </div>
      </div>
    </div>
  )
}

export default Login
