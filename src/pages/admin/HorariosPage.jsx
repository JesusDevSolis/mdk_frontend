import React, { useState, useEffect } from 'react'
import { 
    Calendar, 
    Plus, 
    Search, 
    MoreVertical, 
    Edit3, 
    Eye, 
    Clock,
    MapPin,
    Users,
    Award,
    ChevronDown,
    X,
    SlidersHorizontal,
    Building2,
    UserCheck,
    Trash2,
    PlayCircle,
    PauseCircle,
    UserPlus,
    UserMinus,
    TrendingUp
} from 'lucide-react'
import { horariosAPI, sucursalesAPI, instructoresAPI } from '../../services/APIservice'
import { useAuth } from '../../context/AuthContext'

import HorarioForm from '../../components/forms/HorarioForm'
import HorarioDetailsModal from '../../components/modals/HorarioDetailsModal'

import toast from 'react-hot-toast'

const HorariosPage = () => {
    const { user } = useAuth()
    const [horarios, setHorarios] = useState([])
    const [sucursales, setSucursales] = useState([])
    const [instructores, setInstructores] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedHorario, setSelectedHorario] = useState(null)
    const [showActions, setShowActions] = useState(null)
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        totalCapacidad: 0,
        totalInscritos: 0,
        disponibles: 0
    })
    
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    
    const [filters, setFilters] = useState({
        sucursal: '',
        instructor: '',
        dia: '',
        nivel: '',
        categoria: '',
        estado: 'all'
    })

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData()
    }, [])

    // Filtros con debounce
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
        loadHorarios()
        }, 500)

        return () => clearTimeout(delayedSearch)
    }, [filters, searchTerm])

    const loadInitialData = async () => {
        try {
        const [horariosResponse, sucursalesResponse, instructoresResponse] = await Promise.all([
            horariosAPI.getAll(),
            sucursalesAPI.getAll(),
            instructoresAPI.getAll()
        ])

        if (horariosResponse.success) {
            setHorarios(horariosResponse.data || [])
            calculateStats(horariosResponse.data || [])
        }

        if (sucursalesResponse.success) {
            setSucursales(sucursalesResponse.data.sucursales || [])
        }

        if (instructoresResponse.success) {
            setInstructores(instructoresResponse.data.instructores || [])
        }
        } catch (error) {
        console.error('Error cargando datos iniciales:', error)
        toast.error('Error cargando datos iniciales')
        } finally {
        setLoading(false)
        }
    }

    const loadHorarios = async () => {
        try {
        setLoading(true)
        
        const params = {}
        
        if (searchTerm) params.search = searchTerm
        if (filters.sucursal) params.sucursal = filters.sucursal
        if (filters.instructor) params.instructor = filters.instructor
        if (filters.dia) params.dia = filters.dia
        if (filters.nivel) params.nivel = filters.nivel
        if (filters.categoria) params.categoria = filters.categoria
        if (filters.estado !== 'all') params.estado = filters.estado
        
        const response = await horariosAPI.getAll(params)
        
        if (response.success) {
            setHorarios(response.data)
            calculateStats(response.data)
        }
        } catch (error) {
        console.error('Error cargando horarios:', error)
        toast.error('Error cargando la lista de horarios')
        } finally {
        setLoading(false)
        }
    }

    const calculateStats = (horariosList) => {
        const total = horariosList.length
        const activos = horariosList.filter(h => h.estado === 'activo').length
        const totalCapacidad = horariosList.reduce((sum, h) => sum + (h.capacidadMaxima || 0), 0)
        const totalInscritos = horariosList.reduce((sum, h) => sum + (h.numeroInscritos || 0), 0)
        const disponibles = horariosList.filter(h => !h.estaLleno && h.estado === 'activo').length
        
        setStats({ total, activos, totalCapacidad, totalInscritos, disponibles })
    }

    const handleEdit = (horario) => {
        setSelectedHorario(horario)
        setShowEditModal(true)
        setShowActions(null)
    }

    const handleViewDetails = (horario) => {
        setSelectedHorario(horario)
        setShowDetailsModal(true)
        setShowActions(null)
    }

    const handleDelete = async (horario) => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar el horario "${horario.nombre}"?`)) {
        try {
            const response = await horariosAPI.delete(horario._id)
            if (response.success) {
            toast.success('Horario eliminado exitosamente')
            loadHorarios()
            }
        } catch (error) {
            console.error('Error eliminando horario:', error)
            toast.error(error.response?.data?.message || 'Error al eliminar el horario')
        }
        }
        setShowActions(null)
    }

    const handleCambiarEstado = async (horario, nuevoEstado) => {
        try {
        const response = await horariosAPI.cambiarEstado(horario._id, nuevoEstado)
        if (response.success) {
            toast.success(`Horario ${nuevoEstado === 'activo' ? 'activado' : 'suspendido'} exitosamente`)
            
            // Cerrar modales si están abiertos
            if (showDetailsModal) {
            setShowDetailsModal(false)
            setSelectedHorario(null)
            }
            
            // Recargar lista
            loadHorarios()
        }
        } catch (error) {
        console.error('Error cambiando estado:', error)
        toast.error('Error al cambiar el estado del horario')
        }
        setShowActions(null)
    }

    const handleSuccess = () => {
        loadHorarios()
        setShowCreateModal(false)
        setShowEditModal(false)
        setSelectedHorario(null)
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
        sucursal: '',
        instructor: '',
        dia: '',
        nivel: '',
        categoria: '',
        estado: 'all'
        })
        setSearchTerm('')
        setShowAdvancedFilters(false)
    }

    const getActiveFiltersCount = () => {
        let count = 0
        if (filters.sucursal) count++
        if (filters.instructor) count++
        if (filters.dia) count++
        if (filters.nivel) count++
        if (filters.categoria) count++
        if (filters.estado !== 'all') count++
        return count
    }

    const handleCardFilter = (filterType) => {
        setSearchTerm('')
        setShowAdvancedFilters(false)
        
        switch(filterType) {
        case 'all':
            setFilters({
            sucursal: '',
            instructor: '',
            dia: '',
            nivel: '',
            categoria: '',
            estado: 'all'
            })
            break
        case 'activos':
            setFilters(prev => ({
            ...prev,
            estado: 'activo'
            }))
            break
        case 'disponibles':
            // Filtrar horarios con lugares disponibles
            setFilters(prev => ({
            ...prev,
            estado: 'activo'
            }))
            break
        }
    }

    // Componente de tarjeta de estadísticas
    const StatCard = ({ icon: Icon, label, value, color, onClick, isActive }) => (
        <div 
        onClick={onClick}
        className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
            isActive ? `ring-2 ring-${color}-500` : ''
        }`}
        >
        <div className="flex items-center justify-between">
            <div>
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-4 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
        </div>
        </div>
    )

    // Componente de tarjeta de horario
    const HorarioCard = ({ horario }) => {
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
                'lunes': 'Lun',
                'martes': 'Mar',
                'miercoles': 'Mié',
                'jueves': 'Jue',
                'viernes': 'Vie',
                'sabado': 'Sáb',
                'domingo': 'Dom'
            }
            
            return dias.map(d => diasMap[d] || d).join(', ')
        }

        const getDiasEmojis = (dias) => {
            if (!dias || dias.length === 0) return '📅'
            return dias.map(d => getDiaEmoji(d)).join(' ')
        }

        const porcentajeOcupacion = horario.porcentajeOcupacion || 0

        return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                    {horario.nombre}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {horario.descripcion || 'Sin descripción'}
                </p>
                </div>
                <div className="relative">
                <button
                    onClick={() => setShowActions(showActions === horario._id ? null : horario._id)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                
                {showActions === horario._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                        onClick={() => handleViewDetails(horario)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                    </button>
                    {(user?.role === 'admin' || user?.role === 'instructor') && (
                        <>
                        <button
                            onClick={() => handleEdit(horario)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            Editar
                        </button>
                        <button
                            onClick={() => handleCambiarEstado(
                            horario, 
                            horario.estado === 'activo' ? 'suspendido' : 'activo'
                            )}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            {horario.estado === 'activo' ? (
                            <>
                                <PauseCircle className="w-4 h-4" />
                                Suspender
                            </>
                            ) : (
                            <>
                                <PlayCircle className="w-4 h-4" />
                                Activar
                            </>
                            )}
                        </button>
                        {user?.role === 'admin' && (
                            <button
                            onClick={() => handleDelete(horario)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                            </button>
                        )}
                        </>
                    )}
                    </div>
                )}
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(horario.estado)}`}>
                {horario.estado}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(horario.nivel)}`}>
                {horario.nivel}
                </span>
                {horario.estaLleno && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Lleno
                </span>
                )}
            </div>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3">
            {/* Días y horario */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                        {getDiasEmojis(horario.dias)} {formatDias(horario.dias)}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                        {horario.horaInicio} - {horario.horaFin}
                    </span>
                </div>
            </div>

            {/* Sucursal */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">
                {horario.sucursal?.name || 'Sin sucursal'}
                </span>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <span className="line-clamp-1">
                {horario.instructor?.name || 'Sin instructor'}
                </span>
            </div>

            {/* Capacidad */}
            <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Capacidad</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                    {horario.numeroInscritos || 0} / {horario.capacidadMaxima || 0}
                </span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-full transition-all ${
                    porcentajeOcupacion >= 90 ? 'bg-red-500' :
                    porcentajeOcupacion >= 70 ? 'bg-yellow-500' :
                    'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(porcentajeOcupacion, 100)}%` }}
                />
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                {horario.lugaresDisponibles || 0} lugares disponibles ({porcentajeOcupacion}% ocupado)
                </p>
            </div>
            </div>

            {/* Footer */}
            {(user?.role === 'admin' || user?.role === 'instructor') && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                onClick={() => handleViewDetails(horario)}
                className="w-full btn-primary text-sm py-2"
                >
                <UserPlus className="w-4 h-4 mr-2" />
                Gestionar Alumnos
                </button>
            </div>
            )}
        </div>
        )
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-7 h-7 text-primary-600" />
                Gestión de Horarios
            </h1>
            <p className="text-gray-600 mt-1">
                Administra los horarios de clases de todas las sucursales
            </p>
            </div>
            {(user?.role === 'admin' || user?.role === 'instructor') && (
            <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
            >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Horario
            </button>
            )}
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
            icon={Calendar}
            label="Total Horarios"
            value={stats.total}
            color="blue"
            onClick={() => handleCardFilter('all')}
            isActive={filters.estado === 'all' && !filters.sucursal && !filters.instructor}
            />
            <StatCard
            icon={PlayCircle}
            label="Activos"
            value={stats.activos}
            color="green"
            onClick={() => handleCardFilter('activos')}
            isActive={filters.estado === 'activo'}
            />
            <StatCard
            icon={Users}
            label="Capacidad Total"
            value={stats.totalCapacidad}
            color="purple"
            />
            <StatCard
            icon={UserCheck}
            label="Inscritos"
            value={stats.totalInscritos}
            color="indigo"
            />
            <StatCard
            icon={TrendingUp}
            label="Con Disponibilidad"
            value={stats.disponibles}
            color="orange"
            onClick={() => handleCardFilter('disponibles')}
            />
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
                {/* Búsqueda principal */}
                <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar horarios por nombre, instructor, sucursal..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                
                {/* Botones de acción */}
                <div className="flex items-center gap-2">
                {/* Filtros rápidos */}
                <div className="flex items-center gap-2">
                    <select
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
                    value={filters.estado}
                    onChange={(e) => updateFilter('estado', e.target.value)}
                    >
                    <option value="all">📋 Todos</option>
                    <option value="activo">✅ Activos</option>
                    <option value="suspendido">⏸️ Suspendidos</option>
                    <option value="cancelado">❌ Cancelados</option>
                    <option value="finalizado">🏁 Finalizados</option>
                    </select>

                    <select
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
                    value={filters.sucursal}
                    onChange={(e) => updateFilter('sucursal', e.target.value)}
                    >
                    <option value="">🏢 Todas las sucursales</option>
                    {sucursales.map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                        {sucursal.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Botón filtros avanzados */}
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`relative px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                    showAdvancedFilters || getActiveFiltersCount() > 2
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filtros
                    {getActiveFiltersCount() > 2 && (
                    <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getActiveFiltersCount() - 2}
                    </span>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Botón limpiar */}
                {(searchTerm || getActiveFiltersCount() > 0) && (
                    <button
                    onClick={clearFilters}
                    className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                    >
                    <X className="w-4 h-4" />
                    Limpiar
                    </button>
                )}
                </div>
            </div>
            </div>

            {/* Filtros avanzados */}
            {showAdvancedFilters && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Instructor */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Instructor</label>
                    <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.instructor}
                    onChange={(e) => updateFilter('instructor', e.target.value)}
                    >
                    <option value="">👨‍🏫 Todos los instructores</option>
                    {instructores.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                        {instructor.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Día */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Día de la semana</label>
                    <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.dia}
                    onChange={(e) => updateFilter('dia', e.target.value)}
                    >
                        <option value="">📅 Todos los días</option>
                        <option value="lunes">🌙 Lunes</option>
                        <option value="martes">🔥 Martes</option>
                        <option value="miercoles">💧 Miércoles</option>
                        <option value="jueves">⚡ Jueves</option>
                        <option value="viernes">🌟 Viernes</option>
                        <option value="sabado">☀️ Sábado</option>
                        <option value="domingo">🌈 Domingo</option>
                    </select>
                </div>

                {/* Nivel */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nivel</label>
                    <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.nivel}
                    onChange={(e) => updateFilter('nivel', e.target.value)}
                    >
                    <option value="">🎯 Todos los niveles</option>
                    <option value="principiante">🆕 Principiante</option>
                    <option value="infantil">👶 Infantil</option>
                    <option value="juvenil">🧒 Juvenil</option>
                    <option value="adulto">👨 Adulto</option>
                    <option value="avanzado">🥇 Avanzado</option>
                    <option value="mixto">🎭 Mixto</option>
                    </select>
                </div>

                {/* Categoría */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={filters.categoria}
                    onChange={(e) => updateFilter('categoria', e.target.value)}
                    >
                    <option value="">🏆 Todas las categorías</option>
                    <option value="poomsae">🎯 Poomsae</option>
                    <option value="combate">🥊 Combate</option>
                    <option value="defensa_personal">🛡️ Defensa Personal</option>
                    <option value="acrobacia">🤸 Acrobacia</option>
                    <option value="general">📚 General</option>
                    </select>
                </div>
                </div>

                {/* Resumen de filtros activos */}
                {getActiveFiltersCount() > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                    <span className="font-medium">{getActiveFiltersCount()}</span> filtros activos • 
                    <span className="font-medium"> {stats.total}</span> resultados encontrados
                    </p>
                </div>
                )}
            </div>
            )}
        </div>

        {/* Contenido principal */}
        {loading ? (
            <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : horarios.length === 0 ? (
            <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios</h3>
            <p className="text-gray-600 mb-6">
                {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                ? 'No se encontraron horarios con los filtros aplicados'
                : 'Comienza creando el primer horario de clases'
                }
            </p>
            {(user?.role === 'admin' || user?.role === 'instructor') && (
                <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
                >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Horario
                </button>
            )}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {horarios.map(horario => (
                <HorarioCard key={horario._id} horario={horario} />
            ))}
            </div>
        )}

            {/* Modales */}
            <HorarioForm
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    setSelectedHorario(null)
                }}
                onSuccess={handleSuccess}
                mode="create"
            />

            <HorarioForm
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedHorario(null)
                }}
                onSuccess={handleSuccess}
                horario={selectedHorario}
                mode="edit"
            />
            <HorarioDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false)
                    setSelectedHorario(null)
                }}
                horario={selectedHorario}
                onEdit={handleEdit}
                onUpdate={async () => {
                    // Recargar la lista completa
                    await loadHorarios()
                    
                    // Recargar el horario seleccionado para actualizar el modal
                    if (selectedHorario?._id) {
                        try {
                            const response = await horariosAPI.getById(selectedHorario._id)
                            if (response.success) {
                                setSelectedHorario(response.data)
                            }
                        } catch (error) {
                            console.error('Error recargando horario:', error)
                        }
                    }
                }}
            />
        </div>
    )
}

export default HorariosPage