import React, { useState, useEffect } from 'react'
import { 
    Users, 
    TrendingUp,
    UserCircle,
    Baby,
    User,
    UserCog
} from 'lucide-react'
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AlumnosDemographics = ({ loading }) => {
    const [data, setData] = useState(null)
    const [dataLoading, setDataLoading] = useState(true)

    // Colores para las gráficas
    const GENDER_COLORS = {
        masculino: '#3B82F6', // Azul
        femenino: '#EC4899', // Rosa
        otro: '#8B5CF6' // Morado
    }

    const AGE_COLORS = ['#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7']

    useEffect(() => {
        fetchAlumnosStats()
    }, [])

    const fetchAlumnosStats = async () => {
        try {
            setDataLoading(true)
            const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
            
            const response = await fetch('http://localhost:3005/api/dashboard/alumnos-stats', {
                headers: {
                'Authorization': `Bearer ${token}`
                }
            })
            
            const result = await response.json()
            
            if (result.success) {
                setData(result.data)
            }
        } catch (error) {
            console.error('Error cargando estadísticas de alumnos:', error)
        } finally {
            setDataLoading(false)
        }
    }

    // Transformar datos de género para el gráfico de pastel
    const getGenderData = () => {
        if (!data?.distribucionGenero) return []
        
        const genderLabels = {
            masculino: 'Masculino',
            femenino: 'Femenino',
            otro: 'Otro'
        }

        return data.distribucionGenero.map(item => ({
            name: genderLabels[item._id] || item._id,
            value: item.count,
            gender: item._id
        }))
    }

    // Transformar datos de edad para el gráfico de barras
    const getAgeData = () => {
        if (!data?.rangoEdades) return []

        const ageLabels = {
            'menores_6': '< 6 años',
            '6_12': '6-12 años',
            '13_17': '13-17 años',
            '18_30': '18-30 años',
            '31_50': '31-50 años',
            'mayores_50': '> 50 años'
        }

        return Object.entries(data.rangoEdades).map(([key, value]) => ({
            name: ageLabels[key] || key,
            alumnos: value
        }))
    }

    // Calcular totales
    const getTotals = () => {
        if (!data) return { total: 0, masculino: 0, femenino: 0, otro: 0 }

        const genero = data.distribucionGenero || []
        const totals = {
            total: genero.reduce((sum, item) => sum + item.count, 0),
            masculino: genero.find(g => g._id === 'masculino')?.count || 0,
            femenino: genero.find(g => g._id === 'femenino')?.count || 0,
            otro: genero.find(g => g._id === 'otro')?.count || 0
        }

        return totals
    }

    // Custom label para el gráfico de pastel
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * RADIAN)
        const y = cy + radius * Math.sin(-midAngle * RADIAN)

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    if (loading || dataLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Users className="w-6 h-6 text-primary-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-800">Demografía de Alumnos</h2>
                    </div>
                </div>
                <div className="animate-pulse space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-gray-200 rounded"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay datos de alumnos disponibles</p>
                </div>
            </div>
        )
    }

    const genderData = getGenderData()
    const ageData = getAgeData()
    const totals = getTotals()

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Users className="w-6 h-6 text-primary-600 mr-2" />
                        <h2 className="text-xl font-bold text-gray-800">Demografía de Alumnos</h2>
                    </div>
                    <span className="text-sm text-gray-500">
                        {totals.total} {totals.total === 1 ? 'alumno' : 'alumnos'} activos
                    </span>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Masculino */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Masculino</p>
                                <p className="text-2xl font-bold text-blue-600">{totals.masculino}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <UserCog className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {totals.total > 0 ? `${((totals.masculino / totals.total) * 100).toFixed(1)}% del total` : '0% del total'}
                        </p>
                    </div>

                    {/* Femenino */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Femenino</p>
                                <p className="text-2xl font-bold text-pink-600">{totals.femenino}</p>
                            </div>
                            <div className="p-3 bg-pink-100 rounded-lg">
                                <UserCircle className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {totals.total > 0 ? `${((totals.femenino / totals.total) * 100).toFixed(1)}% del total` : '0% del total'}
                        </p>
                    </div>

                    {/* Otro */}
                    <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Otro</p>
                                <p className="text-2xl font-bold text-purple-600">{totals.otro}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <User className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {totals.total > 0 ? `${((totals.otro / totals.total) * 100).toFixed(1)}% del total` : '0% del total'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Gráficas */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfica de Género (Pastel) */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <UserCircle className="w-5 h-5 mr-2 text-primary-600" />
                            Distribución por Género
                        </h3>
                        
                        {genderData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomLabel}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.gender] || '#94A3B8'} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `${value} alumnos`}
                                    contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem'
                                    }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                                />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <p className="text-gray-400">No hay datos disponibles</p>
                            </div>
                        )}
                    </div>

                    {/* Gráfica de Edad (Barras) */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Baby className="w-5 h-5 mr-2 text-primary-600" />
                            Distribución por Edad
                        </h3>
                
                        {ageData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={ageData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        formatter={(value) => [`${value} alumnos`, 'Cantidad']}
                                        contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                        }}
                                    />
                                    <Bar dataKey="alumnos" radius={[8, 8, 0, 0]}>
                                        {ageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
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
            </div>

            {/* Footer con insights */}
            <div className="px-6 py-4 bg-primary-50 border-t border-primary-100 rounded-b-lg">
                <div className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-primary-600 mr-2 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-gray-800 mb-1">Insights Demográficos</p>
                        <p className="text-xs text-gray-600">
                        {totals.masculino > totals.femenino 
                            ? `Predominancia masculina con ${((totals.masculino / totals.total) * 100).toFixed(0)}% del total.`
                            : totals.femenino > totals.masculino
                            ? `Predominancia femenina con ${((totals.femenino / totals.total) * 100).toFixed(0)}% del total.`
                            : 'Distribución equilibrada entre géneros.'}
                        {' '}
                        {ageData.length > 0 && `El rango de edad más popular es ${ageData.reduce((max, item) => item.alumnos > max.alumnos ? item : max, ageData[0]).name}.`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AlumnosDemographics