// src/lib/supabase/database.ts - COMPLETE VERSION with User + Mata Kuliah
import { supabase } from './client'
import type { User, CreateUserRequest, UpdateUserRequest, UserListParams, UserListResponse } from '@/types/user'
import type { MataKuliah, CreateMataKuliahRequest, UpdateMataKuliahRequest, MataKuliahListParams, MataKuliahListResponse } from '@/types/mataKuliah'

class DatabaseService {
  
  // ========================================
  // USER MANAGEMENT METHODS
  // ========================================
  
  /**
   * Get users list with filters and pagination
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role, 
      status, 
      lab_room_id 
    } = params

    const offset = (page - 1) * limit

    try {
      // Build query
      let query = supabase
        .from('users')
        .select(`
          *,
          lab_room:lab_rooms(id, nama_lab, kode_lab)
        `, { count: 'exact' })

      // Apply filters
      if (search) {
        query = query.or(`
          full_name.ilike.%${search}%,
          email.ilike.%${search}%,
          nim_nip.ilike.%${search}%
        `)
      }

      if (role) {
        query = query.eq('role', role)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (lab_room_id) {
        query = query.eq('lab_room_id', lab_room_id)
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Database: Get users error:', error)
        throw new Error(`Failed to fetch users: ${error.message}`)
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
      console.error('❌ Database: Get users exception:', error)
      throw error
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          lab_room:lab_rooms(id, nama_lab, kode_lab)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // User not found
        }
        console.error('❌ Database: Get user by ID error:', error)
        throw new Error(`Failed to fetch user: ${error.message}`)
      }

      return data

    } catch (error) {
      console.error('❌ Database: Get user by ID exception:', error)
      throw error
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single()

      if (existingUser) {
        throw new Error('Email already exists')
      }

      // Check if NIM/NIP already exists (if provided)
      if (userData.nim_nip) {
        const { data: existingNimNip } = await supabase
          .from('users')
          .select('id')
          .eq('nim_nip', userData.nim_nip)
          .single()

        if (existingNimNip) {
          throw new Error('NIM/NIP already exists')
        }
      }

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          status: userData.status || 'active'
        }])
        .select(`
          *,
          lab_room:lab_rooms(id, nama_lab, kode_lab)
        `)
        .single()

      if (error) {
        console.error('❌ Database: Create user error:', error)
        throw new Error(`Failed to create user: ${error.message}`)
      }

      console.log('✅ Database: User created successfully:', data.email)
      return data

    } catch (error) {
      console.error('❌ Database: Create user exception:', error)
      throw error
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    try {
      // Remove id from userData to avoid updating it
      const { id: _, ...updateData } = userData

      // Check if email is being changed and if it already exists
      if (updateData.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', updateData.email)
          .neq('id', id)
          .single()

        if (existingUser) {
          throw new Error('Email already exists')
        }
      }

      // Check if NIM/NIP is being changed and if it already exists
      if (updateData.nim_nip) {
        const { data: existingNimNip } = await supabase
          .from('users')
          .select('id')
          .eq('nim_nip', updateData.nim_nip)
          .neq('id', id)
          .single()

        if (existingNimNip) {
          throw new Error('NIM/NIP already exists')
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          lab_room:lab_rooms(id, nama_lab, kode_lab)
        `)
        .single()

      if (error) {
        console.error('❌ Database: Update user error:', error)
        throw new Error(`Failed to update user: ${error.message}`)
      }

      if (!data) {
        throw new Error('User not found')
      }

      console.log('✅ Database: User updated successfully:', data.email)
      return data

    } catch (error) {
      console.error('❌ Database: Update user exception:', error)
      throw error
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', id)
        .single()

      if (!existingUser) {
        throw new Error('User not found')
      }

      // Soft delete might be better - for now we'll do hard delete
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Database: Delete user error:', error)
        throw new Error(`Failed to delete user: ${error.message}`)
      }

      console.log('✅ Database: User deleted successfully:', existingUser.full_name)

    } catch (error) {
      console.error('❌ Database: Delete user exception:', error)
      throw error
    }
  }

  // ========================================
  // MATA KULIAH MANAGEMENT METHODS
  // ========================================

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
        console.error('❌ Database: Get mata kuliah error:', error)
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
      console.error('❌ Database: Get mata kuliah exception:', error)
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
        console.error('❌ Database: Get mata kuliah by ID error:', error)
        throw new Error(`Failed to fetch mata kuliah: ${error.message}`)
      }

      return data

    } catch (error) {
      console.error('❌ Database: Get mata kuliah by ID exception:', error)
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
        console.error('❌ Database: Create mata kuliah error:', error)
        throw new Error(`Failed to create mata kuliah: ${error.message}`)
      }

      console.log('✅ Database: Mata kuliah created successfully:', data.kode_mk)
      return data

    } catch (error) {
      console.error('❌ Database: Create mata kuliah exception:', error)
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
        console.error('❌ Database: Update mata kuliah error:', error)
        throw new Error(`Failed to update mata kuliah: ${error.message}`)
      }

      if (!data) {
        throw new Error('Mata kuliah not found')
      }

      console.log('✅ Database: Mata kuliah updated successfully:', data.kode_mk)
      return data

    } catch (error) {
      console.error('❌ Database: Update mata kuliah exception:', error)
      throw error
    }
  }

  /**
 * Delete mata kuliah - FIXED VERSION
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

    // REMOVED: Dependency check for jadwal_praktikum (table doesn't exist yet)
    // This will be added back when jadwal_praktikum table is implemented
    
    // Delete mata kuliah directly
    const { error } = await supabase
      .from('mata_kuliah')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Database: Delete mata kuliah error:', error)
      throw new Error(`Failed to delete mata kuliah: ${error.message}`)
    }

    console.log('✅ Database: Mata kuliah deleted successfully:', existingMK.nama_mk)

  } catch (error) {
    console.error('❌ Database: Delete mata kuliah exception:', error)
    throw error
  }
}

  // ========================================
  // UTILITY METHODS  
  // ========================================

  /**
   * Get lab rooms for dropdown
   */
  async getLabRooms(): Promise<{ id: string; nama_lab: string; kode_lab: string }[]> {
    try {
      const { data, error } = await supabase
        .from('lab_rooms')
        .select('id, nama_lab, kode_lab')
        .eq('status', 'active')
        .order('nama_lab')

      if (error) {
        console.error('❌ Database: Get lab rooms error:', error)
        throw new Error(`Failed to fetch lab rooms: ${error.message}`)
      }

      return data || []

    } catch (error) {
      console.error('❌ Database: Get lab rooms exception:', error)
      throw error
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, status')

      if (error) {
        console.error('❌ Database: Get user stats error:', error)
        throw new Error(`Failed to fetch user statistics: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        active: data?.filter(u => u.status === 'active').length || 0,
        inactive: data?.filter(u => u.status === 'inactive').length || 0,
        byRole: {
          admin: data?.filter(u => u.role === 'admin').length || 0,
          dosen: data?.filter(u => u.role === 'dosen').length || 0,
          laboran: data?.filter(u => u.role === 'laboran').length || 0,
          mahasiswa: data?.filter(u => u.role === 'mahasiswa').length || 0
        }
      }

      return stats

    } catch (error) {
      console.error('❌ Database: Get user stats exception:', error)
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
        console.error('❌ Database: Get mata kuliah stats error:', error)
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
      console.error('❌ Database: Get mata kuliah stats exception:', error)
      throw error
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })

      if (error) {
        console.error('❌ Database: Connection test failed:', error)
        return false
      }

      console.log('✅ Database: Connection test successful')
      return true

    } catch (error) {
      console.error('❌ Database: Connection test exception:', error)
      return false
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

// Export for testing
export { DatabaseService }