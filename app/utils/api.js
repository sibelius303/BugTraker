import { config } from '../config/env'

const API_BASE_URL = config.API_BASE_URL

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }
}

export const fetchBugs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bugs`, {
      headers: getAuthHeaders(),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, data }
    } else {
      return { success: false, error: 'Error al cargar los bugs' }
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión' }
  }
}

export const createBug = async (bugData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bugs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bugData),
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Error al crear el bug' }
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión' }
  }
}

export const fetchBugById = async (bugId) => {
  try {
    console.log('🔍 Buscando bug con ID:', bugId)
    console.log('🌐 URL:', `${API_BASE_URL}/bugs/${bugId}`)
    
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
      headers: getAuthHeaders(),
    })

    console.log('📡 Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    const data = await response.json()
    console.log('📦 Datos recibidos:', data)

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Error al cargar el bug' }
    }
  } catch (error) {
    console.error('❌ Error en fetchBugById:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

export const updateBug = async (bugId, bugData) => {
  try {
    console.log('🔄 Actualizando bug:', { bugId, bugData })
    
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bugData)
    })

    console.log('📡 Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    const data = await response.json()
    console.log('📦 Datos recibidos:', data)

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Error al actualizar el bug' }
    }
  } catch (error) {
    console.error('❌ Error en updateBug:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

export const updateBugStatus = async (bugId, newStatus) => {
  try {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/bugs/${bugId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Error al actualizar el estado' }
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión' }
  }
}

export const uploadMultipleScreenshots = async (images, bugId) => {
  try {
    console.log('📸 Iniciando subida de múltiples imágenes:', {
      cantidad: images.length,
      bugId: bugId,
      url: `${API_BASE_URL}/bugs/upload`
    })

    const uploadPromises = images.map(async (imageData, index) => {
      console.log(`🔄 Subiendo imagen ${index + 1}/${images.length}:`, imageData.file.name)
      
      // Validaciones
      if (!imageData.file) {
        console.error(`❌ Imagen ${index + 1}: Archivo no válido`)
        return { success: false, error: 'Archivo no válido' }
      }

      if (!imageData.file.type.startsWith('image/')) {
        console.error(`❌ Imagen ${index + 1}: No es una imagen`)
        return { success: false, error: 'Solo se permiten archivos de imagen' }
      }

      if (imageData.file.size > 5 * 1024 * 1024) {
        console.error(`❌ Imagen ${index + 1}: Archivo demasiado grande (${imageData.file.size} bytes)`)
        return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB' }
      }

      const formData = new FormData()
      formData.append('screenshot', imageData.file)
      formData.append('bug_id', bugId)

      const token = localStorage.getItem('token')
      console.log(`🌐 Enviando imagen ${index + 1} al servidor...`)
      
      const response = await fetch(`${API_BASE_URL}/bugs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      console.log(`📡 Respuesta para imagen ${index + 1}:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      console.log(`📦 Datos recibidos para imagen ${index + 1}:`, data)

      if (response.ok) {
        console.log(`✅ Imagen ${index + 1} subida exitosamente`)
        return { success: true, data }
      } else {
        console.error(`❌ Error subiendo imagen ${index + 1}:`, data.message || 'Error desconocido')
        return { success: false, error: data.message || 'Error al subir la imagen' }
      }
    })

    const results = await Promise.all(uploadPromises)
    
    // Verificar si todas las subidas fueron exitosas
    const successfulUploads = results.filter(result => result.success)
    const failedUploads = results.filter(result => !result.success)
    
    console.log('📊 Resumen de subidas:', {
      exitosas: successfulUploads.length,
      fallidas: failedUploads.length,
      total: images.length
    })
    
    if (successfulUploads.length === images.length) {
      return { 
        success: true, 
        data: { 
          urls: successfulUploads.map(result => result.data.url),
          uploaded: successfulUploads.length,
          total: images.length
        }
      }
    } else {
      return { 
        success: false, 
        error: `${failedUploads.length} de ${images.length} imágenes fallaron al subir`,
        partial: successfulUploads.length > 0,
        successfulUrls: successfulUploads.map(result => result.data.url)
      }
    }
  } catch (error) {
    console.error('💥 Error en uploadMultipleScreenshots:', error)
    return { success: false, error: 'Error de conexión: ' + error.message }
  }
}

export const uploadScreenshot = async (file, bugId) => {
  try {
    // Validaciones
    if (!file) {
      return { success: false, error: 'Selecciona un archivo' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Solo se permiten archivos de imagen' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB' }
    }

    const formData = new FormData()
    formData.append('screenshot', file) // ← Campo importante: 'screenshot'
    formData.append('bug_id', bugId) // ← Campo requerido: bug_id

    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/bugs/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true, data }
    } else {
      return { success: false, error: data.message || 'Error al subir la imagen' }
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión' }
  }
}
