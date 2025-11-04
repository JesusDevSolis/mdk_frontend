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

// Servicios de alumnos
export const alumnosAPI = {
  // Obtener todos los alumnos
  getAll: async (filters = {}) => {
    const response = await api.get('/alumnos', { params: filters })
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
  }
}

// Servicios de tutores
export const tutoresAPI = {
  // Obtener tutores de un alumno
  getByAlumno: async (alumnoId) => {
    const response = await api.get(`/alumnos/${alumnoId}/tutores`)
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
  }
}

// Servicios de pagos
export const pagosAPI = {
  // Obtener pagos
  getAll: async (filters = {}) => {
    const response = await api.get('/pagos', { params: filters })
    return response.data
  },
  
  // Crear pago
  create: async (pagoData) => {
    const response = await api.post('/pagos', pagoData)
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
  
  // Generar comprobante
  generateComprobante: async (pagoId) => {
    const response = await api.get(`/pagos/${pagoId}/generar-comprobante`, {
      responseType: 'blob'
    })
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