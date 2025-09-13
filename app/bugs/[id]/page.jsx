'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../hooks/useAuth'
import { fetchBugById, updateBugStatus } from '../../utils/api'

// Constantes de estados de bug
const BUG_STATUSES = {
  OPEN: 'open',           // Abierto
  IN_PROGRESS: 'in_progress', // En progreso
  CLOSED: 'closed',       // Cerrado
  REOPENED: 'reopened'    // Reabierto
}

export default function BugDetail() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bugId = params.id

  const [bug, setBug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading && bugId) {
      loadBug()
    }
  }, [isAuthenticated, isLoading, bugId])

  const loadBug = useCallback(async () => {
    try {
      setLoading(true)
      setError('') // Limpiar errores previos
      
      console.log('🔄 Cargando bug con ID:', bugId)
      const result = await fetchBugById(bugId)

      console.log('📋 Resultado de fetchBugById:', result)
      
      if (result.success) {
        console.log('✅ Bug cargado exitosamente:', result.data)
        setBug(result.data.data || result.data)
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
  }, [bugId])

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'closed':
        return 'Cerrado'
      case 'in_progress':
        return 'En Progreso'
      case 'reopened':
        return 'Reabierto'
      default:
        return status
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      const result = await updateBugStatus(bugId, newStatus)
      
      if (result.success) {
        // Actualizar el bug local con el nuevo estado
        setBug(prevBug => ({
          ...prevBug,
          status: newStatus
        }))
        setShowStatusModal(false)
        console.log('Estado actualizado:', result.data)
      } else {
        console.log('Error actualizando estado:', result.error)
        alert('Error al actualizar el estado: ' + result.error)
      }
    } catch (err) {
      console.log('Error actualizando estado:', err)
      alert('Error al actualizar el estado')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getAvailableStatuses = (currentStatus) => {
    const allStatuses = [
      { value: BUG_STATUSES.OPEN, label: 'Abierto', color: 'bg-green-100 text-green-800' },
      { value: BUG_STATUSES.IN_PROGRESS, label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
      { value: BUG_STATUSES.CLOSED, label: 'Cerrado', color: 'bg-red-100 text-red-800' },
      { value: BUG_STATUSES.REOPENED, label: 'Reabierto', color: 'bg-blue-100 text-blue-800' }
    ]
    
    // Filtrar el estado actual
    return allStatuses.filter(status => status.value !== currentStatus)
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
          <p className="mt-4 text-gray-600">Cargando detalles del bug...</p>
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
          <p className="text-gray-600 mb-4">El bug que buscas no existe o no tienes permisos para verlo.</p>
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
          onClick={() => router.push('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </button>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header del bug */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bug #{bug.bug_id || bug.id}
              </h1>
              <h2 className="text-xl text-gray-700 mb-4">
                {bug.title}
              </h2>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(bug.status)}`}>
              {getStatusText(bug.status)}
            </span>
          </div>
        </div>

        {/* Información del bug */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {bug.description}
                  </p>
                </div>
              </div>

              {/* Screenshots */}
              {bug.screenshots && bug.screenshots.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Screenshots</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bug.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative">
                        <img
                          src={screenshot?.url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          Screenshot {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar con información adicional */}
            <div className="space-y-6">
              {/* Información del creador */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Información</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Creado por:</span>
                    <p className="text-gray-900">{bug.creator_name || 'Usuario'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Fecha de creación:</span>
                    <p className="text-gray-900">
                      {new Date(bug.created_at || Date.now()).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Estado:</span>
                    <p className="text-gray-900">{getStatusText(bug.status)}</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Acciones</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => router.push(`/bugs/${bugId}/edit`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Editar Bug
                  </button>
                   <button 
                     onClick={() => setShowStatusModal(true)}
                     className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                   >
                     Cambiar Estado
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cambiar Estado del Bug
            </h3>
            
            <p className="text-gray-600 mb-4">
              Estado actual: <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
                {getStatusText(bug.status)}
              </span>
            </p>

            <div className="space-y-2 mb-6">
              <p className="text-sm font-medium text-gray-700">Selecciona el nuevo estado:</p>
              {getAvailableStatuses(bug.status).map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  disabled={updatingStatus}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 border-transparent hover:border-gray-300 transition-colors ${status.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{status.label}</span>
                    {updatingStatus && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={updatingStatus}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
