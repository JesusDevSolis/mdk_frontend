import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Upload,
  ChevronDown,
  ChevronUp,
  ClipboardCheck, 
  CheckCircle2,
} from 'lucide-react'
import { pagosAPI, alumnosAPI, sucursalesAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'
import PagoForm from '../../components/forms/PagoForm'
import PagoDetailsModal from '../../components/modals/PagoDetailsModal'
import ComprobanteUploadModal from '../../components/modals/ComprobanteUploadModal'

// ✅ NUEVO: Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton, EditButton, DeleteButton } from '../../components/dashboard/PermissionButton'
import PermissionGuard from '../../components/auth/PermissionGuard'

const PagosPage = () => {
  // ✅ NUEVO: Hook de permisos para módulo pagos
  const { canCreate, canUpdate, canDelete, can, isAdmin } = usePermissions('pagos')

  const [searchParams, setSearchParams] = useSearchParams()
  
  // Leer filtro de URL al inicializar
  const initialFilter = searchParams.get('filter')
  const validFilters = ['pendiente', 'vencido', 'pagado', 'cancelado']
  const initialStatus = initialFilter && validFilters.includes(initialFilter) ? initialFilter : ''
  
  // Estados principales
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPago, setSelectedPago] = useState(null)
  const [formMode, setFormMode] = useState('create')

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: initialStatus,
    type: '',
    sucursal: ''
  })

  // Estados de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pagado: 0,
    pendiente: 0,
    vencido: 0,
    totalAmount: 0,
    pagadoAmount: 0,
    pendienteAmount: 0,
    vencidoAmount: 0
  })

  // Cargar sucursales para filtros
  const [sucursales, setSucursales] = useState([])

  // ✅ NUEVO: Estado para configuraciones de pagos
  const [configuraciones, setConfiguraciones] = useState({
      diasGracia: 5,
      recargoTardio: 10,
      requiereComprobante: false
  })

  // ===== EFECTOS =====

  useEffect(() => {
    loadSucursales()
    loadPagos()
    loadConfiguraciones()
    loadStats()
  }, [pagination.page, filters, searchTerm])

  // ===== FUNCIONES DE CARGA =====

  const loadSucursales = async () => {
    try {
      const response = await sucursalesAPI.getAll()
      // ✅ CORREGIDO: Backend devuelve { data: { sucursales: [...], pagination: {...} } }
      setSucursales(response.data?.sucursales || [])
    } catch (error) {
      console.error('Error al cargar sucursales:', error)
      setSucursales([]) // ✅ Garantizar array vacío en caso de error
    }
  }

  const loadPagos = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      }

      const response = await pagosAPI.getAll(params)
      setPagos(response.data)
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      }))
    } catch (error) {
      console.error('Error al cargar pagos:', error)
      toast.error('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }
  
  // ✅ NUEVO: Cargar configuraciones
  const loadConfiguraciones = async () => {
      try {
          const response = await pagosAPI.getConfiguraciones()
          if (response.success) {
              setConfiguraciones(response.data)
          }
      } catch (error) {
          console.warn('No se pudieron cargar configuraciones, usando valores por defecto')
      }
  }

  const loadStats = async () => {
    try {
      const response = await pagosAPI.getStats()
      
      // ✅ CORREGIDO: Transformar respuesta del backend
      // Backend devuelve: { data: { general: { total, totalAmount, byStatus: {...} }, byType: [...], byMonth: [...] } }
      const general = response.data?.general || {}
      const byStatus = general.byStatus || {}
      
      // Transformar a la estructura que espera el frontend
      setStats({
        total: general.total || 0,
        pagado: byStatus.pagado?.count || 0,
        pendiente: byStatus.pendiente?.count || 0,
        vencido: byStatus.vencido?.count || 0,
        totalAmount: general.totalAmount || 0,
        pagadoAmount: byStatus.pagado?.total || 0,
        pendienteAmount: byStatus.pendiente?.total || 0,
        vencidoAmount: byStatus.vencido?.total || 0
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  // ===== HANDLERS =====

  const handleCreate = () => {
    setSelectedPago(null)
    setFormMode('create')
    setShowForm(true)
  }

  const handleEdit = (pago) => {
    setSelectedPago(pago)
    setFormMode('edit')
    setShowForm(true)
  }

  const handleView = (pago) => {
    setSelectedPago(pago)
    setShowDetails(true)
  }

  const handleUploadComprobante = (pago) => {
    setSelectedPago(pago)
    setShowUploadModal(true)
  }

  const handleDelete = async (pago) => {
    if (!window.confirm(`¿Estás seguro de eliminar el pago de ${pago.alumno?.firstName}?`)) {
      return
    }

    try {
      await pagosAPI.delete(pago._id)
      toast.success('Pago eliminado correctamente')
      loadPagos()
      loadStats()
    } catch (error) {
      console.error('Error al eliminar pago:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar el pago')
    }
  }

  const handleMarkAsPaid = async (pago) => {
    if (!window.confirm(`¿Marcar como pagado el pago de ${pago.alumno?.firstName}?`)) {
      return
    }

    try {
      const paymentMethod = prompt('Método de pago (efectivo/tarjeta/transferencia/cheque):')
      if (!paymentMethod) return

      await pagosAPI.markAsPaid(pago._id, {
        paymentMethod,
        paidDate: new Date().toISOString()
      })
      
      toast.success('Pago marcado como pagado')
      loadPagos()
      loadStats()
    } catch (error) {
      console.error('Error al marcar como pagado:', error)
      toast.error(error.response?.data?.message || 'Error al marcar el pago')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    loadPagos()
    loadStats()
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    loadPagos()
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ status: '', type: '', sucursal: '' })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ===== FUNCIONES AUXILIARES =====

  const getStatusBadge = (status) => {
    const badges = {
      pagado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Pagado',
        icon: CheckCircle
      },
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pendiente',
        icon: Clock
      },
      vencido: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Vencido',
        icon: AlertCircle
      },
      cancelado: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Cancelado',
        icon: XCircle
      }
    }

    const badge = badges[status] || badges.pendiente
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const types = {
      colegiatura: { label: 'Colegiatura', color: 'blue' },
      inscripcion: { label: 'Inscripción', color: 'purple' },
      uniforme: { label: 'Uniforme', color: 'green' },
      examen: { label: 'Examen', color: 'yellow' },
      equipo: { label: 'Equipo', color: 'indigo' },
      otro: { label: 'Otro', color: 'gray' }
    }

    const typeInfo = types[type] || types.otro

    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
        {typeInfo.label}
      </span>
    )
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // ✅ NUEVO: Calcular recargo para mostrar en la UI
  const calcularRecargoVisual = (pago) => {
      if (pago.status !== 'vencido' && pago.status !== 'pendiente') return null
      
      const hoy = new Date()
      const fechaVencimiento = new Date(pago.dueDate)
      const diasRetraso = Math.floor((hoy - fechaVencimiento) / (1000 * 60 * 60 * 24))
      
      if (diasRetraso <= configuraciones.diasGracia) return null
      
      const montoRecargo = (pago.amount * configuraciones.recargoTardio) / 100
      
      return {
          diasRetraso,
          porcentaje: configuraciones.recargoTardio,
          monto: montoRecargo,
          totalConRecargo: pago.amount + montoRecargo
      }
  }

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
          <p className="text-gray-600 mt-1">Administra los pagos de colegiaturas, uniformes y más</p>
        </div>
        
        {/* ✅ CORREGIDO: Botón de crear con permisos */}
        <CreateButton 
          module="pagos"
          onClick={handleCreate}
          icon={<Plus className="w-5 h-5" />}
        >
          Registrar Pago
        </CreateButton>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pagos */}
        <div 
          onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 transform ${!filters.status ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
          {!filters.status && (
            <p className="text-xs text-blue-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>

        {/* Pagados */}
        <div 
          onClick={() => setFilters(prev => ({ ...prev, status: prev.status === 'pagado' ? '' : 'pagado' }))}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 transform ${filters.status === 'pagado' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pagados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pagado}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.pagadoAmount)}</p>
            </div>
          </div>
          {filters.status === 'pagado' && (
            <p className="text-xs text-green-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>

        {/* Pendientes */}
        <div 
          onClick={() => setFilters(prev => ({ ...prev, status: prev.status === 'pendiente' ? '' : 'pendiente' }))}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 transform ${filters.status === 'pendiente' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendiente}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.pendienteAmount)}</p>
            </div>
          </div>
          {filters.status === 'pendiente' && (
            <p className="text-xs text-yellow-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>

        {/* Vencidos */}
        <div 
          onClick={() => setFilters(prev => ({ ...prev, status: prev.status === 'vencido' ? '' : 'vencido' }))}
          className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 transform ${filters.status === 'vencido' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.vencido}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.vencidoAmount)}</p>
            </div>
          </div>
          {filters.status === 'vencido' && (
            <p className="text-xs text-red-600 mt-2 font-medium">✓ Filtro activo</p>
          )}
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por recibo, alumno o referencia..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="pagado">Pagados</option>
                  <option value="vencido">Vencidos</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>

              {/* Filtro por tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="colegiatura">Colegiatura</option>
                  <option value="inscripcion">Inscripción</option>
                  <option value="uniforme">Uniforme</option>
                  <option value="examen">Examen</option>
                  <option value="equipo">Equipo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Filtro por sucursal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal
                </label>
                <select
                  value={filters.sucursal}
                  onChange={(e) => handleFilterChange('sucursal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal._id} value={sucursal._id}>
                      {sucursal.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ NUEVO: Información de Configuraciones de Pagos */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Política de Recargos</h3>
              </div>
              <div className="flex gap-6 text-sm">
                  <div>
                      <span className="text-gray-600">Días de gracia:</span>
                      <span className="ml-2 font-semibold text-amber-600">
                          {configuraciones.diasGracia} días
                      </span>
                  </div>
                  <div>
                      <span className="text-gray-600">Recargo por mora:</span>
                      <span className="ml-2 font-semibold text-amber-600">
                          {configuraciones.recargoTardio}%
                      </span>
                  </div>
                  <div className="flex items-center gap-2">
                      {configuraciones.requiereComprobante ? (
                          <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">Comprobante requerido</span>
                          </>
                      ) : (
                          <span className="text-sm text-gray-500">Comprobante opcional</span>
                      )}
                  </div>
              </div>
          </div>
      </div>

      {/* Tabla de Pagos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : pagos.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filters.status || filters.type || filters.sucursal
                ? 'No se encontraron pagos con los filtros aplicados'
                : 'Comienza registrando un nuevo pago'}
            </p>
            {!searchTerm && !filters.status && !filters.type && !filters.sucursal && canCreate && (
              <div className="mt-6">
                <button onClick={handleCreate} className="btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Registrar Primer Pago
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Vista Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alumno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimiento
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
                  {pagos.map((pago) => (
                    <tr key={pago._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pago.alumno?.firstName} {pago.alumno?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pago.alumno?.enrollment?.studentId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(pago.type)}
                      </td>
                      {/* Columna de Monto con Recargo */}
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                              <div className="text-sm font-medium text-gray-900">
                                  ${pago.amount.toFixed(2)}
                              </div>
                              {(() => {
                                  const recargo = calcularRecargoVisual(pago)
                                  if (recargo) {
                                      return (
                                          <div className="text-xs text-red-600 font-semibold">
                                              +${recargo.monto.toFixed(2)} recargo
                                              <div className="text-gray-500">
                                                  Total: ${recargo.totalConRecargo.toFixed(2)}
                                              </div>
                                          </div>
                                      )
                                  }
                                  return null
                              })()}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(pago.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(pago.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Ver detalles - Siempre visible */}
                          <button
                            onClick={() => handleView(pago)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          {/* ✅ CORREGIDO: Botones con permisos */}
                          {pago.status === 'pendiente' && (
                            <>
                              {/* Editar - Solo admin */}
                              <PermissionGuard module="pagos" action="update">
                                <button
                                  onClick={() => handleEdit(pago)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Editar"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                              </PermissionGuard>

                              {/* Marcar como pagado - Solo admin */}
                              <PermissionGuard module="pagos" action="approvePayments">
                                <button
                                  onClick={() => handleMarkAsPaid(pago)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Marcar como pagado"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              </PermissionGuard>
                            </>
                          )}
                          
                          {/* Subir comprobante - Admin e Instructor */}
                          {(pago.status === 'pendiente' || pago.status === 'vencido') && (
                            <PermissionGuard module="pagos" action="uploadReceipt">
                              <button
                                onClick={() => handleUploadComprobante(pago)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Subir comprobante"
                              >
                                <Upload className="w-5 h-5" />
                              </button>
                            </PermissionGuard>
                          )}
                          
                          {/* Eliminar - Solo admin */}
                          {pago.status !== 'pagado' && (
                            <PermissionGuard module="pagos" action="delete">
                              <button
                                onClick={() => handleDelete(pago)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </PermissionGuard>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Mobile */}
            <div className="md:hidden">
              {pagos.map((pago) => (
                <div key={pago._id} className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {pago.alumno?.firstName} {pago.alumno?.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{pago.alumno?.enrollment?.studentId}</p>
                    </div>
                    {getStatusBadge(pago.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      {getTypeBadge(pago.type)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Monto:</span>
                      <span className="font-medium text-gray-900">{formatCurrency(pago.total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Vencimiento:</span>
                      <span className="text-gray-900">{formatDate(pago.dueDate)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    {/* Ver detalles - Siempre visible */}
                    <button
                      onClick={() => handleView(pago)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {/* ✅ CORREGIDO: Botones mobile con permisos */}
                    {pago.status === 'pendiente' && (
                      <>
                        <PermissionGuard module="pagos" action="update">
                          <button
                            onClick={() => handleEdit(pago)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                        
                        <PermissionGuard module="pagos" action="approvePayments">
                          <button
                            onClick={() => handleMarkAsPaid(pago)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </PermissionGuard>
                      </>
                    )}
                    
                    {(pago.status === 'pendiente' || pago.status === 'vencido') && (
                      <PermissionGuard module="pagos" action="uploadReceipt">
                        <button
                          onClick={() => handleUploadComprobante(pago)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                        >
                          <Upload className="w-5 h-5" />
                        </button>
                      </PermissionGuard>
                    )}
                    
                    {pago.status !== 'pagado' && (
                      <PermissionGuard module="pagos" action="delete">
                        <button
                          onClick={() => handleDelete(pago)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{' '}
                        <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                        {' '}-{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {' '}de{' '}
                        <span className="font-medium">{pagination.total}</span>
                        {' '}resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const pageNum = i + 1
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.totalPages ||
                            (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === pagination.page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          } else if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                            return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
                          }
                          return null
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showForm && (
        <PagoForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
          pago={selectedPago}
          mode={formMode}
          configuraciones={configuraciones}
        />
      )}

      {showDetails && (
        <PagoDetailsModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          pago={selectedPago}
          onEdit={handleEdit}  // ✅ AGREGADO
          onDelete={handleDelete}  // ✅ AGREGADO
          configuraciones={configuraciones}
        />
      )}

      {showUploadModal && (
        <ComprobanteUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          pago={selectedPago}
        />
      )}
    </div>
  )
}

export default PagosPage