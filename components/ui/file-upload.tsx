"use client"

import React, { useState, useRef } from 'react'
import { Upload, File as FileIcon, X, Download } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onChange: (file: File | null, url?: string) => void
  accept?: string
  maxSize?: number
  value?: string | File
  placeholder?: string
  className?: string
  disabled?: boolean
  quoteId?: string
  stageKey?: string
}

export function FileUpload({
  onChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024, // 5MB
  value,
  placeholder = "Click to upload or drag and drop",
  className,
  disabled = false,
  quoteId,
  stageKey
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
      return
    }

    setUploading(true)
    
    try {
      if (quoteId && stageKey) {
        // Upload to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('quoteId', quoteId)
        formData.append('stageKey', stageKey)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const result = await response.json()
        onChange(file, result.url)
      } else {
        // Just pass the file to the parent (for backward compatibility)
        onChange(file)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleClear = () => {
    if (!disabled) {
      onChange(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getFileName = () => {
    if (value instanceof File) {
      return value.name
    } else if (typeof value === 'string' && value) {
      return value.split('/').pop() || 'Document'
    }
    return null
  }

  const fileName = getFileName()

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
        }}
        className="hidden"
        disabled={disabled}
      />

      {fileName ? (
        <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-md">
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">{fileName}</span>
          </div>
          <div className="flex items-center gap-1">
            {typeof value === 'string' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => window.open(value, '_blank')}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <Download className="h-3 w-3" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer transition-colors",
            isDragOver && "border-blue-400 bg-blue-50",
            disabled && "cursor-not-allowed opacity-50",
            !disabled && "hover:border-gray-400"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className={cn(
            "h-8 w-8 mx-auto mb-2 text-gray-400",
            isDragOver && "text-blue-500"
          )} />
          <p className="text-sm text-gray-600 mb-1">
            {uploading ? "Processing..." : placeholder}
          </p>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} up to {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}
    </div>
  )
}