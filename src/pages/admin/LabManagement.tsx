// src/pages/admin/LabManagement.tsx
import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal, useModal } from '@/components/ui/Modal'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { LabForm } from '@/components/forms/LabForm'
import { labService } from '@/lib/services/labService'
import { useDebounce } from '@/hooks/useDebounce'
import type { LabRoom, CreateLabRequest, UpdateLabRequest, LabListParams } from '@/types/lab'
import { RoleGuard } from '@/components/guards'

interface LabManagementState {
  labs: LabRoom[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedStatus: string
}

const LabManagement: React.FC = () => {
  // State management
  const [state, setState] = useState<LabManagementState>({
    labs: [],
    loading: true,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    selectedStatus: ''
  })
  
  const [selectedLab, setSelectedLab] = useState<LabRoom | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal controls
  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()
  const viewModal = useModal()
  
  // Debounced search
  const debouncedSearch = useDebounce(state.searchQuery, 500)

  // Load labs data
  const loadLabs = async (params?: Partial<LabListParams>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const queryParams: LabListParams = {
        page: params?.page || state.currentPage,
        limit: params?.limit || state.pageSize,
        search: params?.search || debouncedSearch || undefined,
        status: params?.status || (state.selectedStatus as any) || undefined
      }

      const response = await labService.getLabs(queryParams)
      
      setState(prev => ({
        ...prev,
        labs: response.data,
        total: response.total,
        currentPage: response.page,
        loading: false
      }))

    } catch (error) {
      console.error('Failed to load labs:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load labs'
      }))
    }
  }

  // Effects
  useEffect(() => {
    loadLabs()
  }, [debouncedSearch, state.selectedStatus])

  // Handle create lab
  const handleCreateLab = async (labData: CreateLabRequest) => {
    try {
      setActionLoading('create')
      await labService.createLab(labData)
      await loadLabs()
      createModal.closeModal()
      showSuccessNotification('Lab room created successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle update lab
  const handleUpdateLab = async (labData: UpdateLabRequest) => {
    try {
      setActionLoading('update')
      await labService.updateLab(labData.id, labData)
      await loadLabs()
      editModal.closeModal()
      setSelectedLab(null)
      showSuccessNotification('Lab room updated successfully')
    } catch (error) {
      throw error // Let form handle the error
    } finally {
      setActionLoading(null)
    }
  }

  // Handle delete lab
  const handleDeleteLab = async () => {
    if (!selectedLab) return
    
    try {
      setActionLoading('delete')
      await labService.deleteLab(selectedLab.id)
      await loadLabs()
      deleteModal.closeModal()
      setSelectedLab(null)
      showSuccessNotification('Lab room deleted successfully')
    } catch (error) {
      console.error('Failed to delete lab:', error)
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
    loadLabs({ page, limit: pageSize })
  }

  // Search handler
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }))
  }

  // Status filter handler
  const handleStatusFilter = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status, currentPage: 1 }))
  }

  // Table columns configuration
  const columns: Column<LabRoom>[] = [
    {
      key: 'kode_lab',
      title: 'Lab Code',
      dataIndex: 'kode_lab',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">
              {record.kode_lab.split('-')[1]?.substring(0, 2) || record.kode_lab.substring(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{record.kode_lab}</div>
            <div className="text-sm text-gray-500">{record.lokasi}</div>
          </div>
        </div>
      )
    },
    {
      key: 'nama_lab',
      title: 'Lab Name',
      dataIndex: 'nama_lab',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.nama_lab}</div>
          <div className="text-sm text-gray-500 line-clamp-2">
            {record.deskripsi || 'No description'}
          </div>
        </div>
      )
    },
    {
      key: 'kapasitas',
      title: 'Capacity',
      dataIndex: 'kapasitas',
      render: (value) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value} students
          </span>
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
      key: 'mata_kuliah_count',
      title: 'Courses',
      render: (_, record) => (
        <div className="text-center">
          <span className="text-sm text-gray-600">
            {record.mata_kuliah_count || 0} courses
          </span>
        </div>
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
              setSelectedLab(record)
              viewModal.openModal()
            }}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedLab(record)
              editModal.openModal()
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedLab(record)
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
        title="Lab Management" 
        subtitle="Manage laboratory rooms and facilities"
      >
        <div className="p-6 space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8-2a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Labs</dt>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Labs</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.labs.filter(lab => lab.status === 'active').length}
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
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Capacity</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.labs.reduce((sum, lab) => sum + (lab.kapasitas || 0), 0)} students
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
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Specialized Labs</dt>
                      <dd className="text-lg font-medium text-gray-900">9</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Lab Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Laboratory Rooms</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage 9 specialized lab rooms + 1 equipment depot
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
                  Add Lab Room
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by lab code, name, or location..."
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
                data={state.labs}
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

        {/* Create Lab Modal */}
        <Modal
          isOpen={createModal.isOpen}
          onClose={createModal.closeModal}
          title="Create New Lab Room"
          size="lg"
        >
          <LabForm
            onSubmit={handleCreateLab}
            onCancel={createModal.closeModal}
            loading={actionLoading === 'create'}
          />
        </Modal>

        {/* Edit Lab Modal */}
        <Modal
          isOpen={editModal.isOpen}
          onClose={() => {
            editModal.closeModal()
            setSelectedLab(null)
          }}
          title="Edit Lab Room"
          size="lg"
        >
          <LabForm
            lab={selectedLab}
            onSubmit={handleUpdateLab}
            onCancel={() => {
              editModal.closeModal()
              setSelectedLab(null)
            }}
            loading={actionLoading === 'update'}
          />
        </Modal>

        {/* View Lab Modal */}
        <Modal
          isOpen={viewModal.isOpen}
          onClose={() => {
            viewModal.closeModal()
            setSelectedLab(null)
          }}
          title="Lab Room Details"
          size="lg"
        >
          {selectedLab && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lab Code</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLab.kode_lab}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedLab.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedLab.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Lab Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLab.nama_lab}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLab.deskripsi || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLab.kapasitas} students</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLab.lokasi}</p>
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
            setSelectedLab(null)
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
                <h3 className="font-medium text-red-900">Delete Lab Room</h3>
                <p className="text-sm text-red-700 mt-1">
                  Are you sure you want to delete <strong>{selectedLab?.nama_lab}</strong>? 
                  This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  deleteModal.closeModal()
                  setSelectedLab(null)
                }}
                disabled={actionLoading === 'delete'}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteLab}
                isLoading={actionLoading === 'delete'}
                disabled={actionLoading === 'delete'}
              >
                Delete Lab Room
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  )
}

export default LabManagement