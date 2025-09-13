'use client'

import Link from 'next/link'

export default function BugCard({ bug }) {
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
      default:
        return status
    }
  }

  return (
    <Link href={`/bugs/${bug.bug_id || bug.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer group">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {bug.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>
            {getStatusText(bug.status)}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {bug.description}
        </p>
        
        <div className="text-xs text-gray-500 mb-4">
          <p>Creado por: <span className="font-medium">{bug.creator_name || 'Usuario'}</span></p>
          <p>Fecha: {new Date(bug.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
        
        {bug.screenshots && bug.screenshots.length > 0 && (
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {bug.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot?.url || screenshot}
                  alt={`Screenshot ${index + 1}`}
                  className="w-32 h-20 object-cover rounded flex-shrink-0"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Indicador de click */}
        <div className="mt-4 text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
          Click para ver detalles →
        </div>
      </div>
    </Link>
  )
}