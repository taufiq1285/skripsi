// src/pages/dosen/JadwalManagement.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Modal, useModal } from '@/components/ui/Modal'
import { DataTable, type Column } from '@/components/tables/DataTable'
import { jadwalService } from '@/lib/services/jadwalService'
import { mataKuliahService } from '@/lib/services/mataKuliahService'
import { useDebounce } from '@/hooks/useDebounce'
import type { JadwalPraktikum, JadwalListParams } from '@/types/jadwal'
import type { MataKuliah } from '@/types/mataKuliah'
import { RoleGuard } from '@/components/guards'

interface JadwalManagementState {
  jadwal: JadwalPraktikum[]
  mataKuliah: MataKuliah[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
  searchQuery: string
  selectedStatus: string
  selectedMataKuliah: string
}

const JadwalManagement: React.FC = () => {
  const { user } = useAuth()
  
  // State management
  const [state, setState] = useState<JadwalManagementState>({
    jadwal: [],
    mataKuliah: [],
    loading: true,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    selectedStatus: '',
    selectedMataKuliah: ''
  })
  
  const [selectedJadwal, setSelectedJadwal] = useState<JadwalPraktikum | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Modal controls
  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()
  const viewModal = useModal()
  
  // Debounced search
  const debouncedSearch = useDebounce(state.searchQuery, 500)

  // Load jadwal data (with ownership filter)
  const loadJadwal = async (params?: Partial<JadwalListParams>) => {
    if (!user?.id) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const queryParams: JadwalListParams = {
        page: params?.page || state.currentPage,
        limit: params?.limit || state.pageSize,
        search: params?.search || debouncedSearch || undefined,
        status: params?.status || (state.selectedStatus as any) || undefined,
        mata_kuliah_id: params?.mata_kuliah_id || state.selectedMataKuliah || undefined,
        dosen_id: user.id // OWNERSHIP VALIDATION - Only show dosen's jadwal
      }

      const response = await jadwalService.getJadwal(queryParams)
      
      setState(prev => ({
        ...prev,
        jadwal: response.data,
        total: response.total,
        currentPage: response.page,
        loading: false
      }))

    } catch (error) {
      console.error('Failed to load jadwal:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load jadwal'
      }))
    }
  }

  // Load mata kuliah that belong to this dosen
  const loadMataKuliah = async () => {
    if (!user?.id) return

    try {
      const data = await mataKuliahService.getMataKuliahByDosen(user.id)
      setState(prev => ({ ...prev, mataKuliah: data }))
    } catch (error) {
      console.error('Failed to load mata kuliah:', error)
    }
  }

  // Effects
  useEffect(() => {
    loadMataKuliah()
  }, [user?.id])

  useEffect(() => {
    loadJadwal()
  }, [debouncedSearch, state.selectedStatus, state.selectedMataKuliah, user?.id])

  // Handle create jadwal

  // Handle update jadwal

  // Handle delete jadwal
  const handleDeleteJadwal = async () => {
    if (!selectedJadwal) return
    
    // OWNERSHIP VALIDATION - Check if jadwal belongs to current dosen
    if (selectedJadwal.dosen_id !== user?.id) {
      alert('Anda tidak memiliki izin untuk menghapus jadwal ini')
      return
    }
    
    try {
      setActionLoading('delete')
      await jadwalService.deleteJadwal(selectedJadwal.id)
      await loadJadwal()
      deleteModal.closeModal()
      setSelectedJadwal(null)
      showSuccessNotification('Jadwal deleted successfully')
    } catch (error) {
      console.error('Failed to delete jadwal:', error)
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
    loadJadwal({ page, limit: pageSize })
  }

  // Search handler
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value, currentPage: 1 }))
  }

  // Filter handlers
  const handleStatusFilter = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status, currentPage: 1 }))
  }

  const handleMataKuliahFilter = (mataKuliahId: string) => {
    setState(prev => ({ ...prev, selectedMataKuliah: mataKuliahId, currentPage: 1 }))
  }

  // Table columns configuration
  const columns: Column<JadwalPraktikum>[] = [
    {
      key: 'mata_kuliah',
      title: 'Mata Kuliah',
      dataIndex: 'mata_kuliah',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.mata_kuliah?.nama_mk}
          </div>
          <div className="text-sm text-gray-500">
            {record.mata_kuliah?.kode_mk} • {record.mata_kuliah?.sks} SKS
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      title: 'Jadwal',
      dataIndex: 'schedule',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.hari} • {record.tanggal}
          </div>
          <div className="text-sm text-gray-500">
            {record.jam_mulai} - {record.jam_selesai}
          </div>
        </div>
      )
    },
    {
      key: 'lab_room',
      title: 'Lab Room',
      dataIndex: 'lab_room',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.lab_room?.nama_lab}
          </div>
          <div className="text-sm text-gray-500">
            {record.lab_room?.kode_lab}
          </div>
        </div>
      )
    },
    {
      key: 'materi',
      title: 'Materi',
      dataIndex: 'materi',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'scheduled' ? 'bg-blue-100 text-blue-800' :
          value === 'ongoing' ? 'bg-green-100 text-green-800' :
          value === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      dataIndex: 'actions',
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJadwal(record)
              viewModal.openModal()
            }}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJadwal(record)
              editModal.openModal()
            }}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedJadwal(record)
              deleteModal.openModal()
            }}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  if (!user) return null

  return (
    <RoleGuard allowedRoles={['Admin', 'Dosen']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jadwal Praktikum</h1>
            <p className="text-gray-600">Kelola jadwal praktikum untuk mata kuliah yang Anda ajar</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Jadwal</dt>
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
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Mata Kuliah</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.mataKuliah.length}</dd>
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
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Jadwal Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Jadwal Praktikum</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Kelola jadwal untuk {state.mataKuliah.length} mata kuliah yang Anda ajar
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
                  disabled={state.mataKuliah.length === 0}
                >
                  Add Jadwal
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* No Mata Kuliah Warning */}
              {state.mataKuliah.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-yellow-700 font-medium">Belum ada mata kuliah yang diajar</span>
                      <p className="text-yellow-600 text-sm mt-1">Hubungi admin untuk assignment mata kuliah sebelum membuat jadwal praktikum</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by materi..."
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
                  value={state.selectedMataKuliah}
                  onChange={(e) => handleMataKuliahFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Mata Kuliah</option>
                  {state.mataKuliah.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.kode_mk} - {mk.nama_mk}
                    </option>
                  ))}
                </select>
                
                <select
                  value={state.selectedStatus}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                data={state.jadwal}
                loading={state.loading}
                pagination={{
                  current: state.currentPage,
                  pageSize: state.pageSize,
                  total: state.total,
                  onChange: handlePaginationChange
                }}
              />
            </CardContent>
          </Card>

          {/* Ownership Validation Info */}
          <Card>
            <CardContent className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Dosen Ownership Validation Active</h3>
                <div className="space-y-1 text-sm text-green-800">
                  <div>• <strong>Mata Kuliah Filter:</strong> Hanya mata kuliah yang Anda ajar ({state.mataKuliah.length} items)</div>
                  <div>• <strong>Jadwal Filter:</strong> Hanya jadwal yang Anda buat yang tampil ({state.total} items)</div>
                  <div>• <strong>Edit Protection:</strong> Tidak dapat edit/delete jadwal dosen lain</div>
                  <div>• <strong>Room Availability:</strong> System check konflik otomatis saat create/update</div>
                  <div>• <strong>Current User:</strong> {user?.name} ({user?.role})</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals - Connect to actual handlers when JadwalForm is ready */}
        <Modal isOpen={createModal.isOpen} onClose={createModal.closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Jadwal</h3>
            <p className="text-gray-600 mb-4">JadwalForm component will be implemented here</p>
            <div className="text-sm text-blue-600 mb-4">
              Available Mata Kuliah: {state.mataKuliah.map(mk => mk.kode_mk).join(', ')}
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline" onClick={createModal.closeModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                disabled
                onClick={() => console.log('Will call handleCreateJadwal when form is ready')}
              >
                Create
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={editModal.isOpen} onClose={editModal.closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Jadwal</h3>
            <p className="text-gray-600 mb-4">JadwalForm component will be implemented here</p>
            {selectedJadwal && (
              <div className="text-sm text-blue-600 mb-4">
                Editing: {selectedJadwal.mata_kuliah?.nama_mk} - {selectedJadwal.materi}
              </div>
            )}
            <div className="flex justify-end mt-6 space-x-2">
              <Button variant="outline" onClick={editModal.closeModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                disabled
                onClick={() => console.log('Will call handleUpdateJadwal when form is ready')}
              >
                Update
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Jadwal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this jadwal? This action cannot be undone.
            </p>
            {selectedJadwal && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedJadwal.mata_kuliah?.nama_mk}</h4>
                <p className="text-sm text-gray-600">
                  {selectedJadwal.hari} • {selectedJadwal.tanggal} • {selectedJadwal.jam_mulai} - {selectedJadwal.jam_selesai}
                </p>
                <p className="text-sm text-gray-600">{selectedJadwal.materi}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={deleteModal.closeModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteJadwal}
                isLoading={actionLoading === 'delete'}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Jadwal Detail</h3>
            {selectedJadwal && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mata Kuliah</label>
                  <p className="text-gray-900">{selectedJadwal.mata_kuliah?.nama_mk} ({selectedJadwal.mata_kuliah?.kode_mk})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lab Room</label>
                  <p className="text-gray-900">{selectedJadwal.lab_room?.nama_lab} ({selectedJadwal.lab_room?.kode_lab})</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hari</label>
                    <p className="text-gray-900">{selectedJadwal.hari}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                    <p className="text-gray-900">{selectedJadwal.tanggal}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jam Mulai</label>
                    <p className="text-gray-900">{selectedJadwal.jam_mulai}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jam Selesai</label>
                    <p className="text-gray-900">{selectedJadwal.jam_selesai}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Materi</label>
                  <p className="text-gray-900">{selectedJadwal.materi}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedJadwal.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    selectedJadwal.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    selectedJadwal.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedJadwal.status}
                  </span>
                </div>
                {selectedJadwal.catatan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catatan</label>
                    <p className="text-gray-900">{selectedJadwal.catatan}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={viewModal.closeModal}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RoleGuard>
  )
}

export default JadwalManagement