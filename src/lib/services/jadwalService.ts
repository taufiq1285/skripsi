// src/lib/services/jadwalService.ts
import { supabase } from '@/lib/supabase/client'
import type { 
  JadwalPraktikum, 
  CreateJadwalRequest, 
  UpdateJadwalRequest, 
  JadwalListParams, 
  JadwalListResponse,
  RoomAvailabilityCheck,
  RoomAvailabilityResponse,
  JadwalStats
} from '@/types/jadwal'

class JadwalService {
  
  /**
   * Get jadwal list with filters and pagination
   */
  async getJadwal(params: JadwalListParams = {}): Promise<JadwalListResponse> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      mata_kuliah_id,
      lab_room_id,
      hari,
      status,
      tanggal_start,
      tanggal_end,
      dosen_id
    } = params

    const offset = (page - 1) * limit

    try {
      // Build query with relationships
      let query = supabase
        .from('jadwal_praktikum')
        .select(`
          *,
          mata_kuliah:mata_kuliah!mata_kuliah_id(id, kode_mk, nama_mk, sks, semester),
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab, kapasitas)
        `, { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`
          materi.ilike.%${search}%
        `)
      }

      if (mata_kuliah_id) {
        query = query.eq('mata_kuliah_id', mata_kuliah_id)
      }

      if (lab_room_id) {
        query = query.eq('lab_room_id', lab_room_id)
      }

      if (hari) {
        query = query.eq('hari', hari)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (tanggal_start) {
        query = query.gte('tanggal', tanggal_start)
      }

      if (tanggal_end) {
        query = query.lte('tanggal', tanggal_end)
      }

      if (dosen_id) {
        query = query.eq('dosen_id', dosen_id)
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('tanggal', { ascending: true })
        .order('jam_mulai', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Jadwal Service: Get jadwal error:', error)
        throw new Error(`Failed to fetch jadwal: ${error.message}`)
      }

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages
      }

    } catch (error) {
      console.error('❌ Jadwal Service: Get jadwal exception:', error)
      throw error
    }
  }

  /**
   * Get jadwal by ID
   */
  async getJadwalById(id: string): Promise<JadwalPraktikum | null> {
    try {
      const { data, error } = await supabase
        .from('jadwal_praktikum')
        .select(`
          *,
          mata_kuliah:mata_kuliah!mata_kuliah_id(id, kode_mk, nama_mk, sks, semester),
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab, kapasitas)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Jadwal not found
        }
        console.error('❌ Jadwal Service: Get jadwal by ID error:', error)
        throw new Error(`Failed to fetch jadwal: ${error.message}`)
      }

      return data

    } catch (error) {
      console.error('❌ Jadwal Service: Get jadwal by ID exception:', error)
      throw error
    }
  }

  /**
   * Create new jadwal
   */
  async createJadwal(jadwalData: CreateJadwalRequest): Promise<JadwalPraktikum> {
    try {
      // First check room availability
      const availabilityCheck: RoomAvailabilityCheck = {
        lab_room_id: jadwalData.lab_room_id,
        hari: jadwalData.hari,
        jam_mulai: jadwalData.jam_mulai,
        jam_selesai: jadwalData.jam_selesai,
        tanggal: jadwalData.tanggal
      }

      const availability = await this.checkRoomAvailability(availabilityCheck)
      if (!availability.available) {
        throw new Error(`Lab room is not available at the requested time. Conflicts: ${availability.conflicts.map(c => c.mata_kuliah).join(', ')}`)
      }

      // Create jadwal
      const { data, error } = await supabase
        .from('jadwal_praktikum')
        .insert([{
          ...jadwalData,
          status: jadwalData.status || 'scheduled'
        }])
        .select(`
          *,
          mata_kuliah:mata_kuliah!mata_kuliah_id(id, kode_mk, nama_mk, sks, semester),
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab, kapasitas)
        `)
        .single()

      if (error) {
        console.error('❌ Jadwal Service: Create jadwal error:', error)
        throw new Error(`Failed to create jadwal: ${error.message}`)
      }

      console.log('✅ Jadwal Service: Jadwal created successfully:', data.id)
      return data

    } catch (error) {
      console.error('❌ Jadwal Service: Create jadwal exception:', error)
      throw error
    }
  }

  /**
   * Update jadwal
   */
  async updateJadwal(id: string, jadwalData: Partial<UpdateJadwalRequest>): Promise<JadwalPraktikum> {
    try {
      // Remove id from jadwalData to avoid updating it
      const { id: _, ...updateData } = jadwalData

      // If updating time/room, check availability
      if (updateData.lab_room_id || updateData.hari || updateData.jam_mulai || updateData.jam_selesai || updateData.tanggal) {
        // Get current jadwal to fill missing fields
        const currentJadwal = await this.getJadwalById(id)
        if (!currentJadwal) {
          throw new Error('Jadwal not found')
        }

        const availabilityCheck: RoomAvailabilityCheck = {
          lab_room_id: updateData.lab_room_id || currentJadwal.lab_room_id,
          hari: updateData.hari || currentJadwal.hari,
          jam_mulai: updateData.jam_mulai || currentJadwal.jam_mulai,
          jam_selesai: updateData.jam_selesai || currentJadwal.jam_selesai,
          tanggal: updateData.tanggal || currentJadwal.tanggal,
          exclude_jadwal_id: id
        }

        const availability = await this.checkRoomAvailability(availabilityCheck)
        if (!availability.available) {
          throw new Error(`Lab room is not available at the requested time. Conflicts: ${availability.conflicts.map(c => c.mata_kuliah).join(', ')}`)
        }
      }

      const { data, error } = await supabase
        .from('jadwal_praktikum')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          mata_kuliah:mata_kuliah!mata_kuliah_id(id, kode_mk, nama_mk, sks, semester),
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab, kapasitas)
        `)
        .single()

      if (error) {
        console.error('❌ Jadwal Service: Update jadwal error:', error)
        throw new Error(`Failed to update jadwal: ${error.message}`)
      }

      if (!data) {
        throw new Error('Jadwal not found')
      }

      console.log('✅ Jadwal Service: Jadwal updated successfully:', data.id)
      return data

    } catch (error) {
      console.error('❌ Jadwal Service: Update jadwal exception:', error)
      throw error
    }
  }

  /**
   * Delete jadwal
   */
  async deleteJadwal(id: string): Promise<void> {
    try {
      // Check if jadwal exists
      const { data: existingJadwal } = await supabase
        .from('jadwal_praktikum')
        .select('id, materi')
        .eq('id', id)
        .single()

      if (!existingJadwal) {
        throw new Error('Jadwal not found')
      }

      // Check for related records (presensi, etc.)
      // This would be uncommented when presensi table is implemented
      /*
      const { data: relatedPresensi } = await supabase
        .from('presensi')
        .select('id')
        .eq('jadwal_id', id)
        .limit(1)

      if (relatedPresensi && relatedPresensi.length > 0) {
        throw new Error('Cannot delete jadwal that has attendance records')
      }
      */

      const { error } = await supabase
        .from('jadwal_praktikum')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Jadwal Service: Delete jadwal error:', error)
        throw new Error(`Failed to delete jadwal: ${error.message}`)
      }

      console.log('✅ Jadwal Service: Jadwal deleted successfully:', existingJadwal.materi)

    } catch (error) {
      console.error('❌ Jadwal Service: Delete jadwal exception:', error)
      throw error
    }
  }

  /**
   * Check room availability
   */
  async checkRoomAvailability(check: RoomAvailabilityCheck): Promise<RoomAvailabilityResponse> {
    try {
      let query = supabase
        .from('jadwal_praktikum')
        .select(`
          id,
          jam_mulai,
          jam_selesai,
          mata_kuliah:mata_kuliah!mata_kuliah_id(nama_mk),
          dosen:users!dosen_id(full_name)
        `)
        .eq('lab_room_id', check.lab_room_id)
        .eq('hari', check.hari)
        .eq('tanggal', check.tanggal)
        .neq('status', 'cancelled')

      // Exclude current jadwal if updating
      if (check.exclude_jadwal_id) {
        query = query.neq('id', check.exclude_jadwal_id)
      }

      const { data: existingJadwal, error } = await query

      if (error) {
        console.error('❌ Jadwal Service: Check availability error:', error)
        throw new Error(`Failed to check room availability: ${error.message}`)
      }

      // Check for time conflicts
      const conflicts = (existingJadwal || []).filter(jadwal => {
        const requestStart = check.jam_mulai
        const requestEnd = check.jam_selesai
        const existingStart = jadwal.jam_mulai
        const existingEnd = jadwal.jam_selesai

        // Check if times overlap
        return (requestStart < existingEnd && requestEnd > existingStart)
      }).map(jadwal => ({
        id: jadwal.id,
        mata_kuliah: (jadwal.mata_kuliah as any)?.nama_mk || 'Unknown',
        dosen: (jadwal.dosen as any)?.full_name || 'Unknown',
        jam_mulai: jadwal.jam_mulai,
        jam_selesai: jadwal.jam_selesai
      }))

      return {
        available: conflicts.length === 0,
        conflicts
      }

    } catch (error) {
      console.error('❌ Jadwal Service: Check availability exception:', error)
      throw error
    }
  }

  /**
   * Get jadwal by dosen (for dosen dashboard)
   */
  async getJadwalByDosen(dosenId: string, params: Partial<JadwalListParams> = {}): Promise<JadwalListResponse> {
    return this.getJadwal({
      ...params,
      dosen_id: dosenId
    })
  }

  /**
   * Get jadwal statistics
   */
  async getJadwalStats(dosenId?: string): Promise<JadwalStats> {
    try {
      let query = supabase
        .from('jadwal_praktikum')
        .select('status, tanggal')

      if (dosenId) {
        query = query.eq('dosen_id', dosenId)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Jadwal Service: Get jadwal stats error:', error)
        throw new Error(`Failed to fetch jadwal statistics: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        scheduled: data?.filter(j => j.status === 'scheduled').length || 0,
        ongoing: data?.filter(j => j.status === 'ongoing').length || 0,
        completed: data?.filter(j => j.status === 'completed').length || 0,
        cancelled: data?.filter(j => j.status === 'cancelled').length || 0,
        thisWeek: 0 // Would be calculated based on current week
      }

      return stats

    } catch (error) {
      console.error('❌ Jadwal Service: Get jadwal stats exception:', error)
      throw error
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jadwal_praktikum')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Jadwal Service: Connection test failed:', error)
        return false
      }

      console.log('✅ Jadwal Service: Connection test successful')
      return true

    } catch (error) {
      console.error('❌ Jadwal Service: Connection test exception:', error)
      return false
    }
  }
}

// Export singleton instance
export const jadwalService = new JadwalService()

// Export for testing
export { JadwalService }