import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005/api'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      Cookies.remove('token')
      window.location.href = '/login'
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
    }
    
    // Manejar otros errores
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente más tarde.')
    }
    
    return Promise.reject(error)
  }
)

// Servicios de autenticación
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  
  // Registro
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },
  
  // Verificar token
  verifyToken: async () => {
    const response = await api.get('/auth/verify')
    return response.data
  },
  
  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },
  
  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },
  
  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
  
  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },
  
  // Obtener usuarios (solo admin)
  getUsers: async (params = {}) => {
    const response = await api.get('/auth/users', { params })
    return response.data
  }
}

// Servicios de sucursales
export const sucursalesAPI = {
  // Obtener todas las sucursales
  getAll: async (params = {}) => {
    const response = await api.get('/sucursales', { params })
    return response.data
  },
  
  // Obtener sucursal por ID
  getById: async (id) => {
    const response = await api.get(`/sucursales/${id}`)
    return response.data
  },
  
  // Crear sucursal
  create: async (sucursalData) => {
    const response = await api.post('/sucursales', sucursalData)
    return response.data
  },
  
  // Actualizar sucursal
  update: async (id, sucursalData) => {
    const response = await api.put(`/sucursales/${id}`, sucursalData)
    return response.data
  },
  
  // Eliminar sucursal
  delete: async (id) => {
    const response = await api.delete(`/sucursales/${id}`)
    return response.data
  },
  
  // Subir logo de sucursal
  uploadLogo: async (id, logoFile) => {
    const formData = new FormData()
    formData.append('logo', logoFile)
    const response = await api.post(`/sucursales/${id}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  // Obtener estadísticas de sucursal
  getStats: async (id) => {
    const response = await api.get(`/sucursales/${id}/stats`)
    return response.data
  }
}

// ===== SERVICIOS DE TUTORES =====
export const tutoresAPI = {
  // Obtener todos los tutores
  getAll: async (params = {}) => {
    const response = await api.get('/tutores', { params })
    return response.data
  },
  
  // Obtener tutor por ID
  getById: async (id) => {
    const response = await api.get(`/tutores/${id}`)
    return response.data
  },
  
  // Crear tutor
  create: async (tutorData) => {
    const response = await api.post('/tutores', tutorData)
    return response.data
  },
  
  // Actualizar tutor
  update: async (id, tutorData) => {
    const response = await api.put(`/tutores/${id}`, tutorData)
    return response.data
  },
  
  // Eliminar tutor
  delete: async (id) => {
    const response = await api.delete(`/tutores/${id}`)
    return response.data
  },
  
  // Subir foto de perfil
  uploadPhoto: async (id, photoFile) => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    const response = await api.post(`/tutores/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  // Obtener hijos de un tutor
  getChildren: async (id) => {
    const response = await api.get(`/tutores/${id}/children`)
    return response.data
  },
  
  // Buscar tutores
  search: async (searchTerm, filters = {}) => {
    const response = await api.get('/tutores', {
      params: { search: searchTerm, ...filters }
    })
    return response.data
  },
  
  // Obtener tutores disponibles (sin hijos)
  getAvailable: async () => {
    const response = await api.get('/tutores', {
      params: { hasChildren: 'false' }
    })
    return response.data
  }
}

// ===== SERVICIOS DE ALUMNOS =====
export const alumnosAPI = {
  // Obtener todos los alumnos
  getAll: async (params = {}) => {
    const response = await api.get('/alumnos', { params })
    return response.data
  },
  
  // Obtener alumno por ID
  getById: async (id) => {
    const response = await api.get(`/alumnos/${id}`)
    return response.data
  },
  
  // Crear alumno
  create: async (alumnoData) => {
    const response = await api.post('/alumnos', alumnoData)
    return response.data
  },
  
  // Actualizar alumno
  update: async (id, alumnoData) => {
    const response = await api.put(`/alumnos/${id}`, alumnoData)
    return response.data
  },
  
  // Eliminar alumno
  delete: async (id) => {
    const response = await api.delete(`/alumnos/${id}`)
    return response.data
  },
  
  // Subir foto de perfil
  uploadPhoto: async (id, photoFile) => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    const response = await api.post(`/alumnos/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  // Actualizar cinturón
  updateBelt: async (id, beltData) => {
    const response = await api.put(`/alumnos/${id}/belt`, beltData)
    return response.data
  },
  
  // Obtener estadísticas generales
  getStats: async (params = {}) => {
    const response = await api.get('/alumnos/stats', { params })
    return response.data
  },
  
  // Buscar alumnos
  search: async (searchTerm, filters = {}) => {
    const response = await api.get('/alumnos', {
      params: { search: searchTerm, ...filters }
    })
    return response.data
  },
  
  // Filtros por sucursal
  getBySucursal: async (sucursalId, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { sucursal: sucursalId, ...params }
    })
    return response.data
  },
  
  // Filtros por tutor
  getByTutor: async (tutorId, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { tutor: tutorId, ...params }
    })
    return response.data
  },
  
  // Filtros por cinturón
  getByBelt: async (beltLevel, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { belt: beltLevel, ...params }
    })
    return response.data
  },
  
  // Filtros por edad
  getByAge: async (ageRange, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { age: ageRange, ...params }
    })
    return response.data
  },
  
  // Obtener alumnos activos
  getActive: async (params = {}) => {
    const response = await api.get('/alumnos', {
      params: { status: 'activo', ...params }
    })
    return response.data
  }
}

// Servicios de pagos
export const pagosAPI = {
  // Obtener todos los pagos
  getAll: async (params = {}) => {
    const response = await api.get('/pagos', { params })
    return response.data
  },
  
  // Obtener pago por ID
  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`)
    return response.data
  },
  
  // Crear pago
  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData)
    return response.data
  },
  
  // Actualizar pago
  update: async (id, pagoData) => {
    const response = await api.put(`/pagos/${id}`, pagoData)
    return response.data
  },
  
  // Eliminar pago
  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`)
    return response.data
  },
  
  // Marcar como pagado
  markAsPaid: async (id, paymentData) => {
    const response = await api.put(`/pagos/${id}/marcar-pagado`, paymentData)
    return response.data
  },
  
  // Cancelar pago
  cancel: async (id, reason) => {
    const response = await api.put(`/pagos/${id}/cancelar`, { reason })
    return response.data
  },
  
  // Subir comprobante
  uploadComprobante: async (pagoId, comprobanteFile) => {
    const formData = new FormData()
    formData.append('comprobante', comprobanteFile)
    const response = await api.post(`/pagos/${pagoId}/comprobante`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  // Generar comprobante PDF
  generateComprobante: async (pagoId) => {
    const response = await api.get(`/pagos/${pagoId}/generar-comprobante`, {
      responseType: 'blob'
    })
    return response.data
  },
  
  // 🆕 NUEVO: Obtener estadísticas
  getStats: async (params = {}) => {
    const response = await api.get('/pagos/stats', { params })
    return response.data
  },
  
  // Obtener pagos por alumno
  getByAlumno: async (alumnoId, params = {}) => {
    const response = await api.get(`/pagos/alumno/${alumnoId}`, { params })
    return response.data
  },
  
  // Obtener pagos por tutor
  getByTutor: async (tutorId, params = {}) => {
    const response = await api.get(`/pagos/tutor/${tutorId}`, { params })
    return response.data
  },
  
  // Obtener pagos pendientes
  getPendientes: async (params = {}) => {
    const response = await api.get('/pagos/pendientes', { params })
    return response.data
  }
}

// Servicios de horarios
export const horariosAPI = {
  // Obtener horarios
  getAll: async (filters = {}) => {
    const response = await api.get('/horarios', { params: filters })
    return response.data
  },
  
  // Crear horario
  create: async (horarioData) => {
    const response = await api.post('/horarios', horarioData)
    return response.data
  },
  
  // Actualizar horario
  update: async (id, horarioData) => {
    const response = await api.put(`/horarios/${id}`, horarioData)
    return response.data
  }
}

// Servicios de asistencias
export const asistenciasAPI = {
  // Obtener asistencias
  getAll: async (filters = {}) => {
    const response = await api.get('/asistencias', { params: filters })
    return response.data
  },
  
  // Registrar asistencia
  create: async (asistenciaData) => {
    const response = await api.post('/asistencias', asistenciaData)
    return response.data
  },
  
  // Obtener reporte de asistencias
  getReporte: async (filters = {}) => {
    const response = await api.get('/asistencias/reporte', { params: filters })
    return response.data
  }
}

// Servicios de calificaciones
export const calificacionesAPI = {
  // Obtener calificaciones
  getAll: async (filters = {}) => {
    const response = await api.get('/calificaciones', { params: filters })
    return response.data
  },
  
  // Crear calificación
  create: async (calificacionData) => {
    const response = await api.post('/calificaciones', calificacionData)
    return response.data
  },
  
  // Actualizar calificación
  update: async (id, calificacionData) => {
    const response = await api.put(`/calificaciones/${id}`, calificacionData)
    return response.data
  }
}

// Servicios de instructores
export const instructoresAPI = {
  // Obtener instructores
  getAll: async () => {
    const response = await api.get('/instructores')
    return response.data
  },
  
  // Crear instructor
  create: async (instructorData) => {
    const response = await api.post('/instructores', instructorData)
    return response.data
  },
  
  // Actualizar instructor
  update: async (id, instructorData) => {
    const response = await api.put(`/instructores/${id}`, instructorData)
    return response.data
  }
}

// Servicios de dashboard y estadísticas
export const dashboardAPI = {
  // Obtener estadísticas generales
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  
  // Obtener gráficos de ingresos
  getIngresos: async (periodo = 'mes') => {
    const response = await api.get(`/dashboard/ingresos`, { params: { periodo } })
    return response.data
  },
  
  // Obtener alumnos recientes
  getAlumnosRecientes: async () => {
    const response = await api.get('/dashboard/alumnos-recientes')
    return response.data
  },
  
  // Obtener pagos pendientes
  getPagosPendientes: async () => {
    const response = await api.get('/dashboard/pagos-pendientes')
    return response.data
  }
}

// Servicios de notificaciones
export const notificacionesAPI = {
  // Enviar notificación por email
  sendEmail: async (destinatarios, asunto, mensaje) => {
    const response = await api.post('/notificaciones/email', {
      destinatarios,
      asunto,
      mensaje
    })
    return response.data
  },
  
  // Enviar notificación por Telegram
  sendTelegram: async (mensaje, chatIds = []) => {
    const response = await api.post('/notificaciones/telegram', {
      mensaje,
      chatIds
    })
    return response.data
  }
}

// ===== CONSTANTES ÚTILES =====
export const BELT_LEVELS = [
  'blanco', 'blanco-amarillo', 'amarillo', 'amarillo-naranja', 'naranja',
  'naranja-verde', 'verde', 'verde-azul', 'azul', 'azul-marron', 'marron',
  'marron-negro', 'negro-1', 'negro-2', 'negro-3', 'negro-4', 'negro-5',
  'negro-6', 'negro-7', 'negro-8', 'negro-9'
]

export const BELT_LEVELS_DISPLAY = {
  'blanco': 'Blanco',
  'blanco-amarillo': 'Blanco-Amarillo',
  'amarillo': 'Amarillo',
  'amarillo-naranja': 'Amarillo-Naranja',
  'naranja': 'Naranja',
  'naranja-verde': 'Naranja-Verde',
  'verde': 'Verde',
  'verde-azul': 'Verde-Azul',
  'azul': 'Azul',
  'azul-marron': 'Azul-Marrón',
  'marron': 'Marrón',
  'marron-negro': 'Marrón-Negro',
  'negro-1': 'Negro 1° Dan',
  'negro-2': 'Negro 2° Dan',
  'negro-3': 'Negro 3° Dan',
  'negro-4': 'Negro 4° Dan',
  'negro-5': 'Negro 5° Dan',
  'negro-6': 'Negro 6° Dan',
  'negro-7': 'Negro 7° Dan',
  'negro-8': 'Negro 8° Dan',
  'negro-9': 'Negro 9° Dan'
}

export const GENDER_OPTIONS = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' }
]

export const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'graduado', label: 'Graduado' }
]

export const ID_TYPES = [
  { value: 'ine', label: 'INE' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'licencia', label: 'Licencia de Conducir' },
  { value: 'otro', label: 'Otro' }
]

// ===== FUNCIONES ÚTILES =====
export const utils = {
  // Formatear teléfono mexicano
  formatPhoneMX: (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
    }
    return phone
  },
  
  // Calcular edad
  calculateAge: (dateOfBirth) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  },
  
  // Obtener color del cinturón
  getBeltColor: (level) => {
    const colors = {
      'blanco': '#FFFFFF',
      'blanco-amarillo': '#FFFF99',
      'amarillo': '#FFFF00',
      'amarillo-naranja': '#FFB347',
      'naranja': '#FFA500',
      'naranja-verde': '#90EE90',
      'verde': '#008000',
      'verde-azul': '#20B2AA',
      'azul': '#0000FF',
      'azul-marron': '#8B4513',
      'marron': '#A0522D',
      'marron-negro': '#2F1B14',
      'negro-1': '#000000',
      'negro-2': '#000000',
      'negro-3': '#000000',
      'negro-4': '#000000',
      'negro-5': '#000000',
      'negro-6': '#000000',
      'negro-7': '#000000',
      'negro-8': '#000000',
      'negro-9': '#000000'
    }
    return colors[level] || '#CCCCCC'
  },
  
  // Formatear fecha
  formatDate: (date, format = 'dd/mm/yyyy') => {
    if (!date) return ''
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    
    switch (format) {
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`
      case 'long':
        return d.toLocaleDateString('es-MX', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      default:
        return `${day}/${month}/${year}`
    }
  },
  
  // Validar email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Función para verificar conexión con el backend
export const checkBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`)
    return response.data
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor')
  }
}

// Exportar la instancia de axios por si se necesita usar directamente
export default api