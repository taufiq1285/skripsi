// src/components/forms/UserForm.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import { createUserSchema, updateUserSchema, validateUserByRole, validateEmailDomain } from '@/lib/schemas/user'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import { databaseService } from '@/lib/supabase/database'

interface UserFormProps {
  user?: User | null
  onSubmit: (userData: any) => Promise<void>  // Simplified for now
  onCancel: () => void
  loading?: boolean
}

interface FormErrors {
  [key: string]: string
}

interface FormState {
  email: string
  full_name: string
  role: 'admin' | 'dosen' | 'laboran' | 'mahasiswa'
  nim_nip: string
  phone: string
  status: 'active' | 'inactive'
  lab_room_id: string
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEdit = !!user
  
  // Form state with proper typing
  const [formData, setFormData] = useState<FormState>({
    email: '',
    full_name: '',
    role: 'mahasiswa',
    nim_nip: '',
    phone: '',
    status: 'active',
    lab_room_id: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [labRooms, setLabRooms] = useState<{ id: string; nama_lab: string; kode_lab: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Load initial data
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        nim_nip: user.nim_nip || '',
        phone: user.phone || '',
        status: user.status,
        lab_room_id: user.lab_room_id || ''
      })
    }
  }, [user])

  // Load lab rooms
  useEffect(() => {
    const loadLabRooms = async () => {
      try {
        const rooms = await databaseService.getLabRooms()
        setLabRooms(rooms)
      } catch (error) {
        console.error('Failed to load lab rooms:', error)
      }
    }
    loadLabRooms()
  }, [])

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev: FormState) => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    try {
      // Create submission data with proper typing
      const submissionData: CreateUserRequest = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        nim_nip: formData.nim_nip || undefined,
        phone: formData.phone || undefined,
        status: formData.status, // Remove undefined, always has value
        lab_room_id: formData.lab_room_id || undefined
      }

      // Use appropriate schema based on mode
      const schema = isEdit ? updateUserSchema : createUserSchema
      schema.parse(submissionData)

      // Role-specific validation
      const roleErrors = validateUserByRole(submissionData)
      if (roleErrors.length > 0) {
        newErrors.role = roleErrors[0]
      }

      // Email domain validation
      const emailValidation = validateEmailDomain(submissionData.email, submissionData.role)
      if (!emailValidation.isValid && emailValidation.message) {
        newErrors.email = emailValidation.message
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0

    } catch (error: any) {
      // Handle Zod validation errors
      if (error?.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0]
          if (field) {
            newErrors[field] = err.message
          }
        })
      } else {
        newErrors.general = 'Validation failed'
      }

      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    
    try {
      // Prepare data for submission
      const submitData: CreateUserRequest | UpdateUserRequest = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        nim_nip: formData.nim_nip || undefined,
        phone: formData.phone || undefined,
        status: formData.status,
        lab_room_id: formData.lab_room_id || undefined
      }

      if (isEdit && user) {
        const updateData: UpdateUserRequest = {
          ...submitData,
          id: user.id
        }
        await onSubmit(updateData)
      } else {
        await onSubmit(submitData)
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save user' })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormDisabled = loading || submitting

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit User' : 'Create New User'}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Full Name */}
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            error={errors.full_name}
            disabled={isFormDisabled}
            isRequired
            placeholder="Enter full name"
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={isFormDisabled}
            isRequired
            placeholder="user@akbid.ac.id"
            helperText="Email domain should match the selected role"
          />

          {/* Role */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="laboran">Laboran</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* NIM/NIP */}
          <Input
            label={formData.role === 'mahasiswa' ? 'NIM' : 'NIP'}
            value={formData.nim_nip}
            onChange={(e) => handleInputChange('nim_nip', e.target.value)}
            error={errors.nim_nip}
            disabled={isFormDisabled}
            placeholder={formData.role === 'mahasiswa' ? 'Enter NIM' : 'Enter NIP'}
            helperText={
              formData.role === 'mahasiswa' 
                ? 'NIM should be 8-10 digits' 
                : formData.role === 'dosen'
                ? 'NIP should start with 19 or 20'
                : 'Enter employee ID'
            }
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            error={errors.phone}
            disabled={isFormDisabled}
            placeholder="08123456789"
            helperText="Indonesian phone number format"
          />

          {/* Lab Room */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lab Room
            </label>
            <select
              value={formData.lab_room_id}
              onChange={(e) => handleInputChange('lab_room_id', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select lab room (optional)</option>
              {labRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.kode_lab} - {room.nama_lab}
                </option>
              ))}
            </select>
            {errors.lab_room_id && (
              <p className="text-sm text-red-600">{errors.lab_room_id}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status}</p>
            )}
          </div>

        </CardContent>

        <CardFooter>
          <div className="flex justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isFormDisabled}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              isLoading={submitting}
              disabled={isFormDisabled}
            >
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export { UserForm }