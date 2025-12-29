import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Calendar,
    Award,
    MapPin,
    Phone,
    Mail,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    BarChart3,
    Download,
    ClipboardCheck // ✅ NUEVO: Importar ClipboardCheck
} from 'lucide-react';
import { asistenciasAPI, ASISTENCIA_ESTADOS_COLORS } from '../../services/APIservice';
import LoadingSpinner from '../common/LoadingSpinner';

// ✅ NUEVO: Recibir configuraciones y función de estado automático como props
const AsistenciaModal = ({ alumno, onClose, configuraciones, onEstadoAutomatico }) => {
    const [historial, setHistorial] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroFecha, setFiltroFecha] = useState({
        fechaInicio: '',
        fechaFin: ''
    });

    useEffect(() => {
        if (alumno?._id) {
            loadAsistenciasAlumno();
        }
    }, [alumno, filtroFecha]);

    const loadAsistenciasAlumno = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filtroFecha.fechaInicio) params.fechaInicio = filtroFecha.fechaInicio;
            if (filtroFecha.fechaFin) params.fechaFin = filtroFecha.fechaFin;

            console.log('📥 Cargando historial para alumno:', alumno._id, params);

            const response = await asistenciasAPI.getByAlumno(alumno._id, params);
            
            console.log('📦 Respuesta completa del historial:', response);

            // Manejar diferentes estructuras de respuesta
            let asistencias = [];
            if (Array.isArray(response)) {
                asistencias = response;
            } else if (response?.data && Array.isArray(response.data)) {
                asistencias = response.data;
            } else if (response?.data) {
                asistencias = [response.data];
            }
            
            console.log('📋 Asistencias procesadas:', asistencias.length, asistencias);
            
            setHistorial(asistencias);
            calcularEstadisticas(asistencias);
        } catch (error) {
            console.error('❌ Error al cargar asistencias del alumno:', error);
            console.error('❌ Detalles del error:', error.response?.data);
            
            // Si es error 400/404, puede que no haya asistencias registradas
            const status = error.response?.status;
            if (status === 400 || status === 404) {
                console.log('ℹ️ No hay historial de asistencias para este alumno');
                setHistorial([]);
                calcularEstadisticas([]);
            } else {
                setError('Error al cargar el historial de asistencias');
            }
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadisticas = (asistencias) => {
        const total = asistencias.length;
        const presente = asistencias.filter(a => a.estado === 'presente').length;
        const ausente = asistencias.filter(a => a.estado === 'ausente').length;
        const retardo = asistencias.filter(a => a.estado === 'retardo').length;
        const justificado = asistencias.filter(a => a.estado === 'justificado').length;
        
        const porcentajeAsistencia = total > 0 
            ? Math.round(((presente + retardo) / total) * 100) 
            : 0;

        setEstadisticas({
            total,
            presente,
            ausente,
            retardo,
            justificado,
            porcentajeAsistencia
        });
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltroFecha(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const limpiarFiltros = () => {
        setFiltroFecha({
            fechaInicio: '',
            fechaFin: ''
        });
    };

    const getEstadoColor = (estado) => {
        return ASISTENCIA_ESTADOS_COLORS[estado] || ASISTENCIA_ESTADOS_COLORS['ausente'];
    };

    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'presente':
                return <CheckCircle className="h-5 w-5" />;
            case 'ausente':
                return <XCircle className="h-5 w-5" />;
            case 'retardo':
                return <Clock className="h-5 w-5" />;
            case 'justificado':
                return <FileText className="h-5 w-5" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-MX', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPorcentajeColor = (porcentaje) => {
        if (porcentaje >= 90) return 'text-green-600';
        if (porcentaje >= 75) return 'text-yellow-600';
        return 'text-red-600';
    };

    const formatBeltLevel = (level) => {
        if (!level) return 'Sin cinturón';
        return level.charAt(0).toUpperCase() + level.slice(1).replace('-', ' ');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                                {alumno.profilePhoto?.url ? (
                                    <img
                                        src={`http://localhost:3005${alumno.profilePhoto.url}`}
                                        alt={`${alumno.firstName} ${alumno.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-white" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-1">
                                    {alumno.firstName} {alumno.lastName}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    Historial y Estadísticas de Asistencia
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Información Básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">Matrícula</span>
                            </div>
                            <p className="font-semibold text-gray-800">
                                {alumno.enrollment?.studentId || 'Sin matrícula'}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Award className="h-4 w-4" />
                                <span className="text-sm">Cinturón Actual</span>
                            </div>
                            <p className="font-semibold text-gray-800">
                                {formatBeltLevel(alumno.belt?.level)}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">Email</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm truncate">
                                {alumno.email || 'No registrado'}
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">Teléfono</span>
                            </div>
                            <p className="font-semibold text-gray-800">
                                {alumno.phone || 'No registrado'}
                            </p>
                        </div>
                    </div>

                    {/* ✅ NUEVO: Badge de Información de Configuraciones */}
                    {configuraciones && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Política de Asistencias</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Tolerancia de retardo:</span>
                                    <span className="ml-2 font-semibold text-blue-600">
                                        {configuraciones.toleranciaRetardo} minutos
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Días para justificar:</span>
                                    <span className="ml-2 font-semibold text-blue-600">
                                        {configuraciones.diasJustificar} días
                                    </span>
                                </div>
                                {configuraciones.requiereJustificante && (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <span className="text-sm font-medium">Justificante requerido</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 bg-red-50 rounded-lg">
                            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={loadAsistenciasAlumno}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Estadísticas Generales */}
                            {estadisticas && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Estadísticas Generales
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                                            <p className="text-3xl font-bold text-blue-600">
                                                {estadisticas.total}
                                            </p>
                                            <p className="text-sm text-blue-800">Total Clases</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                                            <p className="text-3xl font-bold text-green-600">
                                                {estadisticas.presente}
                                            </p>
                                            <p className="text-sm text-green-800">Presentes</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
                                            <p className="text-3xl font-bold text-yellow-600">
                                                {estadisticas.retardo}
                                            </p>
                                            <p className="text-sm text-yellow-800">Retardos</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                                            <p className="text-3xl font-bold text-purple-600">
                                                {estadisticas.justificado}
                                            </p>
                                            <p className="text-sm text-purple-800">Justificadas</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
                                            <p className="text-3xl font-bold text-red-600">
                                                {estadisticas.ausente}
                                            </p>
                                            <p className="text-sm text-red-800">Ausencias</p>
                                        </div>
                                    </div>

                                    {/* Barra de Porcentaje */}
                                    {estadisticas.total > 0 && (
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Porcentaje de Asistencia
                                                </span>
                                                <span className={`text-2xl font-bold ${getPorcentajeColor(estadisticas.porcentajeAsistencia)}`}>
                                                    {estadisticas.porcentajeAsistencia}%
                                                </span>
                                            </div>
                                            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                                {estadisticas.presente > 0 && (
                                                    <div
                                                        className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ width: `${(estadisticas.presente / estadisticas.total) * 100}%` }}
                                                    >
                                                        {estadisticas.presente > 0 && (
                                                            <span>{Math.round((estadisticas.presente / estadisticas.total) * 100)}%</span>
                                                        )}
                                                    </div>
                                                )}
                                                {estadisticas.retardo > 0 && (
                                                    <div
                                                        className="bg-yellow-500 flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ width: `${(estadisticas.retardo / estadisticas.total) * 100}%` }}
                                                    >
                                                        {estadisticas.retardo > 0 && (
                                                            <span>{Math.round((estadisticas.retardo / estadisticas.total) * 100)}%</span>
                                                        )}
                                                    </div>
                                                )}
                                                {estadisticas.justificado > 0 && (
                                                    <div
                                                        className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ width: `${(estadisticas.justificado / estadisticas.total) * 100}%` }}
                                                    >
                                                        {estadisticas.justificado > 0 && (
                                                            <span>{Math.round((estadisticas.justificado / estadisticas.total) * 100)}%</span>
                                                        )}
                                                    </div>
                                                )}
                                                {estadisticas.ausente > 0 && (
                                                    <div
                                                        className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold"
                                                        style={{ width: `${(estadisticas.ausente / estadisticas.total) * 100}%` }}
                                                    >
                                                        {estadisticas.ausente > 0 && (
                                                            <span>{Math.round((estadisticas.ausente / estadisticas.total) * 100)}%</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-center gap-4 mt-3 text-xs">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span> Presente
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Retardo
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Justificado
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span> Ausente
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Filtros de Fecha */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Inicio
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaInicio"
                                            value={filtroFecha.fechaInicio}
                                            onChange={handleFiltroChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha Fin
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaFin"
                                            value={filtroFecha.fechaFin}
                                            onChange={handleFiltroChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={limpiarFiltros}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>

                            {/* Historial de Asistencias */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-gray-700" />
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Historial de Asistencias
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            ({historial.length} registros)
                                        </span>
                                    </div>
                                </div>

                                {historial.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium mb-2">
                                            No hay registros de asistencia
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {(filtroFecha.fechaInicio || filtroFecha.fechaFin) 
                                                ? 'No se encontraron registros en el rango de fechas seleccionado'
                                                : 'Este alumno aún no tiene asistencias registradas en el sistema'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Fecha
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Horario
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Instructor
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Estado
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Hora Registro
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                                            Notas
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {historial.map((asistencia, index) => {
                                                        const colors = getEstadoColor(asistencia.estado);
                                                        return (
                                                            <tr key={asistencia._id || index} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                                    {formatFecha(asistencia.fecha)}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                                    {asistencia.horario?.nombre || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                                    {asistencia.instructor?.name || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {/* ✅ NUEVO: Badge de Estado con Tooltip de Tolerancia */}
                                                                    <div className="relative group">
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                                                                            {getEstadoIcon(asistencia.estado)}
                                                                            {asistencia.estado.charAt(0).toUpperCase() + asistencia.estado.slice(1)}
                                                                        </span>
                                                                        
                                                                        {/* Tooltip con info de tolerancia */}
                                                                        {asistencia.estado === 'retardo' && asistencia.horaRegistro && configuraciones && (
                                                                            <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                                                                                <p>Llegada: {asistencia.horaRegistro}</p>
                                                                                <p>Tolerancia: {configuraciones.toleranciaRetardo} min</p>
                                                                                <p className="mt-1 text-yellow-300">Dentro del límite permitido</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {asistencia.horaRegistro || 'N/A'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {asistencia.notas || '-'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsistenciaModal;