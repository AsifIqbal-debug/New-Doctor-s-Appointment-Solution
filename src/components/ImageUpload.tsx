"use client"

import { useState, useRef } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
}

export default function ImageUpload({ value, onChange, label = "Upload Image", required = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed')
      return
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('auth-token')
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to upload image')
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{color: 'var(--foreground)'}}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-lg border"
              style={{borderColor: 'var(--border)'}}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all border ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
            }`}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              borderColor: 'var(--accent)'
            }}
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span>
                Uploading...
              </>
            ) : (
              <>
                📸 {preview ? 'Change Image' : 'Choose Image'}
              </>
            )}
          </label>
          
          {/* File info */}
          <p className="text-xs mt-2 opacity-70" style={{color: 'var(--foreground-secondary)'}}>
            Max 5MB. Supports JPEG, PNG, WebP, GIF
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-2">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}
