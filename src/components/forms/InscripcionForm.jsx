import React, { useState, useEffect } from 'react'
import { 
    X, 
    UserPlus,
    Search,
    AlertCircle,
    CheckCircle2,
    Users,
    Award,
    Calendar,
    DollarSign,
    Percent,
    Save,
    Loader,
    XCircle,
    Trash2
} from 'lucide-react'
import { examenesAPI, alumnosAPI, utils } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

const InscripcionForm = ({ examen, isOpen, onClose, onSuccess }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [examenActual, setExamenActual] = useState(null)
    const [alumnosElegibles, setAlumnosElegibles] = useState([])
    const [alumnosInscritos, setAlumnosInscritos] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAlumnos, setSelectedAlumnos] = useState([])
    const [loadingAlumnos, setLoadingAlumnos] = useState(true)
    const [showTab, setShowTab] = useState('disponibles')

    useEffect(() => {
        if (isOpen && examen) {
        console.log('🚀 Modal abierto - Inicializando...')
        setExamenActual(examen)
        setAlumnosElegibles([])
        // ❌ NO limpiar alumnosInscritos aquí - loadAlumnosElegibles lo hará
        // setAlumnosInscritos([])  
        setSelectedAlumnos([])
        setSearchTerm('')
        setShowTab('disponibles')
        // Cargar datos iniciales
        if (examen._id) {
            console.log('📞 Llamando a loadAlumnosElegibles con examen inicial')
            loadAlumnosElegibles(examen)
        }
        }
    }, [isOpen, examen])

    const loadAlumnosElegibles = async (examenParaUsar = null) => {
        // Usar el examen pasado como parámetro o el state actual
        const examenAUsar = examenParaUsar || examenActual
        
        // ✅ Validación crítica: no continuar si no hay examen
        if (!examenAUsar || !examenAUsar._id) {
        console.log('⏭️ Saltando loadAlumnosElegibles - examen no está listo')
        return
        }

        try {
        setLoadingAlumnos(true)
        const response = await examenesAPI.getAlumnosElegibles(examenAUsar._id)
        
        if (response.success && response.data && response.data.length > 0) {
            console.log('✅ Usando alumnos elegibles del backend')
            setAlumnosElegibles(response.data)
        } else {
            console.log('⚠️ No hay alumnos elegibles, cargando todos de la sucursal')
            // Cargar todos los alumnos de la sucursal
            const alumnosResponse = await alumnosAPI.getAll({ 
            sucursal: examenAUsar.sucursal?._id || examenAUsar.sucursal,
            status: 'activo'
            })
            
            if (alumnosResponse.success && alumnosResponse.data) {
            const alumnosArray = alumnosResponse.data.alumnos || alumnosResponse.data
            
            // Filtrar alumnos ya inscritos
            const idsInscritos = (examenAUsar.alumnosInscritos || []).map(inscrito => {
                if (typeof inscrito === 'string') return inscrito
                if (inscrito.alumno?._id) return inscrito.alumno._id
                if (inscrito.alumno) return inscrito.alumno
                if (inscrito._id) return inscrito._id
                return null
            }).filter(Boolean)
            
            const alumnosNoInscritos = Array.isArray(alumnosArray) 
                ? alumnosArray.filter(alumno => !idsInscritos.includes(alumno._id))
                : []
            
            const alumnosConRequisitos = alumnosNoInscritos.map(alumno => ({
                ...alumno,
                requisitos: {
                cumpleTodos: false,
                detalles: {
                    asistencia: { cumple: false },
                    diasConCinturon: { cumple: false },
                    pagosAlCorriente: { cumple: false }
                }
                }
            }))
            setAlumnosElegibles(alumnosConRequisitos)
            }
        }
        
        // ✅ CRÍTICO: Procesar inscritos SIEMPRE, independiente del camino anterior
        console.log('🔍 Procesando inscritos de examenAUsar:', examenAUsar.alumnosInscritos?.length || 0)
        console.log('📋 Array completo:', examenAUsar.alumnosInscritos)
        
        const inscritosCompletos = (examenAUsar.alumnosInscritos || []).map(inscrito => {
            const alumnoData = inscrito.alumno || inscrito
            console.log('  - Procesando inscrito:', alumnoData?.firstName, alumnoData?.lastName)
            return {
            ...alumnoData,
            fechaInscripcion: inscrito.inscritoEn || inscrito.fechaInscripcion,
            descuentoAplicado: inscrito.pagoExamen?.descuentoAplicado || 0,
            montoPagado: inscrito.pagoExamen?.monto || 0,
            pagado: inscrito.pagoExamen?.pagado || false
            }
        })
        
        console.log('✅ Total de inscritos procesados:', inscritosCompletos.length)
        console.log('📊 Inscritos completos:', inscritosCompletos)
        
        console.log('🎯 LLAMANDO A setAlumnosInscritos con:', inscritosCompletos.length, 'alumnos')
        setAlumnosInscritos(inscritosCompletos)
        console.log('✅ setAlumnosInscritos EJECUTADO')
            
        } catch (error) {
        console.error('Error al cargar alumnos:', error)
        toast.error('Error al cargar alumnos')
        } finally {
        setLoadingAlumnos(false)
        }
    }

    const handleSelectAlumno = (alumno) => {
        const isSelected = selectedAlumnos.find(a => a._id === alumno._id)
        
        if (isSelected) {
        setSelectedAlumnos(selectedAlumnos.filter(a => a._id !== alumno._id))
        } else {
        const costoBase = examenActual.requisitos?.costoExamen || 0
        const descuento = 0
        const montoFinal = costoBase - (costoBase * descuento / 100)
        
        setSelectedAlumnos([...selectedAlumnos, {
            ...alumno,
            descuento,
            montoFinal,
            autorizarSinPago: false
        }])
        }
    }

    const handleDescuentoChange = (alumnoId, descuento) => {
        setSelectedAlumnos(selectedAlumnos.map(alumno => {
        if (alumno._id === alumnoId) {
            const costoBase = examenActual.requisitos?.costoExamen || 0
            const descuentoNum = parseFloat(descuento) || 0
            const montoFinal = costoBase - (costoBase * descuentoNum / 100)
            return { ...alumno, descuento: descuentoNum, montoFinal }
        }
        return alumno
        }))
    }

    const handleAutorizarSinPago = (alumnoId, autorizar) => {
        setSelectedAlumnos(selectedAlumnos.map(alumno => {
        if (alumno._id === alumnoId) {
            return { ...alumno, autorizarSinPago: autorizar }
        }
        return alumno
        }))
    }

    const handleInscribir = async () => {
        if (selectedAlumnos.length === 0) {
        toast.error('Debes seleccionar al menos un alumno')
        return
        }

        try {
        setLoading(true)
        
        const promises = selectedAlumnos.map(alumno => 
            examenesAPI.inscribirAlumno(examenActual._id, {
            alumnoId: alumno._id,
            descuento: alumno.descuento || 0,
            autorizarSinPago: alumno.autorizarSinPago || false
            })
        )

        const results = await Promise.all(promises)
        const exitosos = results.filter(r => r.success).length
        const fallidos = results.length - exitosos

        if (exitosos > 0) {
            toast.success(`${exitosos} alumno(s) inscrito(s) exitosamente`)
        }
        if (fallidos > 0) {
            toast.error(`${fallidos} inscripción(es) fallida(s)`)
        }

        if (exitosos > 0) {
            onSuccess && onSuccess()
            handleClose()
        }

        } catch (error) {
        console.error('Error al inscribir:', error)
        toast.error(error.response?.data?.message || 'Error al inscribir alumnos')
        } finally {
        setLoading(false)
        }
    }

    const handleDesinscribir = async (alumno) => {
        if (!window.confirm(`¿Estás seguro de desinscribir a ${alumno.firstName} ${alumno.lastName}?`)) {
        return
        }

        try {
        setLoading(true)
        const response = await examenesAPI.desinscribirAlumno(examenActual._id, alumno._id)
        
        if (response.success) {
            toast.success('Alumno desinscrito exitosamente')
            
            // Recargar datos del examen para obtener la lista actualizada
            const examenActualizado = await examenesAPI.getById(examenActual._id)
            if (examenActualizado.success) {
            console.log('✅ Examen actualizado recibido:', examenActualizado.data.alumnosInscritos?.length, 'inscritos')
            console.log('📋 Inscritos:', examenActualizado.data.alumnosInscritos)
            
            // Actualizar el state local
            setExamenActual(examenActualizado.data)
            
            // ✅ Llamar a loadAlumnosElegibles pasando directamente el examen actualizado
            // Esto evita problemas de timing con el state
            loadAlumnosElegibles(examenActualizado.data)
            
            // Notificar al componente padre
            onSuccess && onSuccess()
            }
        }
        } catch (error) {
        console.error('❌ Error al desinscribir:', error)
        toast.error(error.response?.data?.message || 'Error al desinscribir alumno')
        } finally {
        setLoading(false)
        }
    }

    const handleClose = () => {
        setSelectedAlumnos([])
        setSearchTerm('')
        onClose()
    }

    const filteredAlumnos = alumnosElegibles.filter(alumno => {
        const nombreCompleto = `${alumno.firstName} ${alumno.lastName}`.toLowerCase()
        return nombreCompleto.includes(searchTerm.toLowerCase())
    })

    const getRequisitosStatus = (alumno) => {
        const cumple = alumno.requisitos?.cumpleTodos || false
        const detalles = alumno.requisitos?.detalles || {}
        
        return {
        cumple,
        asistencia: detalles.asistencia?.cumple || false,
        cinturon: detalles.diasConCinturon?.cumple || false,
        pagos: detalles.pagosAlCorriente?.cumple || false
        }
    }

    if (!isOpen || !examenActual) return null

    // 🔍 DEBUG: Log en cada render
    console.log('🖼️ RENDER - alumnosInscritos.length:', alumnosInscritos.length)
    console.log('🖼️ RENDER - alumnosInscritos:', alumnosInscritos)
    console.log('🖼️ RENDER - showTab:', showTab)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <UserPlus className="w-6 h-6 text-white" />
                    <div>
                        <h2 className="text-xl font-bold text-white">Gestionar Inscripciones</h2>
                        <p className="text-purple-100 text-sm">{examenActual?.nombre}</p>
                    </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                </div>

                {/* Body */}
                <div className="p-6">
                {/* Info del Examen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{utils.formatDate(examenActual?.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">Costo: ${examenActual?.requisitos?.costoExamen?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">Inscritos: {alumnosInscritos.length}</span>
                    </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    <button
                    onClick={() => setShowTab('disponibles')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        showTab === 'disponibles'
                        ? 'text-purple-600 border-b-2 border-purple-600 -mb-px'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    >
                    Disponibles ({alumnosElegibles.length})
                    </button>
                    <button
                    onClick={() => setShowTab('inscritos')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        showTab === 'inscritos'
                        ? 'text-purple-600 border-b-2 border-purple-600 -mb-px'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    >
                    Ya Inscritos ({alumnosInscritos.length})
                    </button>
                </div>

                {/* Tab: Disponibles */}
                {showTab === 'disponibles' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Columna Izquierda - Lista */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alumnos Disponibles</h3>
                        
                        <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar alumno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        </div>

                        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                        {loadingAlumnos ? (
                            <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                            </div>
                        ) : filteredAlumnos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No hay alumnos disponibles</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                            {filteredAlumnos.map(alumno => {
                                const requisitos = getRequisitosStatus(alumno)
                                const isSelected = selectedAlumnos.find(a => a._id === alumno._id)
                                
                                return (
                                <div
                                    key={alumno._id}
                                    onClick={() => handleSelectAlumno(alumno)}
                                    className={`p-4 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                        {alumno.firstName} {alumno.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                        <Award className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500 capitalize">
                                            {alumno.belt?.level?.replace('-', ' ') || 'Sin cinturón'}
                                        </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                        {requisitos.cumple ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Cumple requisitos
                                            </span>
                                        ) : (
                                            <>
                                            {!requisitos.asistencia && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Asistencia</span>
                                            )}
                                            {!requisitos.cinturon && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Días cinturón</span>
                                            )}
                                            {!requisitos.pagos && (
                                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pagos</span>
                                            )}
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                                    </div>
                                </div>
                                )
                            })}
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Columna Derecha - Seleccionados */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Seleccionados ({selectedAlumnos.length})
                        </h3>
                        
                        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                        {selectedAlumnos.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                            <UserPlus className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Selecciona alumnos de la lista</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                            {selectedAlumnos.map(alumno => (
                                <div key={alumno._id} className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-medium text-gray-900">{alumno.firstName} {alumno.lastName}</p>
                                    <button
                                    onClick={() => handleSelectAlumno(alumno)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                    >
                                    <XCircle className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Percent className="w-4 h-4 inline mr-1" />
                                    Descuento (%)
                                    </label>
                                    <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={alumno.descuento || 0}
                                    onChange={(e) => handleDescuentoChange(alumno._id, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Costo base:</span>
                                    <span className="font-medium">${examenActual?.requisitos?.costoExamen?.toFixed(2)}</span>
                                    </div>
                                    {alumno.descuento > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Descuento ({alumno.descuento}%):</span>
                                        <span>-${((examenActual?.requisitos?.costoExamen || 0) * alumno.descuento / 100).toFixed(2)}</span>
                                    </div>
                                    )}
                                    <div className="flex justify-between text-sm font-bold text-gray-900 mt-1 pt-1 border-t">
                                    <span>Total:</span>
                                    <span>${alumno.montoFinal?.toFixed(2)}</span>
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                    type="checkbox"
                                    checked={alumno.autorizarSinPago || false}
                                    onChange={(e) => handleAutorizarSinPago(alumno._id, e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-700">Autorizar inscripción sin pago</span>
                                </label>
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                )}

                {/* Tab: Inscritos */}
                {showTab === 'inscritos' && (
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Alumnos Inscritos ({alumnosInscritos.length})
                    </h3>
                    
                    <div className="border border-gray-200 rounded-lg">
                        {loadingAlumnos ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                        </div>
                        ) : alumnosInscritos.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No hay alumnos inscritos aún</p>
                        </div>
                        ) : (
                        <div className="divide-y divide-gray-200">
                            {alumnosInscritos.map(alumno => (
                            <div key={alumno._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    {alumno.firstName} {alumno.lastName}
                                </p>
                                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                                    {alumno.fechaInscripcion && (
                                    <span>
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        {utils.formatDate(alumno.fechaInscripcion)}
                                    </span>
                                    )}
                                    {alumno.pagado ? (
                                    <span className="text-green-600">
                                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                        Pagado
                                    </span>
                                    ) : (
                                    <span className="text-orange-600">Pendiente pago</span>
                                    )}
                                </div>
                                </div>
                                <button
                                onClick={() => handleDesinscribir(alumno)}
                                disabled={loading}
                                className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
                                >
                                <Trash2 className="w-4 h-4" />
                                Desinscribir
                                </button>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </div>
                )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                    {showTab === 'disponibles' ? (
                        <span><span className="font-medium">{selectedAlumnos.length}</span> alumno(s) seleccionado(s)</span>
                    ) : (
                        <span><span className="font-medium">{alumnosInscritos.length}</span> alumno(s) inscrito(s)</span>
                    )}
                    </div>
                    
                    <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cerrar
                    </button>
                    
                    {showTab === 'disponibles' && (
                        <button
                        onClick={handleInscribir}
                        disabled={loading || selectedAlumnos.length === 0}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                        {loading ? (
                            <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Inscribiendo...
                            </>
                        ) : (
                            <>
                            <Save className="w-4 h-4" />
                            Inscribir Alumnos
                            </>
                        )}
                        </button>
                    )}
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}

export default InscripcionForm