import { config } from '../config/env'
import { setUser } from './user'

const API_BASE_URL = config.API_BASE_URL

export const loginUser = async (email, password) => {
  try {
    console.log('Enviando datos de login:', { email })
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    console.log('Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    const data = await response.json()
    console.log('Datos recibidos:', data)

    if (response.ok) {
      if (data.data && data.data.token) {
        localStorage.setItem('token', data.data.token)
        
        // Guardar usuario como JSON string
        if (data.data.user) {
          setUser(data.data.user)
          console.log('Usuario guardado en localStorage:', data.data.user)
        }
        
        console.log('Token guardado en localStorage:', data.data.token)
        // Disparar evento personalizado para notificar el cambio
        window.dispatchEvent(new Event('authStateChanged'))
        return { success: true, data }
      } else {
        console.error('No se recibió token del servidor:', data)
        return { success: false, error: 'No se recibió token del servidor' }
      }
    } else {
      console.error('Error en login:', data)
      return { success: false, error: data.message || 'Error en el login' }
    }
  } catch (error) {
    console.error('Error de conexión en login:', error)
    return { success: false, error: 'Error de conexión' }
  }
}

export const registerUser = async (name, email, password, role) => {
  try {
    console.log('Enviando datos de registro:', { name, email, role })
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    })

    console.log('Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    const data = await response.json()
    console.log('Datos recibidos:', data)

    if (response.ok) {
      if (data.data) {
        // Guardar token si está disponible
        if (data.data.token) {
          localStorage.setItem('token', data.data.token)
          console.log('Token guardado en localStorage:', data.data.token)
        }
        
        // Guardar usuario si está disponible
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
          console.log('Usuario guardado en localStorage:', data.data.user)
        }
        
        // Disparar evento personalizado para notificar el cambio
        window.dispatchEvent(new Event('authStateChanged'))
        return { success: true, data }
      }
    } else {
      console.error('Error en registro:', data)
      return { success: false, error: data.message || 'Error en el registro' }
    }
  } catch (error) {
    console.error('Error de conexión en registro:', error)
    return { success: false, error: 'Error de conexión' }
  }
}
