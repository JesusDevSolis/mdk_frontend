import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail,
  Users,
  Clock,
  MoreVertical,
  Eye,
  Upload
} from 'lucide-react'
import { useAuth } from '../../context/Authcontext'
import { sucursalesAPI } from '../../services/APIservice'
import SucursalForm from '../../components/forms/SucursalForm'
import SucursalDetailsModal from '../../components/modals/SucursalDetailsModal'
import toast from 'react-hot-toast'

// ✅ NUEVO: Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import PermissionGuard from '../../components/auth/PermissionGuard'

const SucursalesPage = () => {
  const { user } = useAuth()
  // ✅ NUEVO: Hook de permisos
  const { canCreate, canUpdate, canDelete } = usePermissions('sucursales')
  
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, inactive
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSucursal, setEditingSucursal] = useState(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })

  // Cargar sucursales
  const loadSucursales = async (page = 1, search = '', filterStatus = 'all') => {
    try {
      setLoading(true)
      
      const params = {
        page,
        limit: 10,
        search: search.trim()
      }
      
      if (filterStatus !== 'all') {
        params.isActive = filterStatus === 'active'
      }
      
      const response = await sucursalesAPI.getAll(params)
      
      if (response.success) {
        setSucursales(response.data.sucursales)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error cargando sucursales:', error)
      toast.error('Error al cargar las sucursales')
    } finally {
      setLoading(false)
    }
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadSucursales()
  }, [])

  // Efecto para búsqueda
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      loadSucursales(1, searchTerm, filter)
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, filter])

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    loadSucursales(newPage, searchTerm, filter)
  }

  // Manejar eliminación
  const handleDelete = async (sucursalId, sucursalName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la sucursal "${sucursalName}"?`)) {
      return
    }

    try {
      await sucursalesAPI.delete(sucursalId)
      toast.success('Sucursal eliminada exitosamente')
      loadSucursales(pagination.current, searchTerm, filter)
    } catch (error) {
      console.error('Error eliminando sucursal:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar la sucursal')
    }
  }

  // Manejar éxito de formulario
  const handleFormSuccess = () => {
    loadSucursales(pagination.current, searchTerm, filter)
  }

  // Abrir modal de edición
  const openEditModal = (sucursal) => {
    setEditingSucursal(sucursal)
    setShowEditModal(true)
  }

  // Componente de tarjeta de sucursal
  const SucursalCard = ({ sucursal }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
      const handleClickOutside = () => setShowDropdown(false);
      if (showDropdown) {
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
      }
    }, [showDropdown]);

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 relative overflow-visible">
        {/* Header con logo - SIN overflow-hidden */}
        <div className="relative h-32 bg-gradient-primary rounded-t-lg">
          {/* Overlay para mantener bordes redondeados */}
          <div className="absolute inset-0 rounded-t-lg overflow-hidden">
            {sucursal.logoUrl ? (
              <img 
                src={sucursal.logoUrl} 
                alt={`Logo ${sucursal.name}`}
                className="absolute inset-0 w-full h-full object-contain p-4"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-white/70" />
              </div>
            )}
          </div>
          
          {/* Botón de opciones */}
          <div className="absolute top-2 right-2 z-50">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="btn btn-sm btn-circle bg-black/20 border-none hover:bg-black/40 text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {/* Dropdown menu con posición absoluta fuera del contenedor */}
              {showDropdown && (
                <div 
                  className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[12rem]"
                  style={{ 
                    zIndex: 10000,
                    top: 'auto',
                    right: 'auto',
                    transform: 'translate(-100%, 0)',
                    marginTop: '0.25rem'
                  }}
                >
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSucursal(sucursal);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                  
                  {/* ✅ CORREGIDO: Botón Editar con permisos */}
                  <PermissionGuard module="sucursales" action="update">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(sucursal);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  </PermissionGuard>
                  
                  {user?.role === 'admin' && (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sucursal._id, sucursal.name);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Badge de estado */}
          <div className="absolute bottom-2 left-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              sucursal.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {sucursal.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{sucursal.name}</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{sucursal.address}</span>
            </div>
            
            {sucursal.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{sucursal.phone}</span>
              </div>
            )}
            
            {sucursal.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{sucursal.email}</span>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{sucursal.stats?.activeStudents || 0} alumnos</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className={`${sucursal.isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                  {sucursal.isOpenNow ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
            
            {sucursal.capacity && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Capacidad</span>
                  <span>{sucursal.stats?.activeStudents || 0}/{sucursal.capacity}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${sucursal.capacityUsed || 0}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Sucursales</h1>
          <p className="text-gray-600 mt-1">Administra las sucursales de tu escuela de taekwondo</p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva Sucursal
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre o dirección..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="input-field min-w-32"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sucursales.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {user?.role === 'instructor' ? 'No tienes sucursales asignadas' : 'No hay sucursales'}
          </h3>
          <p className="text-gray-600 mb-6">
            {user?.role === 'instructor' 
              ? 'Actualmente no tienes ninguna sucursal asignada. Contacta al administrador para que te asigne una sucursal.'
              : searchTerm || filter !== 'all' 
                ? 'No se encontraron sucursales con los filtros aplicados'
                : 'Comienza creando tu primera sucursal'
            }
          </p>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Sucursal
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid de sucursales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sucursales.map((sucursal) => (
              <SucursalCard key={sucursal._id} sucursal={sucursal} />
            ))}
          </div>

          {/* Paginación */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    pagination.current === i + 1
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modales */}
      {/* Modal de creación */}
      <SucursalForm
        mode="create"
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de edición */}
      <SucursalForm
        mode="edit"
        sucursal={editingSucursal}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSucursal(null)
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de detalles */}
      <SucursalDetailsModal
        sucursal={selectedSucursal}
        isOpen={!!selectedSucursal}
        onClose={() => setSelectedSucursal(null)}
      />
    </div>
  )
}

export default SucursalesPage