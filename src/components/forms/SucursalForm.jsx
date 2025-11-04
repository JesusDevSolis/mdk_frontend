import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  DollarSign,
  Clock,
  Upload,
  X,
  Save,
  Loader
} from 'lucide-react'
import { sucursalesAPI, authAPI } from '../../services/APIservice'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const SucursalForm = ({ 
  sucursal = null, 
  isOpen, 
  onClose, 
  onSuccess,
  mode = 'create' // 'create' or 'edit'
}) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [managers, setManagers] = useState([])
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

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
      address: '',
      phone: '',
      email: '',
      description: '',
      capacity: 50,
      manager: '',
      // Horarios por defecto
      schedule: {
        monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' }
      },
      // Configuraciones por defecto
      settings: {
        allowOnlinePayments: true,
        requireParentApproval: true,
        maxStudentsPerClass: 20,
        monthlyFee: 500,
        registrationFee: 200
      }
    }
  })

  // Cargar managers disponibles
  const loadManagers = async () => {
    try {
      if (user?.role === 'admin') {
        const response = await authAPI.getUsers({ role: 'instructor' })
        if (response.success) {
          setManagers(response.data.docs || [])
        }
      }
    } catch (error) {
      console.error('Error cargando managers:', error)
    }
  }

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadManagers()
      
      if (mode === 'edit' && sucursal) {
        // Llenar formulario con datos existentes
        Object.keys(sucursal).forEach(key => {
          if (key !== '_id' && key !== 'logo' && key !== 'createdAt' && key !== 'updatedAt') {
            setValue(key, sucursal[key])
          }
        })
        
        if (sucursal.logoUrl) {
          setLogoPreview(sucursal.logoUrl)
        }
      } else {
        // Resetear formulario para creación
        reset()
        setLogoFile(null)
        setLogoPreview(null)
      }
    }
  }, [isOpen, mode, sucursal, setValue, reset])

  // Manejar subida de logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen')
        return
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB')
        return
      }
      
      setLogoFile(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remover logo
  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    // Reset file input
    const fileInput = document.getElementById('logo-input')
    if (fileInput) fileInput.value = ''
  }

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      
      let savedSucursal
      
      if (mode === 'create') {
        // Crear nueva sucursal
        const response = await sucursalesAPI.create(data)
        if (response.success) {
          savedSucursal = response.data.sucursal
          toast.success('Sucursal creada exitosamente')
        }
      } else {
        // Actualizar sucursal existente
        const response = await sucursalesAPI.update(sucursal._id, data)
        if (response.success) {
          savedSucursal = response.data.sucursal
          toast.success('Sucursal actualizada exitosamente')
        }
      }
      
      // Subir logo si hay uno
      if (logoFile && savedSucursal) {
        try {
          await sucursalesAPI.uploadLogo(savedSucursal._id, logoFile)
          toast.success('Logo subido exitosamente')
        } catch (logoError) {
          console.error('Error subiendo logo:', logoError)
          toast.error('Sucursal guardada, pero hubo un error subiendo el logo')
        }
      }
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(savedSucursal)
      }
      
      // Cerrar modal
      onClose()
      
    } catch (error) {
      console.error('Error guardando sucursal:', error)
      
      let errorMessage = 'Error guardando la sucursal'
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => err.message).join(', ')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Crear Nueva Sucursal' : `Editar ${sucursal?.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido del formulario */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Sucursal *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Ej: Sucursal Centro"
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: { value: 2, message: 'Mínimo 2 caracteres' }
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad de Alumnos
                </label>
                <input
                  type="number"
                  className={`input-field ${errors.capacity ? 'border-red-300' : ''}`}
                  placeholder="50"
                  {...register('capacity', {
                    min: { value: 1, message: 'Mínimo 1 alumno' },
                    max: { value: 1000, message: 'Máximo 1000 alumnos' }
                  })}
                />
                {errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <textarea
                  className={`input-field ${errors.address ? 'border-red-300' : ''}`}
                  rows="2"
                  placeholder="Dirección completa de la sucursal"
                  {...register('address', {
                    required: 'La dirección es requerida'
                  })}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className={`input-field ${errors.phone ? 'border-red-300' : ''}`}
                  placeholder="+52 961 123 4567"
                  {...register('phone')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className={`input-field ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="sucursal@taekwondo.com"
                  {...register('email')}
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager/Instructor
                  </label>
                  <select
                    className="input-field"
                    {...register('manager')}
                  >
                    <option value="">Seleccionar manager...</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Descripción de la sucursal (opcional)"
                  {...register('description')}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Logo de la Sucursal</h3>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Preview logo"
                        className="w-24 h-24 object-contain border border-gray-200 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-input"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-input"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Subir Logo
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Formatos: JPG, PNG, GIF. Máximo 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuraciones */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuraciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colegiatura Mensual ($)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="500"
                    {...register('settings.monthlyFee', { min: 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuota de Inscripción ($)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="200"
                    {...register('settings.registrationFee', { min: 0 })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo Alumnos por Clase
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="20"
                    {...register('settings.maxStudentsPerClass', { min: 1, max: 50 })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowOnlinePayments"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('settings.allowOnlinePayments')}
                    />
                    <label htmlFor="allowOnlinePayments" className="ml-2 text-sm text-gray-700">
                      Permitir pagos en línea
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireParentApproval"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('settings.requireParentApproval')}
                    />
                    <label htmlFor="requireParentApproval" className="ml-2 text-sm text-gray-700">
                      Requerir aprobación de padres
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Horarios */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios de Atención</h3>
              <div className="space-y-3">
                {days.map((day) => (
                  <div key={day.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          {...register(`schedule.${day.key}.isOpen`)}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {day.label}
                        </span>
                      </label>
                    </div>
                    
                    {watch(`schedule.${day.key}.isOpen`) && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Apertura</label>
                          <input
                            type="time"
                            className="input-field text-sm"
                            {...register(`schedule.${day.key}.openTime`)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cierre</label>
                          <input
                            type="time"
                            className="input-field text-sm"
                            {...register(`schedule.${day.key}.closeTime`)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === 'create' ? 'Crear Sucursal' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SucursalForm