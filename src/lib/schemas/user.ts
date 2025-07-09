// src/lib/schemas/user.ts
import { z } from 'zod'

// User role enum
export const userRoleSchema = z.enum(['admin', 'dosen', 'laboran', 'mahasiswa'], {
  errorMap: () => ({ message: 'Role harus salah satu dari: admin, dosen, laboran, mahasiswa' })
})

// User status enum
export const userStatusSchema = z.enum(['active', 'inactive'], {
  errorMap: () => ({ message: 'Status harus active atau inactive' })
})

// Base user validation schema
export const createUserSchema = z.object({
  email: z
    .string({ required_error: 'Email wajib diisi' })
    .email('Format email tidak valid')
    .min(1, 'Email tidak boleh kosong'),
    
  full_name: z
    .string({ required_error: 'Nama lengkap wajib diisi' })
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama lengkap maksimal 100 karakter')
    .trim(),
    
  role: userRoleSchema,
  
  nim_nip: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return val.length >= 5 && val.length <= 20
    }, 'NIM/NIP harus 5-20 karakter'),
    
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
      return phoneRegex.test(val)
    }, 'Format nomor telepon tidak valid (contoh: 08123456789)'),
    
  status: userStatusSchema.optional().default('active'),
  
  lab_room_id: z
    .string()
    .uuid('ID lab room tidak valid')
    .optional()
    .nullable()
})

// Update user schema (partial fields)
export const updateUserSchema = createUserSchema.partial().extend({
  id: z.string().uuid('ID user tidak valid')
})

// User list filter schema
export const userListParamsSchema = z.object({
  page: z.coerce.number().min(1, 'Page minimal 1').optional().default(1),
  limit: z.coerce.number().min(1, 'Limit minimal 1').max(100, 'Limit maksimal 100').optional().default(10),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  lab_room_id: z.string().uuid().optional()
})

// Role-specific validation rules
export const validateUserByRole = (data: z.infer<typeof createUserSchema>) => {
  const errors: string[] = []
  
  switch (data.role) {
    case 'admin':
      // Admin tidak perlu NIM/NIP
      break
      
    case 'dosen':
      if (!data.nim_nip) {
        errors.push('NIP wajib diisi untuk role dosen')
      } else if (!data.nim_nip.startsWith('19') && !data.nim_nip.startsWith('20')) {
        errors.push('NIP dosen harus dimulai dengan 19 atau 20')
      }
      break
      
    case 'laboran':
      if (!data.nim_nip) {
        errors.push('NIP wajib diisi untuk role laboran')
      }
      break
      
    case 'mahasiswa':
      if (!data.nim_nip) {
        errors.push('NIM wajib diisi untuk role mahasiswa')
      } else if (!data.nim_nip.match(/^\d{8,10}$/)) {
        errors.push('NIM harus berupa 8-10 digit angka')
      }
      break
  }
  
  return errors
}

// Email domain validation for specific roles
export const validateEmailDomain = (email: string, role: string) => {
  const allowedDomains = {
    admin: ['@akbid.ac.id'],
    dosen: ['@akbid.ac.id', '@lecturer.akbid.ac.id'],
    laboran: ['@akbid.ac.id', '@staff.akbid.ac.id'],
    mahasiswa: ['@student.akbid.ac.id', '@mhs.akbid.ac.id']
  }
  
  const domains = allowedDomains[role as keyof typeof allowedDomains] || []
  const isValidDomain = domains.some(domain => email.endsWith(domain))
  
  return {
    isValid: isValidDomain,
    message: isValidDomain ? null : `Email untuk role ${role} harus menggunakan domain: ${domains.join(', ')}`
  }
}

// Export types
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>
export type UserListParams = z.infer<typeof userListParamsSchema>