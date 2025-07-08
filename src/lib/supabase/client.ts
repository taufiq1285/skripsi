import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession()
    if (error) throw error
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}

// Test database access
export const testDatabase = async () => {
  try {
    const { error } = await supabase
      .from('lab_rooms')
      .select('count', { count: 'exact', head: true })
    
    if (error) throw error
    console.log('✅ Database access successful')
    return true
  } catch (error) {
    console.error('❌ Database access failed:', error)
    return false
  }
}
