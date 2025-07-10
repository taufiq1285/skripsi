// src/pages/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal, useModal } from '@/components/ui/Modal'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { UserForm } from '@/components/forms/UserForm'
import { databaseService } from '@/lib/supabase/database'
import { useDebounce } from '@/hooks/useDebounce'
import type { User, CreateUserRequest, UpdateUserRequest, UserListParams } from '@/types/user'
import { RoleGuard } from '@/components/guards'

interface UserManagementState {
  users: User[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedRole: string
  selectedStatus: string
}

const UserManagement: React.FC = () => {
  // State management
  const [state, setState] = useState<UserManagementState>({
    users: [],
    loading: true,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    selectedRole: '',
    selectedStatus: ''
  })
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal controls
  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()
  
  // Debounced search
  const debouncedSearch = useDebounce(state.searchQuery, 500)

  // Load users data
  const loadUsers = async (params?: Partial<UserListParams>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const queryParams: UserListParams = {
        page: params?.page || state.currentPage,
        limit: params?.limit || state.pageSize,
        search: params?.search || debouncedSearch || undefined,
        role: params?.role || (state.selectedRole as any) || undefined,
        status: params?.status || (state.selectedStatus as any) || undefined
      }

      const response = await databaseService.getUsers(queryParams)
      
      setState(prev => ({
        ...prev,
        users: response.data,
        total: response.total,
        currentPage: response.page,
        loading: false
      }))

    } catch (error) {
      console.error('Failed to load users:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load users'
      }))
    }
  }

  // Effects
  useEffect(() => {
    loadUsers()
  }, [debouncedSearch, state.selectedRole, state.selectedStatus])

  // Handle create user
  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      setActionLoading('create')
      await databaseService.createUser(userData)
      await loadUsers()
      createModal.closeModal()
      showSuccessNotification('User created successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle update user
  const handleUpdateUser = async (userData: UpdateUserRequest) => {
    try {
      setActionLoading('update')
      await databaseService.updateUser(userData.id, userData)
      await loadUsers()
      editModal.closeModal()
      setSelectedUser(null)
      showSuccessNotification('User updated successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setActionLoading('delete')
      await databaseService.deleteUser(selectedUser.id)
      await loadUsers()
      deleteModal.closeModal()
      setSelectedUser(null)
      showSuccessNotification('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      // Show error notification
    } finally {
      setActionLoading(null)
    }
  }

  // Simple notification (replace with proper toast system later)
  const showSuccessNotification = (message: string) => {
    // For now, just console log - can be replaced with toast library
    console.log('Success:', message)
  }

  // Pagination handler
  const handlePaginationChange = (page: number, pageSize: number) => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }))
    loadUsers({ page, limit: pageSize })
  }

  // Search handler
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }))
  }

  // Filter handlers
  const handleRoleFilter = (role: string) => {
    setState(prev => ({ ...prev, selectedRole: role, currentPage: 1 }))
  }

  const handleStatusFilter = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status, currentPage: 1 }))
  }

  // Table columns configuration
  const columns: Column<User>[] = [
    {
      key: 'full_name',
      title: 'Name',
      dataIndex: 'full_name',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {record.full_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.full_name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      dataIndex: 'role',
      render: (value) => {
        const roleColors: Record<string, string> = {
          admin: 'bg-blue-100 text-blue-800',
          dosen: 'bg-green-100 text-green-800',
          laboran: 'bg-yellow-100 text-yellow-800',
          mahasiswa: 'bg-purple-100 text-purple-800'
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        )
      }
    },
    {
      key: 'nim_nip',
      title: 'NIM/NIP',
      dataIndex: 'nim_nip',
      render: (value) => (
        <span className="font-mono text-sm">
          {value || '-'}
        </span>
      )
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (value) => value || '-'
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'lab_room',
      title: 'Lab Room',
      render: (_, record) => (
        record.lab_room ? (
          <span className="text-sm">
            {record.lab_room.kode_lab}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedUser(record)
              editModal.openModal()
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedUser(record)
              deleteModal.openModal()
            }}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  return (
    <RoleGuard allowedRoles={['Admin']}>
      <DashboardLayout 
        title="User Management" 
        subtitle="Manage system users and their permissions"
      >
        <div className="p-6 space-y-6">
          
          {/* Header with Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage all system users: Admin, Dosen, Laboran, and Mahasiswa
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                  onClick={createModal.openModal}
                >
                  Add User
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, or NIM/NIP..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                </div>
                
                <select
                  value={state.selectedRole}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="dosen">Dosen</option>
                  <option value="laboran">Laboran</option>
                  <option value="mahasiswa">Mahasiswa</option>
                </select>
                
                <select
                  value={state.selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700">{state.error}</span>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <DataTable
                columns={columns}
                data={state.users}
                loading={state.loading}
                pagination={{
                  current: state.currentPage,
                  pageSize: state.pageSize,
                  total: state.total,
                  onChange: handlePaginationChange
                }}
                rowKey="id"
              />
            </CardContent>
          </Card>
        </div>

        {/* Create User Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.closeModal}
          title="Create New User"
          size="lg"
        >
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={createModal.closeModal}
            loading={actionLoading === 'create'}
          />
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.closeModal()
            setSelectedUser(null)
          }}
          title="Edit User"
          size="lg"
        >
          <UserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            onCancel={() => {
              editModal.closeModal()
              setSelectedUser(null)
            }}
            loading={actionLoading === 'update'}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.closeModal()
            setSelectedUser(null)
          }}
          title="Confirm Delete"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="font-medium text-red-900">Delete User</h3>
                <p className="text-sm text-red-700 mt-1">
                  Are you sure you want to delete <strong>{selectedUser?.full_name}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  deleteModal.closeModal()
                  setSelectedUser(null)
                }}
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                isLoading={actionLoading === 'delete'}
                disabled={actionLoading === 'delete'}
              >
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  )
}

export default UserManagement