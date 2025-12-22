import React, { useState, useEffect } from 'react'
import { 
    X, 
    Award,
    Save,
    Loader,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Users
} from 'lucide-react'
import { examenesAPI, utils } from '../../services/APIservice'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CalificacionForm = ({ examen, isOpen, onClose, onSuccess }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [alumnosInscritos, setAlumnosInscritos] = useState([])
    const [selectedAlumno, setSelectedAlumno] = useState(null)
    const [calificaciones, setCalificaciones] = useState({})
    const [loadingAlumnos, setLoadingAlumnos] = useState(true)

    useEffect(() => {
        if (isOpen && examen) {
        loadAlumnosInscritos()
        }
    }, [isOpen, examen])

    const loadAlumnosInscritos = async () => {
        try {
        setLoadingAlumnos(true)
        
        // Procesar alumnos inscritos del examen
        const inscritos = (examen.alumnosInscritos || []).map(inscrito => {
            const alumnoData = inscrito.alumno || inscrito
            return {
            _id: alumnoData._id || alumnoData,
            firstName: alumnoData.firstName,
            lastName: alumnoData.lastName,
            belt: alumnoData.belt,
            calificado: inscrito.calificado || false,
            aprobado: inscrito.aprobado
            }
        })
        
        setAlumnosInscritos(inscritos)
        
        // Seleccionar el primer alumno no calificado
        const primerNoCalificado = inscritos.find(a => !a.calificado)
        if (primerNoCalificado) {
            handleSelectAlumno(primerNoCalificado)
        } else if (inscritos.length > 0) {
            handleSelectAlumno(inscritos[0])
        }
        
        } catch (error) {
        console.error('Error al cargar alumnos:', error)
        toast.error('Error al cargar alumnos')
        } finally {
        setLoadingAlumnos(false)
        }
    }

    const handleSelectAlumno = async (alumno) => {
        setSelectedAlumno(alumno)
        
        // Intentar cargar calificación existente
        if (alumno.calificado) {
        try {
            const response = await examenesAPI.getCalificacionAlumno(examen._id, alumno._id)
            
            if (response.success && response.data) {
            // Cargar calificaciones existentes
            const califs = {}
            response.data.calificacionesPorCategoria?.forEach(cat => {
                califs[cat.categoria] = {
                puntuacion: cat.calificacion,
                peso: cat.peso
                }
            })
            setCalificaciones(califs)
            return
            }
        } catch (error) {
            console.log('No se encontró calificación previa, iniciando en 0')
        }
        }
        
        // Si no hay calificación o hubo error, inicializar en 0
        const califs = {}
        examen.categorias?.forEach(categoria => {
        califs[categoria.nombre] = {
            puntuacion: 0,
            peso: categoria.peso
        }
        })
        setCalificaciones(califs)
    }

    const handleCalificacionChange = (categoriaNombre, puntuacion) => {
        setCalificaciones({
        ...calificaciones,
        [categoriaNombre]: {
            ...calificaciones[categoriaNombre],
            puntuacion: parseFloat(puntuacion) || 0
        }
        })
    }

    const calcularCalificacionFinal = () => {
        let sumaTotal = 0
        Object.keys(calificaciones).forEach(categoria => {
        const { puntuacion, peso } = calificaciones[categoria]
        sumaTotal += (puntuacion * peso) / 100
        })
        return sumaTotal
    }

    const handleGuardarCalificacion = async () => {
        if (!selectedAlumno) {
        toast.error('Selecciona un alumno')
        return
        }

        const calificacionFinal = calcularCalificacionFinal()

        try {
        setLoading(true)
        
        const response = await examenesAPI.calificarAlumno(examen._id, {
            alumnoId: selectedAlumno._id,
            calificaciones: Object.keys(calificaciones).map(nombre => ({
            categoria: nombre,
            puntuacion: calificaciones[nombre].puntuacion,
            peso: calificaciones[nombre].peso
            })),
            calificacionFinal,
            aprobado: calificacionFinal >= 60 // Mínimo 60 para aprobar
        })

        if (response.success) {
            toast.success('Calificación guardada exitosamente')
            
            // Actualizar lista de alumnos
            setAlumnosInscritos(alumnosInscritos.map(a => 
            a._id === selectedAlumno._id 
                ? { ...a, calificado: true, aprobado: calificacionFinal >= 60 }
                : a
            ))
            
            // Seleccionar siguiente alumno no calificado
            const siguienteNoCalificado = alumnosInscritos.find(a => 
            a._id !== selectedAlumno._id && !a.calificado
            )
            
            if (siguienteNoCalificado) {
            handleSelectAlumno(siguienteNoCalificado)
            } else {
            // Todos calificados
            toast.success('¡Todos los alumnos han sido calificados!')
            setTimeout(() => {
                onSuccess && onSuccess()
                handleClose()
            }, 1500)
            }
        }

        } catch (error) {
        console.error('Error al guardar calificación:', error)
        toast.error(error.response?.data?.message || 'Error al guardar calificación')
        } finally {
        setLoading(false)
        }
    }

    const handleClose = () => {
        setSelectedAlumno(null)
        setCalificaciones({})
        onClose()
    }

    if (!isOpen || !examen) return null

    const calificacionFinal = calcularCalificacionFinal()
    const aprobado = calificacionFinal >= 60
    const alumnosCalificados = alumnosInscritos.filter(a => a.calificado).length
    const alumnosAprobados = alumnosInscritos.filter(a => a.calificado && a.aprobado).length

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-white" />
                <div>
                    <h2 className="text-xl font-bold text-white">Calificar Alumnos</h2>
                    <p className="text-blue-100 text-sm">{examen.nombre}</p>
                </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
                </button>
            </div>
            </div>

            {/* Body */}
            <div className="p-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Users className="w-10 h-10 text-gray-600" />
                    <div>
                    <p className="text-sm text-gray-600">Total Inscritos</p>
                    <p className="text-2xl font-bold text-gray-900">{alumnosInscritos.length}</p>
                    </div>
                </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <Award className="w-10 h-10 text-blue-600" />
                    <div>
                    <p className="text-sm text-blue-600">Calificados</p>
                    <p className="text-2xl font-bold text-blue-900">{alumnosCalificados} / {alumnosInscritos.length}</p>
                    </div>
                </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                    <div>
                    <p className="text-sm text-green-600">Aprobados</p>
                    <p className="text-2xl font-bold text-green-900">{alumnosAprobados}</p>
                    </div>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda - Lista de Alumnos */}
                <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alumnos Inscritos</h3>
                
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {loadingAlumnos ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    ) : alumnosInscritos.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay alumnos inscritos</p>
                    </div>
                    ) : (
                    <div className="divide-y divide-gray-200">
                        {alumnosInscritos.map(alumno => (
                        <div
                            key={alumno._id}
                            onClick={() => handleSelectAlumno(alumno)}
                            className={`p-4 cursor-pointer transition-colors ${
                            selectedAlumno?._id === alumno._id
                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                {alumno.firstName} {alumno.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize mt-1">
                                {alumno.belt?.level?.replace('-', ' ') || 'Sin cinturón'}
                                </p>
                            </div>
                            
                            {alumno.calificado ? (
                                alumno.aprobado ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                ) : (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                )
                            ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                </div>

                {/* Columna Derecha - Formulario de Calificación */}
                <div className="lg:col-span-2">
                {selectedAlumno ? (
                    <>
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                        Calificando a: {selectedAlumno.firstName} {selectedAlumno.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                        {selectedAlumno.belt?.level?.replace('-', ' ') || 'Sin cinturón'}
                        </p>
                    </div>

                    {/* Categorías de Evaluación */}
                    <div className="space-y-4 mb-6">
                        {examen.categorias?.map(categoria => (
                        <div key={categoria.nombre} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-900">{categoria.nombre}</h4>
                                {categoria.descripcion && (
                                <p className="text-sm text-gray-500">{categoria.descripcion}</p>
                                )}
                            </div>
                            <span className="text-sm font-medium text-blue-600">
                                Peso: {categoria.peso}%
                            </span>
                            </div>
                            
                            <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puntuación (0-100)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={calificaciones[categoria.nombre]?.puntuacion || 0}
                                onChange={(e) => handleCalificacionChange(categoria.nombre, e.target.value)}
                                className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            </div>
                            
                            <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-gray-600">Aporte a calificación final:</span>
                            <span className="font-semibold text-gray-900">
                                {((calificaciones[categoria.nombre]?.puntuacion || 0) * categoria.peso / 100).toFixed(2)} pts
                            </span>
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* Calificación Final */}
                    <div className={`border-2 rounded-lg p-6 mb-4 ${
                        aprobado 
                        ? 'bg-green-50 border-green-300' 
                        : 'bg-red-50 border-red-300'
                    }`}>
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <TrendingUp className={`w-8 h-8 ${aprobado ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                            <p className="text-sm font-medium text-gray-700">Calificación Final</p>
                            <p className={`text-3xl font-bold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
                                {calificacionFinal.toFixed(2)}
                            </p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            {aprobado ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                                <span className="text-lg font-semibold text-green-700">APROBADO</span>
                            </div>
                            ) : (
                            <div className="flex items-center gap-2">
                                <XCircle className="w-6 h-6 text-red-600" />
                                <span className="text-lg font-semibold text-red-700">REPROBADO</span>
                            </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1">Mínimo: 60 puntos</p>
                        </div>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <button
                        onClick={handleGuardarCalificacion}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Guardando...
                        </>
                        ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Guardar Calificación
                        </>
                        )}
                    </button>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                        <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>Selecciona un alumno para calificar</p>
                    </div>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                Progreso: <span className="font-medium">{alumnosCalificados} / {alumnosInscritos.length}</span> calificados
                </div>
                
                <button
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                Cerrar
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}

export default CalificacionForm