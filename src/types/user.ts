// src/types/user.ts
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
  
  // Relations (joined data)
  lab_room?: {
    id: string
    nama_lab: string
    kode_lab: string
  }
}

export interface CreateUserInput {
  email: string
  full_name: string
  role: UserRole
  nim_nip?: string
  phone?: string
  status?: StatusEnum
  lab_room_id?: string
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  id: string
}

export interface UserListResponse {
  data: User[]
  count: number
  page: number
  limit: number
  total_pages: number
}

export interface UserFilters {
  role?: UserRole
  status?: StatusEnum
  lab_room_id?: string
  search?: string
}

// Form validation schemas using Zod
export interface UserFormData {
  email: string
  full_name: string
  role: UserRole
  nim_nip: string
  phone: string
  status: StatusEnum
  lab_room_id: string
}