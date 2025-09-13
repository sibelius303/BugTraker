'use client'

import { useState, useEffect } from 'react'

export default function UploadImage({ onImagesChange }) {
  const [images, setImages] = useState([])

  // Sincronizar cambios con el componente padre
  useEffect(() => {
    onImagesChange(images)
  }, [images, onImagesChange])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    
    selectedFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Crear preview
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage = {
            file,
            preview: e.target.result,
            id: Date.now() + Math.random() // ID único para cada imagen
          }
          
          setImages(prev => [...prev, newImage])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleRemove = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Screenshots (opcional)
      </label>
      
      {/* Área de subida */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Seleccionar imágenes
            </span>
            <span className="mt-1 block text-sm text-gray-500">
              PNG, JPG, GIF hasta 5MB cada una
            </span>
            <span className="mt-1 block text-xs text-gray-400">
              Puedes seleccionar múltiples archivos
            </span>
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Imágenes seleccionadas ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {image.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
