// src/routes/index.tsx - FIXED VERSION
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard, PrivateRoute, RoleGuard } from '@/components/guards'
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">✅ Admin Full Access Confirmed</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>• User Management: <strong>FULL ACCESS</strong></div>
              <div>• Lab Management: <strong>FULL ACCESS</strong></div>
              <div>• System Reports: <strong>FULL ACCESS</strong></div>
              <div>• All Role Features: <strong>ACCESSIBLE</strong></div>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Dashboard
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

// FIXED: Create router as variable first, then export
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
  
  // Role-based routes with enhanced guards
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
    path: '/dosen',
    element: (
      <AuthGuard>
        <PrivateRoute>
          <RoleGuard allowedRoles={['Admin', 'Dosen']}> {/* Admin can also access */}
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
          <RoleGuard allowedRoles={['Admin', 'Laboran']}> {/* Admin can also access */}
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
          <RoleGuard allowedRoles={['Admin', 'Mahasiswa']}> {/* Admin can also access */}
            <MahasiswaDashboard />
          </RoleGuard>
        </PrivateRoute>
      </AuthGuard>
    )
  },
  
  // Unauthorized page
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

// FIXED: Explicit export statement
export { router }