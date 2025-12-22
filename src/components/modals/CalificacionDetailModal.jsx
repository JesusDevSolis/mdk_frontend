import React, { useState, useEffect } from 'react'
import { 
    X, 
    Award,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    TrendingUp,
    Edit3,
    Save,
    Loader
} from 'lucide-react'
import { examenesAPI, utils } from '../../services/APIservice'
import toast from 'react-hot-toast'

const CalificacionDetailModal = ({ calificacion: calificacionProp, examen, isOpen, onClose, onSuccess }) => {
    const [calificacion, setCalificacion] = useState(null)
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editedCalificaciones, setEditedCalificaciones] = useState({})

    useEffect(() => {
        if (isOpen && calificacionProp) {
        setCalificacion(calificacionProp)
        setEditMode(false)
        
        // Inicializar calificaciones editables
        const califs = {}
        calificacionProp.calificacionesPorCategoria?.forEach(cat => {
            califs[cat.categoria] = {
            puntuacion: cat.calificacion,
            peso: cat.peso
            }
        })
        setEditedCalificaciones(califs)
        }
    }, [isOpen, calificacionProp])

    const handleCalificacionChange = (categoria, puntuacion) => {
        setEditedCalificaciones({
        ...editedCalificaciones,
        [categoria]: {
            ...editedCalificaciones[categoria],
            puntuacion: parseFloat(puntuacion) || 0
        }
        })
    }

    const calcularCalificacionFinal = () => {
        let sumaTotal = 0
        Object.keys(editedCalificaciones).forEach(categoria => {
        const { puntuacion, peso } = editedCalificaciones[categoria]
        sumaTotal += (puntuacion * peso) / 100
        })
        return sumaTotal
    }

    const handleGuardarCambios = async () => {
        const calificacionFinal = calcularCalificacionFinal()

        try {
        setLoading(true)
        
        const response = await examenesAPI.calificarAlumno(examen._id, {
            alumnoId: calificacion.alumno._id,
            calificaciones: Object.keys(editedCalificaciones).map(nombre => ({
            categoria: nombre,
            puntuacion: editedCalificaciones[nombre].puntuacion,
            peso: editedCalificaciones[nombre].peso
            })),
            calificacionFinal,
            aprobado: calificacionFinal >= 60
        })

        if (response.success) {
            toast.success('Calificación actualizada exitosamente')
            setEditMode(false)
            
            // Actualizar calificación local
            setCalificacion({
            ...calificacion,
            calificacionesPorCategoria: Object.keys(editedCalificaciones).map(nombre => ({
                categoria: nombre,
                calificacion: editedCalificaciones[nombre].puntuacion,
                peso: editedCalificaciones[nombre].peso
            })),
            calificacionFinal,
            resultado: calificacionFinal >= 60 ? 'aprobado' : 'reprobado'
            })
            
            onSuccess && onSuccess()
        }

        } catch (error) {
        console.error('Error al actualizar calificación:', error)
        toast.error('Error al actualizar calificación')
        } finally {
        setLoading(false)
        }
    }

    const handleCancelarEdicion = () => {
        // Restaurar valores originales
        const califs = {}
        calificacion.calificacionesPorCategoria?.forEach(cat => {
        califs[cat.categoria] = {
            puntuacion: cat.calificacion,
            peso: cat.peso
        }
        })
        setEditedCalificaciones(califs)
        setEditMode(false)
    }

    if (!isOpen || !calificacion) return null

    const calificacionFinal = editMode ? calcularCalificacionFinal() : calificacion.calificacionFinal
    const aprobado = calificacionFinal >= 60

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className={`px-6 py-4 ${
            aprobado 
                ? 'bg-gradient-to-r from-green-600 to-green-700' 
                : 'bg-gradient-to-r from-red-600 to-red-700'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-white" />
                <div>
                    <h2 className="text-xl font-bold text-white">Detalle de Calificación</h2>
                    <p className="text-white/90 text-sm">
                    {calificacion.alumno?.firstName} {calificacion.alumno?.lastName}
                    </p>
                </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
                </button>
            </div>
            </div>

            {/* Body */}
            <div className="p-6">
            {/* Información del Alumno y Evaluación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-8 h-8 text-gray-600" />
                <div>
                    <p className="text-xs text-gray-600">Alumno</p>
                    <p className="font-semibold text-gray-900">
                    {calificacion.alumno?.firstName} {calificacion.alumno?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                    {calificacion.alumno?.belt?.level?.replace('-', ' ') || 'Sin cinturón'}
                    </p>
                </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Calendar className="w-8 h-8 text-gray-600" />
                <div>
                    <p className="text-xs text-gray-600">Evaluado Por</p>
                    <p className="font-semibold text-gray-900">
                    {calificacion.evaluadoPor?.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                    {utils.formatDate(calificacion.fechaEvaluacion)}
                    </p>
                </div>
                </div>
            </div>

            {/* Calificación Final */}
            <div className={`border-2 rounded-lg p-6 mb-6 ${
                aprobado 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className={`w-10 h-10 ${aprobado ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                    <p className="text-sm font-medium text-gray-700">Calificación Final</p>
                    <p className={`text-4xl font-bold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
                        {calificacionFinal.toFixed(2)}
                    </p>
                    </div>
                </div>
                
                <div className="text-right">
                    {aprobado ? (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <span className="text-xl font-semibold text-green-700">APROBADO</span>
                    </div>
                    ) : (
                    <div className="flex items-center gap-2">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <span className="text-xl font-semibold text-red-700">REPROBADO</span>
                    </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Mínimo: 60 puntos</p>
                </div>
                </div>
            </div>

            {/* Categorías de Evaluación */}
            <div>
                <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Calificaciones por Categoría</h3>
                {!editMode && (
                    <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                    <Edit3 className="w-4 h-4" />
                    Editar
                    </button>
                )}
                </div>

                <div className="space-y-4">
                {Object.keys(editedCalificaciones).map(categoria => (
                    <div key={categoria} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                        <h4 className="font-semibold text-gray-900">{categoria}</h4>
                        <p className="text-sm text-gray-500">
                            Peso: {editedCalificaciones[categoria].peso}%
                        </p>
                        </div>
                        {!editMode && (
                        <span className="text-2xl font-bold text-blue-600">
                            {editedCalificaciones[categoria].puntuacion}
                        </span>
                        )}
                    </div>
                    
                    {editMode && (
                        <div className="mt-3">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={editedCalificaciones[categoria].puntuacion}
                            onChange={(e) => handleCalificacionChange(categoria, e.target.value)}
                            className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                        <span className="text-gray-600">Aporte a calificación final:</span>
                        <span className="font-semibold text-gray-900">
                        {((editedCalificaciones[categoria].puntuacion * editedCalificaciones[categoria].peso) / 100).toFixed(2)} pts
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            </div>

            {/* Botones de Edición */}
            {editMode && (
                <div className="mt-6 flex gap-3">
                <button
                    onClick={handleGuardarCambios}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Guardando...
                    </>
                    ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Guardar Cambios
                    </>
                    )}
                </button>
                <button
                    onClick={handleCancelarEdicion}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                </div>
            )}
            </div>

            {/* Footer */}
            {!editMode && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <button
                onClick={onClose}
                className="w-full px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                Cerrar
                </button>
            </div>
            )}
        </div>
        </div>
    )
}

export default CalificacionDetailModal