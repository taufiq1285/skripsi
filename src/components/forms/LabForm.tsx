// src/components/forms/LabForm.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import type { LabRoom, CreateLabRequest, UpdateLabRequest } from '@/types/lab'
import { databaseService } from '@/lib/supabase/database'

interface LabFormProps {
  lab?: LabRoom | null
  onSubmit: (labData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface FormErrors {
  [key: string]: string
}

interface FormState {
  kode_lab: string
  nama_lab: string
  deskripsi: string
  kapasitas: number
  status: 'active' | 'inactive'
  lokasi: string
  pic_id: string
  fasilitas: string[]
}

const LabForm: React.FC<LabFormProps> = ({
  lab,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEdit = !!lab
  
  // Form state
  const [formData, setFormData] = useState<FormState>({
    kode_lab: '',
    nama_lab: '',
    deskripsi: '',
    kapasitas: 20,
    status: 'active',
    lokasi: '',
    pic_id: '',
    fasilitas: []
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [laboranUsers, setLaboranUsers] = useState<{ id: string; full_name: string; email: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [fasilitasInput, setFasilitasInput] = useState('')

  // Load initial data
  useEffect(() => {
    if (lab) {
      setFormData({
        kode_lab: lab.kode_lab,
        nama_lab: lab.nama_lab,
        deskripsi: lab.deskripsi || '',
        kapasitas: lab.kapasitas,
        status: lab.status,
        lokasi: lab.lokasi || '',
        pic_id: lab.pic_id || '',
        fasilitas: lab.fasilitas || []
      })
    }
  }, [lab])

  // Load laboran users for PIC selection
  useEffect(() => {
    const loadLaboranUsers = async () => {
      try {
        const response = await databaseService.getUsers({ role: 'laboran', limit: 100 })
        setLaboranUsers(response.data.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email
        })))
      } catch (error) {
        console.error('Failed to load laboran users:', error)
      }
    }
    loadLaboranUsers()
  }, [])

  const handleInputChange = (field: keyof FormState, value: any) => {
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

  const handleAddFasilitas = () => {
    if (fasilitasInput.trim() && !formData.fasilitas.includes(fasilitasInput.trim())) {
      setFormData(prev => ({
        ...prev,
        fasilitas: [...prev.fasilitas, fasilitasInput.trim()]
      }))
      setFasilitasInput('')
    }
  }

  const handleRemoveFasilitas = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields validation
    if (!formData.kode_lab.trim()) {
      newErrors.kode_lab = 'Lab code is required'
    } else if (!/^[A-Z0-9-]+$/.test(formData.kode_lab)) {
      newErrors.kode_lab = 'Lab code must contain only uppercase letters, numbers, and hyphens'
    }

    if (!formData.nama_lab.trim()) {
      newErrors.nama_lab = 'Lab name is required'
    } else if (formData.nama_lab.length < 5) {
      newErrors.nama_lab = 'Lab name must be at least 5 characters'
    }

    if (formData.kapasitas < 1) {
      newErrors.kapasitas = 'Capacity must be at least 1'
    } else if (formData.kapasitas > 100) {
      newErrors.kapasitas = 'Capacity cannot exceed 100 students'
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    
    try {
      // Prepare data for submission
      const submitData: CreateLabRequest | UpdateLabRequest = {
        kode_lab: formData.kode_lab.toUpperCase(),
        nama_lab: formData.nama_lab.trim(),
        deskripsi: formData.deskripsi.trim() || undefined,
        kapasitas: formData.kapasitas,
        status: formData.status,
        lokasi: formData.lokasi.trim(),
        pic_id: formData.pic_id || undefined,
        fasilitas: formData.fasilitas.length > 0 ? formData.fasilitas : undefined
      }

      if (isEdit && lab) {
        const updateData: UpdateLabRequest = {
          ...submitData,
          id: lab.id
        }
        await onSubmit(updateData)
      } else {
        await onSubmit(submitData)
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save lab room' })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormDisabled = loading || submitting

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Lab Room' : 'Create New Lab Room'}
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

          {/* Lab Code */}
          <Input
            label="Lab Code"
            value={formData.kode_lab}
            onChange={(e) => handleInputChange('kode_lab', e.target.value.toUpperCase())}
            error={errors.kode_lab}
            disabled={isFormDisabled}
            isRequired
            placeholder="LAB-ANC"
            helperText="Use format: LAB-XXX (uppercase letters, numbers, hyphens only)"
          />

          {/* Lab Name */}
          <Input
            label="Lab Name"
            value={formData.nama_lab}
            onChange={(e) => handleInputChange('nama_lab', e.target.value)}
            error={errors.nama_lab}
            disabled={isFormDisabled}
            isRequired
            placeholder="Lab Antenatal Care"
          />

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => handleInputChange('deskripsi', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              rows={3}
              placeholder="Describe the lab's purpose and equipment..."
            />
            {errors.deskripsi && (
              <p className="text-sm text-red-600">{errors.deskripsi}</p>
            )}
          </div>

          {/* Capacity and Location */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity"
              type="number"
              value={formData.kapasitas.toString()}
              onChange={(e) => handleInputChange('kapasitas', parseInt(e.target.value) || 0)}
              error={errors.kapasitas}
              disabled={isFormDisabled}
              isRequired
              placeholder="20"
              helperText="Maximum students"
            />

            <Input
              label="Location"
              value={formData.lokasi}
              onChange={(e) => handleInputChange('lokasi', e.target.value)}
              error={errors.lokasi}
              disabled={isFormDisabled}
              isRequired
              placeholder="Lantai 2"
            />
          </div>

          {/* Person in Charge */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Person in Charge (PIC)
            </label>
            <select
              value={formData.pic_id}
              onChange={(e) => handleInputChange('pic_id', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select laboran (optional)</option>
              {laboranUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            {errors.pic_id && (
              <p className="text-sm text-red-600">{errors.pic_id}</p>
            )}
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Facilities
            </label>
            
            {/* Add facility input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={fasilitasInput}
                onChange={(e) => setFasilitasInput(e.target.value)}
                disabled={isFormDisabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add facility (e.g., Whiteboard, Projector)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddFasilitas()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddFasilitas}
                disabled={isFormDisabled || !fasilitasInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Facilities list */}
            {formData.fasilitas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Added facilities:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.fasilitas.map((fasilitas, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {fasilitas}
                      <button
                        type="button"
                        onClick={() => handleRemoveFasilitas(index)}
                        disabled={isFormDisabled}
                        className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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
              {isEdit ? 'Update Lab Room' : 'Create Lab Room'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export { LabForm }