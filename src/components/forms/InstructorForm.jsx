import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import "react-datepicker/dist/react-datepicker.css"
import { 
    User, 
    Phone, 
    Mail, 
    MapPin,
    Save,
    X,
    Award,
    Building2,
    Calendar,
    Briefcase,
    Languages,
    Clock,
    FileText,
    Shield,
    GraduationCap,
    Loader
} from 'lucide-react'
import { instructoresAPI, sucursalesAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// Registrar locale español
registerLocale('es', es)
setDefaultLocale('es')

const InstructorForm = ({ 
    instructor = null, 
    isOpen, 
    onClose, 
    onSuccess,
    mode = 'create' // 'create' or 'edit'
    }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [sucursales, setSucursales] = useState([])
    const [loadingSucursales, setLoadingSucursales] = useState(true)
    const [activeTab, setActiveTab] = useState('basic') // 'basic', 'instructor', 'availability'
    
    // Estados para fechas
    const [selectedCertificationDate, setSelectedCertificationDate] = useState(null)
    
    // Estados para especialidades (multi-select)
    const [selectedSpecialties, setSelectedSpecialties] = useState([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch
    } = useForm({
        defaultValues: {
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        sucursal: '',
        instructorInfo: {
            belt: '',
            danGrade: '',
            certificationNumber: '',
            certificationDate: '',
            certifyingOrganization: '',
            yearsOfExperience: '',
            teachingExperience: '',
            contractType: 'tiempo_completo',
            salary: '',
            bio: '',
            languages: [],
            availability: {
            monday: { available: true, hours: '' },
            tuesday: { available: true, hours: '' },
            wednesday: { available: true, hours: '' },
            thursday: { available: true, hours: '' },
            friday: { available: true, hours: '' },
            saturday: { available: true, hours: '' },
            sunday: { available: false, hours: '' }
            }
        }
        }
    })

    const watchBelt = watch('instructorInfo.belt')

    // Cargar datos iniciales (sucursales) cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
        loadInitialData()
        }
    }, [isOpen])

    // Cargar datos del instructor después de que las sucursales estén cargadas
    useEffect(() => {
        if (instructor && mode === 'edit' && sucursales.length > 0) {
        loadInstructorData()
        }
    }, [instructor, mode, sucursales])

    const loadInitialData = async () => {
        try {
        setLoadingSucursales(true)
        const response = await sucursalesAPI.getAll()
        if (response.success) {
            setSucursales(response.data.sucursales || [])
        }
        } catch (error) {
        console.error('Error al cargar sucursales:', error)
        toast.error('Error al cargar sucursales')
        } finally {
        setLoadingSucursales(false)
        }
    }

    const loadInstructorData = () => {
        if (!instructor) return

        // Información básica
        setValue('name', instructor.name || '')
        setValue('email', instructor.email || '')
        setValue('phone', instructor.phone || '')
        setValue('address', instructor.address || '')
        setValue('sucursal', instructor.sucursal?._id || '')

        // Información de instructor
        if (instructor.instructorInfo) {
        const info = instructor.instructorInfo
        
        setValue('instructorInfo.belt', info.belt || '')
        setValue('instructorInfo.danGrade', info.danGrade || '')
        setValue('instructorInfo.certificationNumber', info.certificationNumber || '')
        setValue('instructorInfo.certifyingOrganization', info.certifyingOrganization || '')
        setValue('instructorInfo.yearsOfExperience', info.yearsOfExperience || '')
        setValue('instructorInfo.teachingExperience', info.teachingExperience || '')
        setValue('instructorInfo.contractType', info.contractType || 'tiempo_completo')
        setValue('instructorInfo.salary', info.salary || '')
        setValue('instructorInfo.bio', info.bio || '')

        // Fecha de certificación
        if (info.certificationDate) {
            const date = new Date(info.certificationDate)
            setSelectedCertificationDate(date)
            setValue('instructorInfo.certificationDate', date.toISOString().split('T')[0])
        }

        // Especialidades
        if (info.specialties && Array.isArray(info.specialties)) {
            setSelectedSpecialties(info.specialties)
        }

        // Idiomas
        if (info.languages && Array.isArray(info.languages)) {
            setValue('instructorInfo.languages', info.languages)
        }

        // Disponibilidad
        if (info.availability) {
            Object.keys(info.availability).forEach(day => {
            setValue(`instructorInfo.availability.${day}.available`, info.availability[day]?.available || false)
            setValue(`instructorInfo.availability.${day}.hours`, info.availability[day]?.hours || '')
            })
        }
        }
    }

    const handleCertificationDateChange = (date) => {
        setSelectedCertificationDate(date)
        if (date) {
        setValue('instructorInfo.certificationDate', date.toISOString().split('T')[0])
        }
    }

    const toggleSpecialty = (specialty) => {
        setSelectedSpecialties(prev => {
        if (prev.includes(specialty)) {
            return prev.filter(s => s !== specialty)
        } else {
            return [...prev, specialty]
        }
        })
    }

    const onSubmit = async (data) => {
        try {
        setIsLoading(true)

        // Preparar datos
        const formData = {
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || '',
            sucursal: data.sucursal || null
        }

        // Solo incluir password en modo creación
        if (mode === 'create') {
            if (!data.password || data.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            setIsLoading(false)
            return
            }
            formData.password = data.password
        }

        // Preparar instructorInfo
        const instructorInfo = {
            belt: data.instructorInfo?.belt || null,
            danGrade: data.instructorInfo?.danGrade ? parseInt(data.instructorInfo.danGrade) : null,
            certificationNumber: data.instructorInfo?.certificationNumber || '',
            certificationDate: data.instructorInfo?.certificationDate || null,
            certifyingOrganization: data.instructorInfo?.certifyingOrganization || '',
            specialties: selectedSpecialties,
            yearsOfExperience: data.instructorInfo?.yearsOfExperience ? parseInt(data.instructorInfo.yearsOfExperience) : 0,
            teachingExperience: data.instructorInfo?.teachingExperience || '',
            contractType: data.instructorInfo?.contractType || 'tiempo_completo',
            salary: data.instructorInfo?.salary ? parseFloat(data.instructorInfo.salary) : null,
            bio: data.instructorInfo?.bio || '',
            languages: data.instructorInfo?.languages || [],
            availability: data.instructorInfo?.availability || {}
        }

        formData.instructorInfo = instructorInfo

        let response
        if (mode === 'create') {
            response = await instructoresAPI.create(formData)
        } else {
            response = await instructoresAPI.update(instructor._id, formData)
        }

        if (response.success) {
            toast.success(`Instructor ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente`)
            reset()
            setSelectedSpecialties([])
            setSelectedCertificationDate(null)
            onSuccess?.()
            onClose()
        }

        } catch (error) {
        console.error('Error al guardar instructor:', error)
        const errorMessage = error.response?.data?.message || 'Error al guardar instructor'
        toast.error(errorMessage)
        } finally {
        setIsLoading(false)
        }
    }

    const handleCancel = () => {
        reset()
        setSelectedSpecialties([])
        setSelectedCertificationDate(null)
        setActiveTab('basic')
        onClose()
    }

    if (!isOpen) return null

    const specialtiesOptions = [
        { value: 'poomsae', label: 'Poomsae (Formas)' },
        { value: 'combate', label: 'Combate' },
        { value: 'defensa_personal', label: 'Defensa Personal' },
        { value: 'acrobacia', label: 'Acrobacia' },
        { value: 'ninos', label: 'Clases para Niños' },
        { value: 'adultos', label: 'Clases para Adultos' },
        { value: 'competencia', label: 'Preparación para Competencias' },
        { value: 'tradicional', label: 'Taekwondo Tradicional' }
    ]

    const daysOfWeek = [
        { key: 'monday', label: 'Lunes' },
        { key: 'tuesday', label: 'Martes' },
        { key: 'wednesday', label: 'Miércoles' },
        { key: 'thursday', label: 'Jueves' },
        { key: 'friday', label: 'Viernes' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    {mode === 'create' ? 'Nuevo Instructor' : 'Editar Instructor'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {mode === 'create' 
                    ? 'Completa la información del nuevo instructor' 
                    : 'Actualiza la información del instructor'
                    }
                </p>
                </div>
            </div>
            <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <X className="w-6 h-6 text-gray-400" />
            </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-4">
                <button
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basic'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                >
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información Básica
                </div>
                </button>
                <button
                onClick={() => setActiveTab('instructor')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'instructor'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                >
                <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Información de Instructor
                </div>
                </button>
                <button
                onClick={() => setActiveTab('availability')}
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'availability'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Disponibilidad
                </div>
                </button>
            </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                
                {/* TAB 1: INFORMACIÓN BÁSICA */}
                {activeTab === 'basic' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre Completo */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo *
                        </label>
                        <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            {...register('name', { required: 'El nombre es requerido' })}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Ej: Juan Pérez García"
                        />
                        </div>
                        {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                        </label>
                        <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            {...register('email', { 
                            required: 'El email es requerido',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Email inválido'
                            }
                            })}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="correo@ejemplo.com"
                        />
                        </div>
                        {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Contraseña (solo en modo crear) */}
                    {mode === 'create' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña *
                        </label>
                        <input
                            type="password"
                            {...register('password', { 
                            required: mode === 'create' ? 'La contraseña es requerida' : false,
                            minLength: {
                                value: 6,
                                message: 'Mínimo 6 caracteres'
                            }
                            })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.password ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="Mínimo 6 caracteres"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                        )}
                        </div>
                    )}

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                        </label>
                        <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="tel"
                            {...register('phone')}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+52 961 123 4567"
                        />
                        </div>
                    </div>

                    {/* Sucursal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sucursal
                        </label>
                        <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            {...register('sucursal')}
                            disabled={loadingSucursales}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:bg-gray-50 disabled:text-gray-500"
                        >
                            <option value="">
                            {loadingSucursales ? 'Cargando sucursales...' : 'Sin asignar'}
                            </option>
                            {sucursales.map(sucursal => (
                            <option key={sucursal._id} value={sucursal._id}>
                                {sucursal.name}
                            </option>
                            ))}
                        </select>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                        </label>
                        <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <textarea
                            {...register('address')}
                            rows="2"
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Calle, colonia, ciudad..."
                        />
                        </div>
                    </div>
                    </div>
                </div>
                )}

                {/* TAB 2: INFORMACIÓN DE INSTRUCTOR */}
                {activeTab === 'instructor' && (
                <div className="space-y-6">
                    {/* Cinturón y Dan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cinturón
                        </label>
                        <select
                        {...register('instructorInfo.belt')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                        <option value="">Seleccionar...</option>
                        <option value="blanco">Blanco</option>
                        <option value="amarillo">Amarillo</option>
                        <option value="verde">Verde</option>
                        <option value="azul">Azul</option>
                        <option value="rojo">Rojo</option>
                        <option value="negro_1dan">Negro 1° Dan</option>
                        <option value="negro_2dan">Negro 2° Dan</option>
                        <option value="negro_3dan">Negro 3° Dan</option>
                        <option value="negro_4dan">Negro 4° Dan</option>
                        <option value="negro_5dan">Negro 5° Dan</option>
                        <option value="negro_6dan">Negro 6° Dan</option>
                        <option value="negro_7dan">Negro 7° Dan</option>
                        <option value="negro_8dan">Negro 8° Dan</option>
                        <option value="negro_9dan">Negro 9° Dan</option>
                        </select>
                    </div>

                    {watchBelt?.includes('negro') && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grado de Dan
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="9"
                            {...register('instructorInfo.danGrade')}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1-9"
                        />
                        </div>
                    )}
                    </div>

                    {/* Certificación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Certificación
                        </label>
                        <input
                        type="text"
                        {...register('instructorInfo.certificationNumber')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="TKD-2024-12345"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Certificación
                        </label>
                        <DatePicker
                        selected={selectedCertificationDate}
                        onChange={handleCertificationDateChange}
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        maxDate={new Date()}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholderText="Seleccionar fecha"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organización Certificadora
                    </label>
                    <input
                        type="text"
                        {...register('instructorInfo.certifyingOrganization')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Federación Mexicana de Taekwondo"
                    />
                    </div>

                    {/* Especialidades */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Especialidades
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {specialtiesOptions.map(specialty => (
                        <button
                            key={specialty.value}
                            type="button"
                            onClick={() => toggleSpecialty(specialty.value)}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedSpecialties.includes(specialty.value)
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {specialty.label}
                        </button>
                        ))}
                    </div>
                    </div>

                    {/* Experiencia */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Años de Experiencia
                        </label>
                        <input
                        type="number"
                        min="0"
                        {...register('instructorInfo.yearsOfExperience')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Contrato
                        </label>
                        <select
                        {...register('instructorInfo.contractType')}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                        <option value="tiempo_completo">Tiempo Completo</option>
                        <option value="medio_tiempo">Medio Tiempo</option>
                        <option value="por_horas">Por Horas</option>
                        <option value="freelance">Freelance</option>
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiencia de Enseñanza
                    </label>
                    <textarea
                        {...register('instructorInfo.teachingExperience')}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe la experiencia de enseñanza del instructor..."
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biografía
                    </label>
                    <textarea
                        {...register('instructorInfo.bio')}
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Biografía profesional del instructor..."
                        maxLength="1000"
                    />
                    <p className="mt-1 text-xs text-gray-500">Máximo 1000 caracteres</p>
                    </div>
                </div>
                )}

                {/* TAB 3: DISPONIBILIDAD */}
                {activeTab === 'availability' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                    Configura los horarios de disponibilidad del instructor
                    </p>

                    {daysOfWeek.map(day => (
                    <div key={day.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-32">
                        <label className="flex items-center gap-2">
                            <input
                            type="checkbox"
                            {...register(`instructorInfo.availability.${day.key}.available`)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{day.label}</span>
                        </label>
                        </div>
                        <div className="flex-1">
                        <input
                            type="text"
                            {...register(`instructorInfo.availability.${day.key}.hours`)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Ej: 9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM"
                        />
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            {/* Footer con botones */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                {isLoading ? (
                    <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Guardando...
                    </>
                ) : (
                    <>
                    <Save className="w-5 h-5" />
                    {mode === 'create' ? 'Crear Instructor' : 'Guardar Cambios'}
                    </>
                )}
                </button>
            </div>
            </form>
        </div>
        </div>
    )
}

export default InstructorForm