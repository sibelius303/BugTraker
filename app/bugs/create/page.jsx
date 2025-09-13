'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { createBug, uploadMultipleScreenshots } from '../../utils/api'
import { getUser, getUserId } from '../../utils/user'
import UploadImage from '../../components/UploadImage'

export default function CreateBug() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImagesChange = (newImages) => {
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const user = getUser()
    const userId = getUserId()
    console.log('👤 Usuario obtenido:', user)
    console.log('🆔 ID del usuario:', userId)

    try {
      // Crear bug primero (sin imágenes)
      const bugData = {
        title,
        description,
        status: 'open',
        created_by: userId,
        screenshots: [] // Inicialmente vacío
      }

      console.log('🔄 Creando bug:', bugData)
      const result = await createBug(bugData)
      
      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      console.log('✅ Bug creado exitosamente:', result.data.data.id)
      
      // Ahora subir imágenes si existen
      if (images.length > 0) {
        console.log('📸 Subiendo imágenes para el bug:', result.data.data.id)
        const uploadResult = await uploadMultipleScreenshots(images, result.data.data.id)
        
        if (uploadResult.success) {
          console.log(`${uploadResult.data.uploaded} imágenes subidas exitosamente`)
        } else {
          if (uploadResult.partial) {
            // Algunas imágenes se subieron exitosamente
            console.warn(`Solo ${uploadResult.successfulUrls.length} imágenes se subieron:`, uploadResult.error)
            // Mostrar advertencia pero continuar
            alert(`Advertencia: Solo ${uploadResult.successfulUrls.length} de ${images.length} imágenes se subieron correctamente.`)
          } else {
            // Ninguna imagen se subió
            console.error('❌ Error subiendo imágenes:', uploadResult.error)
            alert(`Error al subir las imágenes: ${uploadResult.error}`)
            // Continuar de todas formas, el bug ya está creado
          }
        }
      }

      // Redirigir al inicio
      router.push('/')
      
    } catch (err) {
      console.error('💥 Error en handleSubmit:', err)
      setError('Error al crear el bug: ' + err.message)
    } finally {
      setLoading(false)
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportar Nuevo Bug</h1>
        <p className="text-gray-600">Describe el problema que encontraste</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título del Bug *
          </label>
          <input
            type="text"
            id="title"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Error en el botón de login"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="description"
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe detalladamente el problema, pasos para reproducirlo, comportamiento esperado vs actual..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <UploadImage 
          onImagesChange={handleImagesChange}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando bug...' : 'Crear Bug'}
          </button>
        </div>
      </form>
    </div>
  )
}

