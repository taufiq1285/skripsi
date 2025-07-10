// src/pages/dosen/DosenDashboard.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { DashboardLayout } from '@/components/layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { mataKuliahService } from '@/lib/services/mataKuliahService'
import { jadwalService } from '@/lib/services/jadwalService'
import type { MataKuliah } from '@/types/mataKuliah'
import type { JadwalPraktikum, JadwalStats } from '@/types/jadwal'

interface DosenDashboardState {
  mataKuliah: MataKuliah[]
  jadwalToday: JadwalPraktikum[]
  stats: JadwalStats | null
  loading: boolean
  error: string | null
}

const DosenDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [state, setState] = useState<DosenDashboardState>({
    mataKuliah: [],
    jadwalToday: [],
    stats: null,
    loading: true,
    error: null
  })

  // Load dosen data
  const loadDashboardData = async () => {
    if (!user?.id) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Load mata kuliah yang diajar
      const mataKuliahData = await mataKuliahService.getMataKuliahByDosen(user.id)
      
      // Load jadwal hari ini
      const today = new Date().toISOString().split('T')[0]
      const jadwalTodayResponse = await jadwalService.getJadwalByDosen(user.id, {
        tanggal_start: today,
        tanggal_end: today,
        limit: 10
      })

      // Load statistics
      const statsData = await jadwalService.getJadwalStats(user.id)

      setState(prev => ({
        ...prev,
        mataKuliah: mataKuliahData,
        jadwalToday: jadwalTodayResponse.data,
        stats: statsData,
        loading: false
      }))

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }))
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [user?.id])

  if (!user) return null

  const quickAccessItems = [
    { 
      label: 'Mata Kuliah', 
      href: '/dosen/subjects', 
      icon: '📚', 
      color: 'bg-blue-500',
      count: state.mataKuliah.length 
    },
    { 
      label: 'Jadwal Praktikum', 
      href: '/dosen/schedule', 
      icon: '📅', 
      color: 'bg-green-500',
      count: state.stats?.total || 0
    },
    { 
      label: 'Presensi', 
      href: '/dosen/attendance', 
      icon: '✅', 
      color: 'bg-yellow-500',
      count: state.stats?.scheduled || 0
    },
    { 
      label: 'Laporan', 
      href: '/dosen/reports', 
      icon: '📄', 
      color: 'bg-purple-500',
      count: 0 // Would be actual count
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Dosen</h1>
          <p className="text-gray-600">Selamat datang, {user.full_name}</p>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        )}

        {/* Statistics Cards */}
        {!state.loading && state.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <dd className="text-lg font-medium text-gray-900">{state.stats.total}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.stats.scheduled}</dd>
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
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.stats.completed}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Mata Kuliah</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.mataKuliah.length}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAccessItems.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex flex-col items-center space-y-2 hover:bg-gray-50"
                  onClick={() => navigate(item.href)}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.count} items</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {state.jadwalToday.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">Tidak ada jadwal praktikum hari ini</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/dosen/schedule')}
                  >
                    Buat Jadwal Baru
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.jadwalToday.map((jadwal) => (
                    <div key={jadwal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {jadwal.mata_kuliah?.nama_mk} ({jadwal.mata_kuliah?.kode_mk})
                        </h4>
                        <p className="text-sm text-gray-600">
                          {jadwal.lab_room?.nama_lab} • {jadwal.jam_mulai} - {jadwal.jam_selesai}
                        </p>
                        <p className="text-sm text-gray-500">{jadwal.materi}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          jadwal.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          jadwal.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          jadwal.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {jadwal.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mata Kuliah List */}
          <Card>
            <CardHeader>
              <CardTitle>Mata Kuliah yang Diajar</CardTitle>
            </CardHeader>
            <CardContent>
              {state.mataKuliah.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-gray-500">Belum ada mata kuliah yang diajar</p>
                  <p className="text-sm text-gray-400 mt-2">Hubungi admin untuk assignment mata kuliah</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.mataKuliah.map((mk) => (
                    <div key={mk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{mk.nama_mk}</h4>
                        <p className="text-sm text-gray-600">
                          {mk.kode_mk} • {mk.sks} SKS • Semester {mk.semester}
                        </p>
                        {mk.lab_room && (
                          <p className="text-xs text-gray-500">{mk.lab_room.nama_lab}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dosen/subjects/${mk.id}`)}
                      >
                        Detail
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Access Control Info */}
        <Card>
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">✅ Dosen Access Confirmed</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div>• <strong>Ownership Validation:</strong> Hanya mata kuliah dan jadwal milik Anda yang tampil</div>
                <div>• <strong>CRUD Permissions:</strong> Dapat mengelola jadwal untuk mata kuliah yang diajar</div>
                <div>• <strong>Room Availability:</strong> System cek konflik otomatis saat buat jadwal</div>
                <div>• <strong>Role Restrictions:</strong> Tidak dapat edit jadwal dosen lain</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DosenDashboard