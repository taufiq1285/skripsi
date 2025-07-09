// src/lib/supabase/database.ts
import { supabase } from './client'
import type { User, CreateUserRequest, UpdateUserRequest, UserListParams, UserListResponse } from '@/types/user'

class DatabaseService {
  
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
        `)

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

      // Get total count
      const { count } = await query.select('*', { count: 'exact', head: true })

      // Get paginated data
      const { data, error } = await query
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
        throw new Error('Email sudah digunakan')
      }

      // Check if NIM/NIP already exists (if provided)
      if (userData.nim_nip) {
        const { data: existingNimNip } = await supabase
          .from('users')
          .select('id')
          .eq('nim_nip', userData.nim_nip)
          .single()

        if (existingNimNip) {
          throw new Error('NIM/NIP sudah digunakan')
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
      // Check if email is being changed and if it already exists
      if (userData.email) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', userData.email)
          .neq('id', id)
          .single()

        if (existingUser) {
          throw new Error('Email sudah digunakan')
        }
      }

      // Check if NIM/NIP is being changed and if it already exists
      if (userData.nim_nip) {
        const { data: existingNimNip } = await supabase
          .from('users')
          .select('id')
          .eq('nim_nip', userData.nim_nip)
          .neq('id', id)
          .single()

        if (existingNimNip) {
          throw new Error('NIM/NIP sudah digunakan')
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
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
        throw new Error('User tidak ditemukan')
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
        throw new Error('User tidak ditemukan')
      }

      // Check for related records that would prevent deletion
      // You might want to implement soft delete instead
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