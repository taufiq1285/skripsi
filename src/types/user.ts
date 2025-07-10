// src/types/user.ts - FIXED VERSION
export type UserRole = 'admin' | 'dosen' | 'laboran' | 'mahasiswa'
export type StatusEnum = 'active' | 'inactive'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  nim_nip?: string
  phone?: string
  status: StatusEnum
  lab_room_id?: string
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login_at?: string
  metadata?: Record<string, any>
  
  // Relations (joined data)
  lab_room?: {
    id: string
    nama_lab: string
    kode_lab: string
  }
}

// Request types for API calls
export interface CreateUserRequest {
  email: string
  full_name: string
  role: UserRole
  nim_nip?: string
  phone?: string
  status: StatusEnum  // Remove optional - always required
  lab_room_id?: string
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string
}

// Response types from API
export interface UserListResponse {
  data: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and pagination parameters
export interface UserListParams {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: StatusEnum
  lab_room_id?: string
}

// Form validation and UI types
export interface UserFilters {
  role?: UserRole
  status?: StatusEnum
  lab_room_id?: string
  search?: string
}

export interface UserFormData {
  email: string
  full_name: string
  role: UserRole
  nim_nip: string
  phone: string
  status: StatusEnum
  lab_room_id: string
}

// Utility types for component props
export interface UserSelectOption {
  value: string
  label: string
  role?: UserRole
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: Record<UserRole, number>
}