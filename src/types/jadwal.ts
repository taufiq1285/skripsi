// src/types/jadwal.ts
export type JadwalStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
export type HariEnum = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu'

export interface JadwalPraktikum {
  id: string
  mata_kuliah_id: string
  dosen_id: string
  lab_room_id: string
  hari: HariEnum
  jam_mulai: string // HH:mm format
  jam_selesai: string // HH:mm format
  tanggal: string // YYYY-MM-DD format
  materi: string
  status: JadwalStatus
  catatan?: string
  max_mahasiswa?: number
  created_at: string
  updated_at: string
  
  // Relations (joined data)
  mata_kuliah?: {
    id: string
    kode_mk: string
    nama_mk: string
    sks: number
    semester: number
  }
  dosen?: {
    id: string
    full_name: string
    email: string
  }
  lab_room?: {
    id: string
    kode_lab: string
    nama_lab: string
    kapasitas: number
  }
}

// Request types for API calls
export interface CreateJadwalRequest {
  mata_kuliah_id: string
  lab_room_id: string
  hari: HariEnum
  jam_mulai: string
  jam_selesai: string
  tanggal: string
  materi: string
  status?: JadwalStatus
  catatan?: string
  max_mahasiswa?: number
}

export interface UpdateJadwalRequest extends Partial<CreateJadwalRequest> {
  id: string
}

// Response types from API
export interface JadwalListResponse {
  data: JadwalPraktikum[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and pagination parameters
export interface JadwalListParams {
  page?: number
  limit?: number
  search?: string
  mata_kuliah_id?: string
  lab_room_id?: string
  hari?: HariEnum
  status?: JadwalStatus
  tanggal_start?: string
  tanggal_end?: string
  dosen_id?: string // For ownership filtering
}

// Room availability checking
export interface RoomAvailabilityCheck {
  lab_room_id: string
  hari: HariEnum
  jam_mulai: string
  jam_selesai: string
  tanggal: string
  exclude_jadwal_id?: string // For update operations
}

export interface RoomAvailabilityResponse {
  available: boolean
  conflicts: {
    id: string
    mata_kuliah: string
    dosen: string
    jam_mulai: string
    jam_selesai: string
  }[]
}

// Utility types for components
export interface JadwalSelectOption {
  value: string
  label: string
  mata_kuliah: string
  lab_room: string
}

export interface JadwalStats {
  total: number
  scheduled: number
  ongoing: number
  completed: number
  cancelled: number
  thisWeek: number
}

// Form validation and UI types
export interface JadwalFormData {
  mata_kuliah_id: string
  lab_room_id: string
  hari: HariEnum
  jam_mulai: string
  jam_selesai: string
  tanggal: string
  materi: string
  status: JadwalStatus
  catatan: string
  max_mahasiswa: number
}

// Calendar view types
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    mata_kuliah: string
    lab_room: string
    dosen: string
    status: JadwalStatus
  }
}

export interface WeeklySchedule {
  [key: string]: JadwalPraktikum[] // Key is day of week
}

// Time slot validation
export interface TimeSlot {
  jam_mulai: string
  jam_selesai: string
  duration_minutes: number
}

export const AVAILABLE_TIME_SLOTS: TimeSlot[] = [
  { jam_mulai: '07:00', jam_selesai: '09:00', duration_minutes: 120 },
  { jam_mulai: '09:00', jam_selesai: '11:00', duration_minutes: 120 },
  { jam_mulai: '11:00', jam_selesai: '13:00', duration_minutes: 120 },
  { jam_mulai: '13:00', jam_selesai: '15:00', duration_minutes: 120 },
  { jam_mulai: '15:00', jam_selesai: '17:00', duration_minutes: 120 },
]

export const HARI_OPTIONS: { value: HariEnum; label: string }[] = [
  { value: 'senin', label: 'Senin' },
  { value: 'selasa', label: 'Selasa' },
  { value: 'rabu', label: 'Rabu' },
  { value: 'kamis', label: 'Kamis' },
  { value: 'jumat', label: 'Jumat' },
  { value: 'sabtu', label: 'Sabtu' },
]

export const STATUS_OPTIONS: { value: JadwalStatus; label: string; color: string }[] = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'ongoing', label: 'Ongoing', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
]