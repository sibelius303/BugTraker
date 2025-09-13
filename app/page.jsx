'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { fetchBugs } from './utils/api'
import BugCard from './components/BugCard'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const [bugs, setBugs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCreator, setFilterCreator] = useState('')
  const [showAll, setShowAll] = useState(true)

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadBugs()
    }
  }, [isAuthenticated, isLoading])

  const loadBugs = async () => {
    try {
      setLoading(true)
      const result = await fetchBugs()
      console.log(result)
      if (result.success) {
        setBugs(result.data.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Error al cargar los bugs')
    } finally {
      setLoading(false)
    }
  }

  // Función para agrupar bugs por fecha
  const groupBugsByDate = (bugs) => {
    if (!bugs || bugs.length === 0) return {}

    const grouped = bugs.reduce((groups, bug) => {
      // Obtener la fecha de creación del bug
      const createdAt = bug.created_at || bug.createdAt || Date.now()
      const date = new Date(createdAt)
      
      // Formatear la fecha como YYYY-MM-DD para agrupar
      const dateKey = date.toISOString().split('T')[0]
      
      // Formatear la fecha para mostrar (ej: "15 de Enero, 2024")
      const displayDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate,
          bugs: []
        }
      }
      
      groups[dateKey].bugs.push(bug)
      return groups
    }, {})

    // Ordenar las fechas de más reciente a más antigua
    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .reduce((sorted, key) => {
        sorted[key] = grouped[key]
        return sorted
      }, {})

    return sortedGroups
  }

  // Función para filtrar bugs por fecha
  const filterBugsByDate = (bugs, targetDate) => {
    if (!targetDate) return bugs
    
    return bugs.filter(bug => {
      const createdAt = bug.created_at || bug.createdAt || Date.now()
      const bugDate = new Date(createdAt).toISOString().split('T')[0]
      return bugDate === targetDate
    })
  }

  // Función para filtrar bugs por estado
  const filterBugsByStatus = (bugs, targetStatus) => {
    if (!targetStatus) return bugs
    
    return bugs.filter(bug => bug.status === targetStatus)
  }

  // Función para obtener estados únicos disponibles
  const getAvailableStatuses = (bugs) => {
    if (!bugs || bugs.length === 0) return []
    
    const statuses = bugs.map(bug => bug.status).filter(Boolean)
    return [...new Set(statuses)].sort()
  }

  // Función para obtener el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'closed':
        return 'Cerrado'
      case 'in-progress':
        return 'En Progreso'
      case 'reopened':
        return 'Reabierto'
      default:
        return status
    }
  }

  // Función para filtrar bugs por creador
  const filterBugsByCreator = (bugs, targetCreator) => {
    if (!targetCreator) return bugs
    
    return bugs.filter(bug => {
      const creatorName = bug.creator_name
      
      // Filtrar por ID o nombre del creador
      return creatorName === targetCreator
    })
  }

  // Función para obtener creadores únicos disponibles
  const getAvailableCreators = (bugs) => {
    if (!bugs || bugs.length === 0) return []
    
    const creators = bugs.map(bug => ({
      id: bug.creator_name,
      name: bug.creator_name || `Usuario`,
      displayName: bug.creator_name || `Usuario`
    }))
    
    // Eliminar duplicados basado en ID
    const uniqueCreators = creators.filter((creator, index, self) => 
      index === self.findIndex(c => c.id === creator.id)
    )
    
    // Ordenar por nombre
    return uniqueCreators.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }

  // Función para obtener fechas únicas disponibles
  const getAvailableDates = (bugs) => {
    if (!bugs || bugs.length === 0) return []
    
    const dates = bugs.map(bug => {
      const createdAt = bug.created_at || bug.createdAt || Date.now()
      return new Date(createdAt).toISOString().split('T')[0]
    })
    
    // Eliminar duplicados y ordenar
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a))
  }

  const handleDateFilter = (date) => {
    setFilterDate(date)
    setShowAll(!date && !filterStatus && !filterCreator) // Si hay algún filtro, no mostrar todos
  }

  const handleStatusFilter = (status) => {
    setFilterStatus(status)
    setShowAll(!status && !filterDate && !filterCreator) // Si hay algún filtro, no mostrar todos
  }

  const handleCreatorFilter = (creator) => {
    setFilterCreator(creator)
    setShowAll(!creator && !filterDate && !filterStatus) // Si hay algún filtro, no mostrar todos
  }

  const handleShowAll = () => {
    setFilterDate('')
    setFilterStatus('')
    setFilterCreator('')
    setShowAll(true)
  }

  // Aplicar filtros combinados
  const applyFilters = (bugs) => {
    let filtered = bugs
    
    // Aplicar filtro de fecha
    if (filterDate) {
      filtered = filterBugsByDate(filtered, filterDate)
    }
    
    // Aplicar filtro de estado
    if (filterStatus) {
      filtered = filterBugsByStatus(filtered, filterStatus)
    }
    
    // Aplicar filtro de creador
    if (filterCreator) {
      filtered = filterBugsByCreator(filtered, filterCreator)
    }
    
    return filtered
  }

  const filteredBugs = showAll ? bugs : applyFilters(bugs)
  const groupedBugs = groupBugsByDate(filteredBugs)
  const availableDates = getAvailableDates(bugs)
  const availableStatuses = getAvailableStatuses(bugs)
  const availableCreators = getAvailableCreators(bugs)
  
  console.log('Bugs agrupados por fecha:', groupedBugs)
  console.log('Fechas disponibles:', availableDates)
  console.log('Estados disponibles:', availableStatuses)
  console.log('Creadores disponibles:', availableCreators)
  console.log('Filtros activos:', { filterDate, filterStatus, filterCreator, showAll })

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
          <p className="mt-4 text-gray-600">Cargando bugs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            {error}
          </div>
          <button
            onClick={loadBugs}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lista de Bugs</h1>
        <p className="text-gray-600">Gestiona y revisa todos los bugs reportados</p>
      </div>

      {/* Filtros */}
      {bugs?.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Filtros principales */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Filtro por fecha */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Fecha:
                  </label>
                  <select
                    id="dateFilter"
                    value={filterDate}
                    onChange={(e) => handleDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-[180px]"
                  >
                    <option value="">Todas las fechas</option>
                    {availableDates.map((date) => {
                      const displayDate = new Date(date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      return (
                        <option key={date} value={date}>
                          {displayDate}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {/* Filtro por estado */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Estado:
                  </label>
                  <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
                  >
                    <option value="">Todos los estados</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusText(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por creador */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="creatorFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Creado por:
                  </label>
                  <select
                    id="creatorFilter"
                    value={filterCreator}
                    onChange={(e) => handleCreatorFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-[160px]"
                  >
                    <option value="">Todos los creadores</option>
                    {availableCreators.map((creator, index) => (
                      <option key={index} value={creator.displayName}>
                        {creator.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Botón Ver Todos */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleShowAll}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showAll
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Ver Todos
                </button>
              </div>
            </div>
            
            {/* Información del filtro */}
            {(filterDate || filterStatus || filterCreator) && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Filtros activos:</strong> Mostrando {filteredBugs.length} bug{filteredBugs.length !== 1 ? 's' : ''}
                  {filterDate && (
                    <span> del {new Date(filterDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  )}
                  {filterStatus && (
                    <span> con estado &quot;{getStatusText(filterStatus)}&quot;</span>
                  )}
                  {filterCreator && (
                    <span> creados por &quot;{availableCreators.find(c => c.id === parseInt(filterCreator))?.displayName || `Usuario ${filterCreator}`}&quot;</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {bugs?.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay bugs</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza reportando el primer bug.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBugs).map(([dateKey, group]) => (
            <div key={dateKey} className="space-y-4">
              {/* Header de fecha */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {group.displayDate}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {group.bugs.length} bug{group.bugs.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              {/* Grid de bugs para esta fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.bugs.map((bug) => (
                  <BugCard key={bug.id} bug={bug} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
