'use client'

import { useEffect, useState } from 'react'

export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar estado inicial
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsAuthenticated(!!token)
      setIsLoading(false)
    }

    checkAuth()

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setIsAuthenticated(!!e.newValue)
      }
    }

    // Escuchar eventos de storage (cuando cambia en otra pestaña)
    window.addEventListener('storage', handleStorageChange)

    // Escuchar eventos personalizados (cuando cambia en la misma pestaña)
    window.addEventListener('authStateChanged', checkAuth)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', checkAuth)
    }
  }, [])

  return { isAuthenticated, isLoading }
}
