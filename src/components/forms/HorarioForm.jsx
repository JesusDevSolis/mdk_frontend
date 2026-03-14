import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
    Calendar, 
    Clock,
    Users,
    Award,
    Building2,
    UserCheck,
    X,
    Save,
    Loader,
    AlertCircle,
    MapPin,
    DollarSign,
    FileText,
    Settings
} from 'lucide-react'
import { horariosAPI, sucursalesAPI, instructoresAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

const HorarioForm = ({ 
    horario = null, 
    isOpen, 
    onClose, 
    onSuccess,
    mode = 'create' // 'create' or 'edit'
}) => {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [sucursales, setSucursales] = useState([])
    const [instructores, setInstructores] = useState([])
    const [diasSeleccionados, setDiasSeleccionados] = useState([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
        sucursal: '',
        instructor: '',
        nombre: '',
        descripcion: '',
        dias: [],
        horaInicio: '',
        horaFin: '',
        nivel: '',
        categoria: '',
        capacidadMaxima: 20,
        salon: '',
        precio: 0,
        estado: 'activo',
        recurrente: true,
        fechaInicio: '',
        fechaFin: '',
        configuracion: {
            permitirListaEspera: false,
            notificarInscripciones: true,
            requiereConfirmacion: false
        },
        notas: ''
        }
    })

    // Watch para capacidad máxima (validación)
    const watchCapacidad = watch('capacidadMaxima')

    // Cargar datos iniciales
    const loadInitialData = async () => {
        try {
            const [sucursalesResponse, instructoresResponse] = await Promise.all([
                sucursalesAPI.getAll({ isActive: true }),
                instructoresAPI.getAll() // Quitamos el filtro isActive
            ])

            if (sucursalesResponse.success) {
                const sucursalesList = sucursalesResponse.data.sucursales || []
                setSucursales(sucursalesList)
            }

            if (instructoresResponse.success) {
                // Intentar diferentes estructuras de respuesta
                const instructoresList = instructoresResponse.data.instructores || 
                                        instructoresResponse.data.docs || 
                                        instructoresResponse.data || []
                setInstructores(instructoresList)
            }
        } catch (error) {
            toast.error('Error cargando datos del formulario')  
        }
    }

    // Efecto para cargar listas de datos iniciales
    useEffect(() => {
        if (isOpen) {
        loadInitialData()
        }
    }, [isOpen])

    // Efecto para cargar datos del horario al editar
    useEffect(() => {
        if (isOpen && mode === 'edit' && horario) {
        console.log('🔧 DEBUGGING - Modo edición activado')
        console.log('🔧 DEBUGGING - Horario recibido:', horario)
        console.log('🔧 DEBUGGING - Sucursales disponibles:', sucursales.length)
        console.log('🔧 DEBUGGING - Instructores disponibles:', instructores.length)
        
        // Esperar a que las listas estén cargadas
        if (sucursales.length === 0 || instructores.length === 0) {
            console.log('⏳ Esperando a que se carguen las listas...')
            return
        }
        
        console.log('✅ Listas cargadas, procediendo a llenar el formulario')
        
        // Cargar datos básicos
        setValue('nombre', horario.nombre || '')
        setValue('descripcion', horario.descripcion || '')
        // Cargar días (ahora es array)
        if (horario.dias && Array.isArray(horario.dias)) {
            setValue('dias', horario.dias)
            setDiasSeleccionados(horario.dias)
        } else if (horario.dia) {
            // Retrocompatibilidad: si viene el campo antiguo 'dia'
            setValue('dias', [horario.dia])
            setDiasSeleccionados([horario.dia])
        }
        setValue('horaInicio', horario.horaInicio || '')
        setValue('horaFin', horario.horaFin || '')
        setValue('nivel', horario.nivel || '')
        setValue('categoria', horario.categoria || '')
        setValue('capacidadMaxima', horario.capacidadMaxima || 20)
        setValue('salon', horario.salon || '')
        setValue('precio', horario.precio || 0)
        setValue('estado', horario.estado || 'activo')
        setValue('recurrente', horario.recurrente ?? true)
        
        // Cargar sucursal
        if (horario.sucursal) {
            const sucursalId = typeof horario.sucursal === 'object' 
            ? horario.sucursal._id 
            : horario.sucursal
            setValue('sucursal', sucursalId)
        }
        
        // Cargar instructor
        if (horario.instructor) {
            const instructorId = typeof horario.instructor === 'object' 
            ? horario.instructor._id 
            : horario.instructor
            setValue('instructor', instructorId)
        }
        
        // Cargar fechas
        if (horario.fechaInicio) {
            const fechaInicio = new Date(horario.fechaInicio).toISOString().split('T')[0]
            setValue('fechaInicio', fechaInicio)
        }
        if (horario.fechaFin) {
            const fechaFin = new Date(horario.fechaFin).toISOString().split('T')[0]
            setValue('fechaFin', fechaFin)
        }
        
        // Cargar configuración
        setValue('configuracion.permitirListaEspera', horario.configuracion?.permitirListaEspera ?? false)
        setValue('configuracion.notificarInscripciones', horario.configuracion?.notificarInscripciones ?? true)
        setValue('configuracion.requiereConfirmacion', horario.configuracion?.requiereConfirmacion ?? false)
        
        // Cargar notas
        setValue('notas', horario.notas || '')
        
        console.log('✅ Formulario completamente cargado')
        
        } else if (isOpen && mode === 'create') {
        console.log('📝 Modo crear - reseteando formulario')
        // Modo create - reset todo
        reset()
        }
    }, [isOpen, mode, horario, setValue, reset, sucursales, instructores])

    // Función de submit
    const onSubmit = async (data) => {
        try {
            // Validar que haya al menos un día seleccionado
            if (diasSeleccionados.length === 0) {
                toast.error('Debes seleccionar al menos un día')
                return
            }
            setIsLoading(true)

            // Validación adicional de horarios
            if (data.horaInicio >= data.horaFin) {
                toast.error('La hora de fin debe ser posterior a la hora de inicio')
                setIsLoading(false)
                return
            }

            // Preparar datos
            const horarioData = {
                sucursal: data.sucursal,
                instructor: data.instructor,
                nombre: data.nombre,
                descripcion: data.descripcion,
                dias: diasSeleccionados.length > 0 ? diasSeleccionados : data.dias,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                nivel: data.nivel,
                categoria: data.categoria,
                capacidadMaxima: parseInt(data.capacidadMaxima),
                salon: data.salon,
                precio: parseFloat(data.precio),
                estado: data.estado,
                recurrente: data.recurrente,
                fechaInicio: data.fechaInicio || undefined,
                fechaFin: data.fechaFin || undefined,
                configuracion: {
                permitirListaEspera: data.configuracion.permitirListaEspera,
                notificarInscripciones: data.configuracion.notificarInscripciones,
                requiereConfirmacion: data.configuracion.requiereConfirmacion
                },
                notas: data.notas
            }

            let response
            if (mode === 'edit') {
                response = await horariosAPI.update(horario._id, horarioData)
            } else {
                response = await horariosAPI.create(horarioData)
            }

            if (response.success) {
                toast.success(mode === 'edit' ? 'Horario actualizado exitosamente' : 'Horario creado exitosamente')
                onSuccess()
                onClose()
                reset()
            }
        } catch (error) {
            console.error('Error guardando horario:', error)
            toast.error(error.response?.data?.message || 'Error al guardar el horario')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                <h2 className="text-xl font-bold text-white">
                    {mode === 'edit' ? 'Editar Horario' : 'Nuevo Horario'}
                </h2>
                <p className="text-purple-100 text-sm">
                    {mode === 'edit' ? 'Actualiza la información del horario' : 'Crea un nuevo horario de clases'}
                </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                disabled={isLoading}
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Horario <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('nombre', { 
                        required: 'El nombre es requerido',
                        minLength: { value: 3, message: 'Mínimo 3 caracteres' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ej: Taekwondo Infantil - Lunes y Miércoles"
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.nombre.message}
                        </p>
                    )}
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        {...register('descripcion')}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Breve descripción del horario..."
                    />
                    </div>

                    {/* Sucursal */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Sucursal <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('sucursal', { required: 'La sucursal es requerida' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Seleccionar sucursal</option>
                        {sucursales.map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                            {sucursal.name}
                        </option>
                        ))}
                    </select>
                    {errors.sucursal && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.sucursal.message}
                        </p>
                    )}
                    </div>

                    {/* Instructor */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <UserCheck className="w-4 h-4 inline mr-1" />
                        Instructor <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('instructor', { required: 'El instructor es requerido' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Seleccionar instructor</option>
                        {instructores.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                            {instructor.name}
                        </option>
                        ))}
                    </select>
                    {errors.instructor && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.instructor.message}
                        </p>
                    )}
                    </div>
                </div>
                </div>

                {/* Horario */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Horario</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Días de la semana */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de la semana <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'lunes', label: '🌙 Lunes' },
                                { value: 'martes', label: '🔥 Martes' },
                                { value: 'miercoles', label: '💧 Miércoles' },
                                { value: 'jueves', label: '⚡ Jueves' },
                                { value: 'viernes', label: '🌟 Viernes' },
                                { value: 'sabado', label: '☀️ Sábado' },
                                { value: 'domingo', label: '🌈 Domingo' }
                            ].map((dia) => (
                                <label
                                    key={dia.value}
                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                        diasSeleccionados.includes(dia.value)
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'bg-white border-gray-300 hover:border-primary-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={diasSeleccionados.includes(dia.value)}
                                        onChange={(e) => {
                                            const checked = e.target.checked
                                            setDiasSeleccionados(prev => {
                                                if (checked) {
                                                    return [...prev, dia.value]
                                                } else {
                                                    return prev.filter(d => d !== dia.value)
                                                }
                                            })
                                        }}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium">{dia.label}</span>
                                </label>
                            ))}
                        </div>
                        {diasSeleccionados.length === 0 && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Debes seleccionar al menos un día
                            </p>
                        )}
                    </div>

                    {/* Hora Inicio */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Inicio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        {...register('horaInicio', { required: 'La hora de inicio es requerida' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.horaInicio && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.horaInicio.message}
                        </p>
                    )}
                    </div>

                    {/* Hora Fin */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Fin <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        {...register('horaFin', { required: 'La hora de fin es requerida' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.horaFin && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.horaFin.message}
                        </p>
                    )}
                    </div>
                </div>
                </div>

                {/* Clasificación */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Award className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Clasificación</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nivel */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('nivel', { required: 'El nivel es requerido' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Seleccionar nivel</option>
                        <option value="principiante">🆕 Principiante</option>
                        <option value="infantil">👶 Infantil</option>
                        <option value="juvenil">🧒 Juvenil</option>
                        <option value="adulto">👨 Adulto</option>
                        <option value="avanzado">🥇 Avanzado</option>
                        <option value="mixto">🎭 Mixto</option>
                    </select>
                    {errors.nivel && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.nivel.message}
                        </p>
                    )}
                    </div>

                    {/* Categoría */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('categoria', { required: 'La categoría es requerida' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">Seleccionar categoría</option>
                        <option value="pequenos-dragones">🐉 Pequeños Dragones</option>
                        <option value="principiantes">🌱 Principiantes</option>
                        <option value="intermedio">⭐ Intermedio</option>
                        <option value="avanzado">🔥 Avanzado</option>
                        <option value="poomsae">🎯 Poomsae</option>
                        <option value="combate">🥊 Combate</option>
                        <option value="defensa_personal">🛡️ Defensa Personal</option>
                        <option value="acrobacia">🤸 Acrobacia</option>
                        <option value="general">📚 General</option>
                    </select>
                    {errors.categoria && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.categoria.message}
                        </p>
                    )}
                    </div>
                </div>
                </div>

                {/* Capacidad y Detalles */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Users className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Capacidad y Detalles</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Capacidad Máxima */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidad Máxima <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        {...register('capacidadMaxima', { 
                        required: 'La capacidad es requerida',
                        min: { value: 1, message: 'Mínimo 1 alumno' },
                        max: { value: 50, message: 'Máximo 50 alumnos' }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.capacidadMaxima && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.capacidadMaxima.message}
                        </p>
                    )}
                    </div>

                    {/* Salón */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Salón
                    </label>
                    <input
                        type="text"
                        {...register('salon')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ej: Dojang Principal"
                    />
                    </div>

                    {/* Precio */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Precio Mensual (MXN)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('precio')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="0.00"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Estado */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                    </label>
                    <select
                        {...register('estado')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="activo">✅ Activo</option>
                        <option value="suspendido">⏸️ Suspendido</option>
                        <option value="cancelado">❌ Cancelado</option>
                        <option value="finalizado">🏁 Finalizado</option>
                    </select>
                    </div>

                    {/* Fecha Inicio (Opcional) */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Inicio (Opcional)
                    </label>
                    <input
                        type="date"
                        {...register('fechaInicio')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    </div>

                    {/* Fecha Fin (Opcional) */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Fin (Opcional)
                    </label>
                    <input
                        type="date"
                        {...register('fechaFin')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    </div>
                </div>
                </div>

                {/* Configuración */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <Settings className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Configuración</h3>
                </div>

                <div className="space-y-3">
                    {/* Permitir Lista de Espera */}
                    <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('configuracion.permitirListaEspera')}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-700">Permitir lista de espera</span>
                        <p className="text-xs text-gray-500">Permite inscribir alumnos cuando el horario esté lleno</p>
                    </div>
                    </label>

                    {/* Notificar Inscripciones */}
                    <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('configuracion.notificarInscripciones')}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-700">Notificar inscripciones</span>
                        <p className="text-xs text-gray-500">Enviar notificación al instructor cuando se inscriba un alumno</p>
                    </div>
                    </label>

                    {/* Requiere Confirmación */}
                    <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('configuracion.requiereConfirmacion')}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-700">Requiere confirmación</span>
                        <p className="text-xs text-gray-500">Las inscripciones requieren confirmación del instructor</p>
                    </div>
                    </label>

                    {/* Recurrente */}
                    <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register('recurrente')}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div>
                        <span className="text-sm font-medium text-gray-700">Horario recurrente</span>
                        <p className="text-xs text-gray-500">Se repite semanalmente</p>
                    </div>
                    </label>
                </div>
                </div>

                {/* Notas */}
                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas adicionales
                    </label>
                    <textarea
                    {...register('notas')}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Notas u observaciones sobre este horario..."
                    />
                </div>
                </div>
            </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isLoading}
            >
                Cancelar
            </button>
            <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                className="btn-primary flex items-center gap-2"
                disabled={isLoading}
            >
                {isLoading ? (
                <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Guardando...
                </>
                ) : (
                <>
                    <Save className="w-5 h-5" />
                    {mode === 'edit' ? 'Actualizar Horario' : 'Crear Horario'}
                </>
                )}
            </button>
            </div>
        </div>
        </div>
    )
}

export default HorarioForm