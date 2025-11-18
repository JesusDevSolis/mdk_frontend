import React from 'react'
import { 
    X, 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    Calendar, 
    Award,
    Building2,
    Clock,
    FileText,
    Edit3,
    Shield,
    GraduationCap,
    Briefcase,
    Languages,
    Star,
    CheckCircle,
    XCircle,
    TrendingUp
} from 'lucide-react'

const InstructorDetailsModal = ({ instructor, isOpen, onClose, onEdit }) => {
    if (!isOpen || !instructor) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada'
        return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
        })
    }

    const getBeltDisplay = (belt) => {
        if (!belt) return 'Sin cinturón'
        
        const beltNames = {
        'blanco': 'Cinta Blanca',
        'amarillo': 'Cinta Amarilla',
        'verde': 'Cinta Verde',
        'azul': 'Cinta Azul',
        'rojo': 'Cinta Roja',
        'negro_1dan': 'Cinta Negra 1° Dan',
        'negro_2dan': 'Cinta Negra 2° Dan',
        'negro_3dan': 'Cinta Negra 3° Dan',
        'negro_4dan': 'Cinta Negra 4° Dan',
        'negro_5dan': 'Cinta Negra 5° Dan',
        'negro_6dan': 'Cinta Negra 6° Dan',
        'negro_7dan': 'Cinta Negra 7° Dan',
        'negro_8dan': 'Cinta Negra 8° Dan',
        'negro_9dan': 'Cinta Negra 9° Dan'
        }
        
        return beltNames[belt] || belt
    }

    const getBeltColor = (belt) => {
        if (!belt) return 'bg-gray-100 text-gray-800'
        
        if (belt === 'blanco') return 'bg-white text-gray-800 border border-gray-300'
        if (belt === 'amarillo') return 'bg-yellow-100 text-yellow-800'
        if (belt === 'verde') return 'bg-green-100 text-green-800'
        if (belt === 'azul') return 'bg-blue-100 text-blue-800'
        if (belt === 'rojo') return 'bg-red-100 text-red-800'
        if (belt.includes('negro')) return 'bg-black text-white'
        
        return 'bg-gray-100 text-gray-800'
    }

    const getContractTypeDisplay = (type) => {
        const types = {
        'tiempo_completo': 'Tiempo Completo',
        'medio_tiempo': 'Medio Tiempo',
        'por_horas': 'Por Horas',
        'freelance': 'Freelance'
        }
        return types[type] || type
    }

    const getSpecialtyDisplay = (specialty) => {
        const specialties = {
        'poomsae': 'Poomsae',
        'combate': 'Combate',
        'defensa_personal': 'Defensa Personal',
        'acrobacia': 'Acrobacia',
        'ninos': 'Niños',
        'adultos': 'Adultos',
        'competencia': 'Competencia',
        'tradicional': 'Tradicional'
        }
        return specialties[specialty] || specialty
    }

    const instructorInfo = instructor.instructorInfo || {}

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl w-full max-w-4xl my-8">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-t-xl">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
                <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-blue-600">
                    {instructor.name.charAt(0).toUpperCase()}
                </span>
                </div>
                
                <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-1">{instructor.name}</h2>
                <div className="flex items-center gap-2 text-blue-100">
                    <Mail className="w-4 h-4" />
                    <span>{instructor.email}</span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    instructor.isActive
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                    {instructor.isActive ? (
                        <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Activo
                        </>
                    ) : (
                        <>
                        <XCircle className="w-4 h-4 mr-1" />
                        Inactivo
                        </>
                    )}
                    </span>
                    {instructorInfo.belt && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBeltColor(instructorInfo.belt)}`}>
                        <Award className="w-4 h-4 mr-1" />
                        {getBeltDisplay(instructorInfo.belt)}
                    </span>
                    )}
                </div>
                </div>

                {onEdit && (
                <button
                    onClick={() => onEdit(instructor)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                    <Edit3 className="w-5 h-5 text-white" />
                </button>
                )}
            </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-gray-900 font-medium">{instructor.phone || 'No especificado'}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                    <p className="text-sm text-gray-500">Sucursal</p>
                    <p className="text-gray-900 font-medium">{instructor.sucursal?.name || 'Sin asignar'}</p>
                    </div>
                </div>

                {instructor.address && (
                    <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-500">Dirección</p>
                        <p className="text-gray-900 font-medium">{instructor.address}</p>
                    </div>
                    </div>
                )}
                </div>
            </div>

            {/* Información Profesional */}
            {(instructorInfo.belt || instructorInfo.certificationNumber || instructorInfo.certifyingOrganization) && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Certificación y Grado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {instructorInfo.belt && (
                    <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Cinturón</p>
                        <p className="text-gray-900 font-medium">{getBeltDisplay(instructorInfo.belt)}</p>
                        </div>
                    </div>
                    )}

                    {instructorInfo.danGrade && (
                    <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Grado Dan</p>
                        <p className="text-gray-900 font-medium">{instructorInfo.danGrade}° Dan</p>
                        </div>
                    </div>
                    )}

                    {instructorInfo.certificationNumber && (
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Número de Certificación</p>
                        <p className="text-gray-900 font-medium">{instructorInfo.certificationNumber}</p>
                        </div>
                    </div>
                    )}

                    {instructorInfo.certificationDate && (
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Fecha de Certificación</p>
                        <p className="text-gray-900 font-medium">{formatDate(instructorInfo.certificationDate)}</p>
                        </div>
                    </div>
                    )}

                    {instructorInfo.certifyingOrganization && (
                    <div className="flex items-start gap-3 md:col-span-2">
                        <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Organización Certificadora</p>
                        <p className="text-gray-900 font-medium">{instructorInfo.certifyingOrganization}</p>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Especialidades */}
            {instructorInfo.specialties && instructorInfo.specialties.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    Especialidades
                </h3>
                <div className="flex flex-wrap gap-2">
                    {instructorInfo.specialties.map((specialty, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                        {getSpecialtyDisplay(specialty)}
                    </span>
                    ))}
                </div>
                </div>
            )}

            {/* Experiencia */}
            {(instructorInfo.yearsOfExperience || instructorInfo.teachingExperience) && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Experiencia
                </h3>
                <div className="space-y-4">
                    {instructorInfo.yearsOfExperience > 0 && (
                    <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Años de Experiencia</p>
                        <p className="text-gray-900 font-medium">{instructorInfo.yearsOfExperience} años</p>
                        </div>
                    </div>
                    )}

                    {instructorInfo.teachingExperience && (
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Experiencia de Enseñanza</p>
                        <p className="text-gray-900">{instructorInfo.teachingExperience}</p>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Información Laboral */}
            {instructorInfo.contractType && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Información Laboral
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-sm text-gray-500">Tipo de Contrato</p>
                        <p className="text-gray-900 font-medium">{getContractTypeDisplay(instructorInfo.contractType)}</p>
                    </div>
                    </div>

                    {instructorInfo.hireDate && (
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                        <p className="text-sm text-gray-500">Fecha de Contratación</p>
                        <p className="text-gray-900 font-medium">{formatDate(instructorInfo.hireDate)}</p>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            )}

            {/* Biografía */}
            {instructorInfo.bio && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Biografía
                </h3>
                <p className="text-gray-700 leading-relaxed">{instructorInfo.bio}</p>
                </div>
            )}

            {/* Idiomas */}
            {instructorInfo.languages && instructorInfo.languages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-blue-600" />
                    Idiomas
                </h3>
                <div className="flex flex-wrap gap-2">
                    {instructorInfo.languages.map((language, index) => (
                    <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                        {language}
                    </span>
                    ))}
                </div>
                </div>
            )}

            {/* Disponibilidad */}
            {instructorInfo.availability && (
                <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Disponibilidad Semanal
                </h3>
                <div className="space-y-2">
                    {Object.entries({
                    monday: 'Lunes',
                    tuesday: 'Martes',
                    wednesday: 'Miércoles',
                    thursday: 'Jueves',
                    friday: 'Viernes',
                    saturday: 'Sábado',
                    sunday: 'Domingo'
                    }).map(([key, label]) => {
                    const dayInfo = instructorInfo.availability[key]
                    if (!dayInfo) return null

                    return (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <span className="font-medium text-gray-700 w-32">{label}</span>
                        {dayInfo.available ? (
                            <span className="flex-1 text-gray-900">
                            {dayInfo.hours || 'Disponible (horario no especificado)'}
                            </span>
                        ) : (
                            <span className="flex-1 text-gray-400 italic">No disponible</span>
                        )}
                        </div>
                    )
                    })}
                </div>
                </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                    <p className="text-gray-900 font-medium">{formatDate(instructor.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                    <p className="text-sm text-gray-500">Última Actualización</p>
                    <p className="text-gray-900 font-medium">{formatDate(instructor.updatedAt)}</p>
                    </div>
                </div>
                </div>
            </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
                Cerrar
            </button>
            {onEdit && (
                <button
                onClick={() => onEdit(instructor)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                <Edit3 className="w-5 h-5" />
                Editar Instructor
                </button>
            )}
            </div>
        </div>
        </div>
    )
}

export default InstructorDetailsModal