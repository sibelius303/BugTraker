// Utilidades para manejar el usuario en localStorage

export const getUser = () => {
  try {
    const userString = localStorage.getItem('user')
    if (userString) {
      return JSON.parse(userString)
    }
    return null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

export const setUser = (user) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      console.log('Usuario guardado en localStorage:', user)
    } else {
      localStorage.removeItem('user')
      console.log('Usuario removido de localStorage')
    }
  } catch (error) {
    console.error('Error saving user to localStorage:', error)
  }
}

export const clearUser = () => {
  try {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('Usuario y token removidos de localStorage')
  } catch (error) {
    console.error('Error clearing user from localStorage:', error)
  }
}

export const getUserId = () => {
  const user = getUser()
  return user?.id || null
}

export const getUserName = () => {
  const user = getUser()
  return user?.name || user?.email || 'Usuario'
}

export const getUserRole = () => {
  const user = getUser()
  return user?.role || null
}
