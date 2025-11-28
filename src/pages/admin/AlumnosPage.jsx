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
  MapPin,
  Award,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  X,
  SlidersHorizontal,
  Building2,
  UserCheck,
  Trash2
} from 'lucide-react'
import { alumnosAPI, sucursalesAPI, utils } from '../../services/APIservice'
import { useAuth } from '../../context/AuthContext'

// Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton } from '../../components/dashboard/PermissionButton'
import PermissionGuard from '../../components/auth/PermissionGuard'

import AlumnoForm from '../../components/forms/AlumnoForm'
import AlumnoDetailsModal from '../../components/modals/AlumnoDetailsModal'
import toast from 'react-hot-toast'

const AlumnosPage = () => {
  // Hook de permisos
  const { canCreate, canUpdate, canDelete } = usePermissions('alumnos')
  
  const { user } = useAuth()
  const [alumnos, setAlumnos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const [showActions, setShowActions] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    menores: 0,
    adultos: 0
  })
  
  // ✅ NUEVO: Estado para controlar filtros avanzados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const [filters, setFilters] = useState({
    sucursal: '',
    status: 'all',
    belt: '',
    age: '',
    tutor: '',
    gender: ''
  })

  // Función para calcular edad (del archivo original)
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Cargar datos iniciales (sin duplicar llamadas)
  useEffect(() => {
    loadInitialData()
  }, [])

  // Filtros con debounce (evita múltiples llamadas)
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadAlumnos()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(delayedSearch)
  }, [filters, searchTerm])

  const loadInitialData = async () => {
    try {
      const [alumnosResponse, sucursalesResponse] = await Promise.all([
        alumnosAPI.getAll(),
        sucursalesAPI.getAll()
      ])

      if (alumnosResponse.success) {
        setAlumnos(alumnosResponse.data.alumnos || [])
        calculateStats(alumnosResponse.data.alumnos || [])
      }

      if (sucursalesResponse.success) {
        setSucursales(sucursalesResponse.data.sucursales || [])
        console.log('📍 Sucursales cargadas:', sucursalesResponse.data.sucursales?.length || 0)
      } else {
        console.error('❌ Error cargando sucursales:', sucursalesResponse.message)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
      toast.error('Error cargando datos iniciales')
    } finally {
      setLoading(false)
    }
  }

  const loadAlumnos = async () => {
    try {
      setLoading(true)
      
      // Crear objeto de parámetros correctamente
      const params = {}
      
      if (searchTerm) params.search = searchTerm
      if (filters.sucursal) params.sucursal = filters.sucursal
      if (filters.status !== 'all') params.status = filters.status
      if (filters.belt) params.belt = filters.belt
      if (filters.age) params.age = filters.age
      if (filters.tutor) params.tutor = filters.tutor
      if (filters.gender) params.gender = filters.gender
      
      // Pasar objeto de parámetros (no string)
      const response = await alumnosAPI.getAll(params)
      
      if (response.success) {
        setAlumnos(response.data.alumnos)
        calculateStats(response.data.alumnos)
      }
    } catch (error) {
      console.error('Error cargando alumnos:', error)
      toast.error('Error cargando la lista de alumnos')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (alumnosList) => {
    const total = alumnosList.length
    const activos = alumnosList.filter(a => a.enrollment?.status === 'activo').length
    const menores = alumnosList.filter(a => {
      const edad = calculateAge(a.dateOfBirth)
      return edad !== null && edad < 18
    }).length
    const adultos = total - menores
    
    setStats({ total, activos, menores, adultos })
  }

  const handleEdit = (alumno) => {
    setSelectedAlumno(alumno)
    setShowEditModal(true)
    setShowActions(null)
  }

  const handleViewDetails = (alumno) => {
    setSelectedAlumno(alumno)
    setShowDetailsModal(true)
    setShowActions(null)
  }

  const handleDelete = async (alumno) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al alumno ${alumno.fullName || `${alumno.firstName} ${alumno.lastName}`}?`)) {
      try {
        const response = await alumnosAPI.delete(alumno._id)
        if (response.success) {
          toast.success('Alumno eliminado exitosamente')
          loadAlumnos() // Recargar la lista
        }
      } catch (error) {
        console.error('Error eliminando alumno:', error)
        toast.error('Error al eliminar el alumno')
      }
    }
    setShowActions(null)
  }

  const handleSuccess = () => {
    loadAlumnos()
    setShowCreateModal(false)
    setShowEditModal(false)
    setSelectedAlumno(null)
  }

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      sucursal: '',
      status: 'all',
      belt: '',
      age: '',
      tutor: '',
      gender: ''
    })
    setSearchTerm('')
    setShowAdvancedFilters(false)
  }

  // Manejadores para filtros desde tarjetas
  const handleCardFilter = (filterType) => {
    setSearchTerm('') // Limpiar búsqueda
    setShowAdvancedFilters(false) // Cerrar filtros avanzados
    
    switch(filterType) {
      case 'all':
        // Limpiar todos los filtros
        setFilters({
          sucursal: '',
          status: 'all',
          belt: '',
          age: '',
          tutor: '',
          gender: ''
        })
        break
      case 'activos':
        setFilters({
          sucursal: '',
          status: 'activo',
          belt: '',
          age: '',
          tutor: '',
          gender: ''
        })
        break
      case 'menores':
        setFilters({
          sucursal: '',
          status: 'all',
          belt: '',
          age: '0-17',
          tutor: '',
          gender: ''
        })
        break
      case 'adultos':
        setFilters({
          sucursal: '',
          status: 'all',
          belt: '',
          age: '18-100',
          tutor: '',
          gender: ''
        })
        break
      default:
        break
    }
  }

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== 'all').length
  }

  const AlumnoCard = ({ alumno }) => {
    const edad = calculateAge(alumno.dateOfBirth)
    const beltColor = utils.getBeltColor ? utils.getBeltColor(alumno.belt?.level) : '#6B7280'

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 relative">
        {/* Header con foto */}
        <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-t-lg">
          <div className="absolute inset-0 rounded-t-lg overflow-hidden">
            {alumno.profilePhotoUrl ? (
              <img 
                src={alumno.profilePhotoUrl} 
                alt={`Foto de ${alumno.fullName}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-12 h-12 text-white/70" />
              </div>
            )}
          </div>
          
          <div className="absolute top-2 right-2">
            <div className="relative z-50">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(showActions === alumno._id ? null : alumno._id)
                }}
                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActions === alumno._id && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[150px] z-[9999]">
                  {/* Ver detalles - Siempre visible */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(alumno)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                  
                  {/* Botones con permisos */}
                  <PermissionGuard module="alumnos" action="update">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(alumno)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  </PermissionGuard>
                  
                  <PermissionGuard module="alumnos" action="delete">
                    {/* Separador */}
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(alumno)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </PermissionGuard>
                </div>
              )}
            </div>
          </div>
          
          {/* Estado */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              alumno.enrollment?.status === 'activo'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {alumno.enrollment?.status || 'inactivo'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Información principal */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {alumno.fullName || `${alumno.firstName} ${alumno.lastName}`}
            </h3>
            <p className="text-gray-500 text-sm">
              {edad !== null ? `${edad} años` : 'Edad no especificada'}
            </p>
          </div>

          {/* Detalles */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* ID de estudiante */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{alumno.enrollment?.studentId || 'Sin ID'}</span>
            </div>

            {/* Sucursal */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{alumno.enrollment?.sucursal?.name || 'Sin sucursal'}</span>
            </div>

            {/* Cinturón */}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: beltColor }}
                ></div>
                <span className="capitalize">{alumno.belt?.level || 'Sin cinturón'}</span>
              </div>
            </div>

            {/* Contacto */}
            {alumno.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{alumno.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alumnos</h1>
          <p className="text-gray-600">{stats.total} alumnos registrados</p>
        </div>
        
        {/* Botón con permisos */}
        <CreateButton 
          module="alumnos"
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Alumno
        </CreateButton>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Alumnos */}
        <div 
          onClick={() => handleCardFilter('all')}
          className={`bg-white p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
            filters.status === 'all' && !filters.age && !filters.sucursal && !filters.belt
              ? 'border-blue-500 ring-2 ring-blue-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Alumnos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          {filters.status === 'all' && !filters.age && !filters.sucursal && !filters.belt && (
            <p className="text-xs text-blue-600 mt-2 font-medium">✓ Todos los alumnos</p>
          )}
        </div>

        {/* Activos */}
        <div 
          onClick={() => handleCardFilter('activos')}
          className={`bg-white p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
            filters.status === 'activo' && !filters.age
              ? 'border-green-500 ring-2 ring-green-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activos}</p>
            </div>
          </div>
          {filters.status === 'activo' && !filters.age && (
            <p className="text-xs text-green-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>

        {/* Menores */}
        <div 
          onClick={() => handleCardFilter('menores')}
          className={`bg-white p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
            filters.age === '0-17' && filters.status === 'all'
              ? 'border-yellow-500 ring-2 ring-yellow-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Menores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.menores}</p>
            </div>
          </div>
          {filters.age === '0-17' && filters.status === 'all' && (
            <p className="text-xs text-yellow-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>

        {/* Adultos */}
        <div 
          onClick={() => handleCardFilter('adultos')}
          className={`bg-white p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-105 transform ${
            filters.age === '18-100' && filters.status === 'all'
              ? 'border-purple-500 ring-2 ring-purple-200' 
              : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Adultos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.adultos}</p>
            </div>
          </div>
          {filters.age === '18-100' && filters.status === 'all' && (
            <p className="text-xs text-purple-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>
      </div>

      {/* SECCIÓN DE BÚSQUEDA Y FILTROS MODERNIZADA */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Barra principal de búsqueda */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Búsqueda principal */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar alumnos por nombre, email, teléfono o ID..."
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
                  value={filters.status}
                  onChange={(e) => updateFilter('status', e.target.value)}
                >
                  <option value="all">📋 Todos</option>
                  <option value="activo">✅ Activos</option>
                  <option value="inactivo">❌ Inactivos</option>
                  <option value="suspendido">⏸️ Suspendidos</option>
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

              {/* Botón limpiar (solo si hay filtros activos) */}
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

        {/* FILTROS AVANZADOS COLAPSABLES */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Cinturón */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cinturón</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.belt}
                  onChange={(e) => updateFilter('belt', e.target.value)}
                >
                  <option value="">🥋 Todos los cinturones</option>
                  <option value="blanco">⚪ Blanco</option>
                  <option value="amarillo">🟡 Amarillo</option>
                  <option value="naranja">🟠 Naranja</option>
                  <option value="verde">🟢 Verde</option>
                  <option value="azul">🔵 Azul</option>
                  <option value="marron">🟤 Marrón</option>
                  <option value="negro-1">⚫ Negro 1°</option>
                  <option value="negro-2">⚫ Negro 2°</option>
                  <option value="negro-3">⚫ Negro 3°</option>
                </select>
              </div>

              {/* Edad */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Rango de edad</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.age}
                  onChange={(e) => updateFilter('age', e.target.value)}
                >
                  <option value="">👥 Todas las edades</option>
                  <option value="0-12">👶 Niños (0-12)</option>
                  <option value="13-17">🧒 Adolescentes (13-17)</option>
                  <option value="18-30">👨 Jóvenes (18-30)</option>
                  <option value="31-50">👩 Adultos (31-50)</option>
                  <option value="51">👴 Mayores (51+)</option>
                </select>
              </div>

              {/* Género */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Género</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.gender}
                  onChange={(e) => updateFilter('gender', e.target.value)}
                >
                  <option value="">⚧️ Todos</option>
                  <option value="masculino">♂️ Masculino</option>
                  <option value="femenino">♀️ Femenino</option>
                  <option value="otro">🏳️‍⚧️ Otro</option>
                </select>
              </div>

              {/* Con tutor */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tutores</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={filters.tutor}
                  onChange={(e) => updateFilter('tutor', e.target.value)}
                >
                  <option value="">👨‍👩‍👧‍👦 Todos</option>
                  <option value="with">✅ Con tutor</option>
                  <option value="without">❌ Sin tutor</option>
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
      ) : alumnos.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alumnos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || Object.values(filters).some(f => f && f !== 'all')
              ? 'No se encontraron alumnos con los filtros aplicados'
              : 'Comienza registrando tu primer alumno'
            }
          </p>
          {/* Botón con permisos */}
          <CreateButton 
            module="alumnos"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Registrar Primer Alumno
          </CreateButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alumnos.map(alumno => (
            <AlumnoCard key={alumno._id} alumno={alumno} />
          ))}
        </div>
      )}

      {/* Modales */}
      <AlumnoForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
        mode="create"
      />

      <AlumnoForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
        alumno={selectedAlumno}
        mode="edit"
      />

      <AlumnoDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        alumno={selectedAlumno}
        onEdit={handleEdit}
      />
    </div>
  )
}

export default AlumnosPage