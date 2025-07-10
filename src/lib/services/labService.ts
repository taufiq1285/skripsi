// src/lib/services/labService.ts - COMPLETE VERSION WITH CASCADE DELETE
import { supabase } from '@/lib/supabase/client'
import type { LabRoom, CreateLabRequest, UpdateLabRequest, LabListParams, LabListResponse } from '@/types/lab'

class LabService {
  
  /**
   * Get labs list with filters and pagination
   */
  async getLabs(params: LabListParams = {}): Promise<LabListResponse> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      lokasi 
    } = params

    const offset = (page - 1) * limit

    try {
      // Build query with mata kuliah count
      let query = supabase
        .from('lab_rooms')
        .select(`
          *,
          mata_kuliah:mata_kuliah(count)
        `, { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`
          kode_lab.ilike.%${search}%,
          nama_lab.ilike.%${search}%,
          lokasi.ilike.%${search}%
        `)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (lokasi) {
        query = query.eq('lokasi', lokasi)
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('kode_lab', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Lab Service: Get labs error:', error)
        throw new Error(`Failed to fetch labs: ${error.message}`)
      }

      // Transform data to include mata_kuliah_count
      const transformedData = (data || []).map(lab => ({
        ...lab,
        mata_kuliah_count: lab.mata_kuliah?.[0]?.count || 0
      }))

      const totalPages = Math.ceil((count || 0) / limit)

      return {
        data: transformedData,
        total: count || 0,
        page,
        limit,
        totalPages
      }

    } catch (error) {
      console.error('❌ Lab Service: Get labs exception:', error)
      throw error
    }
  }

  /**
   * Get lab by ID
   */
  async getLabById(id: string): Promise<LabRoom | null> {
    try {
      const { data, error } = await supabase
        .from('lab_rooms')
        .select(`
          *,
          pic:users!pic_id(id, full_name, email),
          mata_kuliah:mata_kuliah(count)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Lab not found
        }
        console.error('❌ Lab Service: Get lab by ID error:', error)
        throw new Error(`Failed to fetch lab: ${error.message}`)
      }

      // Transform data
      return {
        ...data,
        mata_kuliah_count: data.mata_kuliah?.[0]?.count || 0
      }

    } catch (error) {
      console.error('❌ Lab Service: Get lab by ID exception:', error)
      throw error
    }
  }

  /**
   * Create new lab
   */
  async createLab(labData: CreateLabRequest): Promise<LabRoom> {
    try {
      // Check if kode_lab already exists
      const { data: existingLab } = await supabase
        .from('lab_rooms')
        .select('id')
        .eq('kode_lab', labData.kode_lab)
        .single()

      if (existingLab) {
        throw new Error('Lab code already exists')
      }

      // Create lab
      const { data, error } = await supabase
        .from('lab_rooms')
        .insert([{
          ...labData,
          status: labData.status || 'active'
        }])
        .select(`
          *,
          pic:users!pic_id(id, full_name, email)
        `)
        .single()

      if (error) {
        console.error('❌ Lab Service: Create lab error:', error)
        throw new Error(`Failed to create lab: ${error.message}`)
      }

      console.log('✅ Lab Service: Lab created successfully:', data.kode_lab)
      return data

    } catch (error) {
      console.error('❌ Lab Service: Create lab exception:', error)
      throw error
    }
  }

  /**
   * Update lab
   */
  async updateLab(id: string, labData: Partial<UpdateLabRequest>): Promise<LabRoom> {
    try {
      // Remove id from labData to avoid updating it
      const { id: _, ...updateData } = labData

      // Check if kode_lab is being changed and if it already exists
      if (updateData.kode_lab) {
        const { data: existingLab } = await supabase
          .from('lab_rooms')
          .select('id')
          .eq('kode_lab', updateData.kode_lab)
          .neq('id', id)
          .single()

        if (existingLab) {
          throw new Error('Lab code already exists')
        }
      }

      const { data, error } = await supabase
        .from('lab_rooms')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          pic:users!pic_id(id, full_name, email)
        `)
        .single()

      if (error) {
        console.error('❌ Lab Service: Update lab error:', error)
        throw new Error(`Failed to update lab: ${error.message}`)
      }

      if (!data) {
        throw new Error('Lab not found')
      }

      console.log('✅ Lab Service: Lab updated successfully:', data.kode_lab)
      return data

    } catch (error) {
      console.error('❌ Lab Service: Update lab exception:', error)
      throw error
    }
  }

  /**
   * Delete lab with automatic cascade - FIXED VERSION
   */
  async deleteLab(id: string): Promise<void> {
    try {
      // Check if lab exists
      const { data: existingLab } = await supabase
        .from('lab_rooms')
        .select('id, kode_lab, nama_lab')
        .eq('id', id)
        .single()

      if (!existingLab) {
        throw new Error('Lab not found')
      }

      // STEP 1: Auto-remove lab assignments from mata_kuliah (CASCADE)
      console.log('🔄 Removing lab assignments from courses...')
      const { error: unassignError } = await supabase
        .from('mata_kuliah')
        .update({ 
          lab_room_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('lab_room_id', id)

      if (unassignError) {
        console.error('❌ Failed to unassign courses:', unassignError)
        throw new Error(`Failed to unassign courses: ${unassignError.message}`)
      }

      // STEP 2: Also remove from users if any users are assigned to this lab
      console.log('🔄 Removing lab assignments from users...')
      const { error: unassignUsersError } = await supabase
        .from('users')
        .update({ 
          lab_room_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('lab_room_id', id)

      if (unassignUsersError) {
        console.error('❌ Failed to unassign users:', unassignUsersError)
        // Don't throw error here, just log warning
        console.warn('⚠️ Some users may still be assigned to this lab')
      }

      // STEP 3: Delete the lab room
      console.log('🗑️ Deleting lab room...')
      const { error: deleteError } = await supabase
        .from('lab_rooms')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('❌ Lab Service: Delete lab error:', deleteError)
        throw new Error(`Failed to delete lab: ${deleteError.message}`)
      }

      console.log('✅ Lab Service: Lab deleted successfully with auto-cascade:', existingLab.nama_lab)

    } catch (error) {
      console.error('❌ Lab Service: Delete lab exception:', error)
      throw error
    }
  }

  /**
   * Get labs for dropdown selection
   */
  async getLabsForSelect(): Promise<{ id: string; kode_lab: string; nama_lab: string; kapasitas: number }[]> {
    try {
      const { data, error } = await supabase
        .from('lab_rooms')
        .select('id, kode_lab, nama_lab, kapasitas')
        .eq('status', 'active')
        .order('kode_lab')

      if (error) {
        console.error('❌ Lab Service: Get labs for select error:', error)
        throw new Error(`Failed to fetch labs: ${error.message}`)
      }

      return data || []

    } catch (error) {
      console.error('❌ Lab Service: Get labs for select exception:', error)
      throw error
    }
  }

  /**
   * Get lab statistics
   */
  async getLabStats() {
    try {
      const { data, error } = await supabase
        .from('lab_rooms')
        .select('status, kapasitas')

      if (error) {
        console.error('❌ Lab Service: Get lab stats error:', error)
        throw new Error(`Failed to fetch lab statistics: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(lab => lab.status === 'active').length || 0,
        inactive: data?.filter(lab => lab.status === 'inactive').length || 0,
        totalCapacity: data?.reduce((sum, lab) => sum + (lab.kapasitas || 0), 0) || 0
      }

      return stats

    } catch (error) {
      console.error('❌ Lab Service: Get lab stats exception:', error)
      throw error
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lab_rooms')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Lab Service: Connection test failed:', error)
        return false
      }

      console.log('✅ Lab Service: Connection test successful')
      return true

    } catch (error) {
      console.error('❌ Lab Service: Connection test exception:', error)
      return false
    }
  }
}

// Export singleton instance
export const labService = new LabService()

// Export for testing
export { LabService }