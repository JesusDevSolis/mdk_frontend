import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import { es } from 'date-fns/locale/es'
import "react-datepicker/dist/react-datepicker.css"
import { 
  ClipboardCheck,
  X,
  Save,
  Loader,
  Award,
  Building2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react'
import { examenesAPI, sucursalesAPI, instructoresAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

registerLocale('es', es)
setDefaultLocale('es')

const ExamenForm = ({ 
  examen = null, 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create'
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [sucursales, setSucursales] = useState([])
  const [instructores, setInstructores] = useState([])
  const [selectedFecha, setSelectedFecha] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control
  } = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipo: 'graduacion',
      fecha: '',
      hora: '',
      cinturonObjetivo: '',
      cinturonActualRequerido: '',
      sucursal: user?.role === 'instructor' ? user?.sucursal : '',
      instructores: [],
      categorias: [
        { nombre: 'Poomsae', descripcion: 'Formas', peso: 25 },
        { nombre: 'Kyorugi', descripcion: 'Combate', peso: 25 },
        { nombre: 'Kyukpa', descripcion: 'Rompimiento', peso: 25 },
        { nombre: 'Teoría', descripcion: 'Conocimiento teórico', peso: 25 }
      ],
      requisitos: {
        asistenciaMinima: 75,
        diasMinimosCinturon: 90,
        pagosAlCorriente: true,
        costoExamen: 0
      },
      notas: ''
    }
  })

  const { fields: categorias, append, remove } = useFieldArray({
    control,
    name: "categorias"
  })

  const watchTipo = watch('tipo')
  const watchCategorias = watch('categorias')

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  // Segundo useEffect para poblar después de cargar sucursales
  useEffect(() => {
    if (isOpen && examen && sucursales.length > 0) {
      populateForm()
    }
  }, [isOpen, examen, sucursales])

  const loadInitialData = async () => {
    try {
      const [sucursalesRes, instructoresRes] = await Promise.all([
        sucursalesAPI.getAll(),
        instructoresAPI.getAll()
      ])

      // Procesar sucursales (puede venir como objeto o array)
      let sucursalesData = []
      if (Array.isArray(sucursalesRes?.data)) {
        sucursalesData = sucursalesRes.data
      } else if (sucursalesRes?.data?.data && Array.isArray(sucursalesRes.data.data)) {
        sucursalesData = sucursalesRes.data.data
      } else if (sucursalesRes?.data && typeof sucursalesRes.data === 'object') {
        // Si data es un objeto con las sucursales, intentar obtenerlas
        const dataObj = sucursalesRes.data
        if (dataObj.sucursales && Array.isArray(dataObj.sucursales)) {
          sucursalesData = dataObj.sucursales
        } else if (Object.keys(dataObj).length > 0) {
          // Convertir el objeto a array si tiene propiedades
          sucursalesData = Object.values(dataObj).filter(item => 
            item && typeof item === 'object' && item._id
          )
        }
      }

      // Procesar instructores (ya viene como array)
      const instructoresData = Array.isArray(instructoresRes?.data) ? instructoresRes.data : []

      setSucursales(sucursalesData)
      setInstructores(instructoresData)

    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos del formulario')
      setSucursales([])
      setInstructores([])
    }
  }

  const populateForm = () => {
    if (!examen) return

    console.log('🔍 Poblando formulario con examen:', examen)
    console.log('🔍 Sucursal del examen:', examen.sucursal)
    console.log('🔍 ID de sucursal:', examen.sucursal?._id || examen.sucursal)
    console.log('🔍 Sucursales disponibles:', sucursales)

    setValue('nombre', examen.nombre || '')
    setValue('descripcion', examen.descripcion || '')
    setValue('tipo', examen.tipo || 'graduacion')
    setValue('hora', examen.hora || '')
    setValue('cinturonObjetivo', examen.cinturonObjetivo || '')
    setValue('cinturonActualRequerido', examen.cinturonActualRequerido || '')
    
    const sucursalId = examen.sucursal?._id || examen.sucursal || ''
    console.log('🔍 Seteando sucursal ID:', sucursalId)
    setValue('sucursal', sucursalId)
    
    setValue('instructores', examen.instructores?.map(i => i._id || i) || [])
    setValue('categorias', examen.categorias || [])
    setValue('requisitos', examen.requisitos || {})
    setValue('notas', examen.notas || '')

    if (examen.fecha) {
      setSelectedFecha(new Date(examen.fecha))
    }
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)

      // Validar suma de pesos
      const sumaPesos = data.categorias.reduce((sum, cat) => sum + parseFloat(cat.peso || 0), 0)
      if (Math.abs(sumaPesos - 100) > 0.01) {
        toast.error(`La suma de los pesos debe ser 100% (actual: ${sumaPesos}%)`)
        setIsLoading(false)
        return
      }

      // Preparar datos base
      const examenData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        fecha: selectedFecha || new Date(data.fecha),
        hora: data.hora,
        sucursal: data.sucursal,
        instructores: data.instructores || [],
        categorias: data.categorias,
        requisitos: {
          asistenciaMinima: parseFloat(data.requisitos.asistenciaMinima),
          diasMinimosCinturon: parseInt(data.requisitos.diasMinimosCinturon),
          pagosAlCorriente: data.requisitos.pagosAlCorriente,
          costoExamen: parseFloat(data.requisitos.costoExamen)
        },
        notas: data.notas
      }

      // ✅ SOLO agregar campos de cinturón si es graduación Y tienen valor
      if (data.tipo === 'graduacion') {
        if (!data.cinturonObjetivo || !data.cinturonActualRequerido) {
          toast.error('Los cinturones son requeridos para exámenes de graduación')
          setIsLoading(false)
          return
        }
        examenData.cinturonObjetivo = data.cinturonObjetivo
        examenData.cinturonActualRequerido = data.cinturonActualRequerido
      }
      // Si no es graduación, simplemente NO agregamos esos campos

      console.log('📤 Datos a enviar:', examenData)

      let response
      if (mode === 'edit' && examen?._id) {
        response = await examenesAPI.update(examen._id, examenData)
      } else {
        response = await examenesAPI.create(examenData)
      }

      if (response.success) {
        toast.success(mode === 'edit' ? 'Examen actualizado exitosamente' : 'Examen creado exitosamente')
        onSuccess && onSuccess()
        handleClose()
      }

    } catch (error) {
      console.error('Error al guardar examen:', error)
      toast.error(error.response?.data?.message || 'Error al guardar examen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedFecha(null)
    onClose()
  }

  const agregarCategoria = () => {
    append({ nombre: '', descripcion: '', peso: 0 })
  }

  const getSumaPesos = () => {
    return watchCategorias?.reduce((sum, cat) => sum + (parseFloat(cat.peso) || 0), 0) || 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              {mode === 'edit' ? 'Editar Examen' : 'Nuevo Examen'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Información Básica */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Examen *
                  </label>
                  <input
                    type="text"
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Examen de Graduación Cinturón Amarillo"
                  />
                  {errors.nombre && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                  )}
                </div>

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    {...register('descripcion')}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del examen..."
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Examen *
                  </label>
                  <select
                    {...register('tipo', { required: 'El tipo es requerido' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="graduacion">Graduación</option>
                    <option value="evaluacion_tecnica">Evaluación Técnica</option>
                    <option value="evaluacion_semestral">Evaluación Semestral</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Sucursal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Sucursal *
                  </label>
                  <select
                    {...register('sucursal', { required: 'La sucursal es requerida' })}
                    disabled={user?.role === 'instructor'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {Array.isArray(sucursales) && sucursales.map(suc => (
                      <option key={suc._id} value={suc._id}>{suc.name}</option>
                    ))}
                  </select>
                  {errors.sucursal && (
                    <p className="text-red-500 text-sm mt-1">{errors.sucursal.message}</p>
                  )}
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha *
                  </label>
                  <DatePicker
                    selected={selectedFecha}
                    onChange={(date) => {
                      setSelectedFecha(date)
                      setValue('fecha', date)
                    }}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Seleccionar fecha"
                  />
                  {errors.fecha && (
                    <p className="text-red-500 text-sm mt-1">La fecha es requerida</p>
                  )}
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    {...register('hora', { required: 'La hora es requerida' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.hora && (
                    <p className="text-red-500 text-sm mt-1">{errors.hora.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cinturones (solo para graduación) */}
            {watchTipo === 'graduacion' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Cinturones
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cinturón Actual Requerido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cinturón Actual Requerido *
                    </label>
                    <select
                      {...register('cinturonActualRequerido', { 
                        required: watchTipo === 'graduacion' ? 'Este campo es requerido' : false 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
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
                    </select>
                    {errors.cinturonActualRequerido && (
                      <p className="text-red-500 text-sm mt-1">{errors.cinturonActualRequerido.message}</p>
                    )}
                  </div>

                  {/* Cinturón Objetivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cinturón Objetivo *
                    </label>
                    <select
                      {...register('cinturonObjetivo', { 
                        required: watchTipo === 'graduacion' ? 'Este campo es requerido' : false 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
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
                      <option value="negro-1">Negro 1er Dan</option>
                      <option value="negro-2">Negro 2do Dan</option>
                      <option value="negro-3">Negro 3er Dan</option>
                    </select>
                    {errors.cinturonObjetivo && (
                      <p className="text-red-500 text-sm mt-1">{errors.cinturonObjetivo.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Categorías de Evaluación */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  Categorías de Evaluación
                </h3>
                <button
                  type="button"
                  onClick={agregarCategoria}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {categorias.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        {...register(`categorias.${index}.nombre`, { required: true })}
                        placeholder="Nombre"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        {...register(`categorias.${index}.descripcion`)}
                        placeholder="Descripción"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        {...register(`categorias.${index}.peso`, { 
                          required: true,
                          min: 0,
                          max: 100
                        })}
                        placeholder="Peso %"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${getSumaPesos() === 100 ? 'text-green-600' : 'text-orange-600'}`} />
                <p className={`text-sm ${getSumaPesos() === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  Suma total: {getSumaPesos()}% {getSumaPesos() !== 100 && '(debe sumar 100%)'}
                </p>
              </div>
            </div>

            {/* Requisitos */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Requisitos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Asistencia Mínima */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asistencia Mínima (%)
                  </label>
                  <input
                    type="number"
                    {...register('requisitos.asistenciaMinima', { min: 0, max: 100 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Días Mínimos con Cinturón */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días Mínimos con Cinturón Actual
                  </label>
                  <input
                    type="number"
                    {...register('requisitos.diasMinimosCinturon', { min: 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Costo del Examen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Costo del Examen
                  </label>
                  <input
                    type="number"
                    {...register('requisitos.costoExamen', { min: 0 })}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Pagos al Corriente */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('requisitos.pagosAlCorriente')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Requiere pagos al corriente
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                {...register('notas')}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas o comentarios sobre el examen..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'edit' ? 'Actualizar' : 'Crear'} Examen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamenForm