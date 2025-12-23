import React, { useState, useEffect } from 'react'
import { 
    X, 
    GraduationCap,
    CheckCircle2,
    Award,
    ArrowRight,
    Loader,
    AlertCircle,
    Users
} from 'lucide-react'
import { examenesAPI, graduacionesAPI, utils } from '../../services/APIservice'
import toast from 'react-hot-toast'

const GraduacionModal = ({ examen, isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [alumnosAprobados, setAlumnosAprobados] = useState([])
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([])
    const [procesando, setProcesando] = useState(false)

    useEffect(() => {
        if (isOpen && examen) {
        loadAlumnosAprobados()
        }
    }, [isOpen, examen])

    const loadAlumnosAprobados = async () => {
        try {
        setLoadingData(true)
        
        // Obtener calificaciones del examen
        const response = await examenesAPI.getCalificacionesExamen(examen._id)
        
        if (response.success) {
            // Filtrar solo aprobados
            const aprobados = response.data.calificaciones.filter(calif => 
            calif.resultado === 'aprobado'
            )
            
            setAlumnosAprobados(aprobados)
        }
        } catch (error) {
        console.error('Error cargando alumnos aprobados:', error)
        toast.error('Error al cargar alumnos aprobados')
        } finally {
        setLoadingData(false)
        }
    }

    const handleSelectAlumno = (calificacion) => {
        const alumnoId = calificacion.alumno._id
        
        if (alumnosSeleccionados.some(a => a.alumnoId === alumnoId)) {
        // Deseleccionar
        setAlumnosSeleccionados(alumnosSeleccionados.filter(a => a.alumnoId !== alumnoId))
        } else {
        // Seleccionar
        setAlumnosSeleccionados([
            ...alumnosSeleccionados,
            {
            alumnoId,
            calificacionId: calificacion._id,
            alumnoNombre: `${calificacion.alumno.firstName} ${calificacion.alumno.lastName}`,
            cinturonActual: calificacion.alumno.belt?.level || 'blanco',
            cinturonNuevo: examen.cinturonObjetivo
            }
        ])
        }
    }

    const handleSelectAll = () => {
        if (alumnosSeleccionados.length === alumnosAprobados.length) {
        // Deseleccionar todos
        setAlumnosSeleccionados([])
        } else {
        // Seleccionar todos
        const todos = alumnosAprobados.map(calif => ({
            alumnoId: calif.alumno._id,
            calificacionId: calif._id,
            alumnoNombre: `${calif.alumno.firstName} ${calif.alumno.lastName}`,
            cinturonActual: calif.alumno.belt?.level || 'blanco',
            cinturonNuevo: examen.cinturonObjetivo
        }))
        setAlumnosSeleccionados(todos)
        }
    }

    const handleProcesarGraduaciones = async () => {
        if (alumnosSeleccionados.length === 0) {
        toast.error('Selecciona al menos un alumno para graduar')
        return
        }

        // Confirmar
        const confirmacion = window.confirm(
        `¿Estás seguro de graduar a ${alumnosSeleccionados.length} alumno(s)?\n\n` +
        `Se actualizará su cinturón de ${formatCinturon(alumnosSeleccionados[0]?.cinturonActual)} a ${formatCinturon(examen.cinturonObjetivo)}.`
        )

        if (!confirmacion) return

        try {
        setProcesando(true)
        
        const response = await graduacionesAPI.procesarGraduaciones({
            examenId: examen._id,
            alumnosGraduar: alumnosSeleccionados.map(a => ({
            alumnoId: a.alumnoId,
            calificacionId: a.calificacionId
            }))
        })

        if (response.success) {
            const { exitosas, fallidas } = response.data
            
            if (exitosas.length > 0) {
            toast.success(
                `✅ ${exitosas.length} alumno(s) graduado(s) exitosamente`
            )
            }
            
            if (fallidas.length > 0) {
            toast.error(
                `❌ ${fallidas.length} graduación(es) fallida(s)`
            )
            }

            // Limpiar selección
            setAlumnosSeleccionados([])
            
            // Recargar datos
            await loadAlumnosAprobados()
            
            // Notificar al padre
            if (onSuccess) onSuccess()
            
            // Cerrar modal si todas fueron exitosas
            if (fallidas.length === 0) {
            setTimeout(() => {
                onClose()
            }, 1500)
            }
        }

        } catch (error) {
        console.error('Error procesando graduaciones:', error)
        toast.error('Error al procesar graduaciones')
        } finally {
        setProcesando(false)
        }
    }

    const formatCinturon = (cinturon) => {
        if (!cinturon) return 'Sin cinturón'
        return cinturon.replace('-', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }

    const getCinturonColor = (cinturon) => {
        if (!cinturon) return 'bg-gray-100 text-gray-800'
        
        const colorMap = {
        'blanco': 'bg-white border border-gray-300 text-gray-800',
        'blanco-amarillo': 'bg-gradient-to-r from-white to-yellow-100 text-gray-800',
        'amarillo': 'bg-yellow-400 text-gray-900',
        'amarillo-naranja': 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
        'naranja': 'bg-orange-500 text-white',
        'naranja-verde': 'bg-gradient-to-r from-orange-500 to-green-500 text-white',
        'verde': 'bg-green-600 text-white',
        'verde-azul': 'bg-gradient-to-r from-green-600 to-blue-600 text-white',
        'azul': 'bg-blue-600 text-white',
        'azul-marron': 'bg-gradient-to-r from-blue-600 to-amber-700 text-white',
        'marron': 'bg-amber-800 text-white',
        'marron-negro': 'bg-gradient-to-r from-amber-800 to-gray-900 text-white',
        'negro-1': 'bg-gray-900 text-white',
        'negro-2': 'bg-gray-900 text-yellow-400',
        'negro-3': 'bg-gray-900 text-yellow-400',
        'negro-4': 'bg-gray-900 text-yellow-400'
        }
        
        return colorMap[cinturon] || 'bg-gray-100 text-gray-800'
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-white" />
                <div>
                    <h2 className="text-xl font-bold text-white">Procesar Graduaciones</h2>
                    <p className="text-white/90 text-sm">{examen.nombre}</p>
                </div>
                </div>
                <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                <X className="w-5 h-5 text-white" />
                </button>
            </div>
            </div>

            {/* Info del Cinturón */}
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Cinturón Objetivo</p>
                <div className={`inline-block px-6 py-2 rounded-full font-semibold ${getCinturonColor(examen.cinturonObjetivo)}`}>
                    {formatCinturon(examen.cinturonObjetivo)}
                </div>
                </div>
            </div>
            </div>

            {/* Body - Lista de Alumnos */}
            <div className="flex-1 overflow-y-auto p-6">
            {loadingData ? (
                <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : alumnosAprobados.length === 0 ? (
                <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No hay alumnos aprobados para graduar</p>
                <p className="text-gray-400 text-sm mt-2">
                    Los alumnos deben tener calificación aprobada (≥ 60)
                </p>
                </div>
            ) : (
                <>
                {/* Header con Select All */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                        Alumnos Aprobados ({alumnosAprobados.length})
                    </h3>
                    </div>
                    <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                    {alumnosSeleccionados.length === alumnosAprobados.length 
                        ? 'Deseleccionar Todos' 
                        : 'Seleccionar Todos'}
                    </button>
                </div>

                {/* Lista de Alumnos */}
                <div className="space-y-3">
                    {alumnosAprobados.map((calificacion) => {
                    const isSelected = alumnosSeleccionados.some(
                        a => a.alumnoId === calificacion.alumno._id
                    )
                    
                    return (
                        <div
                        key={calificacion._id}
                        onClick={() => handleSelectAlumno(calificacion)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        >
                        <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
                            }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>

                            {/* Nombre y Calificación */}
                            <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                                {calificacion.alumno.firstName} {calificacion.alumno.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                                Calificación: <span className="font-bold text-green-600">
                                {calificacion.calificacionFinal.toFixed(1)}
                                </span>
                            </p>
                            </div>

                            {/* Cambio de Cinturón */}
                            <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                getCinturonColor(calificacion.alumno.belt?.level)
                            }`}>
                                {formatCinturon(calificacion.alumno.belt?.level)}
                            </div>
                            
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                            
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                getCinturonColor(examen.cinturonObjetivo)
                            }`}>
                                {formatCinturon(examen.cinturonObjetivo)}
                            </div>
                            </div>
                        </div>
                        </div>
                    )
                    })}
                </div>
                </>
            )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                {alumnosSeleccionados.length > 0 ? (
                    <span className="font-medium text-blue-600">
                    {alumnosSeleccionados.length} alumno(s) seleccionado(s)
                    </span>
                ) : (
                    <span>Selecciona alumnos para graduar</span>
                )}
                </div>
                
                <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={procesando}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
                
                <button
                    onClick={handleProcesarGraduaciones}
                    disabled={alumnosSeleccionados.length === 0 || procesando}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {procesando ? (
                    <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Procesando...
                    </>
                    ) : (
                    <>
                        <Award className="w-5 h-5" />
                        Graduar Alumnos
                    </>
                    )}
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
}

export default GraduacionModal