import React, { useState, useEffect, useMemo } from 'react'
import { 
    X, 
    Calendar,
    Clock,
    MapPin,
    Users,
    Award,
    Building2,
    UserCheck,
    Edit3,
    UserPlus,
    UserMinus,
    Search,
    Loader,
    AlertCircle,
    FileText,
    DollarSign,
    PlayCircle,
    PauseCircle,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react'
import { horariosAPI, alumnosAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

// ✅ NUEVO: Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import PermissionGuard from '../../components/auth/PermissionGuard'

const HorarioDetailsModal = ({ horario, isOpen, onClose, onEdit, onUpdate }) => {
    // ========================================
    // TODOS LOS HOOKS PRIMERO (ANTES DE CUALQUIER RETURN)
    // ========================================
    
    const { user } = useAuth()
    // ✅ NUEVO: Hook de permisos
    const { can } = usePermissions('horarios')
    
    const [loading, setLoading] = useState(false)
    const [alumnosDisponibles, setAlumnosDisponibles] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [showInscribirModal, setShowInscribirModal] = useState(false)
    const [selectedAlumno, setSelectedAlumno] = useState(null)

    useEffect(() => {
        if (isOpen && showInscribirModal) {
            loadAlumnosDisponibles()
        }
    }, [isOpen, showInscribirModal])

    // useMemo ANTES del return condicional
    const alumnosInscritos = useMemo(() => {
        return horario?.alumnosInscritos?.filter(ai => ai.activo) || []
    }, [horario])

    // Filtrar alumnos disponibles por búsqueda
    const alumnosFiltrados = useMemo(() => {
        return alumnosDisponibles.filter(alumno => {
            const searchLower = searchTerm.toLowerCase()
            const fullName = `${alumno.firstName} ${alumno.lastName}`.toLowerCase()
            const studentId = alumno.enrollment?.studentId?.toLowerCase() || ''
            
            return fullName.includes(searchLower) || studentId.includes(searchLower)
        })
    }, [alumnosDisponibles, searchTerm])

    // ========================================
    // AHORA SÍ, EL RETURN CONDICIONAL
    // ========================================
    
    if (!isOpen || !horario) return null

    // ========================================
    // FUNCIONES DEL COMPONENTE
    // ========================================

    const loadAlumnosDisponibles = async () => {
        try {
            setLoading(true)
            const response = await alumnosAPI.getAll({ 
                status: 'activo'
                // Sin filtro de sucursal para máxima flexibilidad
            })
            
            if (response.success) {
                // ✅ CORRECCIÓN: Convertir todos los IDs a string para comparación correcta
                const alumnosInscritosIds = horario?.alumnosInscritos
                    ?.filter(ai => ai.activo) // Solo alumnos activos
                    ?.map(ai => {
                        // Manejar tanto objeto poblado como ObjectId
                        const id = typeof ai.alumno === 'object' ? ai.alumno._id : ai.alumno;
                        return id?.toString(); // Convertir a string para comparación
                    }) || [];
                
                // Filtrar alumnos que NO están inscritos
                const disponibles = response.data.alumnos.filter(alumno => {
                    const alumnoIdStr = alumno._id?.toString();
                    return !alumnosInscritosIds.includes(alumnoIdStr);
                });
                
                setAlumnosDisponibles(disponibles);
                
                // Debug info (puedes eliminar esto en producción)
                console.log('Total alumnos activos:', response.data.alumnos.length);
                console.log('Alumnos inscritos (IDs):', alumnosInscritosIds);
                console.log('Alumnos disponibles:', disponibles.length);
            }
        } catch (error) {
            console.error('Error cargando alumnos:', error)
            toast.error('Error cargando la lista de alumnos')
        } finally {
            setLoading(false)
        }
    }

    const handleInscribir = async (alumnoId) => {
        try {
            setLoading(true)
            const response = await horariosAPI.inscribirAlumno(horario._id, alumnoId)
            
            if (response.success) {
                toast.success('Alumno inscrito exitosamente')
                setShowInscribirModal(false)
                setSearchTerm('')
                
                // Forzar recarga cerrando y abriendo el modal
                onUpdate() // Esto recarga la lista en la página principal
            }
        } catch (error) {
            console.error('Error inscribiendo alumno:', error)
            toast.error(error.response?.data?.message || 'Error al inscribir alumno')
        } finally {
            setLoading(false)
        }
    }

    const handleDesinscribir = async (alumnoId) => {
        if (window.confirm('¿Estás seguro de desinscribir a este alumno del horario?')) {
            try {
                setLoading(true)
                const response = await horariosAPI.desinscribirAlumno(horario._id, alumnoId)
                
                if (response.success) {
                    toast.success('Alumno desinscrito exitosamente')
                    
                    // Forzar recarga cerrando y abriendo el modal
                    onUpdate() // Esto recarga la lista en la página principal
                }
            } catch (error) {
                console.error('Error desinscribiendo alumno:', error)
                toast.error(error.response?.data?.message || 'Error al desinscribir alumno')
            } finally {
                setLoading(false)
            }
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada'
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'activo': return 'bg-green-100 text-green-800'
            case 'suspendido': return 'bg-yellow-100 text-yellow-800'
            case 'cancelado': return 'bg-red-100 text-red-800'
            case 'finalizado': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getNivelColor = (nivel) => {
        switch(nivel) {
            case 'principiante': return 'bg-blue-100 text-blue-800'
            case 'infantil': return 'bg-purple-100 text-purple-800'
            case 'juvenil': return 'bg-indigo-100 text-indigo-800'
            case 'adulto': return 'bg-orange-100 text-orange-800'
            case 'avanzado': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getDiaEmoji = (dia) => {
        const emojis = {
            'lunes': '🌙',
            'martes': '🔥',
            'miercoles': '💧',
            'jueves': '⚡',
            'viernes': '🌟',
            'sabado': '☀️',
            'domingo': '🌈'
        }
        return emojis[dia] || '📅'
    }

    const formatDias = (dias) => {
        if (!dias || dias.length === 0) return 'Sin días asignados'
        
        const diasMap = {
            'lunes': 'Lunes',
            'martes': 'Martes',
            'miercoles': 'Miércoles',
            'jueves': 'Jueves',
            'viernes': 'Viernes',
            'sabado': 'Sábado',
            'domingo': 'Domingo'
        }
        
        return dias.map(d => diasMap[d] || d).join(', ')
    }

    const getDiasEmojis = (dias) => {
        if (!dias || dias.length === 0) return '📅'
        return dias.map(d => getDiaEmoji(d)).join(' ')
    }

    const porcentajeOcupacion = horario.porcentajeOcupacion || 0

    // ========================================
    // RENDER DEL COMPONENTE
    // ========================================

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
                    <div className="flex items-center gap-4">
                        {/* Icono del horario */}
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>

                        {/* Información principal */}
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {horario.nombre}
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-purple-100 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {getDiasEmojis(horario.dias)} {formatDias(horario.dias)}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {horario.horaInicio} - {horario.horaFin}
                                </span>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(horario.estado)}`}>
                                    {horario.estado}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        {/* ✅ CORREGIDO: Botón Editar con permisos */}
                        <PermissionGuard module="horarios" action="update">
                            <button
                                onClick={() => {
                                    onClose()
                                    onEdit(horario)
                                }}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Editar
                            </button>
                        </PermissionGuard>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Columna izquierda - Información del horario */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información Básica */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary-600" />
                                    Información del Horario
                                </h3>
                                <div className="space-y-4">
                                    {horario.descripcion && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Descripción</label>
                                            <p className="text-gray-900">{horario.descripcion}</p>
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                Sucursal
                                            </label>
                                            <p className="text-gray-900">
                                                {horario.sucursal?.name || 'No especificada'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <UserCheck className="w-4 h-4" />
                                                Instructor
                                            </label>
                                            <p className="text-gray-900">
                                                {horario.instructor?.name || 'No especificado'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Award className="w-4 h-4" />
                                                Nivel
                                            </label>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(horario.nivel)}`}>
                                                {horario.nivel}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Categoría</label>
                                            <p className="text-gray-900 capitalize">
                                                {horario.categoria?.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>

                                    {horario.salon && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Salón
                                            </label>
                                            <p className="text-gray-900">{horario.salon}</p>
                                        </div>
                                    )}

                                    {horario.precio > 0 && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <DollarSign className="w-4 h-4" />
                                                Precio Mensual
                                            </label>
                                            <p className="text-gray-900 font-semibold">
                                                {new Intl.NumberFormat('es-MX', {
                                                    style: 'currency',
                                                    currency: 'MXN'
                                                }).format(horario.precio)}
                                            </p>
                                        </div>
                                    )}

                                    {(horario.fechaInicio || horario.fechaFin) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {horario.fechaInicio && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Fecha Inicio</label>
                                                    <p className="text-gray-900">{formatDate(horario.fechaInicio)}</p>
                                                </div>
                                            )}
                                            {horario.fechaFin && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Fecha Fin</label>
                                                    <p className="text-gray-900">{formatDate(horario.fechaFin)}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alumnos Inscritos */}
                            <div className="bg-gray-50 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-600" />
                                        Alumnos Inscritos ({alumnosInscritos.length})
                                    </h3>
                                    {/* ✅ CORREGIDO: Botón con permisos */}
                                    {!horario.estaLleno && (
                                        <PermissionGuard module="horarios" action="enrollStudents">
                                            <button
                                                onClick={() => setShowInscribirModal(true)}
                                                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Inscribir Alumno
                                            </button>
                                        </PermissionGuard>
                                    )}
                                </div>

                                {alumnosInscritos.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay alumnos inscritos en este horario</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {alumnosInscritos.map((inscripcion) => {
                                            const alumno = inscripcion.alumno
                                            return (
                                                <div 
                                                    key={inscripcion._id || alumno._id} 
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {alumno.profilePhotoUrl ? (
                                                            <img 
                                                                src={alumno.profilePhotoUrl} 
                                                                alt={alumno.firstName}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                                <span className="text-primary-600 font-medium text-sm">
                                                                    {alumno.firstName?.charAt(0)}{alumno.lastName?.charAt(0)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {alumno.firstName} {alumno.lastName}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                ID: {alumno.enrollment?.studentId || 'N/A'} • 
                                                                Inscrito: {formatDate(inscripcion.fechaInscripcion)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {/* ✅ CORREGIDO: Botón con permisos */}
                                                    <PermissionGuard module="horarios" action="unenrollStudents">
                                                        <button
                                                            onClick={() => handleDesinscribir(alumno._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            disabled={loading}
                                                        >
                                                            <UserMinus className="w-4 h-4" />
                                                        </button>
                                                    </PermissionGuard>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Notas */}
                            {horario.notas && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                                        Notas
                                    </h3>
                                    <p className="text-gray-700">{horario.notas}</p>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Estadísticas */}
                        <div className="space-y-6">
                            {/* Capacidad */}
                            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg p-5 border border-primary-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary-600" />
                                    Ocupación
                                </h3>
                                
                                <div className="space-y-4">
                                    {/* Números */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Inscritos</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {horario.numeroInscritos || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Capacidad</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {horario.capacidadMaxima || 0}
                                        </span>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-600">Porcentaje</span>
                                            <span className={`text-sm font-bold ${
                                                porcentajeOcupacion >= 90 ? 'text-red-600' :
                                                porcentajeOcupacion >= 70 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {porcentajeOcupacion}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className={`h-full transition-all ${
                                                    porcentajeOcupacion >= 90 ? 'bg-red-500' :
                                                    porcentajeOcupacion >= 70 ? 'bg-yellow-500' :
                                                    'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Lugares disponibles */}
                                    <div className="pt-4 border-t border-primary-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Lugares disponibles</span>
                                            <span className={`text-xl font-bold ${
                                                horario.estaLleno ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                                {horario.lugaresDisponibles || 0}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Estado de disponibilidad */}
                                    {horario.estaLleno ? (
                                        <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                            <XCircle className="w-5 h-5 text-red-600" />
                                            <span className="text-sm font-medium text-red-800">Horario lleno</span>
                                        </div>
                                    ) : (
                                        <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Lugares disponibles</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Configuración */}
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Lista de espera</span>
                                        {horario.configuracion?.permitirListaEspera ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Notificar inscripciones</span>
                                        {horario.configuracion?.notificarInscripciones ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Requiere confirmación</span>
                                        {horario.configuracion?.requiereConfirmacion ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Recurrente</span>
                                        {horario.recurrente ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Inscribir Alumno */}
            {showInscribirModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Inscribir Alumno</h3>
                                    <p className="text-blue-100 text-sm">Selecciona un alumno para inscribir</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowInscribirModal(false)
                                    setSearchTerm('')
                                }}
                                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Búsqueda */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar alumno por nombre o ID..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Lista de alumnos */}
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                                </div>
                            ) : alumnosFiltrados.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {searchTerm 
                                            ? 'No se encontraron alumnos con ese criterio'
                                            : 'No hay alumnos disponibles para inscribir'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {alumnosFiltrados.map((alumno) => (
                                        <div
                                            key={alumno._id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                            onClick={() => handleInscribir(alumno._id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {alumno.profilePhotoUrl ? (
                                                    <img 
                                                        src={alumno.profilePhotoUrl} 
                                                        alt={alumno.firstName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-primary-600 font-medium text-sm">
                                                            {alumno.firstName?.charAt(0)}{alumno.lastName?.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {alumno.firstName} {alumno.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {alumno.enrollment?.studentId || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button className="btn-primary text-sm py-1 px-3">
                                                Inscribir
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HorarioDetailsModal