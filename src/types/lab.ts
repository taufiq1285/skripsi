// src/types/lab.ts
export type LabStatus = 'active' | 'inactive'

export interface LabRoom {
  id: string
  kode_lab: string
  nama_lab: string
  deskripsi?: string
  kapasitas: number
  status: LabStatus
  fasilitas?: string[]
  lokasi?: string
  pic_id?: string
  mata_kuliah_count?: number
  created_at: string
  updated_at: string
  
  // Relations (joined data)
  pic?: {
    id: string
    full_name: string
    email: string
  }
}

// Request types for API calls
export interface CreateLabRequest {
  kode_lab: string
  nama_lab: string
  deskripsi?: string
  kapasitas: number
  status?: LabStatus
  fasilitas?: string[]
  lokasi?: string
  pic_id?: string
}

export interface UpdateLabRequest extends Partial<CreateLabRequest> {
  id: string
}

// Response types from API
export interface LabListResponse {
  data: LabRoom[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and pagination parameters
export interface LabListParams {
  page?: number
  limit?: number
  search?: string
  status?: LabStatus
  lokasi?: string
}

// Utility types for components
export interface LabSelectOption {
  value: string
  label: string
  kode_lab: string
}

export interface LabStats {
  total: number
  active: number
  inactive: number
  totalCapacity: number
}