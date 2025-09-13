'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import { fetchBugById, updateBug, uploadMultipleScreenshots } from '../../../utils/api'
import UploadImage from '../../../components/UploadImage'

export default function EditBug() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bugId = params.id

  const [bug, setBug] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [existingScreenshots, setExistingScreenshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated && !isLoading && bugId) {
      loadBug()
    }
  }, [isAuthenticated, isLoading, bugId, loadBug])

  const loadBug = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 Cargando bug para editar:', bugId)
      const result = await fetchBugById(bugId)

      console.log('📋 Resultado de fetchBugById:', result)
      
      if (result.success) {
        const bugData = result.data.data || result.data
        console.log('✅ Bug cargado para editar:', bugData)
        
        setBug(bugData)
        setTitle(bugData.title || '')
        setDescription(bugData.description || '')
        setExistingScreenshots(bugData.screenshots || [])
      } else {
        console.error('❌ Error cargando bug:', result.error)
        setError(result.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('💥 Excepción en loadBug:', err)
      setError('Error al cargar el bug: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImagesChange = (newImages) => {
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      console.log('🔄 Guardando cambios del bug:', bugId)
      
      // Preparar datos del bug
      const bugData = {
        title,
        description,
        // Mantener otros campos como están
        status: bug?.status || 'open',
        created_by: bug?.created_by,
        screenshots: existingScreenshots // Mantener screenshots existentes por ahora
      }

      console.log('📝 Datos a enviar:', bugData)
      
      // Actualizar bug
      const result = await updateBug(bugId, bugData)
      
      if (!result.success) {
        setError(result.error)
        setSaving(false)
        return
      }

      console.log('✅ Bug actualizado exitosamente:', result.data)
      
      // Subir nuevas imágenes si existen
      if (images.length > 0) {
        console.log('📸 Subiendo nuevas imágenes para el bug:', bugId)
        const uploadResult = await uploadMultipleScreenshots(images, bugId)
        
        if (uploadResult.success) {
          console.log(`${uploadResult.data.uploaded} nuevas imágenes subidas exitosamente`)
        } else {
          if (uploadResult.partial) {
            console.warn(`Solo ${uploadResult.successfulUrls.length} nuevas imágenes se subieron:`, uploadResult.error)
            alert(`Advertencia: Solo ${uploadResult.successfulUrls.length} de ${images.length} nuevas imágenes se subieron correctamente.`)
          } else {
            console.error('❌ Error subiendo nuevas imágenes:', uploadResult.error)
            alert(`Error al subir las nuevas imágenes: ${uploadResult.error}`)
          }
        }
      }

      // Redirigir a la vista de detalle del bug
      router.push(`/bugs/${bugId}`)
      
    } catch (err) {
      console.error('💥 Error en handleSubmit:', err)
      setError('Error al guardar el bug: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // El hook ya redirige automáticamente
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando bug para editar...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <h3 className="font-semibold mb-2">Error al cargar el bug</h3>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2 text-gray-600">
              ID del bug: {bugId}
            </p>
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={loadBug}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!bug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bug no encontrado</h2>
          <p className="text-gray-600 mb-4">El bug que buscas no existe o no tienes permisos para editarlo.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header con botón de volver */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/bugs/${bugId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al bug
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Editar Bug #{bug.bug_id || bug.id}
        </h1>
      </div>

      {/* Formulario de edición */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Bug
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Screenshots existentes */}
          {existingScreenshots && existingScreenshots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshots Actuales
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingScreenshots.map((screenshot, index) => (
                  <div key={index} className="relative">
                    <img
                      src={screenshot?.url || screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Actual {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevas imágenes */}
          <UploadImage 
            onImagesChange={handleImagesChange}
          />

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded transition-colors"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                'Guardar Cambios'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/bugs/${bugId}`)}
              disabled={saving}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-2 px-4 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
