import React, { useState } from 'react'
import { 
    Building2, 
    Users, 
    UserCheck, 
    TrendingUp,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Award,
    MapPin
} from 'lucide-react'

const SucursalesComparisonTable = ({ sucursales, loading }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'ingresos', direction: 'desc' })

    // Función para ordenar las sucursales
    const sortedSucursales = React.useMemo(() => {
        if (!sucursales || sucursales.length === 0) return []

        let sortableItems = [...sucursales]
        
        sortableItems.sort((a, b) => {
            let aValue, bValue

            switch (sortConfig.key) {
                case 'nombre':
                    aValue = a.nombre?.toLowerCase() || ''
                    bValue = b.nombre?.toLowerCase() || ''
                break
                case 'alumnos':
                    aValue = a.totalAlumnos || 0
                    bValue = b.totalAlumnos || 0
                break
                case 'instructores':
                    aValue = a.totalInstructores || 0
                    bValue = b.totalInstructores || 0
                break
                case 'ingresos':
                    aValue = a.ingresosMes || 0
                    bValue = b.ingresosMes || 0
                break
                default:
                    return 0
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1
            }
            return 0
        })

        return sortableItems
    }, [sucursales, sortConfig])

    // Encontrar la mejor sucursal (mayor ingreso)
    const mejorSucursal = React.useMemo(() => {
        if (!sucursales || sucursales.length === 0) return null
        return sucursales.reduce((max, sucursal) => 
        (sucursal.ingresosMes || 0) > (max.ingresosMes || 0) ? sucursal : max
        , sucursales[0])
    }, [sucursales])

    // Función para manejar el ordenamiento
    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    // Renderizar ícono de ordenamiento
    const renderSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        }
        return sortConfig.direction === 'asc' 
                ? <ArrowUp className="w-4 h-4 text-primary-600" />
                : <ArrowDown className="w-4 h-4 text-primary-600" />
    }

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0)
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Building2 className="w-6 h-6 text-primary-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-800">Comparativa de Sucursales</h2>
                    </div>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                </div>
            </div>
        )
    }

    if (!sucursales || sucursales.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Building2 className="w-6 h-6 text-primary-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-800">Comparativa de Sucursales</h2>
                    </div>
                </div>
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay sucursales registradas</p>
                    <p className="text-gray-400 text-sm mt-2">Agrega sucursales para ver la comparativa</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Building2 className="w-6 h-6 text-primary-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-800">Comparativa de Sucursales</h2>
                </div>
                <span className="text-sm text-gray-500">
                    {sucursales.length} {sucursales.length === 1 ? 'sucursal' : 'sucursales'}
                </span>
                </div>
            </div>

            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('nombre')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Sucursal</span>
                                    {renderSortIcon('nombre')}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('alumnos')}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>Alumnos</span>
                                    {renderSortIcon('alumnos')}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('instructores')}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    <UserCheck className="w-4 h-4" />
                                    <span>Instructores</span>
                                    {renderSortIcon('instructores')}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('ingresos')}
                            >
                                <div className="flex items-center justify-center space-x-1">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Ingresos del Mes</span>
                                    {renderSortIcon('ingresos')}
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedSucursales.map((sucursal) => {
                            const esMejor = mejorSucursal && sucursal._id === mejorSucursal._id && (sucursal.ingresosMes || 0) > 0
                
                            return (
                                <tr 
                                key={sucursal._id} 
                                className={`hover:bg-gray-50 transition-colors ${esMejor ? 'bg-primary-50' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-lg">
                                                <Building2 className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {sucursal.nombre}
                                                </div>
                                                {esMejor && (
                                                    <Award className="w-4 h-4 text-yellow-500 ml-2" title="Mejor sucursal" />
                                                )}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {sucursal.direccion?.ciudad || 'Sin ciudad'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {sucursal.totalAlumnos || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                            {sucursal.totalInstructores || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(sucursal.ingresosMes)}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
                {sortedSucursales.map((sucursal) => {
                    const esMejor = mejorSucursal && sucursal._id === mejorSucursal._id && (sucursal.ingresosMes || 0) > 0
            
                    return ( 
                        <div 
                            key={sucursal._id} 
                            className={`p-4 ${esMejor ? 'bg-primary-50' : ''}`}
                        >
                            {/* Header de la card */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-100 rounded-lg">
                                        <Building2 className="w-5 h-5 text-primary-600" />
                                    </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {sucursal.nombre}
                                        </h3>
                                        {esMejor && (
                                            <Award className="w-4 h-4 text-yellow-500 ml-2" />
                                        )}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {sucursal.direccion?.ciudad || 'Sin ciudad'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-xs text-gray-500 mb-1">Alumnos</div>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {sucursal.totalAlumnos || 0}
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <UserCheck className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="text-xs text-gray-500 mb-1">Instructores</div>
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {sucursal.totalInstructores || 0}
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-xs text-gray-500 mb-1">Ingresos</div>
                                    <div className="text-xs font-semibold text-gray-900">
                                        {formatCurrency(sucursal.ingresosMes)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer con totales */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Total Sucursales</p>
                        <p className="text-lg font-bold text-gray-900">{sucursales.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Total Alumnos</p>
                        <p className="text-lg font-bold text-blue-600">
                            {sucursales.reduce((sum, s) => sum + (s.totalAlumnos || 0), 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Total Instructores</p>
                        <p className="text-lg font-bold text-purple-600">
                            {sucursales.reduce((sum, s) => sum + (s.totalInstructores || 0), 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Ingresos Totales</p>
                        <p className="text-lg font-bold text-green-600">
                            {formatCurrency(sucursales.reduce((sum, s) => sum + (s.ingresosMes || 0), 0))}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SucursalesComparisonTable