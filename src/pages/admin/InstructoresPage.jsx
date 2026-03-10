import React, { useState, useEffect } from 'react'
import { 
    Users, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit3, 
    Eye, 
    User,
    Award,
    Calendar,
    Phone,
    Mail,
    ChevronDown,
    X,
    SlidersHorizontal,
    Building2,
    UserCheck,
    Trash2,
    Shield,
    GraduationCap
} from 'lucide-react'
import { instructoresAPI, sucursalesAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import InstructorForm from '../../components/forms/InstructorForm'
import InstructorDetailsModal from '../../components/modals/InstructorDetailsModal'
import toast from 'react-hot-toast'

// ✅ NUEVO: Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton } from '../../components/dashboard/PermissionButton'
import PermissionGuard from '../../components/auth/PermissionGuard'

const InstructoresPage = () => {
    // ✅ NUEVO: Hook de permisos
    const { canCreate, canUpdate, canDelete, isAdmin } = usePermissions('instructores')
    
    const { user } = useAuth()
    const [instructores, setInstructores] = useState([])
    const [sucursales, setSucursales] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedInstructor, setSelectedInstructor] = useState(null)
    const [showActions, setShowActions] = useState(null)
    const [stats, setStats] = useState({
        total: 0,
        activos: 0,
        inactivos: 0,
        cinturonNegro: 0
    })
    
    // Estado para filtros avanzados
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    
    const [filters, setFilters] = useState({
        sucursal: '',
        status: 'all',
        belt: ''
    })

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData()
    }, [])

    // Filtros con debounce
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
        loadInstructores()
        }, 500)

        return () => clearTimeout(delayedSearch)
    }, [filters, searchTerm])

    const loadInitialData = async () => {
        try {
        setLoading(true)
        
        const [instructoresResponse, sucursalesResponse] = await Promise.all([
            instructoresAPI.getAll(),
            sucursalesAPI.getAll()
        ])

        if (instructoresResponse.success) {
            const instructoresData = instructoresResponse.data || []
            setInstructores(instructoresData)
            calculateStats(instructoresData)
        }

        if (sucursalesResponse.success) {
            setSucursales(sucursalesResponse.data.sucursales || [])
        }

        } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar datos')
        } finally {
        setLoading(false)
        }
    }

    const loadInstructores = async () => {
        try {
        setLoading(true)
        
        // ✅ CORREGIDO: Construir objeto en lugar de URLSearchParams
        const params = {}

        if (filters.sucursal) params.sucursal = filters.sucursal
        
        // ✅ CORREGIDO: Transformar status a isActive para el backend
        if (filters.status === 'active') {
            params.isActive = 'true'
        } else if (filters.status === 'inactive') {
            params.isActive = 'false'
        }
        // Si es 'all', no enviamos el parámetro
        
        if (filters.belt) params.belt = filters.belt
        if (searchTerm) params.search = searchTerm

        // ✅ CORREGIDO: Pasar objeto directamente
        const response = await instructoresAPI.getAll(params)
        
        if (response.success) {
            const instructoresData = response.data || []
            setInstructores(instructoresData)
            calculateStats(instructoresData)
        }

        } catch (error) {
        console.error('Error al cargar instructores:', error)
        toast.error('Error al cargar instructores')
        } finally {
        setLoading(false)
        }
    }

    const calculateStats = (data) => {
        setStats({
        total: data.length,
        activos: data.filter(i => i.isActive).length,
        inactivos: data.filter(i => !i.isActive).length,
        cinturonNegro: data.filter(i => i.instructorInfo?.belt?.includes('negro')).length
        })
    }

    // Handlers
    const handleCreateInstructor = () => {
        setSelectedInstructor(null)
        setShowCreateModal(true)
    }

    const handleEditInstructor = (instructor) => {
        setSelectedInstructor(instructor)
        setShowEditModal(true)
        setShowActions(null)
    }

    const handleViewDetails = (instructor) => {
        setSelectedInstructor(instructor)
        setShowDetailsModal(true)
        setShowActions(null)
    }

    const handleToggleStatus = async (instructor) => {
        try {
        const newStatus = !instructor.isActive
        await instructoresAPI.toggleStatus(instructor._id)
        
        toast.success(`Instructor ${newStatus ? 'activado' : 'desactivado'} correctamente`)
        loadInstructores()
        setShowActions(null)
        } catch (error) {
        console.error('Error al cambiar estado:', error)
        toast.error('Error al cambiar el estado del instructor')
        }
    }

    const handleDeleteInstructor = async (instructor) => {
        if (!window.confirm(`¿Estás seguro de eliminar al instructor ${instructor.name}?`)) {
        return
        }

        try {
        await instructoresAPI.delete(instructor._id)
        toast.success('Instructor eliminado correctamente')
        loadInstructores()
        setShowActions(null)
        } catch (error) {
        console.error('Error al eliminar instructor:', error)
        toast.error(error.response?.data?.message || 'Error al eliminar instructor')
        }
    }

    const handleFormSuccess = () => {
        setShowCreateModal(false)
        setShowEditModal(false)
        loadInstructores()
    }

    const handleCardFilter = (filterType) => {
        switch(filterType) {
        case 'all':
            setFilters({ sucursal: '', status: 'all', belt: '' })
            break
        case 'activos':
            setFilters({ ...filters, status: 'active', belt: '' })
            break
        case 'inactivos':
            setFilters({ ...filters, status: 'inactive', belt: '' })
            break
        case 'cinturonNegro':
            setFilters({ ...filters, belt: 'negro', status: 'all' })
            break
        default:
            break
        }
    }

    const resetFilters = () => {
        setFilters({
        sucursal: '',
        status: 'all',
        belt: ''
        })
        setSearchTerm('')
    }

    // Helper functions
    const getBeltColor = (belt) => {
        if (!belt) return 'bg-gray-100 text-gray-800'
        
        if (belt.includes('negro')) return 'bg-gray-900 text-white'
        if (belt === 'blanco') return 'bg-white text-gray-800 border border-gray-300'
        if (belt === 'amarillo') return 'bg-yellow-100 text-yellow-800'
        if (belt === 'verde') return 'bg-green-100 text-green-800'
        if (belt === 'azul') return 'bg-blue-100 text-blue-800'
        if (belt === 'rojo') return 'bg-red-100 text-red-800'
        
        return 'bg-gray-100 text-gray-800'
    }

    const getBeltDisplay = (belt) => {
        if (!belt) return 'Sin cinturón'
        
        const beltNames = {
        'blanco': 'Blanco',
        'amarillo': 'Amarillo',
        'verde': 'Verde',
        'azul': 'Azul',
        'rojo': 'Rojo',
        'negro_1dan': 'Negro 1° Dan',
        'negro_2dan': 'Negro 2° Dan',
        'negro_3dan': 'Negro 3° Dan',
        'negro_4dan': 'Negro 4° Dan',
        'negro_5dan': 'Negro 5° Dan'
        }
        
        return beltNames[belt] || belt
    }

    if (loading && instructores.length === 0) {
        return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando instructores...</p>
            </div>
        </div>
        )
    }

    return (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructores</h1>
            <p className="mt-1 text-sm text-gray-500">
                Gestiona los instructores de tu escuela de taekwondo
            </p>
            </div>
            
            {/* ✅ CORREGIDO: Botón de crear con permisos */}
            <CreateButton 
            module="instructores"
            onClick={handleCreateInstructor}
            icon={<Plus className="w-5 h-5" />}
            >
            Nuevo Instructor
            </CreateButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Instructores */}
            <div 
            onClick={() => handleCardFilter('all')}
            className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
                filters.status === 'all' && !filters.belt && !filters.sucursal
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-100'
            }`}
            >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Total Instructores</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
                </div>
            </div>
            {filters.status === 'all' && !filters.belt && !filters.sucursal && (
                <p className="text-xs text-blue-600 mt-3 font-medium">✓ Todos los instructores</p>
            )}
            </div>

            {/* Activos */}
            <div 
            onClick={() => handleCardFilter('activos')}
            className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
                filters.status === 'active' && !filters.belt
                ? 'border-green-500 ring-2 ring-green-200' 
                : 'border-gray-100'
            }`}
            >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.activos}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
                </div>
            </div>
            {filters.status === 'active' && !filters.belt && (
                <p className="text-xs text-green-600 mt-3 font-medium">✓ Filtro activo</p>
            )}
            </div>

            {/* Inactivos */}
            <div 
            onClick={() => handleCardFilter('inactivos')}
            className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
                filters.status === 'inactive' && !filters.belt
                ? 'border-red-500 ring-2 ring-red-200' 
                : 'border-gray-100'
            }`}
            >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Inactivos</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.inactivos}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                <Shield className="w-6 h-6 text-red-600" />
                </div>
            </div>
            {filters.status === 'inactive' && !filters.belt && (
                <p className="text-xs text-red-600 mt-3 font-medium">✓ Filtro activo</p>
            )}
            </div>

            {/* Cinturón Negro */}
            <div 
            onClick={() => handleCardFilter('cinturonNegro')}
            className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
                filters.belt === 'negro' && filters.status === 'all'
                ? 'border-gray-900 ring-2 ring-gray-300' 
                : 'border-gray-100'
            }`}
            >
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm font-medium text-gray-600">Cinturón Negro</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.cinturonNegro}</p>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg">
                <Award className="w-6 h-6 text-white" />
                </div>
            </div>
            {filters.belt === 'negro' && filters.status === 'all' && (
                <p className="text-xs text-gray-900 mt-3 font-medium">✓ Filtro activo</p>
            )}
            </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                </div>

                {/* Toggle Advanced Filters Button */}
                <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Reset Filters Button */}
                {(filters.sucursal || filters.status !== 'all' || filters.belt || searchTerm) && (
                <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                    Limpiar
                </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sucursal Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal
                    </label>
                    <select
                    value={filters.sucursal}
                    onChange={(e) => setFilters({ ...filters, sucursal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                        {sucursal.name}
                        </option>
                    ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                    </label>
                    <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    </select>
                </div>

                {/* Belt Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cinturón
                    </label>
                    <select
                    value={filters.belt}
                    onChange={(e) => setFilters({ ...filters, belt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="">Todos los cinturones</option>
                    <option value="blanco">Blanco</option>
                    <option value="amarillo">Amarillo</option>
                    <option value="verde">Verde</option>
                    <option value="azul">Azul</option>
                    <option value="rojo">Rojo</option>
                    <option value="negro_1dan">Negro 1° Dan</option>
                    <option value="negro_2dan">Negro 2° Dan</option>
                    <option value="negro_3dan">Negro 3° Dan</option>
                    <option value="negro_4dan">Negro 4° Dan</option>
                    <option value="negro_5dan">Negro 5° Dan</option>
                    </select>
                </div>
                </div>
            )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cinturón
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sucursal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {instructores.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No se encontraron instructores</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {searchTerm || filters.sucursal || filters.status !== 'all' || filters.belt
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'Comienza agregando tu primer instructor'
                            }
                        </p>
                        </div>
                    </td>
                    </tr>
                ) : (
                    instructores.map((instructor) => (
                    <tr key={instructor._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {instructor.name.charAt(0).toUpperCase()}
                            </div>
                            </div>
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {instructor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                                {instructor.instructorInfo?.yearsOfExperience 
                                ? `${instructor.instructorInfo.yearsOfExperience} años de experiencia`
                                : 'Sin experiencia registrada'
                                }
                            </div>
                            </div>
                        </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{instructor.email}</div>
                        <div className="text-sm text-gray-500">{instructor.phone || 'Sin teléfono'}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBeltColor(instructor.instructorInfo?.belt)}`}>
                            <Award className="w-3 h-3 mr-1" />
                            {getBeltDisplay(instructor.instructorInfo?.belt)}
                        </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            {instructor.sucursal?.name || 'Sin asignar'}
                        </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            instructor.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                            {instructor.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block">
                            <button
                            onClick={() => setShowActions(showActions === instructor._id ? null : instructor._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>

                            {showActions === instructor._id && (
                            <>
                                <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowActions(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                                {/* Ver Detalles - Siempre visible */}
                                <button
                                    onClick={() => handleViewDetails(instructor)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Ver Detalles
                                </button>

                                {/* ✅ CORREGIDO: Editar - Solo admin */}
                                <PermissionGuard module="instructores" action="update">
                                    <button
                                    onClick={() => handleEditInstructor(instructor)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                    <Edit3 className="w-4 h-4" />
                                    Editar
                                    </button>
                                </PermissionGuard>

                                {/* ✅ CORREGIDO: Cambiar estado - Solo admin */}
                                <PermissionGuard module="instructores" action="toggleStatus">
                                    <button
                                    onClick={() => handleToggleStatus(instructor)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                    <UserCheck className="w-4 h-4" />
                                    {instructor.isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                </PermissionGuard>

                                {/* ✅ CORREGIDO: Eliminar - Solo admin */}
                                <PermissionGuard module="instructores" action="delete">
                                    <div className="border-t border-gray-100 my-1" />
                                    <button
                                    onClick={() => handleDeleteInstructor(instructor)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                    </button>
                                </PermissionGuard>
                                </div>
                            </>
                            )}
                        </div>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            {/* Pagination Info */}
            {instructores.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                Mostrando <span className="font-medium">{instructores.length}</span> instructor{instructores.length !== 1 ? 'es' : ''}
                </p>
            </div>
            )}
        </div>

        {/* Modals */}
        {showCreateModal && (
            <InstructorForm
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleFormSuccess}
            />
        )}

        {showEditModal && selectedInstructor && (
            <InstructorForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            instructor={selectedInstructor}
            mode="edit"
            />
        )}

        {showDetailsModal && selectedInstructor && (
            <InstructorDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            instructor={selectedInstructor}
            />
        )}
        </div>
    )
}

export default InstructoresPage