import React, { useState, useEffect } from 'react'
import { 
    ClipboardCheck,
    Plus, 
    Search,
    Calendar,
    Users,
    Award,
    Eye,
    Edit3,
    Trash2,
    MoreVertical,
    X,
    Building2,
    ChevronDown,
    Clock,
    CheckCircle2,
    Filter,
    FileText,
    UserPlus
} from 'lucide-react'
import { examenesAPI, sucursalesAPI, utils } from '../../services/APIservice'
import { useAuth } from '../../context/AuthContext'

// Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton } from '../../components/dashboard/PermissionButton'
import PermissionGuard from '../../components/auth/PermissionGuard'

import ExamenForm from '../../components/forms/ExamenForm'
import ExamenDetailsModal from '../../components/modals/ExamenDetailsModal'
import InscripcionForm from '../../components/forms/InscripcionForm'
import CalificacionForm from '../../components/forms/CalificacionForm'

import toast from 'react-hot-toast'

const ExamenesPage = () => {
    // Hook de permisos
    const { canCreate, canUpdate, canDelete } = usePermissions('calificaciones')
    
    const { user } = useAuth()
    const [examenes, setExamenes] = useState([])
    const [sucursales, setSucursales] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedExamen, setSelectedExamen] = useState(null)
    const [showActions, setShowActions] = useState(null)
    const [stats, setStats] = useState({
        total: 0,
        programados: 0,
        completados: 0,
        inscritos: 0
    })

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    
    const [filters, setFilters] = useState({
        sucursal: '',
        tipo: 'all',
        estado: 'all',
        cinturonObjetivo: '',
        fechaInicio: '',
        fechaFin: ''
    })

    const [showInscripcionModal, setShowInscripcionModal] = useState(false)
    const [showCalificacionModal, setShowCalificacionModal] = useState(false)

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData()
    }, [])

    // Filtros con debounce
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
        loadExamenes()
        }, 500)

        return () => clearTimeout(delayedSearch)
    }, [filters, searchTerm])

    const loadInitialData = async () => {
        try {
            const [examenesResponse, sucursalesResponse] = await Promise.all([
                examenesAPI.getAll(),
                sucursalesAPI.getAll()
            ])

            const examenesData = examenesResponse.data || []
            setExamenes(examenesData)
            setSucursales(sucursalesResponse.data || [])
            calculateStats(examenesData)

        } catch (error) {
            console.error('Error al cargar datos iniciales:', error)
            toast.error('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    const loadExamenes = async () => {
        try {
            setLoading(true)
            const params = {}

            if (filters.sucursal) params.sucursal = filters.sucursal
            if (filters.tipo !== 'all') params.tipo = filters.tipo
            if (filters.estado !== 'all') params.estado = filters.estado
            if (filters.cinturonObjetivo) params.cinturonObjetivo = filters.cinturonObjetivo
            if (filters.fechaInicio) params.fechaInicio = filters.fechaInicio
            if (filters.fechaFin) params.fechaFin = filters.fechaFin
            if (searchTerm) params.search = searchTerm

            const response = await examenesAPI.getAll(params)
            
            if (response.success) {
                const examenesData = response.data || []
                setExamenes(examenesData)
                calculateStats(examenesData)
            }

        } catch (error) {
            console.error('Error al cargar exámenes:', error)
            toast.error('Error al cargar exámenes')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data) => {
        setStats({
            total: data.length,
            programados: data.filter(e => e.estado === 'programado').length,
            completados: data.filter(e => e.estado === 'completado').length,
            inscritos: data.reduce((sum, e) => sum + (e.alumnosInscritos?.length || 0), 0)
        })
    }

    // Handlers
    const handleCreateExamen = () => {
        setSelectedExamen(null)
        setShowCreateModal(true)
    }

    const handleViewExamen = (examen) => {
        setSelectedExamen(examen)
        setShowDetailsModal(true)
        setShowActions(null)
    }

    const handleDeleteExamen = async (examen) => {
        if (!canDelete) {
            toast.error('No tienes permiso para eliminar exámenes')
            return
        }

        if (window.confirm(`¿Estás seguro de eliminar el examen "${examen.nombre}"?`)) {
            try {
                await examenesAPI.delete(examen._id)
                toast.success('Examen eliminado exitosamente')
                loadExamenes()
            } catch (error) {
                console.error('Error al eliminar examen:', error)
                toast.error('Error al eliminar examen')
            }
        }
        setShowActions(null)
    }

    const handleClearFilters = () => {
        setFilters({
            sucursal: '',
            tipo: 'all',
            estado: 'all',
            cinturonObjetivo: '',
            fechaInicio: '',
            fechaFin: ''
        })
        setSearchTerm('')
    }

    // Helpers para UI
    const getEstadoBadge = (estado) => {
        const badges = {
            programado: 'bg-blue-100 text-blue-800',
            en_proceso: 'bg-yellow-100 text-yellow-800',
            completado: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800'
        }
        const labels = {
            programado: 'Programado',
            en_proceso: 'En Proceso',
            completado: 'Completado',
            cancelado: 'Cancelado'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[estado] || 'bg-gray-100 text-gray-800'}`}>
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[tipo] || 'bg-gray-100 text-gray-800'}`}>
                {labels[tipo] || tipo}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ClipboardCheck className="w-8 h-8 text-blue-600" />
                    Exámenes y Calificaciones
                </h1>
                <p className="text-gray-600 mt-1">
                    Gestiona exámenes, evaluaciones y graduaciones
                </p>
                </div>

                <CreateButton 
                    module="calificaciones"
                    onClick={handleCreateExamen}
                    >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Examen
                    </CreateButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div 
                    className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 cursor-pointer transition-all hover:shadow-md ${
                        filters.estado === 'all' && filters.tipo === 'all' && !filters.sucursal ? 'ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => {
                        setFilters({ ...filters, estado: 'all', tipo: 'all', sucursal: '' })
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Exámenes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <ClipboardCheck className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div 
                    className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 cursor-pointer transition-all hover:shadow-md ${
                        filters.estado === 'programado' ? 'ring-2 ring-yellow-200' : ''
                    }`}
                    onClick={() => {
                        setFilters({ ...filters, estado: 'programado', tipo: 'all' })
                    }}
                >
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-600 text-sm font-medium">Programados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.programados}</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
                </div>

                <div 
                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 cursor-pointer transition-all hover:shadow-md ${
                    filters.estado === 'completado' ? 'ring-2 ring-green-200' : ''
                }`}
                onClick={() => {
                    setFilters({ ...filters, estado: 'completado', tipo: 'all' })
                }}
                >
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-600 text-sm font-medium">Completados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completados}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-gray-600 text-sm font-medium">Total Inscritos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.inscritos}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                    </div>
                </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar examen por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    </div>
                </div>

                {/* Toggle Advanced Filters */}
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Filter className="w-5 h-5" />
                    Filtros
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Clear Filters */}
                {(filters.sucursal || filters.tipo !== 'all' || filters.estado !== 'all' || filters.cinturonObjetivo || searchTerm) && (
                    <button
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                    <X className="w-5 h-5" />
                    Limpiar
                    </button>
                )}
                </div>

                {/* Advanced Filters Panel */}
                {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    {/* Sucursal Filter */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Sucursal
                    </label>
                    <select
                        value={filters.sucursal}
                        onChange={(e) => setFilters({ ...filters, sucursal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todas</option>
                        {sucursales.map(suc => (
                        <option key={suc._id} value={suc._id}>{suc.name}</option>
                        ))}
                    </select>
                    </div>

                    {/* Tipo Filter */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                    </label>
                    <select
                        value={filters.tipo}
                        onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos</option>
                        <option value="graduacion">Graduación</option>
                        <option value="evaluacion_tecnica">Evaluación Técnica</option>
                        <option value="evaluacion_semestral">Evaluación Semestral</option>
                        <option value="otro">Otro</option>
                    </select>
                    </div>

                    {/* Estado Filter */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </label>
                    <select
                        value={filters.estado}
                        onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Todos</option>
                        <option value="programado">Programado</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                    </div>

                    {/* Cinturón Filter */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Award className="w-4 h-4 inline mr-1" />
                        Cinturón Objetivo
                    </label>
                    <select
                        value={filters.cinturonObjetivo}
                        onChange={(e) => setFilters({ ...filters, cinturonObjetivo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todos</option>
                        <option value="blanco-amarillo">Blanco-Amarillo</option>
                        <option value="amarillo">Amarillo</option>
                        <option value="naranja">Naranja</option>
                        <option value="verde">Verde</option>
                        <option value="azul">Azul</option>
                        <option value="marron">Marrón</option>
                        <option value="negro-1">Negro 1er Dan</option>
                    </select>
                    </div>

                    {/* Fecha Inicio */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Desde
                    </label>
                    <input
                        type="date"
                        value={filters.fechaInicio}
                        onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    </div>

                    {/* Fecha Fin */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Hasta
                    </label>
                    <input
                        type="date"
                        value={filters.fechaFin}
                        onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    </div>
                </div>
                )}
            </div>

            {/* Tabla de Exámenes */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Examen
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sucursal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Inscritos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {examenes.length === 0 ? (
                                <tr>
                                <td colSpan="7" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                    <ClipboardCheck className="w-12 h-12 mb-3 text-gray-300" />
                                    <p className="text-lg font-medium">No hay exámenes registrados</p>
                                    <p className="text-sm">Crea tu primer examen para comenzar</p>
                                    </div>
                                </td>
                                </tr>
                            ) : (
                                examenes.map((examen) => (
                                    <tr key={examen._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{examen.nombre}</p>
                                            {examen.cinturonObjetivo && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <Award className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-500 capitalize">
                                                {examen.cinturonObjetivo.replace('-', ' ')}
                                                </span>
                                            </div>
                                            )}
                                        </div>
                                        </td>
                                        <td className="px-6 py-4">
                                        {getTipoBadge(examen.tipo)}
                                        </td>
                                        <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            {utils.formatDate(examen.fecha)}
                                        </div>
                                        {examen.hora && (
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Clock className="w-3 h-3" />
                                            {examen.hora}
                                            </div>
                                        )}
                                        </td>
                                        <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Building2 className="w-4 h-4" />
                                            {examen.sucursal?.name || 'N/A'}
                                        </div>
                                        </td>
                                        <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">
                                            {examen.alumnosInscritos?.length || 0}
                                            </span>
                                        </div>
                                        </td>
                                        <td className="px-6 py-4">
                                        {getEstadoBadge(examen.estado)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative">
                                                <button
                                                onClick={() => setShowActions(showActions === examen._id ? null : examen._id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {showActions === examen._id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-60">
                                                    <button
                                                        onClick={() => handleViewExamen(examen)}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver Detalles
                                                    </button>

                                                    <PermissionGuard module="calificaciones" action="delete">
                                                        <button
                                                            onClick={() => handleDeleteExamen(examen)}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Eliminar
                                                        </button>
                                                    </PermissionGuard>
                                                </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales */}
            {showCreateModal && (
                <ExamenForm
                    examen={selectedExamen} 
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false)
                        setSelectedExamen(null)
                    }}
                    onSuccess={loadExamenes}
                    mode={selectedExamen ? 'edit' : 'create'}
                />
            )}

            {showDetailsModal && selectedExamen && (
                <ExamenDetailsModal
                    examen={selectedExamen}
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false)
                        setSelectedExamen(null)
                    }}
                    onSuccess={loadExamenes}
                    onEdit={(examen) => {
                        setSelectedExamen(examen)
                        setShowDetailsModal(false)
                        setShowCreateModal(true)
                    }}
                    onInscribir={(examen) => {
                        setSelectedExamen(examen)
                        setShowDetailsModal(false)
                        setShowInscripcionModal(true)
                    }}
                    onCalificar={(examen) => {
                        setSelectedExamen(examen)
                        setShowDetailsModal(false)
                        setShowCalificacionModal(true)
                    }}
                />
            )}

            {/* Modal Inscripción */}
            {showInscripcionModal && selectedExamen && (
                <InscripcionForm
                    examen={selectedExamen}
                    isOpen={showInscripcionModal}
                    onClose={() => {
                        setShowInscripcionModal(false)
                        setSelectedExamen(null)
                    }}
                    onSuccess={async () => {
                    // Recargar la lista de exámenes
                    await loadExamenes()
                    
                    // Recargar el examen seleccionado para actualizar los inscritos
                    if (selectedExamen?._id) {
                        try {
                            const response = await examenesAPI.getById(selectedExamen._id)
                            if (response.success) {
                                setSelectedExamen(response.data)
                            }
                        } catch (error) {
                            console.error('Error al recargar examen:', error)
                        }
                    }
                    }}
                />
            )}

            {/* Modal Calificación */}
            {showCalificacionModal && selectedExamen && (
                <CalificacionForm
                    examen={selectedExamen}
                    isOpen={showCalificacionModal}
                    onClose={() => {
                        setShowCalificacionModal(false)
                        setSelectedExamen(null)
                    }}
                    onSuccess={loadExamenes}
                />
            )}
        </div>
    )
}

export default ExamenesPage