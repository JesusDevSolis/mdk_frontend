import React from 'react'
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Settings
} from 'lucide-react'

const SucursalDetailsModal = ({ sucursal, isOpen, onClose }) => {
  if (!isOpen || !sucursal) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {sucursal.logoUrl ? (
              <img 
                src={sucursal.logoUrl} 
                alt={`Logo ${sucursal.name}`}
                className="w-12 h-12 object-contain border border-gray-200 rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{sucursal.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  sucursal.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {sucursal.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  sucursal.isOpenNow 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {sucursal.isOpenNow ? 'Abierto Ahora' : 'Cerrado'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Información General
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dirección</p>
                      <p className="text-sm text-gray-600">{sucursal.address}</p>
                    </div>
                  </div>
                  
                  {sucursal.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Teléfono</p>
                        <p className="text-sm text-gray-600">{sucursal.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {sucursal.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{sucursal.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {sucursal.capacity && (
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacidad</p>
                        <p className="text-sm text-gray-600">
                          {sucursal.stats?.activeStudents || 0} / {sucursal.capacity} alumnos
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sucursal.capacityUsed || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Estadísticas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {sucursal.stats?.activeStudents || 0}
                    </p>
                    <p className="text-sm text-blue-800">Alumnos Activos</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {sucursal.stats?.totalInstructors || 0}
                    </p>
                    <p className="text-sm text-green-800">Instructores</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">
                      {formatCurrency(sucursal.stats?.monthlyRevenue)}
                    </p>
                    <p className="text-sm text-purple-800">Ingresos Mes</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-lg font-bold text-yellow-600">
                      {sucursal.capacityUsed || 0}%
                    </p>
                    <p className="text-sm text-yellow-800">Capacidad</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {sucursal.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {sucursal.description}
                </p>
              </div>
            )}

            {/* Horarios */}
            {sucursal.schedule && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Horarios de Atención
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {days.map((day) => {
                    const schedule = sucursal.schedule[day.key]
                    return (
                      <div key={day.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{day.label}</span>
                        {schedule?.isOpen ? (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {schedule.openTime} - {schedule.closeTime}
                          </span>
                        ) : (
                          <span className="text-sm text-red-600 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Cerrado
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Configuraciones */}
            {sucursal.settings && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuraciones y Tarifas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Colegiatura Mensual</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(sucursal.settings.monthlyFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Cuota de Inscripción</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(sucursal.settings.registrationFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Máx. Alumnos por Clase</span>
                      <span className="font-medium text-gray-900">
                        {sucursal.settings.maxStudentsPerClass}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Pagos en Línea</span>
                      <span className={`font-medium ${sucursal.settings.allowOnlinePayments ? 'text-green-600' : 'text-red-600'}`}>
                        {sucursal.settings.allowOnlinePayments ? 'Permitidos' : 'No Permitidos'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Aprobación de Padres</span>
                      <span className={`font-medium ${sucursal.settings.requireParentApproval ? 'text-orange-600' : 'text-gray-600'}`}>
                        {sucursal.settings.requireParentApproval ? 'Requerida' : 'No Requerida'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metadatos */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Creada:</span> {formatDate(sucursal.createdAt)}
                </div>
                {sucursal.stats?.lastUpdated && (
                  <div>
                    <span className="font-medium">Última actualización:</span> {formatDate(sucursal.stats.lastUpdated)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SucursalDetailsModal