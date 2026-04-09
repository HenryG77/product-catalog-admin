'use client'

import { useState } from 'react'
import { X, Upload, ImageIcon, GripVertical } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  order: number
}

interface ProductImageGridProps {
  images: ProductImage[]
  mainImage?: string
  onDelete?: (id: string) => void
  onReorder?: (images: ProductImage[]) => void
  maxImages?: number
  editable?: boolean
}

export default function ProductImageGrid({
  images,
  mainImage,
  onDelete,
  onReorder,
  maxImages = 15,
  editable = false
}: ProductImageGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  
  // Combine main image with additional images for display
  const allImages = mainImage 
    ? [{ id: 'main', url: mainImage, order: -1 }, ...images]
    : images

  const handleDragStart = (id: string) => {
    if (!editable) return
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!editable || draggedId === null || draggedId === targetId) return
    
    const draggedIndex = images.findIndex(img => img.id === draggedId)
    const targetIndex = images.findIndex(img => img.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newImages = [...images]
    const [draggedImage] = newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedImage)
    
    // Update order values
    const reordered = newImages.map((img, index) => ({
      ...img,
      order: index
    }))
    
    onReorder?.(reordered)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  if (allImages.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No hay imágenes</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{allImages.length} de {maxImages} imágenes</span>
        {editable && (
          <span className="text-xs text-gray-400">
            Arrastrá para reordenar
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {allImages.map((image, index) => (
          <div
            key={image.id}
            draggable={editable && image.id !== 'main'}
            onDragStart={() => handleDragStart(image.id)}
            onDragOver={(e) => handleDragOver(e, image.id)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
              draggedId === image.id 
                ? 'border-blue-500 opacity-50' 
                : 'border-gray-200'
            } ${editable && image.id !== 'main' ? 'cursor-move' : ''}`}
          >
            <img
              src={image.url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Main image badge */}
            {image.id === 'main' && (
              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                Principal
              </div>
            )}
            
            {/* Drag handle for reordering */}
            {editable && image.id !== 'main' && (
              <div className="absolute top-1 left-1 bg-white/80 rounded p-0.5">
                <GripVertical className="h-3 w-3 text-gray-600" />
              </div>
            )}
            
            {/* Delete button */}
            {editable && onDelete && image.id !== 'main' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(image.id)
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-colors z-20 cursor-pointer touch-manipulation"
                title="Eliminar imagen"
                aria-label="Eliminar imagen"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Image number */}
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Multi-upload component
interface MultiImageUploadProps {
  onUpload: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  remainingSlots?: number
}

export function MultiImageUpload({ 
  onUpload, 
  disabled = false,
  maxFiles = 15,
  remainingSlots = 15
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > remainingSlots) {
      alert(`Solo podés subir ${remainingSlots} imágenes más`)
      return
    }
    
    onUpload(files.slice(0, remainingSlots))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || disabled) return
    
    const files = Array.from(e.target.files)
    
    if (files.length > remainingSlots) {
      alert(`Solo podés subir ${remainingSlots} imágenes más`)
      return
    }
    
    onUpload(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <Upload className={`h-10 w-10 mx-auto mb-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
      <p className={`text-sm mb-1 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {disabled 
          ? `Límite de ${maxFiles} imágenes alcanzado`
          : 'Arrastrá imágenes aquí o hacé clic para seleccionar'
        }
      </p>
      <p className="text-xs text-gray-400">
        {remainingSlots > 0 
          ? `Podés subir ${remainingSlots} imágenes más (máx. ${maxFiles} total)`
          : 'No hay espacio para más imágenes'
        }
      </p>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
        id="multi-image-upload"
      />
      <label
        htmlFor="multi-image-upload"
        className={`mt-3 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
        }`}
      >
        <Upload className="h-4 w-4 mr-2" />
        Seleccionar imágenes
      </label>
    </div>
  )
}
