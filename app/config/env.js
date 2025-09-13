// Configuración de variables de entorno
export const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
}

// Función para generar ID numérico secuencial simple
let currentId = 1
export const generateNumericId = () => {
  return currentId++
}
