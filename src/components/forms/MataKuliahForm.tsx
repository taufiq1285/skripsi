// src/components/forms/MataKuliahForm.tsx
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import type { MataKuliah, CreateMataKuliahRequest, UpdateMataKuliahRequest } from '@/types/mataKuliah'
import { databaseService } from '@/lib/supabase/database'
import { labService } from '@/lib/services/labService'

interface MataKuliahFormProps {
  mataKuliah?: MataKuliah | null
  onSubmit: (mataKuliahData: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface FormErrors {
  [key: string]: string
}

interface FormState {
  kode_mk: string
  nama_mk: string
  sks: number
  semester: number
  dosen_id: string
  lab_room_id: string
  status: 'active' | 'inactive'
  deskripsi: string
  silabus: string
  capaian_pembelajaran: string[]
}

interface DosenOption {
  id: string
  full_name: string
  email: string
}

interface LabRoomOption {
  id: string
  kode_lab: string
  nama_lab: string
  kapasitas: number
}

const MataKuliahForm: React.FC<MataKuliahFormProps> = ({
  mataKuliah,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEdit = !!mataKuliah
  
  // Form state
  const [formData, setFormData] = useState<FormState>({
    kode_mk: '',
    nama_mk: '',
    sks: 3,
    semester: 1,
    dosen_id: '',
    lab_room_id: '',
    status: 'active',
    deskripsi: '',
    silabus: '',
    capaian_pembelajaran: []
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [dosenOptions, setDosenOptions] = useState<DosenOption[]>([])
  const [labRoomOptions, setLabRoomOptions] = useState<LabRoomOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [capaianInput, setCapaianInput] = useState('')

  // Load initial data
  useEffect(() => {
    if (mataKuliah) {
      setFormData({
        kode_mk: mataKuliah.kode_mk,
        nama_mk: mataKuliah.nama_mk,
        sks: mataKuliah.sks,
        semester: mataKuliah.semester || 1,
        dosen_id: mataKuliah.dosen_id || '',
        lab_room_id: mataKuliah.lab_room_id || '',
        status: mataKuliah.status,
        deskripsi: mataKuliah.deskripsi || '',
        silabus: mataKuliah.silabus || '',
        capaian_pembelajaran: mataKuliah.capaian_pembelajaran || []
      })
    }
  }, [mataKuliah])

  // Load dosen and lab room options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load dosen (lecturers)
        const dosenResponse = await databaseService.getUsers({ 
          role: 'dosen', 
          status: 'active',
          limit: 100 
        })
        setDosenOptions(dosenResponse.data.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email
        })))

        // Load lab rooms
        const labRoomsResponse = await labService.getLabsForSelect()
        setLabRoomOptions(labRoomsResponse)
      } catch (error) {
        console.error('Failed to load options:', error)
      }
    }
    loadOptions()
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

  const handleAddCapaianPembelajaran = () => {
    if (capaianInput.trim() && !formData.capaian_pembelajaran.includes(capaianInput.trim())) {
      setFormData(prev => ({
        ...prev,
        capaian_pembelajaran: [...prev.capaian_pembelajaran, capaianInput.trim()]
      }))
      setCapaianInput('')
    }
  }

  const handleRemoveCapaianPembelajaran = (index: number) => {
    setFormData(prev => ({
      ...prev,
      capaian_pembelajaran: prev.capaian_pembelajaran.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required fields validation
    if (!formData.kode_mk.trim()) {
      newErrors.kode_mk = 'Course code is required'
    } else if (!/^[A-Z]{2,4}\d{3,4}$/.test(formData.kode_mk)) {
      newErrors.kode_mk = 'Course code format: ABC1234 (2-4 letters + 3-4 digits)'
    }

    if (!formData.nama_mk.trim()) {
      newErrors.nama_mk = 'Course name is required'
    } else if (formData.nama_mk.length < 5) {
      newErrors.nama_mk = 'Course name must be at least 5 characters'
    }

    if (formData.sks < 1 || formData.sks > 6) {
      newErrors.sks = 'SKS must be between 1 and 6'
    }

    if (formData.semester < 1 || formData.semester > 8) {
      newErrors.semester = 'Semester must be between 1 and 8'
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
      const submitData: CreateMataKuliahRequest | UpdateMataKuliahRequest = {
        kode_mk: formData.kode_mk.toUpperCase(),
        nama_mk: formData.nama_mk.trim(),
        sks: formData.sks,
        semester: formData.semester,
        dosen_id: formData.dosen_id || undefined,
        lab_room_id: formData.lab_room_id || undefined,
        status: formData.status,
        deskripsi: formData.deskripsi.trim() || undefined,
        silabus: formData.silabus.trim() || undefined,
        capaian_pembelajaran: formData.capaian_pembelajaran.length > 0 ? formData.capaian_pembelajaran : undefined
      }

      if (isEdit && mataKuliah) {
        const updateData: UpdateMataKuliahRequest = {
          ...submitData,
          id: mataKuliah.id
        }
        await onSubmit(updateData)
      } else {
        await onSubmit(submitData)
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to save mata kuliah' })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormDisabled = loading || submitting

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? 'Edit Mata Kuliah' : 'Create New Mata Kuliah'}
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Code */}
            <Input
              label="Course Code"
              value={formData.kode_mk}
              onChange={(e) => handleInputChange('kode_mk', e.target.value.toUpperCase())}
              error={errors.kode_mk}
              disabled={isFormDisabled}
              isRequired
              placeholder="ABC1234"
              helperText="Format: 2-4 letters + 3-4 digits (e.g., KEB301)"
            />

            {/* Course Name */}
            <Input
              label="Course Name"
              value={formData.nama_mk}
              onChange={(e) => handleInputChange('nama_mk', e.target.value)}
              error={errors.nama_mk}
              disabled={isFormDisabled}
              isRequired
              placeholder="Asuhan Kebidanan I"
            />
          </div>

          {/* SKS and Semester */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="SKS (Credits)"
              type="number"
              value={formData.sks.toString()}
              onChange={(e) => handleInputChange('sks', parseInt(e.target.value) || 0)}
              error={errors.sks}
              disabled={isFormDisabled}
              isRequired
              min="1"
              max="6"
              placeholder="3"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.semester}
                onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                disabled={isFormDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                {[1,2,3,4,5,6,7,8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
              {errors.semester && (
                <p className="text-sm text-red-600">{errors.semester}</p>
              )}
            </div>

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
            </div>
          </div>

          {/* Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dosen Assignment */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Assigned Lecturer
              </label>
              <select
                value={formData.dosen_id}
                onChange={(e) => handleInputChange('dosen_id', e.target.value)}
                disabled={isFormDisabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Select lecturer (optional)</option>
                {dosenOptions.map((dosen) => (
                  <option key={dosen.id} value={dosen.id}>
                    {dosen.full_name} ({dosen.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Lab Room Assignment */}
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
                {labRoomOptions.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.kode_lab} - {lab.nama_lab} (Cap: {lab.kapasitas})
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              placeholder="Brief description of the course..."
            />
          </div>

          {/* Silabus */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Syllabus
            </label>
            <textarea
              value={formData.silabus}
              onChange={(e) => handleInputChange('silabus', e.target.value)}
              disabled={isFormDisabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              rows={4}
              placeholder="Course syllabus and topics covered..."
            />
          </div>

          {/* Capaian Pembelajaran */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Learning Outcomes (Capaian Pembelajaran)
            </label>
            
            {/* Add outcome input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={capaianInput}
                onChange={(e) => setCapaianInput(e.target.value)}
                disabled={isFormDisabled}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add learning outcome..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCapaianPembelajaran()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCapaianPembelajaran}
                disabled={isFormDisabled || !capaianInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Learning outcomes list */}
            {formData.capaian_pembelajaran.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Learning outcomes:</p>
                <div className="space-y-2">
                  {formData.capaian_pembelajaran.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-900 flex-1">
                        {index + 1}. {outcome}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCapaianPembelajaran(index)}
                        disabled={isFormDisabled}
                        className="ml-3 text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
              {isEdit ? 'Update Mata Kuliah' : 'Create Mata Kuliah'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export { MataKuliahForm }