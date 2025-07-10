// src/lib/services/mataKuliahService.ts
import { supabase } from '@/lib/supabase/client'
import type { 
  MataKuliah, 
  CreateMataKuliahRequest, 
  UpdateMataKuliahRequest, 
  MataKuliahListParams, 
  MataKuliahListResponse 
} from '@/types/mataKuliah'

class MataKuliahService {
  
  /**
   * Get mata kuliah list with filters and pagination
   */
  async getMataKuliah(params: MataKuliahListParams = {}): Promise<MataKuliahListResponse> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      semester,
      dosen_id,
      lab_room_id
    } = params

    const offset = (page - 1) * limit

    try {
      // Build query with relationships
      let query = supabase
        .from('mata_kuliah')
        .select(`
          *,
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab)
        `, { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`
          kode_mk.ilike.%${search}%,
          nama_mk.ilike.%${search}%
        `)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (semester) {
        query = query.eq('semester', semester)
      }

      if (dosen_id) {
        query = query.eq('dosen_id', dosen_id)
      }

      if (lab_room_id) {
        query = query.eq('lab_room_id', lab_room_id)
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('semester', { ascending: true })
        .order('kode_mk', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Mata Kuliah Service: Get mata kuliah error:', error)
        throw new Error(`Failed to fetch mata kuliah: ${error.message}`)
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
      console.error('❌ Mata Kuliah Service: Get mata kuliah exception:', error)
      throw error
    }
  }

  /**
   * Get mata kuliah by ID
   */
  async getMataKuliahById(id: string): Promise<MataKuliah | null> {
    try {
      const { data, error } = await supabase
        .from('mata_kuliah')
        .select(`
          *,
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Mata kuliah not found
        }
        console.error('❌ Mata Kuliah Service: Get mata kuliah by ID error:', error)
        throw new Error(`Failed to fetch mata kuliah: ${error.message}`)
      }

      return data

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Get mata kuliah by ID exception:', error)
      throw error
    }
  }

  /**
   * Create new mata kuliah
   */
  async createMataKuliah(mataKuliahData: CreateMataKuliahRequest): Promise<MataKuliah> {
    try {
      // Check if kode_mk already exists
      const { data: existingMK } = await supabase
        .from('mata_kuliah')
        .select('id')
        .eq('kode_mk', mataKuliahData.kode_mk)
        .single()

      if (existingMK) {
        throw new Error('Course code already exists')
      }

      // Create mata kuliah
      const { data, error } = await supabase
        .from('mata_kuliah')
        .insert([{
          ...mataKuliahData,
          status: mataKuliahData.status || 'active'
        }])
        .select(`
          *,
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab)
        `)
        .single()

      if (error) {
        console.error('❌ Mata Kuliah Service: Create mata kuliah error:', error)
        throw new Error(`Failed to create mata kuliah: ${error.message}`)
      }

      console.log('✅ Mata Kuliah Service: Mata kuliah created successfully:', data.kode_mk)
      return data

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Create mata kuliah exception:', error)
      throw error
    }
  }

  /**
   * Update mata kuliah
   */
  async updateMataKuliah(id: string, mataKuliahData: Partial<UpdateMataKuliahRequest>): Promise<MataKuliah> {
    try {
      // Remove id from mataKuliahData to avoid updating it
      const { id: _, ...updateData } = mataKuliahData

      // Check if kode_mk is being changed and if it already exists
      if (updateData.kode_mk) {
        const { data: existingMK } = await supabase
          .from('mata_kuliah')
          .select('id')
          .eq('kode_mk', updateData.kode_mk)
          .neq('id', id)
          .single()

        if (existingMK) {
          throw new Error('Course code already exists')
        }
      }

      const { data, error } = await supabase
        .from('mata_kuliah')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          dosen:users!dosen_id(id, full_name, email),
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab)
        `)
        .single()

      if (error) {
        console.error('❌ Mata Kuliah Service: Update mata kuliah error:', error)
        throw new Error(`Failed to update mata kuliah: ${error.message}`)
      }

      if (!data) {
        throw new Error('Mata kuliah not found')
      }

      console.log('✅ Mata Kuliah Service: Mata kuliah updated successfully:', data.kode_mk)
      return data

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Update mata kuliah exception:', error)
      throw error
    }
  }

  /**
   * Delete mata kuliah
   */
  async deleteMataKuliah(id: string): Promise<void> {
    try {
      // Check if mata kuliah exists
      const { data: existingMK } = await supabase
        .from('mata_kuliah')
        .select('id, kode_mk, nama_mk')
        .eq('id', id)
        .single()

      if (!existingMK) {
        throw new Error('Mata kuliah not found')
      }

      // Check for related records (jadwal praktikum, materi, etc.)
      const { data: relatedSchedules } = await supabase
        .from('jadwal_praktikum')
        .select('id')
        .eq('mata_kuliah_id', id)
        .limit(1)

      if (relatedSchedules && relatedSchedules.length > 0) {
        throw new Error('Cannot delete mata kuliah that has scheduled practicum sessions. Remove schedules first.')
      }

      // Delete mata kuliah
      const { error } = await supabase
        .from('mata_kuliah')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Mata Kuliah Service: Delete mata kuliah error:', error)
        throw new Error(`Failed to delete mata kuliah: ${error.message}`)
      }

      console.log('✅ Mata Kuliah Service: Mata kuliah deleted successfully:', existingMK.nama_mk)

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Delete mata kuliah exception:', error)
      throw error
    }
  }

  /**
   * Get mata kuliah by dosen (for dosen dashboard)
   */
  async getMataKuliahByDosen(dosenId: string): Promise<MataKuliah[]> {
    try {
      const { data, error } = await supabase
        .from('mata_kuliah')
        .select(`
          *,
          lab_room:lab_rooms!lab_room_id(id, kode_lab, nama_lab)
        `)
        .eq('dosen_id', dosenId)
        .eq('status', 'active')
        .order('semester', { ascending: true })
        .order('kode_mk', { ascending: true })

      if (error) {
        console.error('❌ Mata Kuliah Service: Get mata kuliah by dosen error:', error)
        throw new Error(`Failed to fetch mata kuliah: ${error.message}`)
      }

      return data || []

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Get mata kuliah by dosen exception:', error)
      throw error
    }
  }

  /**
   * Get mata kuliah for dropdown selection
   */
  async getMataKuliahForSelect(): Promise<{ id: string; kode_mk: string; nama_mk: string; sks: number }[]> {
    try {
      const { data, error } = await supabase
        .from('mata_kuliah')
        .select('id, kode_mk, nama_mk, sks')
        .eq('status', 'active')
        .order('kode_mk')

      if (error) {
        console.error('❌ Mata Kuliah Service: Get mata kuliah for select error:', error)
        throw new Error(`Failed to fetch mata kuliah: ${error.message}`)
      }

      return data || []

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Get mata kuliah for select exception:', error)
      throw error
    }
  }

  /**
   * Assign dosen to mata kuliah
   */
  async assignDosenToMataKuliah(mataKuliahId: string, dosenId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('mata_kuliah')
        .update({ 
          dosen_id: dosenId,
          updated_at: new Date().toISOString()
        })
        .eq('id', mataKuliahId)

      if (error) {
        console.error('❌ Mata Kuliah Service: Assign dosen error:', error)
        throw new Error(`Failed to assign dosen: ${error.message}`)
      }

      console.log('✅ Mata Kuliah Service: Dosen assigned successfully')

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Assign dosen exception:', error)
      throw error
    }
  }

  /**
   * Get mata kuliah statistics
   */
  async getMataKuliahStats() {
    try {
      const { data, error } = await supabase
        .from('mata_kuliah')
        .select('status, semester, sks')

      if (error) {
        console.error('❌ Mata Kuliah Service: Get mata kuliah stats error:', error)
        throw new Error(`Failed to fetch mata kuliah statistics: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(mk => mk.status === 'active').length || 0,
        inactive: data?.filter(mk => mk.status === 'inactive').length || 0,
        totalSks: data?.reduce((sum, mk) => sum + (mk.sks || 0), 0) || 0,
        bySemester: data?.reduce((acc, mk) => {
          if (mk.semester) {
            acc[mk.semester] = (acc[mk.semester] || 0) + 1
          }
          return acc
        }, {} as Record<number, number>) || {}
      }

      return stats

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Get mata kuliah stats exception:', error)
      throw error
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mata_kuliah')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Mata Kuliah Service: Connection test failed:', error)
        return false
      }

      console.log('✅ Mata Kuliah Service: Connection test successful')
      return true

    } catch (error) {
      console.error('❌ Mata Kuliah Service: Connection test exception:', error)
      return false
    }
  }
}

// Export singleton instance
export const mataKuliahService = new MataKuliahService()

// Export for testing
export { MataKuliahService }