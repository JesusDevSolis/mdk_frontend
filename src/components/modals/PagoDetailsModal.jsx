import React from 'react'
import { 
    X, 
    User, 
    Calendar,
    DollarSign,
    Building2,
    Phone,
    Mail,
    CreditCard,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Edit,
    Trash2,
    Download,
    Tag,
    Users
} from 'lucide-react'

const PagoDetailsModal = ({ isOpen, onClose, pago, onEdit, onDelete }) => {
    if (!isOpen || !pago) return null

    console.log('🔍 Pago completo en modal:', pago)

    const getStatusInfo = (status) => {
        const statusInfo = {
        pagado: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            icon: CheckCircle,
            label: 'Pagado'
        },
        pendiente: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            icon: Clock,
            label: 'Pendiente'
        },
        vencido: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            icon: AlertCircle,
            label: 'Vencido'
        },
        cancelado: {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            border: 'border-gray-300',
            icon: XCircle,
            label: 'Cancelado'
        }
        }
        return statusInfo[status] || statusInfo.pendiente
    }

    const getTypeInfo = (type) => {
        const types = {
        colegiatura: { label: 'Colegiatura', color: 'blue' },
        inscripcion: { label: 'Inscripción', color: 'purple' },
        uniforme: { label: 'Uniforme', color: 'indigo' },
        examen: { label: 'Examen', color: 'pink' },
        equipo: { label: 'Equipo', color: 'cyan' },
        otro: { label: 'Otro', color: 'gray' }
        }
        return types[type] || types.otro
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
        }).format(amount || 0)
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        })
    }

    const formatDateTime = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        })
    }

    const statusInfo = getStatusInfo(pago.status)
    const typeInfo = getTypeInfo(pago.type)
    const StatusIcon = statusInfo.icon

    // Obtener datos del alumno - manejar diferentes estructuras
    const alumno = pago.alumno || {}
    const alumnoNombre = alumno.firstName && alumno.lastName 
        ? `${alumno.firstName} ${alumno.lastName}` 
        : 'No especificado'
    
    // Obtener datos de la sucursal - manejar diferentes estructuras
    const sucursal = pago.sucursal || {}
    const sucursalNombre = sucursal.name || 'No especificada'
    
    // Obtener datos del tutor - manejar diferentes estructuras
    const tutor = pago.tutor || {}
    const tutorNombre = tutor.firstName && tutor.lastName 
        ? `${tutor.firstName} ${tutor.lastName}` 
        : null

    // ===== RENDER =====

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                <h2 className="text-xl font-bold text-white">
                    Detalles del Pago
                </h2>
                <p className="text-blue-100 text-sm">
                    {pago.receiptNumber || 'Sin número de recibo'}
                </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
            {/* Estado y Tipo */}
            <div className="flex flex-wrap gap-4">
                <div className={`flex-1 min-w-[200px] ${statusInfo.bg} ${statusInfo.border} border-2 rounded-lg p-4`}>
                <div className="flex items-center gap-3">
                    <StatusIcon className={`w-8 h-8 ${statusInfo.text}`} />
                    <div>
                    <p className="text-sm font-medium text-gray-600">Estado del Pago</p>
                    <p className={`text-lg font-bold ${statusInfo.text}`}>
                        {statusInfo.label}
                    </p>
                    </div>
                </div>
                </div>

                <div className={`flex-1 min-w-[200px] bg-${typeInfo.color}-100 border-2 border-${typeInfo.color}-300 rounded-lg p-4`}>
                <div className="flex items-center gap-3">
                    <Tag className={`w-8 h-8 text-${typeInfo.color}-600`} />
                    <div>
                    <p className="text-sm font-medium text-gray-600">Tipo de Pago</p>
                    <p className={`text-lg font-bold text-${typeInfo.color}-800`}>
                        {typeInfo.label}
                    </p>
                    </div>
                </div>
                </div>
            </div>

            {/* Información del Monto */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Monto Original</p>
                    <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(pago.amount)}
                    </p>
                </div>
                
                {pago.discount > 0 && (
                    <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Descuento</p>
                    <p className="text-2xl font-bold text-orange-600">
                        - {formatCurrency(pago.discount)}
                    </p>
                    </div>
                )}

                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total a Pagar</p>
                    <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(pago.total || (pago.amount - (pago.discount || 0)))}
                    </p>
                </div>
                </div>
            </div>

            {/* Información del Alumno */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información del Alumno
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="text-base font-medium text-gray-900">
                    {alumnoNombre}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-600">ID del Estudiante</p>
                    <p className="text-base font-medium text-gray-900">
                    {alumno.enrollment?.studentId || 'N/A'}
                    </p>
                </div>

                {alumno.email && (
                    <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {alumno.email}
                    </p>
                    </div>
                )}

                {alumno.phone && (
                    <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {alumno.phone}
                    </p>
                    </div>
                )}

                {alumno.belt?.level && (
                    <div>
                    <p className="text-sm text-gray-600">Cinturón Actual</p>
                    <p className="text-base font-medium text-gray-900 capitalize">
                        {alumno.belt.level}
                    </p>
                    </div>
                )}

                {alumno.enrollment?.status && (
                    <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="text-base font-medium text-gray-900 capitalize">
                        {alumno.enrollment.status}
                    </p>
                    </div>
                )}
                </div>
            </div>

            {/* Información de Sucursal */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Información de Sucursal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600">Sucursal</p>
                    <p className="text-base font-medium text-gray-900">
                    {sucursalNombre}
                    </p>
                </div>

                {sucursal.address && (
                    <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="text-base font-medium text-gray-900">
                        {sucursal.address}
                    </p>
                    </div>
                )}

                {sucursal.phone && (
                    <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {sucursal.phone}
                    </p>
                    </div>
                )}

                {sucursal.email && (
                    <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {sucursal.email}
                    </p>
                    </div>
                )}
                </div>
            </div>

            {/* Información del Tutor (si existe) */}
            {tutorNombre && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Información del Tutor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <p className="text-sm text-gray-600">Nombre del Tutor</p>
                    <p className="text-base font-medium text-gray-900">
                        {tutorNombre}
                    </p>
                    </div>

                    {tutor.email && (
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {tutor.email}
                        </p>
                    </div>
                    )}

                    {tutor.phone && (
                    <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {tutor.phone}
                        </p>
                    </div>
                    )}

                    {tutor.relationship && (
                    <div>
                        <p className="text-sm text-gray-600">Parentesco</p>
                        <p className="text-base font-medium text-gray-900 capitalize">
                        {tutor.relationship}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Fechas */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                Fechas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                    <p className="text-base font-medium text-gray-900">
                    {formatDate(pago.dueDate)}
                    </p>
                </div>

                {pago.paidDate && (
                    <div>
                    <p className="text-sm text-gray-600">Fecha de Pago</p>
                    <p className="text-base font-medium text-green-600">
                        {formatDate(pago.paidDate)}
                    </p>
                    </div>
                )}

                {pago.isOverdue && pago.status !== 'pagado' && (
                    <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">
                        ⚠️ Este pago está vencido desde hace {pago.daysOverdue} día(s)
                    </p>
                    </div>
                )}
                </div>
            </div>

            {/* Periodo (para colegiaturas) */}
            {pago.period && pago.period.month && pago.period.year && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                    <p className="text-sm text-blue-600 font-medium">Periodo de Colegiatura</p>
                    <p className="text-lg font-bold text-blue-900">
                        {new Date(pago.period.year, pago.period.month - 1).toLocaleDateString('es-MX', { 
                        month: 'long', 
                        year: 'numeric' 
                        })}
                    </p>
                    </div>
                </div>
                </div>
            )}

            {/* Información de Pago */}
            {pago.status === 'pagado' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Información del Pago Realizado
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pago.paymentMethod && (
                    <div>
                        <p className="text-sm text-gray-600">Método de Pago</p>
                        <p className="text-base font-medium text-gray-900 capitalize">
                        {pago.paymentMethod}
                        </p>
                    </div>
                    )}

                    {pago.paymentReference && (
                    <div>
                        <p className="text-sm text-gray-600">Referencia</p>
                        <p className="text-base font-medium text-gray-900">
                        {pago.paymentReference}
                        </p>
                    </div>
                    )}

                    {pago.paidBy && (
                    <div>
                        <p className="text-sm text-gray-600">Registrado por</p>
                        <p className="text-base font-medium text-gray-900">
                        {pago.paidBy.name}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Comprobante */}
            {pago.receiptFile?.url && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Comprobante de Pago
                </h3>
                
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm text-gray-600">Archivo disponible</p>
                    <p className="text-base font-medium text-gray-900">
                        {pago.receiptFile.filename || 'Comprobante subido exitosamente'}
                    </p>
                    </div>
                    <a
                    href={`http://localhost:3005${pago.receiptFile.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2"
                    >
                    <Download className="w-5 h-5" />
                    Descargar
                    </a>
                </div>
                </div>
            )}

            {/* Descripción y Notas */}
            {(pago.description || pago.notes) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Información Adicional
                </h3>
                
                <div className="space-y-4">
                    {pago.description && (
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Descripción</p>
                        <p className="text-base text-gray-900">{pago.description}</p>
                    </div>
                    )}

                    {pago.notes && (
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Notas Adicionales</p>
                        <p className="text-base text-gray-900 whitespace-pre-wrap">{pago.notes}</p>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Información de Auditoría */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-600">Creado el</p>
                    <p className="text-gray-900 font-medium">
                    {formatDateTime(pago.createdAt)}
                    </p>
                </div>

                {pago.updatedAt && pago.updatedAt !== pago.createdAt && (
                    <div>
                    <p className="text-gray-600">Última modificación</p>
                    <p className="text-gray-900 font-medium">
                        {formatDateTime(pago.updatedAt)}
                    </p>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* Footer con acciones */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
                Cerrar
            </button>

            <div className="flex items-center gap-3">
                {pago.status !== 'pagado' && pago.status !== 'cancelado' && (
                <>
                    <button
                    onClick={() => {
                        onEdit(pago)
                        onClose()
                    }}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                    >
                    <Edit className="w-5 h-5" />
                    Editar
                    </button>

                    <button
                    onClick={() => {
                        if (window.confirm('¿Estás seguro de eliminar este pago?')) {
                        onDelete(pago)
                        onClose()
                        }
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                    <Trash2 className="w-5 h-5" />
                    Eliminar
                    </button>
                </>
                )}
            </div>
            </div>
        </div>
        </div>
    )
}

export default PagoDetailsModal