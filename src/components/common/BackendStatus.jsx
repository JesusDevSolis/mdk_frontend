import React, { useState, useEffect } from 'react'
import { checkBackendConnection } from '../../services/APIservice'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const BackendStatus = () => {
  const [status, setStatus] = useState('checking') // 'checking', 'connected', 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus('checking')
        const response = await checkBackendConnection()
        setStatus('connected')
        setMessage(`Backend conectado: ${response.status} - ${response.environment}`)
      } catch (error) {
        setStatus('error')
        setMessage('No se pudo conectar con el backend. Verifica que esté corriendo en el puerto 3005.')
      }
    }

    checkConnection()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'connected':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()} mb-4`}>
      <div className="flex items-center">
        {getStatusIcon()}
        <span className="ml-2 text-sm font-medium">
          Estado del Backend: 
          <span className={`ml-1 ${
            status === 'connected' ? 'text-green-700' : 
            status === 'error' ? 'text-red-700' : 
            'text-blue-700'
          }`}>
            {status === 'checking' ? 'Verificando...' : 
             status === 'connected' ? 'Conectado' : 
             'Desconectado'}
          </span>
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2">{message}</p>
      {status === 'error' && (
        <div className="mt-3 text-sm text-red-700">
          <p><strong>Posibles soluciones:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Verifica que el backend esté corriendo: <code>npm run dev</code></li>
            <li>Confirma que esté en el puerto 3005</li>
            <li>Revisa la consola del backend por errores</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default BackendStatus