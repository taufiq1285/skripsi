// src/types/mataKuliah.ts
export type MataKuliahStatus = 'active' | 'inactive'

export interface MataKuliah {
  id: string
  kode_mk: string
  nama_mk: string
  sks: number
  semester?: number
  dosen_id?: string
  lab_room_id?: string
  status: MataKuliahStatus
  deskripsi?: string
  silabus?: string
  capaian_pembelajaran?: string[]
  rps_file_url?: string
  created_at: string
  updated_at: string
  
  // Relations (joined data)
  dosen?: {
    id: string
    full_name: string
    email: string
  }
  lab_room?: {
    id: string
    kode_lab: string
    nama_lab: string
  }
}

// Request types for API calls
export interface CreateMataKuliahRequest {
  kode_mk: string
  nama_mk: string
  sks: number
  semester?: number
  dosen_id?: string
  lab_room_id?: string
  status?: MataKuliahStatus
  deskripsi?: string
  silabus?: string
  capaian_pembelajaran?: string[]
  rps_file_url?: string
}

export interface UpdateMataKuliahRequest extends Partial<CreateMataKuliahRequest> {
  id: string
}

// Response types from API
export interface MataKuliahListResponse {
  data: MataKuliah[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and pagination parameters
export interface MataKuliahListParams {
  page?: number
  limit?: number
  search?: string
  status?: MataKuliahStatus
  semester?: number
  dosen_id?: string
  lab_room_id?: string
}

// Utility types
export interface MataKuliahSelectOption {
  value: string
  label: string
  kode_mk: string
  sks: number
}

export interface MataKuliahStats {
  total: number
  active: number
  inactive: number
  bySemester: Record<number, number>
  totalSks: number
}