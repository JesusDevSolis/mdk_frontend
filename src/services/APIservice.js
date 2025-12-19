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
  
  // Filtros por género
  getByGender: async (gender, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { gender, ...params }
    })
    return response.data
  },
  
  // Filtros por cinturón
  getByBelt: async (beltLevel, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { beltLevel, ...params }
    })
    return response.data
  },
  
  // Filtros por estado
  getByStatus: async (status, params = {}) => {
    const response = await api.get('/alumnos', {
      params: { status, ...params }
    })
    return response.data
  }
}

// ===== SERVICIOS DE PAGOS =====
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
  
  // Subir comprobante de pago
  uploadComprobante: async (id, comprobanteFile) => {
    const formData = new FormData()
    formData.append('comprobante', comprobanteFile)
    
    const response = await api.post(`/pagos/${id}/comprobante`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },
  
  // Obtener pagos por alumno
  getByAlumno: async (alumnoId, params = {}) => {
    const response = await api.get('/pagos', {
      params: { alumno: alumnoId, ...params }
    })
    return response.data
  },
  
  // Obtener pagos por sucursal
  getBySucursal: async (sucursalId, params = {}) => {
    const response = await api.get('/pagos', {
      params: { sucursal: sucursalId, ...params }
    })
    return response.data
  },
  
  // Obtener pagos pendientes
  getPendientes: async (params = {}) => {
    const response = await api.get('/pagos', {
      params: { status: 'pendiente', ...params }
    })
    return response.data
  },
  
  // Obtener pagos completados
  getCompletados: async (params = {}) => {
    const response = await api.get('/pagos', {
      params: { status: 'completado', ...params }
    })
    return response.data
  },
  
  // Obtener estadísticas de pagos
  getStats: async (params = {}) => {
    const response = await api.get('/pagos/stats', { params })
    return response.data
  },
  
  // Cambiar estado de pago
  cambiarEstado: async (id, estado) => {
    const response = await api.put(`/pagos/${id}/estado`, { estado })
    return response.data
  },
  
  // Obtener historial financiero de un alumno
  getHistorialFinanciero: async (alumnoId) => {
    const response = await api.get(`/pagos/alumno/${alumnoId}/historial`)
    return response.data
  },
  
  // ✅ NUEVO: Marcar pago como pagado
  markAsPaid: async (id, paymentData) => {
    const response = await api.put(`/pagos/${id}/marcar-pagado`, paymentData)
    return response.data
  },
  
  // ✅ NUEVO: Cancelar pago
  cancelPayment: async (id, reason) => {
    const response = await api.put(`/pagos/${id}/cancelar`, { reason })
    return response.data
  }
}

// ===== SERVICIOS DE ASISTENCIAS =====
export const asistenciasAPI = {
  // Obtener todas las asistencias con filtros opcionales
  getAll: async (params = {}) => {
    const response = await api.get('/asistencias', { params })
    return response.data
  },
  
  // Obtener asistencia por ID
  getById: async (id) => {
    const response = await api.get(`/asistencias/${id}`)
    return response.data
  },
  
  // Marcar asistencia individual
  create: async (asistenciaData) => {
    const response = await api.post('/asistencias', asistenciaData)
    return response.data
  },
  
  // Marcar asistencia grupal (PRINCIPAL - para marcar varios alumnos a la vez)
  marcarGrupo: async (grupoData) => {
    const response = await api.post('/asistencias/marcar-grupo', grupoData)
    return response.data
  },
  
  // Actualizar asistencia
  update: async (id, asistenciaData) => {
    const response = await api.put(`/asistencias/${id}`, asistenciaData)
    return response.data
  },
  
  // Eliminar asistencia (solo admin)
  delete: async (id) => {
    const response = await api.delete(`/asistencias/${id}`)
    return response.data
  },
  
  // Obtener asistencias por alumno
  getByAlumno: async (alumnoId, params = {}) => {
    const response = await api.get(`/asistencias/alumno/${alumnoId}`, { params })
    return response.data
  },
  
  // Obtener asistencias por horario (PRINCIPAL para marcar asistencias)
  getByHorario: async (horarioId, params = {}) => {
    const response = await api.get(`/asistencias/horario/${horarioId}`, { params })
    return response.data
  },
  
  // Obtener asistencias por fecha
  getByFecha: async (fecha) => {
    const response = await api.get(`/asistencias/fecha/${fecha}`)
    return response.data
  },
  
  // Obtener estadísticas generales de asistencias
  getEstadisticas: async (params = {}) => {
    const response = await api.get('/asistencias/estadisticas', { params })
    return response.data
  }
}

// Servicios de calificaciones
export const calificacionesAPI = {
  // Obtener calificaciones
  getAll: async (params = {}) => {
    const response = await api.get('/calificaciones', { params })
    return response.data
  },
  
  // Obtener calificaciones por alumno
  getByAlumno: async (alumnoId) => {
    const response = await api.get(`/calificaciones/alumno/${alumnoId}`)
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
  },

  // Finalizar calificación
  finalizar: async (id) => {
    const response = await api.put(`/calificaciones/${id}/finalizar`)
    return response.data
  },

  // Obtener calificaciones por examen
  getByExamen: async (examenId) => {
    const response = await api.get(`/calificaciones/examen/${examenId}`)
    return response.data
  },

  // Obtener estadísticas de examen
  getEstadisticasExamen: async (examenId) => {
    const response = await api.get(`/calificaciones/estadisticas/${examenId}`)
    return response.data
  }
}

// ===== SERVICIOS DE GRADUACIONES =====
export const graduacionesAPI = {
  // Obtener todas las graduaciones
  getAll: async (params = {}) => {
    const response = await api.get('/graduaciones', { params })
    return response.data
  },
  
  // Obtener graduación por ID
  getById: async (id) => {
    const response = await api.get(`/graduaciones/${id}`)
    return response.data
  },
  
  // Crear graduación
  create: async (graduacionData) => {
    const response = await api.post('/graduaciones', graduacionData)
    return response.data
  },
  
  // Aprobar graduación
  aprobar: async (id) => {
    const response = await api.put(`/graduaciones/${id}/aprobar`)
    return response.data
  },
  
  // Subir certificado
  uploadCertificado: async (id, certificadoFile) => {
    const formData = new FormData()
    formData.append('certificado', certificadoFile)
    
    const response = await api.post(`/graduaciones/${id}/certificado`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },
  
  // Cancelar graduación
  cancelar: async (id, motivo) => {
    const response = await api.put(`/graduaciones/${id}/cancelar`, { motivo })
    return response.data
  },
  
  // Obtener historial de graduaciones de un alumno
  getHistorialAlumno: async (alumnoId) => {
    const response = await api.get(`/graduaciones/alumno/${alumnoId}`)
    return response.data
  },
  
  // Obtener graduaciones de un examen
  getByExamen: async (examenId) => {
    const response = await api.get(`/graduaciones/examen/${examenId}`)
    return response.data
  },
  
  // Obtener graduaciones pendientes de aprobación
  getPendientes: async () => {
    const response = await api.get('/graduaciones/pendientes')
    return response.data
  },
  
  // Obtener graduaciones sin certificado
  getSinCertificado: async () => {
    const response = await api.get('/graduaciones/sin-certificado')
    return response.data
  },
  
  // Registrar ceremonia
  registrarCeremonia: async (id, ceremoniaData) => {
    const response = await api.put(`/graduaciones/${id}/ceremonia`, ceremoniaData)
    return response.data
  },
  
  // Obtener estadísticas
  getEstadisticas: async (params = {}) => {
    const response = await api.get('/graduaciones/estadisticas', { params })
    return response.data
  }
}

// Servicios de instructores
export const instructoresAPI = {
  // Obtener todos los instructores con filtros opcionales
  getAll: async (params = {}) => {
    const response = await api.get('/instructores', { params })
    return response.data
  },
  
  // Obtener instructor por ID
  getById: async (id) => {
    const response = await api.get(`/instructores/${id}`)
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
  },
  
  // Eliminar instructor (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/instructores/${id}`)
    return response.data
  },
  
  // Obtener instructores por sucursal
  getBySucursal: async (sucursalId) => {
    const response = await api.get(`/instructores/sucursal/${sucursalId}`)
    return response.data
  },
  
  // Activar/Desactivar instructor
  toggleStatus: async (id) => {
    const response = await api.put(`/instructores/${id}/toggle-status`)
    return response.data
  },
  
  // Obtener estadísticas del instructor
  getEstadisticas: async (id) => {
    const response = await api.get(`/instructores/${id}/estadisticas`)
    return response.data
  },
  
  // Subir foto de perfil
  uploadPhoto: async (id, photoFile) => {
    const formData = new FormData()
    formData.append('photo', photoFile)
    
    const response = await api.post(`/instructores/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

// ===== SERVICIOS DE HORARIOS =====
export const horariosAPI = {
  // Obtener todos los horarios con filtros opcionales
  getAll: async (params = {}) => {
    const response = await api.get('/horarios', { params })
    return response.data
  },
  
  // Obtener horario por ID
  getById: async (id) => {
    const response = await api.get(`/horarios/${id}`)
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
  },
  
  // Eliminar horario
  delete: async (id) => {
    const response = await api.delete(`/horarios/${id}`)
    return response.data
  },
  
  // Obtener horarios por sucursal
  getBySucursal: async (sucursalId) => {
    const response = await api.get(`/horarios/sucursal/${sucursalId}`)
    return response.data
  },
  
  // Obtener horarios por instructor
  getByInstructor: async (instructorId) => {
    const response = await api.get(`/horarios/instructor/${instructorId}`)
    return response.data
  },
  
  // Obtener horarios por día
  getByDia: async (dia) => {
    const response = await api.get(`/horarios/dia/${dia}`)
    return response.data
  },
  
  // Obtener horarios disponibles (con lugares disponibles)
  getDisponibles: async () => {
    const response = await api.get('/horarios/disponibles')
    return response.data
  },
  
  // Obtener estadísticas de horarios
  getStats: async () => {
    const response = await api.get('/horarios/stats')
    return response.data
  },
  
  // Cambiar estado del horario
  cambiarEstado: async (id, estado) => {
    const response = await api.put(`/horarios/${id}/estado`, { estado })
    return response.data
  },
  
  // Inscribir alumno en horario
  inscribirAlumno: async (id, alumnoId) => {
    const response = await api.post(`/horarios/${id}/inscribir`, { alumnoId })
    return response.data
  },
  
  // Desinscribir alumno de horario
  desinscribirAlumno: async (id, alumnoId) => {
    const response = await api.delete(`/horarios/${id}/desinscribir/${alumnoId}`)
    return response.data
  }
}

// ===== SERVICIOS DE DASHBOARD =====
export const dashboardAPI = {
  // ENDPOINT PRINCIPAL - Resumen rápido para tarjetas
  getResumen: async () => {
    const response = await api.get('/dashboard/resumen')
    return response.data
  },
  
  // Obtener estadísticas generales completas
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
  
  // Obtener actividad reciente (últimos alumnos, pagos, próximos vencimientos)
  getActividadReciente: async (limit = 10) => {
    const response = await api.get('/dashboard/actividad-reciente', { 
      params: { limit } 
    })
    return response.data
  },
  
  // Obtener estadísticas por sucursal
  getSucursalesStats: async () => {
    const response = await api.get('/dashboard/sucursales-stats')
    return response.data
  },
  
  // Obtener comparativa de sucursales (para tabla comparativa)
  getSucursalesComparativa: async () => {
    const response = await api.get('/dashboard/sucursales-comparativa')
    return response.data
  },
  
  // Obtener estadísticas financieras detalladas (Solo Admin)
  getFinanciero: async (year = null, month = null) => {
    const params = {}
    if (year) params.year = year
    if (month) params.month = month
    
    const response = await api.get('/dashboard/financiero', { params })
    return response.data
  },
  
  // Obtener estadísticas de alumnos (distribución por género, edad, sucursal)
  getAlumnosStats: async () => {
    const response = await api.get('/dashboard/alumnos-stats')
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

// ===== SERVICIOS DE EXÁMENES =====
export const examenesAPI = {
  // Obtener todos los exámenes con filtros opcionales
  getAll: async (params = {}) => {
    const response = await api.get('/examenes', { params })
    return response.data
  },
  
  // Obtener examen por ID
  getById: async (id) => {
    const response = await api.get(`/examenes/${id}`)
    return response.data
  },
  
  // Crear examen
  create: async (examenData) => {
    const response = await api.post('/examenes', examenData)
    return response.data
  },
  
  // Actualizar examen
  update: async (id, examenData) => {
    const response = await api.put(`/examenes/${id}`, examenData)
    return response.data
  },
  
  // Eliminar examen (soft delete)
  delete: async (id) => {
    const response = await api.delete(`/examenes/${id}`)
    return response.data
  },
  
  // Inscribir alumno al examen
  inscribirAlumno: async (examenId, inscripcionData) => {
    const response = await api.post(`/examenes/${examenId}/inscribir`, inscripcionData)
    return response.data
  },
  
  // Desinscribir alumno del examen
  desinscribirAlumno: async (examenId, alumnoId) => {
    const response = await api.delete(`/examenes/${examenId}/alumnos/${alumnoId}`)
    return response.data
  },
  
  // Registrar pago de examen
  registrarPago: async (examenId, pagoData) => {
    const response = await api.post(`/examenes/${examenId}/pago`, pagoData)
    return response.data
  },
  
  // Obtener alumnos elegibles para el examen
  getAlumnosElegibles: async (examenId) => {
    const response = await api.get(`/examenes/${examenId}/alumnos-elegibles`)
    return response.data
  },
  
  // Cambiar estado del examen
  cambiarEstado: async (examenId, estado) => {
    const response = await api.put(`/examenes/${examenId}/estado`, { estado })
    return response.data
  },
  
  // Obtener estadísticas
  getEstadisticas: async (params = {}) => {
    const response = await api.get('/examenes/estadisticas', { params })
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

// ===== CONSTANTES DE ASISTENCIAS =====
export const ASISTENCIA_ESTADOS = [
  { value: 'presente', label: 'Presente', color: 'green' },
  { value: 'ausente', label: 'Ausente', color: 'red' },
  { value: 'retardo', label: 'Retardo', color: 'yellow' },
  { value: 'justificado', label: 'Justificado', color: 'blue' }
]

export const ASISTENCIA_ESTADOS_DISPLAY = {
  'presente': 'Presente',
  'ausente': 'Ausente',
  'retardo': 'Retardo',
  'justificado': 'Justificado'
}

export const ASISTENCIA_ESTADOS_COLORS = {
  'presente': {
    bg: 'bg-green-100',
    border: 'border-green-500',
    text: 'text-green-800',
    badge: 'bg-green-500'
  },
  'ausente': {
    bg: 'bg-red-100',
    border: 'border-red-500',
    text: 'text-red-800',
    badge: 'bg-red-500'
  },
  'retardo': {
    bg: 'bg-yellow-100',
    border: 'border-yellow-500',
    text: 'text-yellow-800',
    badge: 'bg-yellow-500'
  },
  'justificado': {
    bg: 'bg-blue-100',
    border: 'border-blue-500',
    text: 'text-blue-800',
    badge: 'bg-blue-500'
  }
}

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