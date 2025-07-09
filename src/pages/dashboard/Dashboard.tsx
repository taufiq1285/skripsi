// src/pages/dashboard/Dashboard.tsx - Enhanced with UI Components
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal, useModal } from '@/components/ui/Modal'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  if (!user) return null

  const getRoleInfo = (role: string) => {
    const roleMap: Record<string, { color: string; description: string; permissions: string[] }> = {
      'Admin': { 
        color: 'bg-blue-100 text-blue-800',
        description: 'Full system access',
        permissions: ['Manage Users', 'System Reports', 'Lab Management', 'All Features']
      },
      'Dosen': { 
        color: 'bg-green-100 text-green-800',
        description: 'Teaching and evaluation',
        permissions: ['Manage Jadwal', 'View Laporan', 'Grade Students', 'Manage Materi']
      },
      'Laboran': { 
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Lab equipment management',
        permissions: ['Manage Inventaris', 'Approve Peminjaman', 'Lab Maintenance', 'Stock Management']
      },
      'Mahasiswa': { 
        color: 'bg-purple-100 text-purple-800',
        description: 'Student access',
        permissions: ['View Jadwal', 'Submit Laporan', 'View Grades', 'Download Materi']
      }
    }
    return roleMap[role] || { color: 'bg-gray-100 text-gray-800', description: 'Unknown', permissions: [] }
  }

  const roleInfo = getRoleInfo(user.role)

  // Quick access items based on role
  const getQuickAccessItems = () => {
    switch (user.role) {
      case 'Admin':
        return [
          { label: 'User Management', href: '/admin', icon: '👥', color: 'bg-blue-500' },
          { label: 'System Reports', href: '/admin/reports', icon: '📊', color: 'bg-green-500' },
          { label: 'Lab Settings', href: '/admin/labs', icon: '⚙️', color: 'bg-purple-500' }
        ]
      case 'Dosen':
        return [
          { label: 'Mata Kuliah', href: '/dosen/subjects', icon: '📚', color: 'bg-green-500' },
          { label: 'Jadwal Praktikum', href: '/dosen/schedule', icon: '📅', color: 'bg-blue-500' },
          { label: 'Presensi', href: '/dosen/attendance', icon: '✅', color: 'bg-yellow-500' }
        ]
      case 'Laboran':
        return [
          { label: 'Inventaris Alat', href: '/laboran/inventory', icon: '🔧', color: 'bg-yellow-500' },
          { label: 'Peminjaman', href: '/laboran/borrowing', icon: '📋', color: 'bg-blue-500' },
          { label: 'Maintenance', href: '/laboran/maintenance', icon: '🛠️', color: 'bg-red-500' }
        ]
      case 'Mahasiswa':
        return [
          { label: 'Jadwal Praktikum', href: '/mahasiswa/schedule', icon: '📅', color: 'bg-purple-500' },
          { label: 'Upload Laporan', href: '/mahasiswa/reports', icon: '📄', color: 'bg-green-500' },
          { label: 'Nilai & Presensi', href: '/mahasiswa/grades', icon: '🎓', color: 'bg-blue-500' }
        ]
      default:
        return []
    }
  }

  const quickAccessItems = getQuickAccessItems()

  return (
    <DashboardLayout 
      title="Dashboard" 
      subtitle={`Welcome back, ${user.name}`}
    >
      <div className="p-6 space-y-6">
        
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${roleInfo.color}`}>
                  <span className="text-2xl font-bold">
                    {user.role.charAt(0)}
                  </span>
                </div>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <p className="text-gray-600">{roleInfo.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>📧 {user.email}</span>
                    <span>🕒 {new Date(user.loginTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your Permissions:</p>
              <div className="flex flex-wrap gap-2">
                {roleInfo.permissions.map((permission, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <p className="text-gray-600">Frequently used features for your role</p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickAccessItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-4 flex flex-col items-center space-y-2 border border-gray-200 hover:border-gray-300"
                  onClick={() => navigate(item.href)}
                >
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Navigation */}
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Test</CardTitle>
            <p className="text-gray-600">Test role-based routing by accessing different role pages</p>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/admin')}
              >
                <div className="text-blue-600 font-medium">Admin</div>
                <div className="text-xs text-gray-500">Full Access</div>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/dosen')}
              >
                <div className="text-green-600 font-medium">Dosen</div>
                <div className="text-xs text-gray-500">Teaching</div>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/laboran')}
              >
                <div className="text-yellow-600 font-medium">Laboran</div>
                <div className="text-xs text-gray-500">Lab Management</div>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={() => navigate('/mahasiswa')}
              >
                <div className="text-purple-600 font-medium">Mahasiswa</div>
                <div className="text-xs text-gray-500">Student Portal</div>
              </Button>
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="w-full p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Current Role:</strong> {user.role} - You can access pages based on your role permissions.
              </p>
            </div>
          </CardFooter>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover>
            <CardContent className="p-6">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">4</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Lab Rooms</dt>
                    <dd className="text-lg font-medium text-gray-900">10</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Mata Kuliah</dt>
                    <dd className="text-lg font-medium text-gray-900">2</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Your Role</dt>
                    <dd className="text-lg font-medium text-gray-900">{user.role}</dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* UI Components Demo */}
        <Card>
          <CardHeader>
            <CardTitle>UI Components Demo</CardTitle>
            <p className="text-gray-600">Test the new UI components functionality</p>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              
              {/* Button Variants */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Button Variants:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="success" size="sm">Success</Button>
                  <Button variant="warning" size="sm">Warning</Button>
                  <Button variant="danger" size="sm">Danger</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                </div>
              </div>

              {/* Modal Demo */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Modal Component:</h4>
                <Button onClick={openModal} variant="primary">
                  Open Modal Demo
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Day 12-14 Validation */}
        <Card>
          <CardHeader>
            <CardTitle>🎨 Day 12-14: UI Foundation - Complete!</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 mb-3">✅ UI Components</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Button: <strong>8 variants + loading states</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Input: <strong>Validation + icons</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Modal: <strong>Portal + keyboard nav</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Card: <strong>Multiple variants</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 mb-3">✅ Layout System</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Header: <strong>User menu + responsive</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Sidebar: <strong>Role-based navigation</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Dashboard Layout: <strong>Mobile responsive</strong></span>
                  </div>
                  <div className="flex items-center p-2 bg-green-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Integration: <strong>All components working</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Demo */}
      <Modal isOpen={isOpen} onClose={closeModal} title="UI Components Demo">
        <div className="space-y-4">
          <p>This modal demonstrates the UI foundation components working together:</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample Input Field
              </label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type something here..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button variant="primary" onClick={closeModal}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default Dashboard