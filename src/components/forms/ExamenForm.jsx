import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import DatePicker from 'react-datepicker'
import { registerLocale, setDefaultLocale } from 'react-datepicker'
import { es } from 'date-fns/locale/es'
import 'react-datepicker/dist/react-datepicker.css'
import {
  ClipboardCheck, X, Save, Loader, Award, Building2,
  Calendar, Clock, Users, DollarSign, Plus, Trash2,
  AlertCircle, CheckCircle2, Info, ChevronDown
} from 'lucide-react'
import { examenesAPI, sucursalesAPI, instructoresAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import useCinturones from '../../hooks/useCinturones'
import toast from 'react-hot-toast'

registerLocale('es', es)
setDefaultLocale('es')


// Sección con título
const Section = ({ icon: Icon, title, color = 'text-primary-600', children }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      {title}
    </h3>
    {children}
  </div>
)

const ExamenForm = ({
  examen = null,
  isOpen,
  onClose,
  onSuccess,
  mode = 'create'
}) => {
  const { user }    = useAuth()
  const { cinturones, loading: loadingCinturones } = useCinturones()
  const [isLoading, setIsLoading]     = useState(false)
  const [sucursales, setSucursales]   = useState([])
  const [instructores, setInstructores] = useState([])
  const [selectedFecha, setSelectedFecha] = useState(null)

  const {
    register, handleSubmit, formState: { errors },
    reset, setValue, watch, control
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
        { nombre: 'Poomsae',  descripcion: 'Formas',                peso: 25 },
        { nombre: 'Kyorugi',  descripcion: 'Combate',               peso: 25 },
        { nombre: 'Kyukpa',   descripcion: 'Rompimiento',           peso: 25 },
        { nombre: 'Teoría',   descripcion: 'Conocimiento teórico',  peso: 25 },
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

  const { fields: categorias, append, remove } = useFieldArray({ control, name: 'categorias' })
  const watchTipo       = watch('tipo')
  const watchCategorias = watch('categorias')
  const watchCinActual  = watch('cinturonActualRequerido')
  const watchCinObj     = watch('cinturonObjetivo')

  useEffect(() => {
    if (isOpen) loadInitialData()
  }, [isOpen])

  useEffect(() => {
    if (isOpen && examen && sucursales.length > 0) populateForm()
  }, [isOpen, examen, sucursales])

  const loadInitialData = async () => {
    try {
      const [sucRes, insRes] = await Promise.all([
        sucursalesAPI.getAll(),
        instructoresAPI.getAll()
      ])
      // sucursalesAPI devuelve { success, data: { sucursales: [...], pagination: {} } }
      let sucs = []
      if (Array.isArray(sucRes?.data?.sucursales))              sucs = sucRes.data.sucursales
      else if (sucRes?.success && Array.isArray(sucRes.data))   sucs = sucRes.data
      else if (Array.isArray(sucRes?.data))                     sucs = sucRes.data
      else if (Array.isArray(sucRes?.data?.data))               sucs = sucRes.data.data
      else if (Array.isArray(sucRes))                           sucs = sucRes
      setSucursales(sucs)

      // instructoresAPI devuelve { success, data: [...], pagination }
      let insts = []
      if (insRes?.success && Array.isArray(insRes.data))       insts = insRes.data
      else if (Array.isArray(insRes?.data))                     insts = insRes.data
      else if (Array.isArray(insRes))                           insts = insRes
      setInstructores(insts)
    } catch (err) {
      toast.error('Error al cargar datos del formulario')
      setSucursales([])
      setInstructores([])
    }
  }

  const populateForm = () => {
    if (!examen) return
    setValue('nombre',                 examen.nombre || '')
    setValue('descripcion',            examen.descripcion || '')
    setValue('tipo',                   examen.tipo || 'graduacion')
    setValue('hora',                   examen.hora || '')
    setValue('cinturonObjetivo',       examen.cinturonObjetivo || '')
    setValue('cinturonActualRequerido',examen.cinturonActualRequerido || '')
    setValue('sucursal',               examen.sucursal?._id || examen.sucursal || '')
    setValue('instructores',           examen.instructores?.map(i => i._id || i) || [])
    setValue('categorias',             examen.categorias || [])
    setValue('requisitos',             examen.requisitos || {})
    setValue('notas',                  examen.notas || '')
    if (examen.fecha) setSelectedFecha(new Date(examen.fecha))
  }

  // BeltSelect dinámico — usa los cinturones de la BD
  const BeltSelectDyn = ({ value, onChange, placeholder = 'Seleccionar', error }) => {
    const selected = cinturones.find(c => c.key === value)
    return (
      <div>
        <div className={`relative flex items-center border rounded-xl bg-white transition-colors
          ${error ? 'border-red-400' : 'border-gray-200 hover:border-gray-300 focus-within:border-primary-400'}`}>
          {selected && (
            <div className="pl-3 flex-shrink-0">
              <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm flex-shrink-0"
                style={{ backgroundColor: selected.color }} />
            </div>
          )}
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-900 appearance-none outline-none cursor-pointer"
          >
            <option value="">{loadingCinturones ? 'Cargando...' : placeholder}</option>
            {cinturones.map(c => (
              <option key={c.key} value={c.key}>{c.nombre}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0 pointer-events-none" />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }

  const getSumaPesos = () =>
    watchCategorias?.reduce((s, c) => s + (parseFloat(c.peso) || 0), 0) || 0

  const onSubmit = async (data) => {
    const sumaPesos = getSumaPesos()
    if (Math.abs(sumaPesos - 100) > 0.01) {
      toast.error(`Los pesos deben sumar 100% (actual: ${sumaPesos}%)`)
      return
    }
    try {
      setIsLoading(true)
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        fecha: selectedFecha || new Date(data.fecha),
        hora: data.hora,
        sucursal: data.sucursal,
        instructores: data.instructores || [],
        categorias: data.categorias,
        requisitos: {
          asistenciaMinima:    parseFloat(data.requisitos.asistenciaMinima),
          diasMinimosCinturon: parseInt(data.requisitos.diasMinimosCinturon),
          pagosAlCorriente:    data.requisitos.pagosAlCorriente,
          costoExamen:         parseFloat(data.requisitos.costoExamen)
        },
        notas: data.notas
      }
      if (data.tipo === 'graduacion') {
        if (!data.cinturonObjetivo || !data.cinturonActualRequerido) {
          toast.error('Los cinturones son requeridos para exámenes de graduación')
          return
        }
        payload.cinturonObjetivo        = data.cinturonObjetivo
        payload.cinturonActualRequerido = data.cinturonActualRequerido
      }
      const res = mode === 'edit' && examen?._id
        ? await examenesAPI.update(examen._id, payload)
        : await examenesAPI.create(payload)
      if (res.success) {
        onSuccess?.()
        handleClose()
      } else {
        toast.error(res.message || 'Error al guardar')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar examen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedFecha(null)
    onClose()
  }

  if (!isOpen) return null

  const sumaPesos = getSumaPesos()
  const pesosOk   = Math.abs(sumaPesos - 100) < 0.01

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-xl">
              <ClipboardCheck className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'edit' ? 'Editar Examen' : 'Nuevo Examen'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {mode === 'edit' ? 'Modifica los datos del examen' : 'Completa la información para crear el examen'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Información Básica */}
            <Section icon={Info} title="Información Básica">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del Examen <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    className="input-field w-full"
                    placeholder="Ej: Examen de Graduación Cinturón Amarillo"
                  />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select {...register('tipo')} className="input-field w-full">
                    <option value="graduacion">Graduación</option>
                    <option value="evaluacion_tecnica">Evaluación Técnica</option>
                    <option value="evaluacion_semestral">Evaluación Semestral</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Sucursal <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('sucursal', { required: 'La sucursal es requerida' })}
                    disabled={user?.role === 'instructor'}
                    className="input-field w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {sucursales.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  {errors.sucursal && <p className="text-red-500 text-xs mt-1">{errors.sucursal.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={selectedFecha}
                    onChange={date => { setSelectedFecha(date); setValue('fecha', date) }}
                    dateFormat="dd/MM/yyyy"
                    locale="es"
                    className="input-field w-full"
                    placeholderText="dd/mm/aaaa"
                    wrapperClassName="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    {...register('hora', { required: 'La hora es requerida' })}
                    className="input-field w-full"
                  />
                  {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    {...register('descripcion')}
                    rows={2}
                    className="input-field w-full resize-none"
                    placeholder="Descripción opcional del examen..."
                  />
                </div>
              </div>
            </Section>

            {/* Cinturones — solo para graduación */}
            {watchTipo === 'graduacion' && (
              <Section icon={Award} title="Cinturones" color="text-amber-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cinturón Actual Requerido <span className="text-red-500">*</span>
                    </label>
                    <BeltSelectDyn
                      value={watchCinActual}
                      onChange={v => setValue('cinturonActualRequerido', v)}
                      placeholder="Cinturón que debe tener"
                      error={errors.cinturonActualRequerido?.message}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Cinturón Objetivo <span className="text-red-500">*</span>
                    </label>
                    <BeltSelectDyn
                      value={watchCinObj}
                      onChange={v => setValue('cinturonObjetivo', v)}
                      placeholder="Cinturón a obtener"
                      error={errors.cinturonObjetivo?.message}
                    />
                  </div>
                </div>
                {watchCinActual && watchCinObj && (() => {
                    const cA = cinturones.find(c => c.key === watchCinActual)
                    const cO = cinturones.find(c => c.key === watchCinObj)
                    return (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: cA?.color || '#9CA3AF' }} />
                          <span className="text-sm text-gray-600">{cA?.nombre || watchCinActual}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: cO?.color || '#9CA3AF' }} />
                          <span className="text-sm font-medium text-gray-800">{cO?.nombre || watchCinObj}</span>
                        </div>
                      </div>
                    )
                  })()}
              </Section>
            )}

            {/* Categorías de Evaluación */}
            <Section icon={ClipboardCheck} title="Categorías de Evaluación" color="text-green-600">
              <div className="space-y-2">
                {/* Cabecera tabla */}
                <div className="grid grid-cols-12 gap-2 px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <span className="col-span-4">Nombre</span>
                  <span className="col-span-5">Descripción</span>
                  <span className="col-span-2 text-center">Peso %</span>
                  <span className="col-span-1" />
                </div>

                {categorias.map((field, index) => (
                  <div key={field.id}
                    className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl px-3 py-2">
                    <input
                      {...register(`categorias.${index}.nombre`, { required: true })}
                      placeholder="Nombre"
                      className="col-span-4 input-field text-sm py-1.5"
                    />
                    <input
                      {...register(`categorias.${index}.descripcion`)}
                      placeholder="Descripción"
                      className="col-span-5 input-field text-sm py-1.5"
                    />
                    <input
                      type="number"
                      {...register(`categorias.${index}.peso`, { required: true, min: 0, max: 100 })}
                      placeholder="0"
                      className="col-span-2 input-field text-sm py-1.5 text-center"
                    />
                    <button type="button" onClick={() => remove(index)}
                      className="col-span-1 flex items-center justify-center p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3">
                <button type="button" onClick={() => append({ nombre: '', descripcion: '', peso: 0 })}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                  <Plus className="w-4 h-4" /> Agregar categoría
                </button>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${pesosOk ? 'text-green-600' : 'text-amber-600'}`}>
                  {pesosOk
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <AlertCircle className="w-4 h-4" />}
                  Total: {sumaPesos}% {!pesosOk && `(faltan ${(100 - sumaPesos).toFixed(0)}%)`}
                </div>
              </div>
            </Section>

            {/* Requisitos */}
            <Section icon={Users} title="Requisitos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Asistencia mínima
                  </label>
                  <div className="relative">
                    <input type="number"
                      {...register('requisitos.asistenciaMinima', { min: 0, max: 100 })}
                      className="input-field w-full pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Días mínimos con cinturón
                  </label>
                  <div className="relative">
                    <input type="number"
                      {...register('requisitos.diasMinimosCinturon', { min: 0 })}
                      className="input-field w-full pr-10" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">días</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                    Costo del examen
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input type="number" step="0.01"
                      {...register('requisitos.costoExamen', { min: 0 })}
                      className="input-field w-full pl-7" />
                  </div>
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2.5 cursor-pointer w-fit">
                <input type="checkbox"
                  {...register('requisitos.pagosAlCorriente')}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">Requiere pagos al corriente</span>
              </label>
            </Section>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notas adicionales
              </label>
              <textarea
                {...register('notas')}
                rows={2}
                className="input-field w-full resize-none"
                placeholder="Notas o comentarios sobre el examen..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button type="button" onClick={handleClose} disabled={isLoading}
              className="btn-secondary px-5">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading}
              className="btn-primary px-5 flex items-center gap-2">
              {isLoading ? (
                <><Loader className="w-4 h-4 animate-spin" />Guardando...</>
              ) : (
                <><Save className="w-4 h-4" />{mode === 'edit' ? 'Actualizar' : 'Crear'} Examen</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExamenForm