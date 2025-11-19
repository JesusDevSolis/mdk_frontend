import React, { useState, useEffect } from 'react'
import { 
    X, 
    TrendingUp, 
    TrendingDown,
    DollarSign,
    CreditCard,
    Calendar,
    Building2,
    FileText,
    ArrowRight,
    Loader
} from 'lucide-react'
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FinancialStatsModal = ({ isOpen, onClose }) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Colores para las gráficas
    const TYPE_COLORS = {
        colegiatura: '#3B82F6',
        inscripcion: '#10B981',
        uniforme: '#F59E0B',
        examen: '#EF4444',
        equipo: '#8B5CF6',
        otro: '#6B7280'
    }

    const METHOD_COLORS = ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B']

    useEffect(() => {
        if (isOpen) {
        fetchFinancialStats()
        }
    }, [isOpen, selectedMonth, selectedYear])

    const fetchFinancialStats = async () => {
        try {
        setLoading(true)
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
        
        const response = await fetch(
            `http://localhost:3005/api/dashboard/financiero?year=${selectedYear}&month=${selectedMonth}`,
            {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            }
        )
        
        const result = await response.json()
        
        if (result.success) {
            setData(result.data)
        }
        } catch (error) {
        console.error('Error cargando estadísticas financieras:', error)
        } finally {
        setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
        }).format(amount || 0)
    }

    const getMonthName = (month) => {
        const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        return months[month - 1]
    }

    // Transformar datos para gráfica de tipo de pago
    const getTypeData = () => {
        if (!data?.ingresosPorTipo) return []

        const typeLabels = {
        colegiatura: 'Colegiatura',
        inscripcion: 'Inscripción',
        uniforme: 'Uniforme',
        examen: 'Examen',
        equipo: 'Equipo',
        otro: 'Otro'
        }

        return data.ingresosPorTipo.map(item => ({
        name: typeLabels[item._id] || item._id,
        value: item.total,
        type: item._id,
        count: item.count
        }))
    }

    // Transformar datos para gráfica de método de pago
    const getMethodData = () => {
        if (!data?.ingresosPorMetodo) return []

        const methodLabels = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        transferencia: 'Transferencia',
        cheque: 'Cheque',
        deposito: 'Depósito'
        }

        return data.ingresosPorMetodo.map(item => ({
        name: methodLabels[item._id] || item._id,
        ingresos: item.total,
        count: item.count
        }))
    }

    // Custom label para el gráfico de pastel
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        if (percent < 0.05) return null // No mostrar labels muy pequeños

        return (
        <text 
            x={x} 
            y={y} 
            fill="white" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            className="font-semibold text-xs"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Overlay */}
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Estadísticas Financieras</h2>
                    <p className="text-sm text-gray-600">{getMonthName(selectedMonth)} {selectedYear}</p>
                </div>
                </div>
                <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Selector de Mes/Año */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                    </option>
                    ))}
                </select>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                    {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                        <option key={year} value={year}>
                        {year}
                        </option>
                    )
                    })}
                </select>
                </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="w-8 h-8 animate-spin text-primary-600" />
                    <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
                </div>
                ) : data ? (
                <div className="p-6 space-y-6">
                    {/* Resumen General */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-700 mb-1">Total de Ingresos</p>
                            <p className="text-3xl font-bold text-green-900">
                            {formatCurrency(data.resumen?.totalMes || 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-green-200 rounded-full">
                            <DollarSign className="w-8 h-8 text-green-700" />
                        </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                        {data.resumen?.cantidadPagos || 0} pagos procesados
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-700 mb-1">Promedio por Pago</p>
                            <p className="text-3xl font-bold text-blue-900">
                            {formatCurrency(
                                data.resumen?.cantidadPagos > 0 
                                ? data.resumen.totalMes / data.resumen.cantidadPagos 
                                : 0
                            )}
                            </p>
                        </div>
                        <div className="p-4 bg-blue-200 rounded-full">
                            <FileText className="w-8 h-8 text-blue-700" />
                        </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                        Calculado sobre {data.resumen?.cantidadPagos || 0} pagos
                        </p>
                    </div>
                    </div>

                    {/* Gráficas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ingresos por Tipo */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary-600" />
                        Ingresos por Tipo de Pago
                        </h3>
                        
                        {getTypeData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                            <Pie
                                data={getTypeData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getTypeData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type] || '#94A3B8'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value, name, props) => [
                                formatCurrency(value),
                                `${props.payload.count} pagos`
                                ]}
                                contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem'
                                }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                formatter={(value, entry) => `${value}: ${formatCurrency(entry.payload.value)}`}
                            />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-gray-400">No hay datos disponibles</p>
                        </div>
                        )}
                    </div>

                    {/* Ingresos por Método */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                        Ingresos por Método de Pago
                        </h3>
                        
                        {getMethodData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getMethodData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                                formatter={(value, name) => [
                                formatCurrency(value),
                                name === 'ingresos' ? 'Total' : name
                                ]}
                                contentStyle={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem'
                                }}
                            />
                            <Bar dataKey="ingresos" radius={[8, 8, 0, 0]}>
                                {getMethodData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                                ))}
                            </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <p className="text-gray-400">No hay datos disponibles</p>
                        </div>
                        )}
                    </div>
                    </div>

                    {/* Tabla de Ingresos por Sucursal */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                        Ingresos por Sucursal
                        </h3>
                    </div>
                    
                    {data.ingresosPorSucursal && data.ingresosPorSucursal.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sucursal
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pagos
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Ingresos
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                % del Total
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {data.ingresosPorSucursal.map((sucursal, index) => {
                                const percentage = data.resumen?.totalMes > 0 
                                ? (sucursal.total / data.resumen.totalMes) * 100 
                                : 0
                                
                                return (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium text-gray-900">
                                        {sucursal.name || 'Sin nombre'}
                                        </span>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {sucursal.count}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(sucursal.total)}
                                    </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end">
                                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                        {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    </td>
                                </tr>
                                )
                            })}
                            </tbody>
                        </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No hay datos de sucursales</p>
                        </div>
                    )}
                    </div>
                </div>
                ) : (
                <div className="text-center py-20">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay datos financieros disponibles</p>
                    <p className="text-gray-400 text-sm mt-2">Intenta con otro mes o año</p>
                </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                onClick={onClose}
                className="btn-secondary"
                >
                Cerrar
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}

export default FinancialStatsModal