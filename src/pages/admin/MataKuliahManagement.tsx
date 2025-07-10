// src/pages/admin/MataKuliahManagement.tsx
import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal, useModal } from '@/components/ui/Modal'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { MataKuliahForm } from '@/components/forms/MataKuliahForm'
import { databaseService } from '@/lib/supabase/database'
import { useDebounce } from '@/hooks/useDebounce'
import type { MataKuliah, CreateMataKuliahRequest, UpdateMataKuliahRequest, MataKuliahListParams } from '@/types/mataKuliah'
import { RoleGuard } from '@/components/guards'

interface MataKuliahManagementState {
  mataKuliah: MataKuliah[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedStatus: string
  selectedSemester: string
}

const MataKuliahManagement: React.FC = () => {
  // State management
  const [state, setState] = useState<MataKuliahManagementState>({
    mataKuliah: [],
    loading: true,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    selectedStatus: '',
    selectedSemester: ''
  })
  
  const [selectedMataKuliah, setSelectedMataKuliah] = useState<MataKuliah | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal controls
  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()
  const viewModal = useModal()
  const assignModal = useModal()
  
  // Debounced search
  const debouncedSearch = useDebounce(state.searchQuery, 500)

  // Load mata kuliah data
  const loadMataKuliah = async (params?: Partial<MataKuliahListParams>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const queryParams: MataKuliahListParams = {
        page: params?.page || state.currentPage,
        limit: params?.limit || state.pageSize,
        search: params?.search || debouncedSearch || undefined,
        status: params?.status || (state.selectedStatus as any) || undefined,
        semester: params?.semester || (state.selectedSemester ? parseInt(state.selectedSemester) : undefined)
      }

      const response = await databaseService.getMataKuliah(queryParams)
      
      setState(prev => ({
        ...prev,
        mataKuliah: response.data,
        total: response.total,
        currentPage: response.page,
        loading: false
      }))

    } catch (error) {
      console.error('Failed to load mata kuliah:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load mata kuliah'
      }))
    }
  }

  // Effects
  useEffect(() => {
    loadMataKuliah()
  }, [debouncedSearch, state.selectedStatus, state.selectedSemester])

  // Handle create mata kuliah
  const handleCreateMataKuliah = async (mkData: CreateMataKuliahRequest) => {
    try {
      setActionLoading('create')
      await databaseService.createMataKuliah(mkData)
      await loadMataKuliah()
      createModal.closeModal()
      showSuccessNotification('Mata kuliah created successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle update mata kuliah
  const handleUpdateMataKuliah = async (mkData: UpdateMataKuliahRequest) => {
    try {
      setActionLoading('update')
      await databaseService.updateMataKuliah(mkData.id, mkData)
      await loadMataKuliah()
      editModal.closeModal()
      setSelectedMataKuliah(null)
      showSuccessNotification('Mata kuliah updated successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle delete mata kuliah
  const handleDeleteMataKuliah = async () => {
    if (!selectedMataKuliah) return
    
    try {
      setActionLoading('delete')
      await databaseService.deleteMataKuliah(selectedMataKuliah.id)
      await loadMataKuliah()
      deleteModal.closeModal()
      setSelectedMataKuliah(null)
      showSuccessNotification('Mata kuliah deleted successfully')
    } catch (error) {
      console.error('Failed to delete mata kuliah:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Simple notification
  const showSuccessNotification = (message: string) => {
    console.log('Success:', message)
  }

  // Pagination handler
  const handlePaginationChange = (page: number, pageSize: number) => {
    setState(prev => ({ ...prev, currentPage: page, pageSize }))
    loadMataKuliah({ page, limit: pageSize })
  }

  // Search handler
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }))
  }

  // Filter handlers
  const handleStatusFilter = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status, currentPage: 1 }))
  }

  const handleSemesterFilter = (semester: string) => {
    setState(prev => ({ ...prev, selectedSemester: semester, currentPage: 1 }))
  }

  // Get semester badge color
  const getSemesterColor = (semester?: number) => {
    if (!semester) return 'bg-gray-100 text-gray-800'
    if (semester <= 2) return 'bg-green-100 text-green-800'
    if (semester <= 4) return 'bg-blue-100 text-blue-800'
    if (semester <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  // Table columns configuration
  const columns: Column<MataKuliah>[] = [
    {
      key: 'kode_mk',
      title: 'Course Code',
      dataIndex: 'kode_mk',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-purple-600">
              {record.kode_mk.substring(0, 3)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.kode_mk}</div>
            <div className="text-sm text-gray-500">{record.sks} SKS</div>
          </div>
        </div>
      )
    },
    {
      key: 'nama_mk',
      title: 'Course Name',
      dataIndex: 'nama_mk',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.nama_mk}</div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {record.deskripsi || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'semester',
      title: 'Semester',
      dataIndex: 'semester',
      render: (value) => (
        <div className="text-center">
          {value ? (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSemesterColor(value)}`}>
              Semester {value}
            </span>
          ) : (
            <span className="text-gray-400">Not set</span>
          )}
        </div>
      )
    },
    {
      key: 'dosen',
      title: 'Lecturer',
      render: (_, record) => (
        <div>
          {record.dosen ? (
            <div>
              <div className="text-sm font-medium text-gray-900">{record.dosen.full_name}</div>
              <div className="text-xs text-gray-500">{record.dosen.email}</div>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-sm text-gray-400">Not assigned</span>
              <button
                onClick={() => {
                  setSelectedMataKuliah(record)
                  assignModal.openModal()
                }}
                className="block text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Assign Dosen
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'lab_room',
      title: 'Lab Room',
      render: (_, record) => (
        <div>
          {record.lab_room ? (
            <div>
              <div className="text-sm font-medium text-gray-900">{record.lab_room.kode_lab}</div>
              <div className="text-xs text-gray-500">{record.lab_room.nama_lab}</div>
            </div>
          ) : (
            <span className="text-sm text-gray-400">Not assigned</span>
          )}
        </div>
      )
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
      key: 'actions',
      title: 'Actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedMataKuliah(record)
              viewModal.openModal()
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedMataKuliah(record)
              editModal.openModal()
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedMataKuliah(record)
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
        title="Mata Kuliah Management" 
        subtitle="Manage courses and assign lecturers"
      >
        <div className="p-6 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.total}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Courses</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.mataKuliah.filter(mk => mk.status === 'active').length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Assigned Lecturers</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.mataKuliah.filter(mk => mk.dosen_id).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total SKS</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0)} SKS
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Mata Kuliah Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mata Kuliah</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage courses and assign to lecturers and lab rooms
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
                  Add Course
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by course code or name..."
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
                  value={state.selectedSemester}
                  onChange={(e) => handleSemesterFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem.toString()}>Semester {sem}</option>
                  ))}
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
                data={state.mataKuliah}
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

        {/* Create Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.closeModal}
          title="Create New Course"
          size="lg"
        >
          <MataKuliahForm
            onSubmit={handleCreateMataKuliah}
            onCancel={createModal.closeModal}
            loading={actionLoading === 'create'}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.closeModal()
            setSelectedMataKuliah(null)
          }}
          title="Edit Course"
          size="lg"
        >
          <MataKuliahForm
            mataKuliah={selectedMataKuliah}
            onSubmit={handleUpdateMataKuliah}
            onCancel={() => {
              editModal.closeModal()
              setSelectedMataKuliah(null)
            }}
            loading={actionLoading === 'update'}
          />
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={viewModal.isOpen}
          onClose={() => {
            viewModal.closeModal()
            setSelectedMataKuliah(null)
          }}
          title="Course Details"
          size="lg"
        >
          {selectedMataKuliah && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Code</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMataKuliah.kode_mk}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKS</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedMataKuliah.sks} SKS</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Course Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMataKuliah.nama_mk}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedMataKuliah.deskripsi || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Semester</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMataKuliah.semester ? `Semester ${selectedMataKuliah.semester}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedMataKuliah.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMataKuliah.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Lecturer</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMataKuliah.dosen?.full_name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lab Room</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedMataKuliah.lab_room?.nama_lab || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => {
            deleteModal.closeModal()
            setSelectedMataKuliah(null)
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
                <h3 className="font-medium text-red-900">Delete Course</h3>
                <p className="text-sm text-red-700 mt-1">
                  Are you sure you want to delete <strong>{selectedMataKuliah?.nama_mk}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  deleteModal.closeModal()
                  setSelectedMataKuliah(null)
                }}
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteMataKuliah}
                isLoading={actionLoading === 'delete'}
                disabled={actionLoading === 'delete'}
              >
                Delete Course
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  )
}

export default MataKuliahManagement