import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = null }) => {
  const { isAuthenticated, isLoading, hasRole, hasAnyRole } = useAuth()
  const location = useLocation()

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ NUEVO: Si se especifican múltiples roles permitidos
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!hasAnyRole(allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
            <p className="text-gray-600 mb-8">No tienes permisos para acceder a esta página</p>
            <button 
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Volver
            </button>
          </div>
        </div>
      )
    }
  }

  // Si se requiere un rol específico único
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
          <p className="text-gray-600 mb-8">No tienes permisos para acceder a esta página</p>
          <button 
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // Si todo está bien, renderizar el componente hijo
  return children
}

export default ProtectedRoute