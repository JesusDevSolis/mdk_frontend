import React, { useState, useEffect } from 'react'
import { useNavigate, createSearchParams } from 'react-router-dom'
import { 
    Users, 
    Building2, 
    CreditCard, 
    GraduationCap,
    UserCheck,
    AlertCircle,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { dashboardAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'
import BackendStatus from '../../components/common/BackendStatus'
import BeltDistributionChart from '../../components/dashboard/BeltDistributionChart'
import SucursalesComparisonTable from '../../components/dashboard/SucursalesComparisonTable'
import AlumnosDemographics from '../../components/dashboard/AlumnosDemographics'
import FinancialStatsModal from '../../components/modals/FinancialStatsModal'

const DashboardHome = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [resumen, setResumen] = useState(null)
    const [actividadReciente, setActividadReciente] = useState(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [stats, setStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)
    const [sucursales, setSucursales] = useState([])
    const [sucursalesLoading, setSucursalesLoading] = useState(true)
    const [showFinancialModal, setShowFinancialModal] = useState(false)

    // Cargar datos del resumen
    useEffect(() => {
        fetchResumen()
        fetchActividadReciente()
        fetchStats()
        fetchSucursales()
    }, [refreshKey])

    const fetchResumen = async () => {
        try {
        setLoading(true)
        const response = await dashboardAPI.getResumen()
        if (response.success) {
            setResumen(response.data)
        }
        } catch (error) {
        console.error('Error cargando resumen:', error)
        toast.error('Error al cargar estadísticas del dashboard')
        } finally {
        setLoading(false)
        }
    }

    const fetchActividadReciente = async () => {
        try {
        const response = await dashboardAPI.getActividadReciente(5)
        if (response.success) {
            setActividadReciente(response.data)
        }
        } catch (error) {
        console.error('Error cargando actividad reciente:', error)
        }
    }

    const fetchStats = async () => {
        try {
            setStatsLoading(true)
            const response = await dashboardAPI.getStats()
            if (response.success) {
            setStats(response.data)
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
        } finally {
            setStatsLoading(false)
    }
    }

    const fetchSucursales = async () => {
        try {
            setSucursalesLoading(true)
            const response = await dashboardAPI.getSucursalesComparativa()
            if (response.success) {
                setSucursales(response.data)
            }
        } catch (error) {
            console.error('Error cargando comparativa de sucursales:', error)
        } finally {
            setSucursalesLoading(false)
        }
    }

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
        toast.success('Actualizando datos...')
    }

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
        }).format(amount || 0)
    }

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
        })
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
            {/* Verificador de conexión con backend */}
            <BackendStatus />
            
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Resumen general del sistema
                </p>
                </div>
                <button 
                onClick={handleRefresh}
                className="btn-primary"
                >
                <TrendingUp className="w-4 h-4 mr-2" />
                Actualizar
                </button>
            </div>
            
            {/* Tarjetas de Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjeta: Total Alumnos */}
                <div 
                    onClick={() => navigate('/admin/alumnos')}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform"
                >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Alumnos</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {resumen?.alumnosActivos || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Activos • Clic para ver más</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
                </div>
                
                {/* Tarjeta: Total Instructores */}
                <div 
                    onClick={() => navigate('/admin/instructores')}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform"
                >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Instructores</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {resumen?.instructoresActivos || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Personal activo • Clic para ver más</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                    <UserCheck className="w-8 h-8 text-purple-600" />
                    </div>
                </div>
                </div>
                
                {/* Tarjeta: Sucursales */}
                <div 
                    onClick={() => navigate('/admin/sucursales')}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform"
                >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Sucursales</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {resumen?.sucursalesActivas || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">En operación • Clic para ver más</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                    <Building2 className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
                </div>
                
                {/* Tarjeta: Ingresos del Mes */}
                <div 
                    onClick={() => setShowFinancialModal(true)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer hover:scale-105 transform transition-transform"
                >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Ingresos del Mes</p>
                    <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(resumen?.ingresosMes)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pagos recibidos • Clic para detalles</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                    <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                </div>
                </div>
                
                {/* Tarjeta: Pagos Pendientes */}
                <div 
                    onClick={() => navigate({
                        pathname: '/admin/pagos',
                        search: createSearchParams({ filter: 'pendiente' }).toString()
                    })}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform"
                >
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Pagos Pendientes</p>
                    <p className="text-3xl font-bold text-orange-600">
                        {resumen?.pagosPendientes || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Por cobrar • Clic para ver más</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                    <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
                </div>
                
                {/* Tarjeta: Pagos Vencidos */}
                <div 
                    onClick={() => navigate({
                        pathname: '/admin/pagos',
                        search: createSearchParams({ filter: 'vencido' }).toString()
                    })}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer hover:scale-105 transform"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">Pagos Vencidos</p>
                            <p className="text-3xl font-bold text-red-600">
                                {resumen?.pagosVencidos || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Requieren atención • Clic para ver más</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>
        
            {/* Sección: Actividad Reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos Alumnos Registrados */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Últimos Alumnos Registrados
                    </h3>
                    
                    {actividadReciente?.ultimosAlumnos?.length > 0 ? (
                        <div className="space-y-3">
                        {actividadReciente.ultimosAlumnos.map((alumno) => (
                            <div 
                            key={alumno._id} 
                            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                    {alumno.firstName} {alumno.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                    {alumno.enrollment?.sucursal?.name || 'Sin sucursal'}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {formatDate(alumno.enrollment?.enrollmentDate)}
                                </span>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No hay registros recientes</p>
                        </div>
                    )}
                </div>
                
                {/* Últimos Pagos Recibidos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                        Últimos Pagos Recibidos
                    </h3>
                
                    {actividadReciente?.ultimosPagos?.length > 0 ? (
                        <div className="space-y-3">
                            {actividadReciente.ultimosPagos.map((pago) => (
                            <div 
                                key={pago._id} 
                                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                {pago.alumno?.firstName} {pago.alumno?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                {formatCurrency(pago.total)} - {pago.paymentMethod}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formatDate(pago.paidDate)}
                            </span>
                        </div>
                    ))}
                </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay pagos recientes</p>
                    </div>
                )}
                </div>
            </div>
        
            {/* Sección: Próximos Pagos por Vencer */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 text-orange-600 mr-2" />
                    Próximos Pagos por Vencer (7 días)
                </h3>
            
                {actividadReciente?.proximosPagos?.length > 0 ? (
                    <div className="overflow-x-auto">
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
                                    Vence
                                </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {actividadReciente.proximosPagos.map((pago) => (
                                    <tr key={pago._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {pago.alumno?.firstName} {pago.alumno?.lastName}
                                        </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {pago.type}
                                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(pago.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                                        {formatDate(pago.dueDate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay pagos próximos a vencer</p>
                    </div>
                )}
            </div>

            {/* Sección: Distribución de Cinturones */}
            <BeltDistributionChart 
                data={stats?.distribucionCinturones || []}
                loading={statsLoading}
            />

            {/* Sección: Comparativa de Sucursales */}
            <SucursalesComparisonTable 
                sucursales={sucursales}
                loading={sucursalesLoading}
            />

            {/* Sección: Demografía de Alumnos */}
            <AlumnosDemographics 
                loading={statsLoading}
            />

            {/* Modal de Estadísticas Financieras */}
            <FinancialStatsModal 
                isOpen={showFinancialModal}
                onClose={() => setShowFinancialModal(false)}
            />
        </div>
    )
}

export default DashboardHome