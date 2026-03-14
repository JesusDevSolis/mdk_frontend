import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { registerLocale } from 'react-datepicker'
import es from 'date-fns/locale/es'
import "react-datepicker/dist/react-datepicker.css"
import { 
  X, 
  Save, 
  Loader,
  DollarSign,
  Calendar,
  User,
  Building2,
  FileText,
  Tag,
  Percent,
  CreditCard,
  Banknote
} from 'lucide-react'
import { pagosAPI, alumnosAPI, tutoresAPI, sucursalesAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// Registrar locale español para el DatePicker
registerLocale('es', es)

const PagoForm = ({ isOpen, onClose, onSuccess, pago = null, mode = 'create', onCobrar }) => {
  // Estados principales
  const [loading, setLoading] = useState(false)
  const [alumnos, setAlumnos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const [dueDate, setDueDate] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // React Hook Form
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      alumno: '',
      tutor: '',
      sucursal: '',
      type: 'colegiatura',
      description: '',
      amount: '',
      discount: 0,
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      notes: ''
    }
  })

  // Watch para cálculos
  const watchAmount = watch('amount')
  const watchDiscount = watch('discount')
  const watchType = watch('type')

  // Calcular total
  const total = (parseFloat(watchAmount) || 0) - (parseFloat(watchDiscount) || 0)

  // ===== EFECTOS =====

  useEffect(() => {
    if (isOpen) {
      loadData()
    } else {
      // Resetear cuando se cierra
      setDataLoaded(false)
    }
  }, [isOpen])

  // Efecto separado para cargar los datos del pago después de cargar alumnos y sucursales
  useEffect(() => {
    if (isOpen && dataLoaded && mode === 'edit' && pago) {
      console.log('📝 Cargando datos del pago para editar:', pago)
      populateForm()
    }
  }, [isOpen, dataLoaded, mode, pago])

  // ===== FUNCIONES DE CARGA =====

  const loadData = async () => {
    try {
      // Cargar alumnos y sucursales en paralelo
      await Promise.all([
        loadAlumnos(),
        loadSucursales()
      ])
      
      // Marcar que los datos ya están cargados
      setDataLoaded(true)
      
      // Si es modo crear, resetear el formulario
      if (mode === 'create') {
        resetForm()
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos necesarios')
    }
  }

  const loadAlumnos = async () => {
    try {
      const response = await alumnosAPI.getAll({ limit: 1000 })
      console.log('📥 Respuesta completa de alumnos:', response)
      
      // Manejar diferentes estructuras de respuesta del backend
      let alumnosData = []
      
      if (Array.isArray(response)) {
        alumnosData = response
        console.log('✅ Caso 1: Array directo')
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          alumnosData = response.data
          console.log('✅ Caso 2a: response.data es array')
        } else if (response.data.data && Array.isArray(response.data.data)) {
          alumnosData = response.data.data
          console.log('✅ Caso 2b: response.data.data es array (paginación)')
        } else if (response.data.alumnos && Array.isArray(response.data.alumnos)) {
          alumnosData = response.data.alumnos
          console.log('✅ Caso 2c: response.data.alumnos es array')
        }
      }
      
      console.log(`✅ Total de alumnos cargados: ${alumnosData.length}`)
      setAlumnos(alumnosData)
      
      if (alumnosData.length === 0) {
        toast.error('No se encontraron alumnos en el sistema')
      }
    } catch (error) {
      console.error('❌ Error al cargar alumnos:', error)
      toast.error('Error al cargar la lista de alumnos')
      setAlumnos([])
    }
  }

  const loadSucursales = async () => {
    try {
      const response = await sucursalesAPI.getAll()
      console.log('📥 Respuesta completa de sucursales:', response)
      
      // Manejar diferentes estructuras de respuesta del backend
      let sucursalesData = []
      
      if (Array.isArray(response)) {
        sucursalesData = response
        console.log('✅ Caso 1: Array directo')
      } else if (response.data) {
        if (Array.isArray(response.data)) {
          sucursalesData = response.data
          console.log('✅ Caso 2a: response.data es array')
        } else if (response.data.data && Array.isArray(response.data.data)) {
          sucursalesData = response.data.data
          console.log('✅ Caso 2b: response.data.data es array (paginación)')
        } else if (response.data.sucursales && Array.isArray(response.data.sucursales)) {
          sucursalesData = response.data.sucursales
          console.log('✅ Caso 2c: response.data.sucursales es array')
        }
      }
      
      console.log(`✅ Total de sucursales cargadas: ${sucursalesData.length}`)
      setSucursales(sucursalesData)
      
      if (sucursalesData.length === 0) {
        toast.error('No se encontraron sucursales en el sistema')
      }
    } catch (error) {
      console.error('❌ Error al cargar sucursales:', error)
      toast.error('Error al cargar la lista de sucursales')
      setSucursales([])
    }
  }

  const populateForm = () => {
    if (!pago) {
      console.log('❌ No hay pago para cargar')
      return
    }

    console.log('🔍 Pago recibido:', pago)
    console.log('🔍 Alumno del pago:', pago.alumno)
    console.log('🔍 Sucursal del pago:', pago.sucursal)
    console.log('🔍 Tutor del pago:', pago.tutor)

    // Extraer IDs de forma segura
    const alumnoId = pago.alumno?._id || pago.alumno || ''
    const sucursalId = pago.sucursal?._id || pago.sucursal || ''
    const tutorId = pago.tutor?._id || pago.tutor || ''

    console.log('📌 IDs extraídos:')
    console.log('  - Alumno ID:', alumnoId)
    console.log('  - Sucursal ID:', sucursalId)
    console.log('  - Tutor ID:', tutorId)

    // Verificar que existen en las listas cargadas
    const alumnoExists = alumnos.find(a => a._id === alumnoId)
    const sucursalExists = sucursales.find(s => s._id === sucursalId)

    console.log('✅ Verificación:')
    console.log('  - Alumno existe en lista:', !!alumnoExists)
    console.log('  - Sucursal existe en lista:', !!sucursalExists)

    // Establecer valores del formulario
    if (alumnoId) {
      setValue('alumno', alumnoId)
      console.log('✅ Alumno establecido:', alumnoId)
      
      // Si el alumno existe en la lista, establecer selectedAlumno
      if (alumnoExists) {
        setSelectedAlumno(alumnoExists)
      }
    }

    if (sucursalId) {
      setValue('sucursal', sucursalId)
      console.log('✅ Sucursal establecida:', sucursalId)
    }

    if (tutorId) {
      setValue('tutor', tutorId)
      console.log('✅ Tutor establecido:', tutorId)
    }

    setValue('type', pago.type || 'colegiatura')
    setValue('description', pago.description || '')
    setValue('amount', pago.amount || '')
    setValue('discount', pago.discount || 0)
    setValue('notes', pago.notes || '')

    if (pago.period) {
      setValue('periodMonth', pago.period.month)
      setValue('periodYear', pago.period.year)
    }

    if (pago.dueDate) {
      setDueDate(new Date(pago.dueDate))
    }

    console.log('✅ Formulario poblado completamente')
  }

  const resetForm = () => {
    reset()
    setDueDate(null)
    setSelectedAlumno(null)
  }

  // ===== HANDLERS =====

  // Calcular la próxima fecha de cobro según el paymentDay del alumno
  const calcularProximaDueDate = (paymentDay) => {
    if (!paymentDay) return null
    const hoy    = new Date()
    const año    = hoy.getFullYear()
    const mes    = hoy.getMonth()       // 0-based

    // Intentar en el mes actual
    let fecha = new Date(año, mes, paymentDay)

    // Si ya pasó (o es hoy), mover al mes siguiente
    if (fecha <= hoy) {
      fecha = new Date(año, mes + 1, paymentDay)
    }

    return fecha
  }

  const handleAlumnoChange = async (e) => {
    const alumnoId = e.target.value
    console.log('👤 Alumno seleccionado:', alumnoId)
    setValue('alumno', alumnoId)

    if (!alumnoId) {
      setSelectedAlumno(null)
      setValue('tutor', '')
      setValue('sucursal', '')
      return
    }

    // Buscar alumno seleccionado
    const alumno = alumnos.find(a => a._id === alumnoId)
    if (alumno) {
      setSelectedAlumno(alumno)
      console.log('✅ Alumno encontrado:', alumno)
      
      // Auto-llenar tutor y sucursal
      if (alumno.tutor) {
        const tutorId = alumno.tutor._id || alumno.tutor
        setValue('tutor', tutorId)
        console.log('✅ Tutor auto-llenado:', tutorId)
      }
      if (alumno.enrollment?.sucursal) {
        const sucursalId = alumno.enrollment.sucursal._id || alumno.enrollment.sucursal
        setValue('sucursal', sucursalId)
        console.log('✅ Sucursal auto-llenada:', sucursalId)
      }

      // ── Paso A: auto-sugerir dueDate según paymentDay del alumno ──
      const paymentDay = alumno.enrollment?.paymentDay
      if (paymentDay) {
        const sugerida = calcularProximaDueDate(paymentDay)
        if (sugerida) {
          setDueDate(sugerida)
          console.log(`✅ Fecha de pago sugerida (día ${paymentDay}):`, sugerida.toLocaleDateString('es-MX'))
        }
      }

      // ── Auto-llenar monto si es colegiatura ──
      if (watchType === 'colegiatura' && alumno.enrollment?.monthlyFee) {
        setValue('amount', alumno.enrollment.monthlyFee)
      }
    }
  }

  const handleTypeChange = (e) => {
    const type = e.target.value
    setValue('type', type)

    // Auto-llenar descripción según el tipo
    const descriptions = {
      colegiatura: 'Pago de colegiatura mensual',
      inscripcion: 'Pago de inscripción',
      uniforme: 'Compra de uniforme',
      examen: 'Pago de examen de graduación',
      equipo: 'Compra de equipo',
      otro: ''
    }
    setValue('description', descriptions[type] || '')
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      if (!dueDate) {
        toast.error('Debe seleccionar una fecha de vencimiento')
        return
      }

      // Validar que el alumno existe
      if (!data.alumno) {
        toast.error('Debe seleccionar un alumno')
        return
      }

      // Validar que la sucursal existe
      if (!data.sucursal) {
        toast.error('Debe seleccionar una sucursal')
        return
      }

      // Preparar datos
      const paymentData = {
        alumno: data.alumno,
        tutor: data.tutor || undefined,
        sucursal: data.sucursal,
        type: data.type,
        description: data.description,
        amount: parseFloat(data.amount),
        discount: parseFloat(data.discount) || 0,
        dueDate: dueDate.toISOString(),
        notes: data.notes
      }

      // Agregar periodo si es colegiatura
      if (data.type === 'colegiatura') {
        paymentData.period = {
          month: parseInt(data.periodMonth),
          year: parseInt(data.periodYear)
        }
      }

      console.log('📤 Datos a enviar:', paymentData)

      // Crear o actualizar
      if (mode === 'create') {
        await pagosAPI.create(paymentData)
        toast.success('Pago registrado exitosamente')
      } else {
        await pagosAPI.update(pago._id, paymentData)
        toast.success('Pago actualizado exitosamente')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error al guardar pago:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el pago')
    } finally {
      setLoading(false)
    }
  }

  // ===== RENDER =====

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'create' ? 'Registrar Nuevo Pago' : 'Editar Pago'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'create' 
                ? 'Completa los datos del pago' 
                : 'Modifica los datos del pago'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Sección: Información del Alumno */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Información del Alumno
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Alumno */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alumno *
                </label>
                <select
                  {...register('alumno', { required: 'El alumno es requerido' })}
                  onChange={handleAlumnoChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.alumno ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading || !dataLoaded}
                >
                  <option value="">Seleccionar alumno...</option>
                  {Array.isArray(alumnos) && alumnos.length > 0 ? (
                    alumnos.map(alumno => (
                      <option key={alumno._id} value={alumno._id}>
                        {alumno.firstName} {alumno.lastName} - {alumno.enrollment?.studentId || 'Sin ID'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No hay alumnos disponibles</option>
                  )}
                </select>
                {errors.alumno && (
                  <p className="text-red-500 text-xs mt-1">{errors.alumno.message}</p>
                )}
                {!dataLoaded && (
                  <p className="text-yellow-600 text-xs mt-1">⏳ Cargando alumnos...</p>
                )}
              </div>

              {/* Info del alumno seleccionado */}
              {selectedAlumno && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Edad</p>
                      <p className="font-medium text-gray-900">{selectedAlumno.age} años</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cinturón</p>
                      <p className="font-medium text-gray-900">{selectedAlumno.belt?.level || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Sucursal</p>
                      <p className="font-medium text-gray-900">
                        {selectedAlumno.enrollment?.sucursal?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Estado</p>
                      <p className="font-medium text-gray-900">{selectedAlumno.enrollment?.status}</p>
                    </div>
                    {selectedAlumno.enrollment?.monthlyFee > 0 && (
                      <div>
                        <p className="text-gray-600">Cuota mensual</p>
                        <p className="font-medium text-green-700">
                          ${selectedAlumno.enrollment.monthlyFee.toLocaleString('es-MX')} MXN
                        </p>
                      </div>
                    )}
                    {selectedAlumno.enrollment?.paymentDay && (
                      <div>
                        <p className="text-gray-600">Día de pago</p>
                        <p className="font-medium text-blue-700">
                          Día {selectedAlumno.enrollment.paymentDay} de cada mes
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedAlumno.enrollment?.paymentDay && dueDate && (
                    <div className="mt-3 pt-3 border-t border-blue-200 flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-blue-700">
                        Próxima fecha de cobro sugerida:
                        <strong className="ml-1">
                          {dueDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sucursal *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('sucursal', { required: 'La sucursal es requerida' })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.sucursal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading || !dataLoaded}
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {Array.isArray(sucursales) && sucursales.length > 0 ? (
                      sucursales.map(sucursal => (
                        <option key={sucursal._id} value={sucursal._id}>
                          {sucursal.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No hay sucursales disponibles</option>
                    )}
                  </select>
                </div>
                {errors.sucursal && (
                  <p className="text-red-500 text-xs mt-1">{errors.sucursal.message}</p>
                )}
                {!dataLoaded && (
                  <p className="text-yellow-600 text-xs mt-1">⏳ Cargando sucursales...</p>
                )}
              </div>

              {/* Tutor (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutor (Opcional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    {...register('tutor')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    placeholder="Se asigna automáticamente"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Detalles del Pago */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Detalles del Pago
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    {...register('type', { required: 'El tipo de pago es requerido' })}
                    onChange={handleTypeChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value="colegiatura">Colegiatura</option>
                    <option value="inscripcion">Inscripción</option>
                    <option value="uniforme">Uniforme</option>
                    <option value="examen">Examen</option>
                    <option value="equipo">Equipo</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    {...register('description')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del pago"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('amount', { 
                      required: 'El monto es requerido',
                      min: { value: 0, message: 'El monto debe ser positivo' }
                    })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
                )}
              </div>

              {/* Descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('discount', {
                      min: { value: 0, message: 'El descuento debe ser positivo' }
                    })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.discount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                {errors.discount && (
                  <p className="text-red-500 text-xs mt-1">{errors.discount.message}</p>
                )}
              </div>

              {/* Total (calculado) */}
              <div className="md:col-span-2">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${total.toFixed(2)} MXN
                    </span>
                  </div>
                  {watchDiscount > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Monto original: ${(parseFloat(watchAmount) || 0).toFixed(2)} - 
                      Descuento: ${(parseFloat(watchDiscount) || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Fecha de Vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                  <DatePicker
                    selected={dueDate}
                    onChange={(date) => setDueDate(date)}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholderText="Seleccionar fecha"
                    minDate={new Date()}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Periodo (solo para colegiaturas) */}
              {watchType === 'colegiatura' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mes del Periodo *
                    </label>
                    <select
                      {...register('periodMonth', { required: 'El mes es requerido para colegiaturas' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="1">Enero</option>
                      <option value="2">Febrero</option>
                      <option value="3">Marzo</option>
                      <option value="4">Abril</option>
                      <option value="5">Mayo</option>
                      <option value="6">Junio</option>
                      <option value="7">Julio</option>
                      <option value="8">Agosto</option>
                      <option value="9">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año del Periodo *
                    </label>
                    <input
                      type="number"
                      {...register('periodYear', { required: 'El año es requerido para colegiaturas' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="2020"
                      max="2100"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sección: Notas Adicionales */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Información adicional sobre el pago..."
              disabled={loading}
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
            {/* Botón Cobrar — solo en modo edición y si no está pagado/cancelado */}
            {mode === 'edit' && pago && !['pagado', 'cancelado'].includes(pago.status) && onCobrar && (
              <button
                type="button"
                onClick={() => { onCobrar(pago); onClose() }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Banknote className="w-5 h-5" />
                Cobrar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={loading || !dataLoaded}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {mode === 'create' ? 'Registrar Pago' : 'Actualizar Pago'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PagoForm