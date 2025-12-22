import React, { useState, useEffect } from 'react'
import { 
    X, 
    ClipboardCheck,
    Calendar,
    Clock,
    Award,
    Building2,
    Users,
    DollarSign,
    AlertCircle,
    CheckCircle2,
    FileText,
    Edit3,
    UserPlus,
    List,
    TrendingUp,
    AlertTriangle,
    Info
} from 'lucide-react'
import { examenesAPI, utils } from '../../services/APIservice'
import { usePermissions } from '../../hooks/usePermissions'
import PermissionGuard from '../../components/auth/PermissionGuard'
import CalificacionDetailModal from './CalificacionDetailModal'
import toast from 'react-hot-toast'

const ExamenDetailsModal = ({ examen: examenProp, isOpen, onClose, onSuccess, onEdit, onInscribir, onCalificar }) => {
    const { canUpdate } = usePermissions('calificaciones')
    const [examen, setExamen] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showEstadoMenu, setShowEstadoMenu] = useState(false)
    const [calificaciones, setCalificaciones] = useState([])
    const [estadisticasCalificaciones, setEstadisticasCalificaciones] = useState(null)
    const [loadingCalificaciones, setLoadingCalificaciones] = useState(false)
    const [showCalificacionDetail, setShowCalificacionDetail] = useState(false)
    const [selectedCalificacion, setSelectedCalificacion] = useState(null)

    useEffect(() => {
        if (isOpen && examenProp) {
        loadExamenDetails()
        loadCalificaciones()
        }
    }, [isOpen, examenProp])

    const loadExamenDetails = async () => {
        try {
        setLoading(true)
        const response = await examenesAPI.getById(examenProp._id)
        if (response.success) {
            setExamen(response.data)
        }
        } catch (error) {
        console.error('Error al cargar detalles:', error)
        toast.error('Error al cargar detalles del examen')
        setExamen(examenProp)
        } finally {
        setLoading(false)
        }
    }

    const loadCalificaciones = async () => {
        try {
            setLoadingCalificaciones(true)
            const response = await examenesAPI.getCalificacionesExamen(examenProp._id)
            if (response.success) {
                setCalificaciones(response.data.calificaciones || [])
                setEstadisticasCalificaciones(response.data.estadisticas || null)
            }
        } catch (error) {
            console.log('No hay calificaciones aún')
            setCalificaciones([])
            setEstadisticasCalificaciones(null)
        } finally {
            setLoadingCalificaciones(false)
        }
    }

    const handleCambiarEstado = async (nuevoEstado) => {
        if (!canUpdate) {
        toast.error('No tienes permiso para cambiar el estado')
        return
        }

        try {
        const response = await examenesAPI.cambiarEstado(examen._id, nuevoEstado)
        if (response.success) {
            toast.success('Estado actualizado exitosamente')
            setShowEstadoMenu(false)
            loadExamenDetails()
            // ✅ Notificar al componente padre para actualizar la lista
            if (onSuccess) onSuccess()
        }
        } catch (error) {
        console.error('Error al cambiar estado:', error)
        toast.error('Error al cambiar estado')
        }
    }

    if (!isOpen || !examen) return null

    // Helpers
    const getEstadoBadge = (estado) => {
        const badges = {
        programado: 'bg-blue-100 text-blue-800 border-blue-200',
        en_proceso: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        completado: 'bg-green-100 text-green-800 border-green-200',
        cancelado: 'bg-red-100 text-red-800 border-red-200'
        }
        const labels = {
        programado: 'Programado',
        en_proceso: 'En Proceso',
        completado: 'Completado',
        cancelado: 'Cancelado'
        }
        return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[estado] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
            {labels[estado] || estado}
        </span>
        )
    }

    const getTipoBadge = (tipo) => {
        const badges = {
        graduacion: 'bg-purple-100 text-purple-800',
        evaluacion_tecnica: 'bg-indigo-100 text-indigo-800',
        evaluacion_semestral: 'bg-cyan-100 text-cyan-800',
        otro: 'bg-gray-100 text-gray-800'
        }
        const labels = {
        graduacion: 'Graduación',
        evaluacion_tecnica: 'Evaluación Técnica',
        evaluacion_semestral: 'Evaluación Semestral',
        otro: 'Otro'
        }
        return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badges[tipo] || 'bg-gray-100 text-gray-800'}`}>
            {labels[tipo] || tipo}
        </span>
        )
    }

    const getRequisitosStatus = () => {
        const total = examen.alumnosInscritos?.length || 0
        const conRequisitos = examen.alumnosInscritos?.filter(a => a.cumpleRequisitos).length || 0
        return { total, conRequisitos, sinRequisitos: total - conRequisitos }
    }

    const getPagosStatus = () => {
        const total = examen.alumnosInscritos?.length || 0
        const pagados = examen.alumnosInscritos?.filter(a => a.pagoCompleto).length || 0
        const recaudado = examen.alumnosInscritos?.reduce((sum, a) => sum + (a.montoPagado || 0), 0) || 0
        return { total, pagados, pendientes: total - pagados, recaudado }
    }

    const requisitosStatus = getRequisitosStatus()
    const pagosStatus = getPagosStatus()

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-white" />
                <div>
                    <h2 className="text-xl font-bold text-white">Detalles del Examen</h2>
                    <p className="text-blue-100 text-sm">{examen.nombre}</p>
                </div>
                </div>
                <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                <X className="w-5 h-5 text-white" />
                </button>
            </div>
            </div>

            {/* Body */}
            {loading ? (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            ) : (
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Status y Tipo */}
                <div className="flex items-center gap-3 mb-6">
                {getEstadoBadge(examen.estado)}
                {getTipoBadge(examen.tipo)}
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna Izquierda */}
                <div className="space-y-6">
                    {/* Información General */}
                    <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Información General
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Fecha</p>
                            <p className="font-medium text-gray-900">{utils.formatDate(examen.fecha)}</p>
                        </div>
                        </div>

                        {examen.hora && (
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                            <p className="text-sm text-gray-600">Hora</p>
                            <p className="font-medium text-gray-900">{examen.hora}</p>
                            </div>
                        </div>
                        )}

                        <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Sucursal</p>
                            <p className="font-medium text-gray-900">{examen.sucursal?.name || 'N/A'}</p>
                        </div>
                        </div>

                        {examen.descripcion && (
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                            <p className="text-sm text-gray-600">Descripción</p>
                            <p className="font-medium text-gray-900">{examen.descripcion}</p>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>

                    {/* Cinturones (solo para graduación) */}
                    {examen.tipo === 'graduacion' && (
                    <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        Cinturones
                        </h3>
                        
                        <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Cinturón Actual Requerido</p>
                            <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-white"></div>
                            <span className="font-medium text-gray-900 capitalize">
                                {examen.cinturonActualRequerido?.replace('-', ' ') || 'N/A'}
                            </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400">
                            <span>→</span>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Cinturón Objetivo</p>
                            <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-2 border-purple-300 bg-purple-100"></div>
                            <span className="font-medium text-gray-900 capitalize">
                                {examen.cinturonObjetivo?.replace('-', ' ') || 'N/A'}
                            </span>
                            </div>
                        </div>
                        </div>
                    </div>
                    )}

                    {/* Requisitos */}
                    <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        Requisitos
                    </h3>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Asistencia mínima:</span>
                        <span className="font-medium text-gray-900">{examen.requisitos?.asistenciaMinima || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Días mínimos con cinturón:</span>
                        <span className="font-medium text-gray-900">{examen.requisitos?.diasMinimosCinturon || 0} días</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Costo del examen:</span>
                        <span className="font-medium text-gray-900">${examen.requisitos?.costoExamen?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pagos al corriente:</span>
                        <span className="font-medium text-gray-900">
                            {examen.requisitos?.pagosAlCorriente ? '✓ Requerido' : '✗ No requerido'}
                        </span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                    {/* Estadísticas */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Estadísticas
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Total Inscritos</p>
                        <p className="text-2xl font-bold text-gray-900">{requisitosStatus.total}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Cumplen Requisitos</p>
                        <p className="text-2xl font-bold text-green-600">{requisitosStatus.conRequisitos}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Pagos Completos</p>
                        <p className="text-2xl font-bold text-blue-600">{pagosStatus.pagados}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Recaudado</p>
                        <p className="text-2xl font-bold text-purple-600">${pagosStatus.recaudado.toFixed(2)}</p>
                        </div>
                    </div>

                    {requisitosStatus.sinRequisitos > 0 && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                            {requisitosStatus.sinRequisitos} alumno(s) no cumplen requisitos
                        </p>
                        </div>
                    )}
                    </div>

                    {/* Categorías de Evaluación */}
                    <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <List className="w-5 h-5 text-green-600" />
                        Categorías de Evaluación
                    </h3>
                    
                    <div className="space-y-2">
                        {examen.categorias?.map((cat, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div>
                            <p className="font-medium text-gray-900">{cat.nombre}</p>
                            {cat.descripcion && (
                                <p className="text-xs text-gray-500">{cat.descripcion}</p>
                            )}
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{cat.peso}%</span>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Alumnos Inscritos */}
                    <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Alumnos Inscritos ({examen.alumnosInscritos?.length || 0})
                    </h3>
                    
                    {examen.alumnosInscritos && examen.alumnosInscritos.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                        {examen.alumnosInscritos.map((inscrito, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                {inscrito.alumno?.firstName} {inscrito.alumno?.lastName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                {inscrito.cumpleRequisitos ? (
                                    <span className="text-green-600">✓ Cumple requisitos</span>
                                ) : (
                                    <span className="text-yellow-600">⚠ No cumple requisitos</span>
                                )}
                                {inscrito.pagoCompleto ? (
                                    <span className="text-blue-600">• Pagado</span>
                                ) : (
                                    <span className="text-orange-600">• Pendiente pago</span>
                                )}
                                </div>
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                        No hay alumnos inscritos aún
                        </p>
                    )}
                    </div>
                </div>
                </div>

                {/* Notas */}
                {examen.notas && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    Notas Adicionales
                    </h4>
                    <p className="text-sm text-gray-700">{examen.notas}</p>
                </div>
                )}

                {/* Calificaciones */}
                <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        Calificaciones
                    </h4>

                    {loadingCalificaciones ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : calificaciones.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-gray-500">No hay calificaciones registradas aún</p>
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas */}
                            {estadisticasCalificaciones && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-xs text-gray-600 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{estadisticasCalificaciones.totalCalificaciones}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                        <p className="text-xs text-green-700 mb-1">Aprobados</p>
                                        <p className="text-2xl font-bold text-green-700">{estadisticasCalificaciones.aprobados}</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                                        <p className="text-xs text-red-700 mb-1">Reprobados</p>
                                        <p className="text-2xl font-bold text-red-700">{estadisticasCalificaciones.reprobados}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                        <p className="text-xs text-blue-700 mb-1">Promedio</p>
                                        <p className="text-2xl font-bold text-blue-700">{estadisticasCalificaciones.promedioGeneral.toFixed(1)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Tabla de Calificaciones */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Alumno
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Calificación
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Resultado
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Evaluado Por
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Fecha
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {calificaciones.map((calif) => (
                                                <tr 
                                                    key={calif._id} 
                                                    onClick={() => {
                                                        setSelectedCalificacion(calif)
                                                        setShowCalificacionDetail(true)
                                                    }}
                                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {calif.alumno?.firstName} {calif.alumno?.lastName}
                                                                </div>
                                                                <div className="text-xs text-gray-500 capitalize">
                                                                    {calif.alumno?.belt?.level?.replace('-', ' ') || 'Sin cinturón'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <span className={`text-lg font-bold ${
                                                            calif.resultado === 'aprobado' 
                                                                ? 'text-green-600' 
                                                                : 'text-red-600'
                                                        }`}>
                                                            {calif.calificacionFinal?.toFixed(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        {calif.resultado === 'aprobado' ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Aprobado
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                Reprobado
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {calif.evaluadoPor?.name || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {utils.formatDate(calif.fechaEvaluacion)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            )}

            {/* Footer - Acciones */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex flex-wrap gap-3 justify-between">
                <div className="flex gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    Cerrar
                </button>
                
                <PermissionGuard module="calificaciones" action="update">
                    <button
                    onClick={() => onEdit && onEdit(examen)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                    <Edit3 className="w-4 h-4" />
                    Editar
                    </button>
                </PermissionGuard>
                </div>

                <div className="flex gap-2">
                {examen.estado === 'programado' && (
                    <PermissionGuard module="calificaciones" action="create">
                    <button
                        onClick={() => onInscribir && onInscribir(examen)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Inscribir Alumnos
                    </button>
                    </PermissionGuard>
                )}

                {(examen.estado === 'en_proceso' || examen.estado === 'completado') && (
                    <PermissionGuard module="calificaciones" action="create">
                    <button
                        onClick={() => onCalificar && onCalificar(examen)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Calificar
                    </button>
                    </PermissionGuard>
                )}

                {/* Cambiar Estado */}
                {canUpdate && examen.estado !== 'completado' && examen.estado !== 'cancelado' && (
                    <div className="relative">
                    <button
                        onClick={() => setShowEstadoMenu(!showEstadoMenu)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        Cambiar Estado
                    </button>
                    {showEstadoMenu && (
                        <>
                        {/* Overlay para cerrar al hacer click fuera */}
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowEstadoMenu(false)}
                        />
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-20">
                            {examen.estado === 'programado' && (
                            <button
                                onClick={() => handleCambiarEstado('en_proceso')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Iniciar Examen
                            </button>
                            )}
                            {examen.estado === 'en_proceso' && (
                            <button
                                onClick={() => handleCambiarEstado('completado')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Completar
                            </button>
                            )}
                            <button
                            onClick={() => handleCambiarEstado('cancelado')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                            Cancelar Examen
                            </button>
                        </div>
                        </>
                    )}
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>

        {/* Modal de Detalle de Calificación */}
        {showCalificacionDetail && selectedCalificacion && (
            <CalificacionDetailModal
                calificacion={selectedCalificacion}
                examen={examen}
                isOpen={showCalificacionDetail}
                onClose={() => {
                    setShowCalificacionDetail(false)
                    setSelectedCalificacion(null)
                }}
                onSuccess={() => {
                    loadCalificaciones()
                    if (onSuccess) onSuccess()
                }}
            />
        )}
        </>
    )
}

export default ExamenDetailsModal