// src/pages/dosen/MataKuliahList.tsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { mataKuliahService } from '@/lib/services/mataKuliahService'
import { useDebounce } from '@/hooks/useDebounce'
import type { MataKuliah } from '@/types/mataKuliah'
import { RoleGuard } from '@/components/guards'

interface MataKuliahListState {
  mataKuliah: MataKuliah[]
  loading: boolean
  error: string | null
  searchQuery: string
}

const MataKuliahList: React.FC = () => {
  const { user } = useAuth()
  
  const [state, setState] = useState<MataKuliahListState>({
    mataKuliah: [],
    loading: true,
    error: null,
    searchQuery: ''
  })
  
  // Debounced search
  const debouncedSearch = useDebounce(state.searchQuery, 500)

  // Load mata kuliah for current dosen (OWNERSHIP VALIDATION)
  const loadMataKuliah = async () => {
    if (!user?.id) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // OWNERSHIP: Only load mata kuliah taught by this dosen
      const data = await mataKuliahService.getMataKuliahByDosen(user.id)
      
      // Apply search filter if any
      const filteredData = debouncedSearch 
        ? data.filter(mk => 
            mk.nama_mk.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            mk.kode_mk.toLowerCase().includes(debouncedSearch.toLowerCase())
          )
        : data

      setState(prev => ({
        ...prev,
        mataKuliah: filteredData,
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

  useEffect(() => {
    loadMataKuliah()
  }, [user?.id, debouncedSearch])

  // Handle search
  const handleSearchChange = (value: string) => {
    setState(prev => ({ ...prev, searchQuery: value }))
  }

  if (!user) return null

  return (
    <RoleGuard allowedRoles={['Admin', 'Dosen']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mata Kuliah yang Diajar</h1>
            <p className="text-gray-600">Daftar mata kuliah yang Anda ajar di program studi</p>
          </div>

          {/* Stats Card */}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Mata Kuliah</dt>
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
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h8v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total SKS</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.mataKuliah.reduce((total, mk) => total + mk.sks, 0)}
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
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Semester Range</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {state.mataKuliah.length > 0 
                          ? (() => {
                              const semesters = state.mataKuliah.map(mk => mk.semester).filter((s): s is number => s !== undefined)
                              return semesters.length > 0 
                                ? `${Math.min(...semesters)} - ${Math.max(...semesters)}`
                                : '0'
                            })()
                          : '0'
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mata Kuliah yang Diajar</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Daftar mata kuliah yang ditetapkan untuk Anda ajar
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                  onClick={() => window.location.href = '/dosen/schedule'}
                >
                  Buat Jadwal
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Search */}
              <div className="mb-6">
                <Input
                  placeholder="Search mata kuliah by name or code..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
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

              {/* Loading State */}
              {state.loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading mata kuliah...</span>
                </div>
              )}

              {/* Empty State */}
              {!state.loading && state.mataKuliah.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada mata kuliah</h3>
                  <p className="text-gray-500 mb-4">
                    Anda belum ditetapkan untuk mengajar mata kuliah manapun.
                  </p>
                  <p className="text-sm text-gray-400">
                    Hubungi administrator untuk assignment mata kuliah
                  </p>
                </div>
              )}

              {/* Mata Kuliah Grid */}
              {!state.loading && state.mataKuliah.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.mataKuliah.map((mk) => (
                    <Card key={mk.id} hover className="border-2 border-gray-200 hover:border-blue-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {mk.nama_mk}
                            </h3>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Kode:</span>
                                <span className="ml-2">{mk.kode_mk}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">SKS:</span>
                                <span className="ml-2">{mk.sks}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">Semester:</span>
                                <span className="ml-2">{mk.semester}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mk.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mk.status}
                          </span>
                        </div>

                        {mk.lab_room && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Assigned Lab:</h4>
                            <p className="text-sm text-gray-600">
                              {mk.lab_room.nama_lab} ({mk.lab_room.kode_lab})
                            </p>
                          </div>
                        )}

                        {mk.deskripsi && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Deskripsi:</h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {mk.deskripsi}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/dosen/subjects/${mk.id}`}
                          >
                            Detail
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.location.href = `/dosen/schedule?mata_kuliah=${mk.id}`}
                          >
                            Buat Jadwal
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ownership Validation Info */}
          <Card>
            <CardContent className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">✅ Dosen Ownership View</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>• <strong>Ownership Filter:</strong> Hanya mata kuliah dengan dosen_id = {user?.id}</div>
                  <div>• <strong>Search Function:</strong> Filter by nama_mk atau kode_mk</div>
                  <div>• <strong>Quick Actions:</strong> Langsung ke create jadwal per mata kuliah</div>
                  <div>• <strong>Assignment Info:</strong> Assignment dilakukan oleh admin</div>
                  <div>• <strong>Current User:</strong> {user?.name} ({user?.role})</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </RoleGuard>
  )
}

export default MataKuliahList