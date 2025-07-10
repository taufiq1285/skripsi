// src/routes/index.tsx - UPDATED with Lab & Mata Kuliah Management
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard, PrivateRoute, RoleGuard } from '@/components/guards'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import UserManagement from '@/pages/admin/UserManagement'
import LabManagement from '@/pages/admin/LabManagement'
import MataKuliahManagement from '@/pages/admin/MataKuliahManagement'
import Unauthorized from '@/pages/shared/Unauthorized'

// Role-specific dashboard components
const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Complete system administration control</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">✅ Admin Full Access Confirmed</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• User Management: <strong>FULL ACCESS</strong></div>
              <div>• Lab Management: <strong>FULL ACCESS</strong></div>
              <div>• System Reports: <strong>FULL ACCESS</strong></div>
              <div>• All Role Features: <strong>ACCESSIBLE</strong></div>
            </div>
          </div>
          
          {/* Quick Access to Core Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-300 transition-colors text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">User Management</h3>
              </div>
              <p className="text-sm text-gray-600">Manage all system users with full CRUD operations</p>
              <div className="mt-3 text-xs text-green-600 font-medium">✅ Phase 3 Complete</div>
            </div>
            
            <button
              onClick={() => window.location.href = '/admin/labs'}
              className="p-6 bg-white border-2 border-green-200 rounded-lg hover:border-green-300 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Lab Management</h3>
              </div>
              <p className="text-sm text-gray-600">Configure 9 lab rooms + 1 equipment depot</p>
              <div className="mt-3 text-xs text-blue-600 font-medium">🚀 Phase 4 Ready</div>
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/mata-kuliah'}
              className="p-6 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-300 transition-colors text-left"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Mata Kuliah Management</h3>
              </div>
              <p className="text-sm text-gray-600">Manage courses and assign to lecturers</p>
              <div className="mt-3 text-xs text-blue-600 font-medium">🚀 Phase 4 Ready</div>
            </button>
            
            <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-left opacity-60">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700">Lab Management</h3>
              </div>
              <p className="text-sm text-gray-500">Configure lab rooms and facilities</p>
              <div className="mt-3 text-xs text-yellow-600 font-medium">🔄 Coming Next</div>
            </div>
            
            <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg text-left opacity-60">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700">System Reports</h3>
              </div>
              <p className="text-sm text-gray-500">View system analytics and reports</p>
              <div className="mt-3 text-xs text-yellow-600 font-medium">🔄 Coming Next</div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => {
                console.log('Navigating to /admin/users...')
                window.location.href = '/admin/users'
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 Test User Management
            </button>
            <button
              onClick={() => {
                console.log('Current path:', window.location.pathname)
                console.log('Attempting direct navigation...')
                window.location.replace('/admin/users')
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔧 Debug Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const DosenDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-green-50 border-b px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Dosen Dashboard</h1>
          <p className="text-gray-600">Teaching and student management portal</p>
        </div>
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-2">✅ Dosen Access Confirmed</h3>
            <p className="text-sm text-green-800">Teaching features accessible to education staff.</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const LaboranDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-yellow-50 border-b px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Laboran Dashboard</h1>
          <p className="text-gray-600">Laboratory equipment and inventory management</p>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">✅ Laboran Access Confirmed</h3>
            <p className="text-sm text-yellow-800">Lab management features accessible to lab staff.</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const MahasiswaDashboard = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-purple-50 border-b px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Mahasiswa Dashboard</h1>
          <p className="text-gray-600">Student learning and assignment portal</p>
        </div>
        <div className="p-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">✅ Mahasiswa Access Confirmed</h3>
            <p className="text-sm text-purple-800">Student features accessible to enrolled students.</p>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Create router with updated routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><Navigate to="/dashboard" replace /></AuthGuard>
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      </AuthGuard>
    )
  },
  
  // Admin routes
  {
    path: '/admin',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin']}>
            <AdminDashboard />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  {
    path: '/admin/users',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin']}>
            <UserManagement />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  {
    path: '/admin/labs',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin']}>
            <LabManagement />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  {
    path: '/admin/mata-kuliah',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin']}>
            <MataKuliahManagement />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  
  // Other role routes
  {
    path: '/dosen',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin', 'Dosen']}>
            <DosenDashboard />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  {
    path: '/laboran',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin', 'Laboran']}>
            <LaboranDashboard />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  {
    path: '/mahasiswa',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin', 'Mahasiswa']}>
            <MahasiswaDashboard />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  
  // Error pages
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },
  
  // Catch all route
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
])

// Export router
export { router }