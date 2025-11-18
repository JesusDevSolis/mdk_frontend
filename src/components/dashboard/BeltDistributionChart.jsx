import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Award, TrendingUp } from 'lucide-react'

const BeltDistributionChart = ({ data, loading }) => {
    // Mapeo de nombres de cinturones a español
    const beltNames = {
        'blanco': 'Blanco',
        'blanco-amarillo': 'Blanco-Amarillo',
        'amarillo': 'Amarillo',
        'amarillo-naranja': 'Amarillo-Naranja',
        'naranja': 'Naranja',
        'naranja-verde': 'Naranja-Verde',
        'verde': 'Verde',
        'verde-azul': 'Verde-Azul',
        'azul': 'Azul',
        'azul-marron': 'Azul-Marrón',
        'marron': 'Marrón',
        'marron-negro': 'Marrón-Negro',
        'negro-1': 'Negro 1° Dan',
        'negro-2': 'Negro 2° Dan',
        'negro-3': 'Negro 3° Dan',
        'negro-4': 'Negro 4° Dan',
        'negro-5': 'Negro 5° Dan',
        'negro-6': 'Negro 6° Dan',
        'negro-7': 'Negro 7° Dan',
        'negro-8': 'Negro 8° Dan',
        'negro-9': 'Negro 9° Dan'
    }

    // Colores para cada cinturón
    const beltColors = {
        'blanco': '#FFFFFF',
        'blanco-amarillo': '#FFE599',
        'amarillo': '#FFD700',
        'amarillo-naranja': '#FFB347',
        'naranja': '#FFA500',
        'naranja-verde': '#90EE90',
        'verde': '#228B22',
        'verde-azul': '#20B2AA',
        'azul': '#1E90FF',
        'azul-marron': '#8B4513',
        'marron': '#A0522D',
        'marron-negro': '#5D4037',
        'negro-1': '#000000',
        'negro-2': '#000000',
        'negro-3': '#000000',
        'negro-4': '#000000',
        'negro-5': '#000000',
        'negro-6': '#000000',
        'negro-7': '#000000',
        'negro-8': '#000000',
        'negro-9': '#000000'
    }

    // Transformar datos para Recharts
    const chartData = data?.map(item => ({
        name: beltNames[item._id] || item._id,
        alumnos: item.count,
        color: beltColors[item._id] || '#CCCCCC',
        belt: item._id
    })) || []

    // Calcular total de alumnos
    const totalAlumnos = chartData.reduce((acc, item) => acc + item.alumnos, 0)

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                <p className="text-sm text-gray-600">
                    Alumnos: <span className="font-bold text-blue-600">{payload[0].value}</span>
                </p>
                <p className="text-xs text-gray-500">
                    {((payload[0].value / totalAlumnos) * 100).toFixed(1)}% del total
                </p>
            </div>
        )
        }
        return null
    }

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    // Estado vacío
    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 text-blue-600 mr-2" />
                    Distribución de Cinturones
                </h3>
                <div className="text-center py-12 text-gray-500">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No hay datos de cinturones disponibles</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Award className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Distribución de Cinturones
                    </h3>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Total de alumnos</p>
                    <p className="text-2xl font-bold text-blue-600">{totalAlumnos}</p>
                </div>
            </div>

            {/* Gráfica */}
            <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        />
                        <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                        dataKey="alumnos" 
                        radius={[8, 8, 0, 0]}
                        label={{ position: 'top', fontSize: 12, fill: '#374151' }}
                        >
                        {chartData.map((entry, index) => (
                            <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={entry.belt === 'blanco' ? '#d1d5db' : entry.color}
                            strokeWidth={entry.belt === 'blanco' ? 2 : 0}
                            />
                        ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Leyenda personalizada */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chartData.slice(0, 8).map((item, index) => (
                <div 
                    key={index}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                <div 
                    className="w-4 h-4 rounded"
                    style={{ 
                        backgroundColor: item.color,
                        border: item.belt === 'blanco' ? '2px solid #d1d5db' : 'none'
                    }}
                />
                    <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                        {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {item.alumnos} alumnos
                    </p>
                    </div>
                </div>
                ))}
            </div>

            {/* Mostrar "ver más" si hay más de 8 cinturones */}
            {chartData.length > 8 && (
                <div className="mt-3 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver todos los cinturones ({chartData.length})
                </button>
                </div>
            )}

            {/* Insight */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                <p className="text-sm font-medium text-blue-900">
                    Análisis rápido
                </p>
                <p className="text-sm text-blue-700 mt-1">
                    {chartData.length > 0 && (
                    <>
                        El cinturón más común es <span className="font-bold">{chartData[0]?.name}</span> con {chartData[0]?.alumnos} alumnos
                        ({((chartData[0]?.alumnos / totalAlumnos) * 100).toFixed(1)}% del total).
                    </>
                    )}
                </p>
                </div>
            </div>
        </div>
    )
}

export default BeltDistributionChart