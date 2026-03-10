import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { registerLocale, setDefaultLocale } from 'react-datepicker' // NUEVO: Para locale
import es from 'date-fns/locale/es' // NUEVO: Locale español
import "react-datepicker/dist/react-datepicker.css"
import { 
  User, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Heart,
  Upload,
  X,
  Save,
  Loader,
  Award,
  Building2,
  UserCheck,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Camera,
  CalendarDays,
  Dumbbell,
  BookOpen
} from 'lucide-react'
import { alumnosAPI, tutoresAPI, sucursalesAPI, authAPI, utils, GENDER_OPTIONS, STATUS_OPTIONS, ID_TYPES } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

// NUEVO: Registrar locale español
registerLocale('es', es)
setDefaultLocale('es')

// ── Constantes de disciplinas (v1.5) ──────────────────────────────────────────
const PROGRAMA_OPTIONS = [
  { value: 'tae-kwon-do',       label: 'Tae Kwon Do',       emoji: '🥋' },
  { value: 'tang-soo-do',       label: 'Tang Soo Do',        emoji: '🥊' },
  { value: 'hapkido',           label: 'Hapkido',            emoji: '🤸' },
  { value: 'gumdo',             label: 'Gumdo',              emoji: '⚔️' },
  { value: 'pequenos-dragones', label: 'Pequeños Dragones',  emoji: '🐉' },
]

const MARITAL_STATUS_OPTIONS = [
  { value: 'soltero',     label: 'Soltero/a' },
  { value: 'casado',      label: 'Casado/a' },
  { value: 'divorciado',  label: 'Divorciado/a' },
  { value: 'viudo',       label: 'Viudo/a' },
  { value: 'union-libre', label: 'Unión libre' },
  { value: 'otro',        label: 'Otro' },
]

const AlumnoForm = ({ 
  alumno = null, 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create' // 'create' or 'edit'
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [tutores, setTutores] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [instructores, setInstructores] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showTutorForm, setShowTutorForm] = useState(false)
  const [isMinor, setIsMinor] = useState(false)
  const [tutorMode, setTutorMode] = useState('existing') // 'existing' | 'new'
  
  // ✅ ESTADOS PARA CALENDARIOS MEJORADOS
  const [selectedBirthDate, setSelectedBirthDate] = useState(null)
  const [selectedBeltDate, setSelectedBeltDate] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      email: '',
      phone: '',
      // ── v1.5: campos nuevos de información personal ──
      birthPlace: '',
      height: '',
      maritalStatus: '',
      occupation: '',
      gradeLevel: '',
      // ─────────────────────────────────────────────────
      address: {
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      tutor: '',
      relationshipToTutor: '',
      // Campos para nuevo tutor
      newTutor: {
        firstName: '',
        lastName: '',
        email: '',
        identification: {
          type: 'ine',
          number: ''
        },
        phones: {
          primary: '',
          secondary: ''
        },
        address: {
          street: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: ''
      },
      medicalInfo: {
        bloodType: '',
        allergies: '',
        medications: '',
        medicalConditions: '',
        doctorName: '',
        doctorPhone: '',
        insuranceInfo: ''
      },
      enrollment: {
        sucursal: '',
        status: 'activo',
        monthlyFee: '',
        registrationFee: '',
        // ── v1.5: campos nuevos de matrícula ──
        programa: '',
        enrollmentReason: '',
        recommendedBy: '',
        // ──────────────────────────────────────
      },
      belt: {
        level: 'blanco',
        dateObtained: '',
        certifiedBy: ''
      },
      preferences: {
        receiveNotifications: true,
        receivePromotions: true,
        preferredContactMethod: 'email'
      },
      notes: ''
    }
  })

  // Watch para detectar cambios en la fecha de nacimiento
  const watchDateOfBirth = watch('dateOfBirth')
  // Watch para detectar disciplina seleccionada (v1.5)
  const watchPrograma = watch('enrollment.programa')

  // NUEVO: Calcular edad automáticamente cuando cambia la fecha
  useEffect(() => {
    if (watchDateOfBirth) {
      const age = utils.calculateAge(watchDateOfBirth)
      setIsMinor(age < 18)
    }
  }, [watchDateOfBirth])

  // Cargar datos iniciales
  const loadInitialData = async () => {
    try {
      const [tutoresResponse, sucursalesResponse, instructoresResponse] = await Promise.all([
        tutoresAPI.getAll({ isActive: true }),
        sucursalesAPI.getAll({ isActive: true }),
        authAPI.getUsers({ role: 'instructor' })
      ])

      if (tutoresResponse.success) {
        setTutores(tutoresResponse.data.tutores || [])
      }

      if (sucursalesResponse.success) {
        setSucursales(sucursalesResponse.data.sucursales || [])
      }

      if (instructoresResponse.success) {
        setInstructores(instructoresResponse.data.docs || instructoresResponse.data.users || [])
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
      toast.error('Error cargando datos del formulario')
    }
  }

  // ✅ Efecto para cargar listas de datos iniciales (tutores, sucursales, instructores)
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  // ✅ Efecto separado para cargar datos del alumno (SOLO cuando las listas están disponibles)
  useEffect(() => {
    if (isOpen && mode === 'edit' && alumno && tutores.length > 0 && sucursales.length > 0) {
      console.log('🔧 Cargando datos para editar (con listas cargadas):', alumno)
      console.log('🔧 Tutores disponibles:', tutores.length)
      console.log('🔧 Sucursales disponibles:', sucursales.length)
      
      // ✅ CARGAR FECHA DE NACIMIENTO - CALENDARIO MEJORADO
      if (alumno.dateOfBirth) {
        const date = new Date(alumno.dateOfBirth)
        setSelectedBirthDate(date)
        setValue('dateOfBirth', alumno.dateOfBirth.split('T')[0])
      }
      
      // ✅ CARGAR TODOS LOS DATOS DEL ALUMNO
      setValue('firstName', alumno.firstName || '')
      setValue('lastName', alumno.lastName || '')
      setValue('gender', alumno.gender || '')
      setValue('email', alumno.email || '')
      setValue('phone', alumno.phone || '')
      
      // ✅ v1.5: CARGAR CAMPOS NUEVOS DE INFORMACIÓN PERSONAL
      setValue('birthPlace',    alumno.birthPlace    || '')
      setValue('height',        alumno.height        || '')
      setValue('maritalStatus', alumno.maritalStatus || '')
      setValue('occupation',    alumno.occupation    || '')
      setValue('gradeLevel',    alumno.gradeLevel    || '')
      
      // ✅ CARGAR DIRECCIÓN
      setValue('address.street', alumno.address?.street || '')
      setValue('address.neighborhood', alumno.address?.neighborhood || '')
      setValue('address.city', alumno.address?.city || '')
      setValue('address.state', alumno.address?.state || '')
      setValue('address.zipCode', alumno.address?.zipCode || '')
      
      // ✅ CARGAR TUTOR - MEJORADO (ahora con listas disponibles)
      console.log('🔍 DEBUGGING - alumno.tutor:', alumno.tutor)
      console.log('🔍 DEBUGGING - tipo tutor:', typeof alumno.tutor)
      if (alumno.tutor) {
        const tutorId = typeof alumno.tutor === 'object' ? alumno.tutor._id : alumno.tutor
        console.log('🔍 DEBUGGING - tutorId final:', tutorId)
        console.log('🔍 DEBUGGING - tutor existe en lista:', tutores.find(t => t._id === tutorId))
        setValue('tutor', tutorId)
      }
      setValue('relationshipToTutor', alumno.relationshipToTutor || '')
      
      // ✅ CARGAR CONTACTO DE EMERGENCIA
      setValue('emergencyContact.name', alumno.emergencyContact?.name || '')
      setValue('emergencyContact.relationship', alumno.emergencyContact?.relationship || '')
      setValue('emergencyContact.phone', alumno.emergencyContact?.phone || '')
      setValue('emergencyContact.email', alumno.emergencyContact?.email || '')
      
      // ✅ CARGAR INFO MÉDICA
      setValue('medicalInfo.bloodType', alumno.medicalInfo?.bloodType || '')
      setValue('medicalInfo.allergies', alumno.medicalInfo?.allergies || '')
      setValue('medicalInfo.medications', alumno.medicalInfo?.medications || '')
      setValue('medicalInfo.medicalConditions', alumno.medicalInfo?.medicalConditions || '')
      setValue('medicalInfo.doctorName', alumno.medicalInfo?.doctorName || '')
      setValue('medicalInfo.doctorPhone', alumno.medicalInfo?.doctorPhone || '')
      setValue('medicalInfo.insuranceInfo', alumno.medicalInfo?.insuranceInfo || '')
      
      // ✅ CARGAR SUCURSAL - MEJORADO (ahora con listas disponibles)
      console.log('🔍 DEBUGGING - alumno.enrollment?.sucursal:', alumno.enrollment?.sucursal)
      console.log('🔍 DEBUGGING - tipo sucursal:', typeof alumno.enrollment?.sucursal)
      if (alumno.enrollment?.sucursal) {
        const sucursalId = typeof alumno.enrollment.sucursal === 'object' 
          ? alumno.enrollment.sucursal._id 
          : alumno.enrollment.sucursal
        console.log('🔍 DEBUGGING - sucursalId final:', sucursalId)
        console.log('🔍 DEBUGGING - sucursal existe en lista:', sucursales.find(s => s._id === sucursalId))
        setValue('enrollment.sucursal', sucursalId)
      }
      setValue('enrollment.status', alumno.enrollment?.status || 'activo')
      setValue('enrollment.monthlyFee', alumno.enrollment?.monthlyFee || 0)
      setValue('enrollment.registrationFee', alumno.enrollment?.registrationFee || 0)
      
      // ✅ v1.5: CARGAR CAMPOS NUEVOS DE MATRÍCULA
      setValue('enrollment.programa',         alumno.enrollment?.programa         || '')
      setValue('enrollment.enrollmentReason', alumno.enrollment?.enrollmentReason || '')
      setValue('enrollment.recommendedBy',    alumno.enrollment?.recommendedBy    || '')
      
      // ✅ CARGAR CINTURÓN - CALENDARIO MEJORADO
      setValue('belt.level', alumno.belt?.level || 'blanco')
      if (alumno.belt?.dateObtained) {
        const beltDate = new Date(alumno.belt.dateObtained)
        setSelectedBeltDate(beltDate)
        setValue('belt.dateObtained', new Date(alumno.belt.dateObtained).toISOString().split('T')[0])
      }
      setValue('belt.certifiedBy', alumno.belt?.certifiedBy?._id || alumno.belt?.certifiedBy || '')
      
      // ✅ CARGAR PREFERENCIAS
      setValue('preferences.receiveNotifications', alumno.preferences?.receiveNotifications ?? true)
      setValue('preferences.receivePromotions', alumno.preferences?.receivePromotions ?? true)
      setValue('preferences.preferredContactMethod', alumno.preferences?.preferredContactMethod || 'email')
      
      // ✅ CARGAR NOTAS
      setValue('notes', alumno.notes || '')
      
      // ✅ CARGAR FOTO SI EXISTE
      if (alumno.profilePhotoUrl) {
        setPhotoPreview(alumno.profilePhotoUrl)
      }
      
    } else if (isOpen && mode === 'create') {
      // Modo create - reset todo
      reset()
      setPhotoFile(null)
      setPhotoPreview(null)
      setShowTutorForm(false)
      setIsMinor(false)
      setTutorMode('existing')
      setSelectedBirthDate(null)
      setSelectedBeltDate(null)
    }
  }, [isOpen, mode, alumno, setValue, reset, tutores, sucursales, instructores])

  // Crear nuevo tutor
  const createNewTutor = async (tutorData) => {
    try {
      console.log('🚀 Datos del tutor a enviar (original):', tutorData)
      
      // Limpiar y estructurar datos según el modelo Tutor.js
      const formattedTutorData = {
        firstName: tutorData.firstName,
        lastName: tutorData.lastName,
        email: tutorData.email,
        identification: {
          type: tutorData.identification?.type || 'ine',
          number: tutorData.identification?.number || ''
        },
        phones: {
          primary: tutorData.phones?.primary || '',
          secondary: tutorData.phones?.secondary || ''
        },
        address: {
          street: tutorData.address?.street || '',
          neighborhood: tutorData.address?.neighborhood || '',
          city: tutorData.address?.city || '',
          state: tutorData.address?.state || '',
          zipCode: tutorData.address?.zipCode || ''
        },
        preferences: {
          receiveNotifications: true,
          receivePromotions: true,
          preferredContactMethod: 'email'
        },
        createdBy: user._id || user.id
      }
      
      console.log('✅ Datos corregidos según modelo Tutor.js:', formattedTutorData)
      
      const response = await tutoresAPI.create(formattedTutorData)
      
      if (response.success) {
        console.log('✅ Tutor creado exitosamente:', response.data)
        toast.success('Tutor creado exitosamente')
        await loadInitialData() // Recargar lista de tutores
        return response.data.tutor
      } else {
        throw new Error(response.message || 'Error creando tutor')
      }
    } catch (error) {
      console.error('❌ Error completo creando tutor:', error)
      console.error('❌ Respuesta completa del servidor:', error.response?.data)
      console.error('❌ Detalles del error del servidor:', error.response?.data)
      
      if (error.response?.data?.errors) {
        console.error('🔍 ERRORES ESPECÍFICOS:', error.response.data.errors)
        error.response.data.errors.forEach((err, index) => {
          console.error(`🔍 Error ${index + 1}:`, err)
          console.error(`🔍 Mensaje del error:`, err.message)
          console.error(`🔍 Campo con error:`, err.field)
          console.error(`🔍 Valor enviado:`, err.value)
        })
        
        const errorMessages = error.response.data.errors
          .map(err => `Campo: ${err.field} - ${err.message}`)
          .join('\n')
        throw new Error(`Errores específicos: ${errorMessages}`)
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Error desconocido creando tutor')
    }
  }

  // Manejar cambio de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Limpiar foto
  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  // Manejar cierre del modal
  const handleClose = () => {
    if (!isLoading) {
      reset()
      setPhotoFile(null)
      setPhotoPreview(null)
      setShowTutorForm(false)
      setIsMinor(false)
      setTutorMode('existing')
      setSelectedBirthDate(null)
      setSelectedBeltDate(null)
      onClose()
    }
  }

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      // Validaciones específicas
      if (isMinor && tutorMode === 'existing' && !data.tutor) {
        toast.error('Los alumnos menores de 18 años deben tener un tutor asignado o crear uno nuevo')
        return
      }

      if (isMinor && tutorMode === 'new') {
        // Validar datos del nuevo tutor
        if (!data.newTutor.firstName || !data.newTutor.lastName || !data.newTutor.email || !data.newTutor.phones.primary) {
          toast.error('Complete los datos obligatorios del tutor: nombre, apellidos, email y teléfono')
          return
        }
      }
      
      let tutorId = null
      
      // Crear tutor si es necesario
      if (isMinor && tutorMode === 'new') {
        try {
          const newTutor = await createNewTutor(data.newTutor)
          tutorId = newTutor._id
        } catch (error) {
          toast.error('Error creando el tutor. Revise la consola para más detalles.')
          return
        }
      } else if (isMinor && tutorMode === 'existing') {
        tutorId = data.tutor
      }
      
      // Preparar datos del alumno
      const formData = { ...data }
      formData.tutor = tutorId || null

      // Limpiar campos de tutor si no es menor de edad
      if (!isMinor) {
        delete formData.tutor
        delete formData.relationshipToTutor
      }
      
      formData.createdBy = user._id || user.id

      if (formData.enrollment?.monthlyFee) {
        formData.enrollment.monthlyFee = Number(formData.enrollment.monthlyFee)
      }
      if (formData.enrollment?.registrationFee) {
        formData.enrollment.registrationFee = Number(formData.enrollment.registrationFee)
      }
      // v1.5: convertir estatura a float
      if (formData.height) {
        formData.height = parseFloat(formData.height)
      }
      
      // Remover datos del nuevo tutor del payload
      delete formData.newTutor
      
      console.log('🎯 Datos del alumno a enviar:', formData)
      console.log('🎯 Estructura completa:', JSON.stringify(formData, null, 2))
      
      let response
      if (mode === 'edit') {
        response = await alumnosAPI.update(alumno._id, formData)
      } else {
        response = await alumnosAPI.create(formData)
      }
      
      if (response.success) {
        const createdAlumno = response.data.alumno
        
        // Subir foto si hay una
        if (photoFile && createdAlumno?._id) {
          try {
            console.log('📸 Iniciando subida de foto...')
            console.log('📸 Archivo seleccionado:', photoFile)
            console.log('📸 ID del alumno creado:', createdAlumno._id)
            
            const photoResponse = await alumnosAPI.uploadPhoto(createdAlumno._id, photoFile)
            console.log('📸 Respuesta de subida:', photoResponse)
            
          } catch (photoError) {
            console.error('❌ Error subiendo foto:', photoError)
            console.error('❌ Detalles del error de foto:', photoError.response?.data)
          }
        }
        
        toast.success(mode === 'edit' ? 'Alumno actualizado exitosamente' : 'Alumno creado exitosamente')
        onSuccess()
        handleClose()
      }
    } catch (error) {
      console.error('❌ Error guardando alumno:', error)
      console.error('❌ Respuesta completa del servidor:', error.response?.data)
      console.error('❌ Detalles específicos:', error.response?.data?.errors)
      console.error('❌ Mensaje del servidor:', error.response?.data?.message)
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join('\n')
        toast.error(`Errores específicos: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.message || 'Error al guardar el alumno')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // v1.5: detectar si la disciplina es Pequeños Dragones
  const isPequenoDragon = watchPrograma === 'pequenos-dragones'

  return (
    <>
      {/* ESTILOS CSS PERSONALIZADOS PARA CALENDARIOS MODERNOS */}
      <style jsx>{`
        .custom-datepicker .react-datepicker {
          font-family: 'Inter', system-ui, sans-serif;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          overflow: hidden;
        }
        
        .custom-datepicker .react-datepicker__header {
          background: linear-gradient(35deg, #667eea 0%, #764ba2 100%);
          color: #58367f;
          border: none;
          padding: 16px;
          border-radius: 0;
        }
        
        .custom-datepicker .react-datepicker__current-month {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 8px;
        }
        
        .custom-datepicker .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          margin: 0;
          padding: 8px 0;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .custom-datepicker .react-datepicker__day-name {
          color: white;
          font-weight: 500;
          font-size: 12px;
          text-transform: uppercase;
          width: 32px;
          line-height: 32px;
        }
        
        .custom-datepicker .react-datepicker__month-container {
          background: white;
        }
        
        .custom-datepicker .react-datepicker__week {
          display: flex;
          justify-content: space-around;
        }
        
        .custom-datepicker .react-datepicker__day {
          width: 32px;
          height: 32px;
          line-height: 32px;
          margin: 2px;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
          font-weight: 500;
        }
        
        .custom-datepicker .react-datepicker__day:hover {
          background: #f3f4f6;
          transform: scale(1.1);
        }
        
        .custom-datepicker .react-datepicker__day--selected {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
        }
        
        .custom-datepicker .react-datepicker__day--today {
          background: #fef3c7;
          color: #92400e;
          font-weight: 600;
        }
        
        .custom-datepicker .react-datepicker__day--outside-month {
          color: #d1d5db;
        }
        
        .custom-datepicker .react-datepicker__navigation {
          top: 20px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        
        .custom-datepicker .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .custom-datepicker .react-datepicker__navigation-icon::before {
          border-color: white;
          border-width: 2px 2px 0 0;
          width: 6px;
          height: 6px;
          top: 8px;
        }
        
        .custom-datepicker .react-datepicker__year-dropdown,
        .custom-datepicker .react-datepicker__month-dropdown {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        
        .custom-datepicker .react-datepicker__year-option,
        .custom-datepicker .react-datepicker__month-option {
          padding: 8px 12px;
          transition: all 0.2s ease;
        }
        
        .custom-datepicker .react-datepicker__year-option:hover,
        .custom-datepicker .react-datepicker__month-option:hover {
          background: #f3f4f6;
        }
        
        .calendar-input {
          position: relative;
        }
        
        .calendar-input .calendar-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          pointer-events: none;
          z-index: 10;
        }
        
        .calendar-input input {
          padding-right: 40px !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? `Editar Alumno: ${alumno?.fullName}` : 'Nuevo Alumno'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[calc(90vh-140px)]">
              
              {/* ✅ DISCIPLINA / PROGRAMA - v1.5 - VA PRIMERO */}
              <div className="bg-gradient-to-r from-primary-50 to-indigo-50 rounded-lg p-5 border-2 border-primary-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary-600" />
                  Disciplina / Programa
                  <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {PROGRAMA_OPTIONS.map(prog => {
                    const isSelected = watchPrograma === prog.value
                    return (
                      <label
                        key={prog.value}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all select-none
                          ${isSelected
                            ? 'border-primary-500 bg-primary-50 shadow-md ring-2 ring-primary-300'
                            : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
                          }`}
                      >
                        <input
                          type="radio"
                          value={prog.value}
                          className="sr-only"
                          {...register('enrollment.programa', {
                            required: 'Selecciona una disciplina'
                          })}
                        />
                        <span className="text-2xl">{prog.emoji}</span>
                        <span className={`text-xs font-semibold text-center leading-tight
                          ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>
                          {prog.label}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
                {errors.enrollment?.programa && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.enrollment.programa.message}
                  </p>
                )}
                {isPequenoDragon && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <span className="text-lg">🐉</span>
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Pequeños Dragones</span> — Programa para niños de 3 a 5 años.
                      Se habilitará el campo de <span className="font-semibold">Grado Escolar</span> abajo.
                    </p>
                  </div>
                )}
              </div>

              {/* ✅ INFORMACIÓN PERSONAL - SIEMPRE VISIBLE */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('firstName', {
                        required: 'El nombre es requerido',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('lastName', {
                        required: 'Los apellidos son requeridos',
                        minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                      })}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* ✅ CALENDARIO MEJORADO PARA FECHA DE NACIMIENTO */}
                  <div className="calendar-input">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento *
                    </label>
                    <div className="custom-datepicker">
                      <DatePicker
                        selected={selectedBirthDate}
                        onChange={(date) => {
                          setSelectedBirthDate(date)
                          if (date) {
                            setValue('dateOfBirth', date.toISOString().split('T')[0])
                          }
                        }}
                        className="input-field w-full pr-10"
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        maxDate={new Date()}
                        placeholderText="Seleccionar fecha de nacimiento..."
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        showMonthDropdown
                        dropdownMode="select"
                        todayButton="Hoy"
                        isClearable
                        clearButtonTitle="Limpiar fecha"
                        showPopperArrow={false}
                        popperModifiers={[
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 10],
                            },
                          },
                        ]}
                      />
                    </div>
                    <CalendarDays className="calendar-icon w-5 h-5" />
                    
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
                    )}
                    {selectedBirthDate && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">
                          📅 {selectedBirthDate.toLocaleDateString('es-MX', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-blue-600">
                          🎂 Edad: {utils.calculateAge(selectedBirthDate)} años
                        </p>
                      </div>
                    )}
                    
                    {/* Campo hidden para react-hook-form */}
                    <input
                      type="hidden"
                      {...register('dateOfBirth', {
                        required: 'La fecha de nacimiento es requerida'
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género *
                    </label>
                    <select
                      className="input-field"
                      {...register('gender', { required: 'El género es requerido' })}
                    >
                      <option value="">Seleccionar género...</option>
                      {GENDER_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      {...register('email', {
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email inválido'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      {...register('phone')}
                    />
                  </div>

                  {/* ── v1.5: Lugar de Nacimiento ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lugar de Nacimiento
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej: San Cristóbal de las Casas, Chis."
                      {...register('birthPlace', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                    />
                    {errors.birthPlace && (
                      <p className="text-red-500 text-sm mt-1">{errors.birthPlace.message}</p>
                    )}
                  </div>

                  {/* ── v1.5: Estatura ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estatura (metros)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="Ej: 1.75"
                      step="0.01"
                      min="0.30"
                      max="2.50"
                      {...register('height', {
                        min: { value: 0.30, message: 'Mínimo 0.30 m' },
                        max: { value: 2.50, message: 'Máximo 2.50 m' }
                      })}
                    />
                    {errors.height && (
                      <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                    )}
                  </div>

                  {/* ── v1.5: Estado Civil (solo adultos) ── */}
                  {!isMinor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil
                      </label>
                      <select className="input-field" {...register('maritalStatus')}>
                        <option value="">Seleccionar...</option>
                        {MARITAL_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ── v1.5: Ocupación (solo adultos) ── */}
                  {!isMinor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ocupación
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Ej: Empleado, Estudiante, Comerciante..."
                        {...register('occupation', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                      />
                      {errors.occupation && (
                        <p className="text-red-500 text-sm mt-1">{errors.occupation.message}</p>
                      )}
                    </div>
                  )}

                  {/* ── v1.5: Grado Escolar (menores + Pequeños Dragones) ── */}
                  {(isMinor || isPequenoDragon) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grado Escolar
                        {isPequenoDragon && <span className="ml-1 text-xs text-amber-600">(Jardín de niños)</span>}
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder={isPequenoDragon ? 'Ej: Maternal, Kínder 1, Kínder 2...' : 'Ej: 3° Primaria, 1° Secundaria...'}
                        {...register('gradeLevel', { maxLength: { value: 50, message: 'Máximo 50 caracteres' } })}
                      />
                      {errors.gradeLevel && (
                        <p className="text-red-500 text-sm mt-1">{errors.gradeLevel.message}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ FOTO DE PERFIL - SIEMPRE VISIBLE */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gray-600" />
                  Foto de Perfil
                </h3>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="btn-secondary inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {photoPreview ? 'Cambiar foto' : 'Subir foto'}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos: JPG, PNG. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ DIRECCIÓN - SIEMPRE VISIBLE */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Dirección
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calle y número
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('address.street')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colonia
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('address.neighborhood')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('address.city')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('address.state')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('address.zipCode')}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ TUTOR/PADRE - SIEMPRE VISIBLE */}
              {isMinor && (
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Tutor/Padre <span className="text-red-500">*</span>
                  </h3>

                  {/* Selector de modo de tutor */}
                  <div className="mb-4 flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="existing"
                        checked={tutorMode === 'existing'}
                        onChange={(e) => setTutorMode(e.target.value)}
                        className="mr-2"
                      />
                      Seleccionar tutor existente
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="new"
                        checked={tutorMode === 'new'}
                        onChange={(e) => setTutorMode(e.target.value)}
                        className="mr-2"
                      />
                      Crear nuevo tutor
                    </label>
                  </div>

                  {tutorMode === 'existing' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tutor *
                        </label>
                        <select
                          className="input-field"
                          {...register('tutor', {
                            required: isMinor ? 'Debe seleccionar o crear un tutor' : false
                          })}
                        >
                          <option value="">Seleccionar tutor...</option>
                          {tutores.map(tutor => (
                            <option key={tutor._id} value={tutor._id}>
                              {tutor.firstName} {tutor.lastName} - {tutor.phones?.primary}
                            </option>
                          ))}
                        </select>
                        {errors.tutor && (
                          <p className="text-red-500 text-sm mt-1">{errors.tutor.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Relación con el tutor *
                        </label>
                        <select
                          className="input-field"
                          {...register('relationshipToTutor', {
                            required: isMinor ? 'La relación es requerida' : false
                          })}
                        >
                          <option value="">Seleccionar relación...</option>
                          <option value="hijo">Hijo</option>
                          <option value="hija">Hija</option>
                          <option value="pupilo">Pupilo/a</option>
                          <option value="padre">Padre</option>
                          <option value="madre">Madre</option>
                          <option value="tutor">Tutor legal</option>
                          <option value="abuelo">Abuelo/a</option>
                          <option value="hermano">Hermano/a</option>
                          <option value="otro">Otro</option>
                        </select>
                        {errors.relationshipToTutor && (
                          <p className="text-red-500 text-sm mt-1">{errors.relationshipToTutor.message}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Datos del nuevo tutor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            {...register('newTutor.firstName')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellidos *
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            {...register('newTutor.lastName')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            className="input-field"
                            {...register('newTutor.email')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono principal *
                          </label>
                          <input
                            type="tel"
                            className="input-field"
                            {...register('newTutor.phones.primary')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de identificación
                          </label>
                          <select
                            className="input-field"
                            {...register('newTutor.identification.type')}
                          >
                            {ID_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de identificación
                          </label>
                          <input
                            type="text"
                            className="input-field"
                            {...register('newTutor.identification.number')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relación con el alumno *
                          </label>
                          <select
                            className="input-field"
                            {...register('relationshipToTutor')}
                          >
                            <option value="">Seleccionar relación...</option>
                            <option value="hijo">Hijo</option>
                            <option value="hija">Hija</option>
                            <option value="pupilo">Pupilo/a</option>
                            <option value="padre">Padre</option>
                            <option value="madre">Madre</option>
                            <option value="tutor">Tutor legal</option>
                            <option value="abuelo">Abuelo/a</option>
                            <option value="hermano">Hermano/a</option>
                            <option value="otro">Otro</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ CONTACTO DE EMERGENCIA - SIEMPRE VISIBLE */}
              <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Contacto de Emergencia <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('emergencyContact.name', {
                        required: 'El nombre del contacto de emergencia es requerido'
                      })}
                    />
                    {errors.emergencyContact?.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relación *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej: Padre, Madre, Tío, etc."
                      {...register('emergencyContact.relationship', {
                        required: 'La relación es requerida'
                      })}
                    />
                    {errors.emergencyContact?.relationship && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      {...register('emergencyContact.phone', {
                        required: 'El teléfono es requerido'
                      })}
                    />
                    {errors.emergencyContact?.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      {...register('emergencyContact.email')}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ INFORMACIÓN MÉDICA - SIEMPRE VISIBLE */}
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Información Médica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de sangre
                    </label>
                    <select className="input-field" {...register('medicalInfo.bloodType')}>
                      <option value="">Seleccionar...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alergias
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej: Ninguna conocida"
                      {...register('medicalInfo.allergies')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicamentos actuales
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('medicalInfo.medications')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condiciones médicas
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('medicalInfo.medicalConditions')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del médico
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('medicalInfo.doctorName')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono del médico
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      {...register('medicalInfo.doctorPhone')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Información del seguro
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      {...register('medicalInfo.insuranceInfo')}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ INFORMACIÓN DE MATRÍCULA - SIEMPRE VISIBLE */}
              <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                  Información de Matrícula <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sucursal *
                    </label>
                    <select
                      className="input-field"
                      {...register('enrollment.sucursal', {
                        required: 'La sucursal es requerida'
                      })}
                    >
                      <option value="">Seleccionar sucursal...</option>
                      {sucursales.map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                          {sucursal.name}
                        </option>
                      ))}
                    </select>
                    {errors.enrollment?.sucursal && (
                      <p className="text-red-500 text-sm mt-1">{errors.enrollment.sucursal.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select className="input-field" {...register('enrollment.status')}>
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuota mensual (MXN)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      step="0.01"
                      {...register('enrollment.monthlyFee')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuota de inscripción (MXN)
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      min="0"
                      step="0.01"
                      {...register('enrollment.registrationFee')}
                    />
                  </div>

                  {/* ── v1.5: Motivo de inscripción ── */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de inscripción
                    </label>
                    <textarea
                      className="input-field min-h-[80px] resize-none"
                      placeholder="¿Por qué desea inscribirse? Ej: Mejorar disciplina, autodefensa, actividad física..."
                      {...register('enrollment.enrollmentReason', { maxLength: { value: 500, message: 'Máximo 500 caracteres' } })}
                    />
                    {errors.enrollment?.enrollmentReason && (
                      <p className="text-red-500 text-sm mt-1">{errors.enrollment.enrollmentReason.message}</p>
                    )}
                  </div>

                  {/* ── v1.5: Recomendado por ── */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recomendado por
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Nombre de quien recomendó la escuela"
                      {...register('enrollment.recommendedBy', { maxLength: { value: 100, message: 'Máximo 100 caracteres' } })}
                    />
                    {errors.enrollment?.recommendedBy && (
                      <p className="text-red-500 text-sm mt-1">{errors.enrollment.recommendedBy.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ INFORMACIÓN DE CINTURÓN - SIEMPRE VISIBLE CON CALENDARIO MEJORADO */}
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Información de Cinturón
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel actual
                    </label>
                    <select className="input-field" {...register('belt.level')}>
                      <option value="blanco">Blanco</option>
                      <option value="blanco-amarillo">Blanco-Amarillo</option>
                      <option value="amarillo">Amarillo</option>
                      <option value="amarillo-naranja">Amarillo-Naranja</option>
                      <option value="naranja">Naranja</option>
                      <option value="naranja-verde">Naranja-Verde</option>
                      <option value="verde">Verde</option>
                      <option value="verde-azul">Verde-Azul</option>
                      <option value="azul">Azul</option>
                      <option value="azul-marron">Azul-Marrón</option>
                      <option value="marron">Marrón</option>
                      <option value="marron-negro">Marrón-Negro</option>
                      <option value="negro-1">Negro 1° Dan</option>
                      <option value="negro-2">Negro 2° Dan</option>
                      <option value="negro-3">Negro 3° Dan</option>
                    </select>
                  </div>

                  {/* CALENDARIO MEJORADO PARA FECHA DE OBTENCIÓN DEL CINTURÓN */}
                  <div className="calendar-input">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de obtención
                    </label>
                    <div className="custom-datepicker">
                      <DatePicker
                        selected={selectedBeltDate}
                        onChange={(date) => {
                          setSelectedBeltDate(date)
                          if (date) {
                            setValue('belt.dateObtained', date.toISOString().split('T')[0])
                          }
                        }}
                        className="input-field w-full pr-10"
                        dateFormat="dd/MM/yyyy"
                        locale="es"
                        maxDate={new Date()}
                        placeholderText="Seleccionar fecha de obtención..."
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={20}
                        showMonthDropdown
                        dropdownMode="select"
                        todayButton="Hoy"
                        isClearable
                        clearButtonTitle="Limpiar fecha"
                        showPopperArrow={false}
                        popperModifiers={[
                          {
                            name: 'offset',
                            options: {
                              offset: [0, 10],
                            },
                          },
                        ]}
                      />
                    </div>
                    <CalendarDays className="calendar-icon w-5 h-5" />
                    
                    {selectedBeltDate && (
                      <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm text-indigo-700 font-medium">
                          🥋 {selectedBeltDate.toLocaleDateString('es-MX', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    
                    {/* Campo hidden para react-hook-form */}
                    <input
                      type="hidden"
                      {...register('belt.dateObtained')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificado por
                    </label>
                    <select className="input-field" {...register('belt.certifiedBy')}>
                      <option value="">Seleccionar instructor...</option>
                      {instructores.map(instructor => (
                        <option key={instructor._id} value={instructor._id}>
                          {instructor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* PREFERENCIAS - SIEMPRE VISIBLE */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Preferencias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de contacto preferido
                    </label>
                    <select className="input-field" {...register('preferences.preferredContactMethod')}>
                      <option value="email">Email</option>
                      <option value="phone">Teléfono</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register('preferences.receiveNotifications')}
                      />
                      Recibir notificaciones
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        {...register('preferences.receivePromotions')}
                      />
                      Recibir promociones
                    </label>
                  </div>
                </div>
              </div>

              {/* NOTAS - SIEMPRE VISIBLE */}
              <div className="bg-orange-50 rounded-lg p-5 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Notas y Observaciones
                </h3>
                <textarea
                  className="input-field min-h-[100px]"
                  placeholder="Notas adicionales sobre el alumno..."
                  {...register('notes')}
                />
              </div>

            </div>

            {/* Footer con botones */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="btn-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {mode === 'edit' ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'edit' ? 'Actualizar Alumno' : 'Guardar Alumno'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default AlumnoForm