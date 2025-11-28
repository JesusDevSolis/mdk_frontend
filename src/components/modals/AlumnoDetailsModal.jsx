import React from 'react'
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Heart,
  Award,
  Building2,
  UserCheck,
  AlertCircle,
  Clock,
  Users,
  FileText,
  Settings,
  Edit3,
  Camera,
  GraduationCap
} from 'lucide-react'
import { utils, BELT_LEVELS_DISPLAY, GENDER_OPTIONS, STATUS_OPTIONS } from '../../services/APIservice'

// Importar sistema de permisos
import { usePermissions } from '../../hooks/usePermissions'
import PermissionGuard from '../../components/auth/PermissionGuard'

const AlumnoDetailsModal = ({ alumno, isOpen, onClose, onEdit }) => {
  // Hook de permisos
  const { canUpdate } = usePermissions('alumnos')
  
  if (!isOpen || !alumno) return null

  // FUNCIÓN PRINCIPAL PARA CALCULAR EDAD
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // FUNCIÓN PARA OBTENER INFO DE EDAD
  const getAgeInfo = () => {
    if (!alumno.dateOfBirth) return { age: 'No especificada', isMinor: false }
    
    const ageNumber = calculateAge(alumno.dateOfBirth)
    if (ageNumber === null) return { age: 'No especificada', isMinor: false }
    
    return { 
      age: `${ageNumber} años`, 
      isMinor: ageNumber < 18 
    }
  }

  const { age, isMinor } = getAgeInfo()

  const getBeltInfo = () => {
    if (!alumno.belt?.level) return { color: '#CCCCCC', display: 'Sin cinturón' }
    return {
      color: utils.getBeltColor ? utils.getBeltColor(alumno.belt.level) : '#6B7280',
      display: BELT_LEVELS_DISPLAY ? (BELT_LEVELS_DISPLAY[alumno.belt.level] || alumno.belt.level) : alumno.belt.level
    }
  }

  const beltInfo = getBeltInfo()

  const getGenderDisplay = () => {
    if (!alumno.gender) return 'No especificado'
    if (GENDER_OPTIONS) {
      const genderOption = GENDER_OPTIONS.find(opt => opt.value === alumno.gender)
      return genderOption ? genderOption.label : alumno.gender
    }
    return alumno.gender
  }

  const getStatusDisplay = () => {
    const status = alumno.enrollment?.status || 'inactivo'
    if (STATUS_OPTIONS) {
      const statusOption = STATUS_OPTIONS.find(opt => opt.value === status)
      return statusOption ? statusOption.label : status
    }
    return status
  }

  const getStatusColor = () => {
    const status = alumno.enrollment?.status || 'inactivo'
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800'
      case 'inactivo': return 'bg-red-100 text-red-800'
      case 'suspendido': return 'bg-yellow-100 text-yellow-800'
      case 'graduado': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            {/* Foto de perfil */}
            <div className="relative">
              {alumno.profilePhotoUrl ? (
                <img 
                  src={alumno.profilePhotoUrl} 
                  alt={`Foto de ${alumno.fullName}`}
                  className="w-16 h-16 object-cover border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Información principal */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {alumno.fullName || `${alumno.firstName} ${alumno.lastName}`}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {getStatusDisplay()}
                </span>
                <span>ID: {alumno.enrollment?.studentId || 'Sin ID'}</span>
                <span>{age}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* ✅ CORREGIDO: Botón Editar con permisos */}
            <PermissionGuard module="alumnos" action="update">
              <button
                onClick={() => {
                  console.log('🔍 DATOS COMPLETOS DEL ALUMNO PARA EDITAR:', alumno) 
                  onClose() 
                  onEdit(alumno)
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
            </PermissionGuard>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-gray-900">{alumno.firstName || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Apellidos</label>
                      <p className="text-gray-900">{alumno.lastName || 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
                      <p className="text-gray-900">{formatDate(alumno.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Edad</label>
                      <p className="text-gray-900">{age}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Género</label>
                    <p className="text-gray-900">{getGenderDisplay()}</p>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contacto
                </h3>
                <div className="space-y-3">
                  {alumno.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{alumno.email}</span>
                    </div>
                  )}
                  {alumno.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900">{alumno.phone}</span>
                    </div>
                  )}
                  {alumno.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-gray-900">
                          {[
                            alumno.address.street,
                            alumno.address.neighborhood,
                            alumno.address.city,
                            alumno.address.state,
                            alumno.address.zipCode
                          ].filter(Boolean).join(', ') || 'Dirección no especificada'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información del Tutor */}
              {alumno.tutor && (
                <div className="bg-blue-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Tutor/Responsable
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre del Tutor</label>
                      <p className="text-gray-900">
                        {typeof alumno.tutor === 'object' && alumno.tutor.firstName 
                          ? `${alumno.tutor.firstName} ${alumno.tutor.lastName}`
                          : 'Información no disponible'
                        }
                      </p>
                    </div>
                    {alumno.relationshipToTutor && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Relación</label>
                        <p className="text-gray-900 capitalize">{alumno.relationshipToTutor}</p>
                      </div>
                    )}
                    {typeof alumno.tutor === 'object' && alumno.tutor.phones?.primary && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Teléfono del Tutor</label>
                        <p className="text-gray-900">{alumno.tutor.phones.primary}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contacto de Emergencia */}
              {alumno.emergencyContact && (
                <div className="bg-red-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Contacto de Emergencia
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nombre</label>
                      <p className="text-gray-900">{alumno.emergencyContact.name || 'No especificado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Relación</label>
                      <p className="text-gray-900">{alumno.emergencyContact.relationship || 'No especificada'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Teléfono</label>
                      <p className="text-gray-900">{alumno.emergencyContact.phone || 'No especificado'}</p>
                    </div>
                    {alumno.emergencyContact.email && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Email</label>
                        <p className="text-gray-900">{alumno.emergencyContact.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Información Académica */}
              <div className="bg-yellow-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Información Académica
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cinturón Actual</label>
                    <div className="flex items-center gap-3 mt-1">
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: beltInfo.color }}
                      ></div>
                      <span className="text-gray-900 font-medium capitalize">{beltInfo.display}</span>
                    </div>
                  </div>
                  {alumno.belt?.dateObtained && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Fecha de Obtención</label>
                      <p className="text-gray-900">{formatDate(alumno.belt.dateObtained)}</p>
                    </div>
                  )}
                  {alumno.belt?.certifiedBy && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Certificado por</label>
                      <p className="text-gray-900">
                        {typeof alumno.belt.certifiedBy === 'object' && alumno.belt.certifiedBy.name
                          ? alumno.belt.certifiedBy.name
                          : 'Instructor no especificado'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Matrícula */}
              <div className="bg-green-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Matrícula
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sucursal</label>
                    <p className="text-gray-900">
                      {typeof alumno.enrollment?.sucursal === 'object' 
                        ? alumno.enrollment.sucursal.name 
                        : 'Sucursal no especificada'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Inscripción</label>
                    <p className="text-gray-900">{formatDate(alumno.enrollment?.enrollmentDate)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cuota Mensual</label>
                      <p className="text-gray-900">
                        ${alumno.enrollment?.monthlyFee || 0} MXN
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cuota de Inscripción</label>
                      <p className="text-gray-900">
                        ${alumno.enrollment?.registrationFee || 0} MXN
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Médica */}
              {alumno.medicalInfo && (
                <div className="bg-purple-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Información Médica
                  </h3>
                  <div className="space-y-3">
                    {alumno.medicalInfo.bloodType && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tipo de Sangre</label>
                        <p className="text-gray-900">{alumno.medicalInfo.bloodType}</p>
                      </div>
                    )}
                    {alumno.medicalInfo.allergies && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Alergias</label>
                        <p className="text-gray-900">{alumno.medicalInfo.allergies}</p>
                      </div>
                    )}
                    {alumno.medicalInfo.medications && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Medicamentos</label>
                        <p className="text-gray-900">{alumno.medicalInfo.medications}</p>
                      </div>
                    )}
                    {alumno.medicalInfo.medicalConditions && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Condiciones Médicas</label>
                        <p className="text-gray-900">{alumno.medicalInfo.medicalConditions}</p>
                      </div>
                    )}
                    {alumno.medicalInfo.doctorName && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Doctor</label>
                        <p className="text-gray-900">{alumno.medicalInfo.doctorName}</p>
                        {alumno.medicalInfo.doctorPhone && (
                          <p className="text-sm text-gray-600">{alumno.medicalInfo.doctorPhone}</p>
                        )}
                      </div>
                    )}
                    {alumno.medicalInfo.insuranceInfo && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Seguro Médico</label>
                        <p className="text-gray-900">{alumno.medicalInfo.insuranceInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estadísticas */}
              {alumno.stats && (
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Estadísticas
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-primary-600">
                        {alumno.stats.attendanceCount || 0}
                      </p>
                      <p className="text-sm text-gray-600">Asistencias</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {alumno.stats.attendancePercentage || 0}%
                      </p>
                      <p className="text-sm text-gray-600">Asistencia</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {alumno.stats.graduationTests?.passed || 0}
                      </p>
                      <p className="text-sm text-gray-600">Exámenes Aprobados</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {alumno.stats.competitions?.participated || 0}
                      </p>
                      <p className="text-sm text-gray-600">Competencias</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              {alumno.notes && (
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notas
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{alumno.notes}</p>
                </div>
              )}

              {/* Información de Auditoría */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Información del Sistema
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Registrado: {formatDateTime(alumno.createdAt)}</p>
                  <p>Última modificación: {formatDateTime(alumno.updatedAt)}</p>
                  {typeof alumno.createdBy === 'object' && alumno.createdBy.name && (
                    <p>Creado por: {alumno.createdBy.name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlumnoDetailsModal