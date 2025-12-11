import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Calendar, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    FileText,
    Filter,
    ChevronDown,
    ChevronUp,
    Save,
    User,
    MapPin,
    Award,
    RotateCcw
} from 'lucide-react';
import { 
    horariosAPI, 
    sucursalesAPI, 
    instructoresAPI,
    asistenciasAPI,
    ASISTENCIA_ESTADOS_COLORS 
} from '../../services/APIservice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AsistenciaModal from '../../components/modals/AsistenciaModal';

const AsistenciasPage = () => {
    // Estados principales
    const [horarios, setHorarios] = useState([]);
    const [sucursales, setSucursales] = useState([]);
    const [instructores, setInstructores] = useState([]);
    const [selectedHorario, setSelectedHorario] = useState(null);
    const [alumnosInscritos, setAlumnosInscritos] = useState([]);
    const [asistenciasRegistradas, setAsistenciasRegistradas] = useState([]);
    const [asistenciasTemp, setAsistenciasTemp] = useState({});
    
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [loadingAlumnos, setLoadingAlumnos] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Estados de filtros
    const [filters, setFilters] = useState({
        horarioId: '',
        fecha: new Date().toLocaleString("en-CA", {timeZone: "America/Mexico_City"}).split(',')[0], // Fecha México
        sucursal: '',
        instructor: ''
    });

    // Estados del modal
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // ✅ NUEVO: Recargar horarios cuando cambian filtros de sucursal o instructor
    useEffect(() => {
        const recargarHorarios = async () => {
            try {
                const params = { estado: 'activo' };
                
                if (filters.sucursalId) {
                    params.sucursal = filters.sucursalId;
                }
                
                if (filters.instructorId) {
                    params.instructor = filters.instructorId;
                }
                
                const horariosData = await horariosAPI.getAll(params);
                
                let horariosArray = [];
                if (Array.isArray(horariosData)) {
                    horariosArray = horariosData;
                } else if (Array.isArray(horariosData?.data)) {
                    horariosArray = horariosData.data;
                }
                
                setHorarios(horariosArray);
                
                // Si el horario actual no está en la nueva lista, limpiar selección
                if (filters.horarioId && !horariosArray.find(h => h._id === filters.horarioId)) {
                    setFilters(prev => ({
                        ...prev,
                        horarioId: horariosArray[0]?._id || ''
                    }));
                }
            } catch (error) {
                console.error('Error recargando horarios:', error);
            }
        };
        
        // Solo recargar si hay cambios en sucursal o instructor
        if (filters.sucursalId || filters.instructorId) {
            recargarHorarios();
        }
    }, [filters.sucursalId, filters.instructorId]);

    // Cargar alumnos cuando se selecciona un horario
    useEffect(() => {
        if (filters.horarioId && filters.fecha) {
        loadAlumnosAndAsistencias();
        } else {
        setAlumnosInscritos([]);
        setAsistenciasRegistradas([]);
        setAsistenciasTemp({});
        }
    }, [filters.horarioId, filters.fecha]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
        const [horariosData, sucursalesData, instructoresData] = await Promise.all([
            horariosAPI.getAll({ estado: 'activo' }),
            sucursalesAPI.getAll(),
            instructoresAPI.getAll({ status: 'activo' })
        ]);

        // Procesar horarios
        let horariosArray = [];
        if (Array.isArray(horariosData)) {
            horariosArray = horariosData;
        } else if (horariosData?.data) {
            horariosArray = Array.isArray(horariosData.data) ? horariosData.data : [];
        }

        // Procesar sucursales (Backend: {success: true, data: {sucursales: [...]}})
        let sucursalesArray = [];
        if (Array.isArray(sucursalesData)) {
            sucursalesArray = sucursalesData;
        } else if (sucursalesData?.data?.sucursales) {
            sucursalesArray = sucursalesData.data.sucursales;
        } else if (Array.isArray(sucursalesData?.data)) {
            sucursalesArray = sucursalesData.data;
        }

        // Procesar instructores (Backend: {success: true, data: [...]})
        let instructoresArray = [];
        if (Array.isArray(instructoresData)) {
            instructoresArray = instructoresData;
        } else if (Array.isArray(instructoresData?.data)) {
            instructoresArray = instructoresData.data;
        }

        setHorarios(horariosArray);
        setSucursales(sucursalesArray);
        setInstructores(instructoresArray);
        
        console.log('✅ Datos cargados:', {
            horarios: horariosArray.length,
            sucursales: sucursalesArray.length,
            instructores: instructoresArray.length
        });

        // DEBUG: Ver estructura de datos
        if (sucursalesArray.length > 0) {
            console.log('📊 Primera Sucursal completa:', sucursalesArray[0]);
        }
        if (instructoresArray.length > 0) {
            console.log('📊 Primer Instructor completo:', instructoresArray[0]);
        }
        if (horariosArray.length > 0) {
            console.log('📊 Primer Horario completo:', horariosArray[0]);
        }

        // Seleccionar automáticamente el horario actual si hay horarios disponibles
        if (horariosArray.length > 0) {
            const horarioActual = encontrarHorarioActual(horariosArray);
            if (horarioActual) {
                setFilters(prev => ({
                    ...prev,
                    horarioId: horarioActual._id
                }));
                console.log('🎯 Horario actual seleccionado:', horarioActual.nombre);
            } else {
                // Si no hay horario actual, seleccionar el primero
                setFilters(prev => ({
                    ...prev,
                    horarioId: horariosArray[0]._id
                }));
                console.log('📌 Primer horario seleccionado:', horariosArray[0].nombre);
            }
        }

        } catch (error) {
        console.error('❌ Error al cargar datos iniciales:', error);
        setError('Error al cargar los datos iniciales');
        setHorarios([]);
        setSucursales([]);
        setInstructores([]);
        } finally {
        setLoading(false);
        }
    };

    const loadAlumnosAndAsistencias = async () => {
        setLoadingAlumnos(true);
        setError(null);
        try {
        console.log('📥 Cargando datos para horario:', filters.horarioId, 'fecha:', filters.fecha);
        
        // Obtener el horario seleccionado
        const horarioData = await horariosAPI.getById(filters.horarioId);
        const horario = horarioData.data || horarioData;
        setSelectedHorario(horario);
        console.log('✅ Horario cargado:', horario);

        // ✅ CORRECCIÓN: Obtener alumnos inscritos y filtrar solo activos
        const inscripciones = horario.alumnosInscritos || [];
        
        // Filtrar solo inscripciones activas y que tengan el alumno poblado
        const alumnosActivos = inscripciones.filter(inscripcion => {
            // Verificar que esté activo
            if (inscripcion.activo !== true) return false;
            
            // Verificar que tenga datos del alumno poblados
            if (!inscripcion.alumno || typeof inscripcion.alumno !== 'object') return false;
            
            return true;
        });
        
        setAlumnosInscritos(alumnosActivos);
        console.log('👥 Alumnos inscritos (activos):', alumnosActivos.length);
        console.log('📋 Estructura de alumno:', alumnosActivos[0]);

        // Obtener asistencias ya registradas para esta fecha
        try {
            console.log('🔍 Buscando asistencias existentes para horario:', filters.horarioId, 'fecha:', filters.fecha);
            
            const asistenciasData = await asistenciasAPI.getByHorario(filters.horarioId, {
                fecha: filters.fecha
            });

            console.log('📦 Respuesta de asistencias:', asistenciasData);

            const asistencias = Array.isArray(asistenciasData) 
                ? asistenciasData 
                : (asistenciasData.data || []);
            
            setAsistenciasRegistradas(asistencias);
            console.log('📋 Asistencias registradas encontradas:', asistencias.length);

            // ✅ CORRECCIÓN: Inicializar asistencias temporales con las ya registradas
            const tempAsistencias = {};
            if (Array.isArray(asistencias) && asistencias.length > 0) {
                asistencias.forEach(asistencia => {
                    // El alumno puede venir como objeto poblado o como ID string
                    let alumnoId;
                    if (typeof asistencia.alumno === 'object' && asistencia.alumno !== null) {
                        alumnoId = asistencia.alumno._id?.toString() || asistencia.alumno.toString();
                    } else {
                        alumnoId = asistencia.alumno?.toString();
                    }
                    
                    if (alumnoId) {
                        tempAsistencias[alumnoId] = {
                            estado: asistencia.estado,
                            notas: asistencia.notas || '',
                            _id: asistencia._id,
                            yaRegistrada: true  // ✅ NUEVO: Indicador de asistencia ya guardada
                        };
                        console.log(`  ✓ Asistencia cargada para alumno ${alumnoId}: ${asistencia.estado}`);
                    }
                });
            }
            setAsistenciasTemp(tempAsistencias);
            console.log('✅ Asistencias temp inicializadas:', Object.keys(tempAsistencias).length, tempAsistencias);

        } catch (asistenciasError) {
            // Solo mostrar warning si NO es un error esperado (404 o sin registros)
            const status = asistenciasError.response?.status;
            if (status !== 400 && status !== 404) {
                console.error('❌ Error inesperado al cargar asistencias:', asistenciasError);
            } else {
                console.log('ℹ️ No hay asistencias previas para esta fecha (esto es normal)');
            }
            // Inicializar vacío
            setAsistenciasRegistradas([]);
            setAsistenciasTemp({});
        }

        } catch (error) {
        console.error('❌ Error al cargar alumnos y asistencias:', error);
        console.error('❌ Error detalles:', error.response?.data);
        setError(error.response?.data?.message || 'Error al cargar los datos del horario');
        setSelectedHorario(null);
        setAlumnosInscritos([]);
        } finally {
        setLoadingAlumnos(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
        ...prev,
        [name]: value
        }));
    };

    // ✅ MEJORA: Toggle individual - Si ya tiene el mismo estado, lo desmarca
    const handleMarcarAsistencia = (alumnoId, estado) => {
        setAsistenciasTemp(prev => {
            const estadoActual = prev[alumnoId]?.estado;
            
            // Si el estado actual es el mismo que se quiere poner, desmarcar
            if (estadoActual === estado) {
                const newState = { ...prev };
                delete newState[alumnoId];
                return newState;
            }
            
            // Si no, establecer el nuevo estado
            return {
                ...prev,
                [alumnoId]: {
                    ...prev[alumnoId],
                    estado: estado
                }
            };
        });
    };

    // ✅ MEJORA: Verificar si todos tienen un estado específico
    const todosTienenEstado = (estado) => {
        if (alumnosInscritos.length === 0) return false;
        return alumnosInscritos.every(inscripcion => {
            const alumnoId = inscripcion.alumno._id;
            return asistenciasTemp[alumnoId]?.estado === estado;
        });
    };

    // ✅ MEJORA: Toggle - Si todos están presentes, desmarcar; si no, marcar todos presentes
    const handleMarcarTodosPresentes = () => {
        if (todosTienenEstado('presente')) {
            // Desmarcar todos (quitar el estado)
            handleLimpiarTodo();
        } else {
            // Marcar todos como presentes
            const nuevasAsistencias = {};
            alumnosInscritos.forEach(inscripcion => {
                const alumnoId = inscripcion.alumno._id;
                nuevasAsistencias[alumnoId] = {
                    ...asistenciasTemp[alumnoId],
                    estado: 'presente'
                };
            });
            setAsistenciasTemp(nuevasAsistencias);
        }
    };

    // ✅ MEJORA: Toggle - Si todos están ausentes, desmarcar; si no, marcar todos ausentes
    const handleMarcarTodosAusentes = () => {
        if (todosTienenEstado('ausente')) {
            // Desmarcar todos (quitar el estado)
            handleLimpiarTodo();
        } else {
            // Marcar todos como ausentes
            const nuevasAsistencias = {};
            alumnosInscritos.forEach(inscripcion => {
                const alumnoId = inscripcion.alumno._id;
                nuevasAsistencias[alumnoId] = {
                    ...asistenciasTemp[alumnoId],
                    estado: 'ausente'
                };
            });
            setAsistenciasTemp(nuevasAsistencias);
        }
    };

    // ✅ NUEVO: Limpiar todas las asistencias temporales
    const handleLimpiarTodo = () => {
        setAsistenciasTemp({});
    };

    const handleGuardarAsistencias = async () => {
        if (!filters.horarioId || !filters.fecha) {
        setError('Debes seleccionar un horario y una fecha');
        return;
        }

        // ✅ CORRECCIÓN: Validar que se hayan marcado todas las asistencias
        const alumnosSinMarcar = alumnosInscritos.filter(inscripcion => {
            const alumnoId = inscripcion.alumno._id;
            return !asistenciasTemp[alumnoId]?.estado;
        });

        if (alumnosSinMarcar.length > 0) {
        setError(`Hay ${alumnosSinMarcar.length} alumno(s) sin marcar asistencia`);
        return;
        }

        setSaving(true);
        setError(null);
        setSuccessMessage('');

        try {
        // ✅ CORRECCIÓN: Preparar datos para enviar usando alumnoId (no alumno)
        const asistenciasParaGuardar = alumnosInscritos.map(inscripcion => {
            const alumnoId = inscripcion.alumno._id;
            return {
                alumnoId: alumnoId,  // ✅ El backend espera "alumnoId", no "alumno"
                estado: asistenciasTemp[alumnoId].estado,
                notas: asistenciasTemp[alumnoId].notas || ''
            };
        });

        const dataToSend = {
            horarioId: filters.horarioId,  // ✅ El backend espera "horarioId", no "horario"
            fecha: filters.fecha,
            asistencias: asistenciasParaGuardar
        };

        console.log('📤 Enviando asistencias:', dataToSend);

        await asistenciasAPI.marcarGrupo(dataToSend);
        
        setSuccessMessage('Asistencias guardadas correctamente');
        
        // Recargar asistencias para mostrar las actualizadas
        await loadAlumnosAndAsistencias();

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);

        } catch (error) {
        console.error('Error al guardar asistencias:', error);
        setError(error.response?.data?.message || 'Error al guardar las asistencias');
        } finally {
        setSaving(false);
        }
    };

    // ✅ CORRECCIÓN: Pasar el objeto alumno completo al modal
    const handleOpenModal = (inscripcion) => {
        // Pasar el objeto alumno directamente, no la inscripción
        setSelectedAlumno(inscripcion.alumno);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setSelectedAlumno(null);
        setShowModal(false);
    };

    // Función helper para encontrar el horario actual
    const encontrarHorarioActual = (horarios) => {
        try {
            // Obtener hora actual en México
            const now = new Date();
            const mexicoTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
            
            // Obtener día de la semana en español
            const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const diaActual = diasSemana[mexicoTime.getDay()];
            
            // Obtener hora actual en formato HH:MM
            const horaActual = mexicoTime.getHours().toString().padStart(2, '0') + ':' + 
                             mexicoTime.getMinutes().toString().padStart(2, '0');
            
            console.log(`🕐 Buscando horario para: ${diaActual} a las ${horaActual}`);
            
            // Buscar horarios que coincidan con el día actual
            const horariosHoy = horarios.filter(h => 
                h.dias && Array.isArray(h.dias) && h.dias.includes(diaActual)
            );
            
            if (horariosHoy.length === 0) {
                console.log('⚠️ No hay horarios para hoy');
                return null;
            }
            
            // Buscar el horario que esté en curso o próximo a iniciar (dentro de 1 hora)
            const horarioActual = horariosHoy.find(h => {
                if (!h.horaInicio || !h.horaFin) return false;
                
                // Convertir horas a minutos para comparar
                const [horaInicioH, horaInicioM] = h.horaInicio.split(':').map(Number);
                const [horaFinH, horaFinM] = h.horaFin.split(':').map(Number);
                const [horaActualH, horaActualM] = horaActual.split(':').map(Number);
                
                const minutosInicio = horaInicioH * 60 + horaInicioM;
                const minutosFin = horaFinH * 60 + horaFinM;
                const minutosActual = horaActualH * 60 + horaActualM;
                
                // Horario está en curso o próximo a iniciar (1 hora antes)
                return minutosActual >= (minutosInicio - 60) && minutosActual <= minutosFin;
            });
            
            // Si encontramos un horario actual/próximo, retornarlo
            if (horarioActual) {
                console.log('✅ Horario encontrado:', horarioActual.nombre);
                return horarioActual;
            }
            
            // Si no, retornar el primer horario del día
            console.log('📍 Usando primer horario del día:', horariosHoy[0].nombre);
            return horariosHoy[0];
            
        } catch (error) {
            console.error('Error buscando horario actual:', error);
            return null;
        }
    };

    const getEstadoColor = (estado) => {
        return ASISTENCIA_ESTADOS_COLORS[estado] || ASISTENCIA_ESTADOS_COLORS['ausente'];
    };

    const contarMarcados = () => {
        return Object.values(asistenciasTemp).filter(a => a?.estado).length;
    };

    // Filtrar horarios según filtros aplicados
    const horariosFiltrados = horarios.filter(horario => {
        if (filters.sucursal && horario.sucursal?._id !== filters.sucursal) return false;
        if (filters.instructor && horario.instructor?._id !== filters.instructor) return false;
        return true;
    });

    if (loading) {
        return (
        <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
        </div>
        );
    }

    return (
        <div className="p-6">
        {/* Header */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                Control de Asistencias
            </h1>
            </div>
            <p className="text-gray-600">
            Selecciona un horario y marca la asistencia de los alumnos
            </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md mb-6">
            <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            >
            <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-700">Filtros</span>
            </div>
            {showFilters ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
            </button>

            {showFilters && (
            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro de Sucursal */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sucursal
                </label>
                <select
                    name="sucursal"
                    value={filters.sucursal}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todas las sucursales</option>
                    {Array.isArray(sucursales) && sucursales.map(sucursal => (
                    <option key={sucursal._id} value={sucursal._id}>
                        {sucursal.name}
                    </option>
                    ))}
                </select>
                </div>

                {/* Filtro de Instructor */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                </label>
                <select
                    name="instructor"
                    value={filters.instructor}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todos los instructores</option>
                    {Array.isArray(instructores) && instructores.map(instructor => (
                    <option key={instructor._id} value={instructor._id}>
                        {instructor.name}
                    </option>
                    ))}
                </select>
                </div>

                {/* Selección de Horario */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horario *
                </label>
                <select
                    name="horarioId"
                    value={filters.horarioId}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="">Selecciona un horario</option>
                    {horariosFiltrados.map(horario => (
                    <option key={horario._id} value={horario._id}>
                        {horario.nombre} - {horario.dias?.join(', ')} {horario.horaInicio}
                    </option>
                    ))}
                </select>
                </div>

                {/* Selección de Fecha */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                </label>
                <input
                    type="date"
                    name="fecha"
                    value={filters.fecha}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                </div>
            </div>
            )}
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
            </div>
            </div>
        )}

        {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">{successMessage}</p>
            </div>
            </div>
        )}

        {/* Contenido Principal */}
        {!filters.horarioId ? (
            // Estado inicial - No hay horario seleccionado
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Selecciona un horario para comenzar
            </h3>
            <p className="text-gray-500">
                Utiliza los filtros superiores para seleccionar un horario y fecha
            </p>
            </div>
        ) : loadingAlumnos ? (
            // Cargando alumnos
            <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
            </div>
        ) : selectedHorario ? (
            // Vista principal - Horario seleccionado
            <div className="space-y-6">
            {/* Header del Horario */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedHorario.nombre}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedHorario.sucursal?.name || selectedHorario.sucursal?.nombre || 'Sin sucursal'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>
                        {selectedHorario.instructor?.name || 'Sin instructor'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedHorario.dias?.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedHorario.horaInicio} - {selectedHorario.horaFin}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                        {alumnosInscritos.length}/{selectedHorario.capacidadMaxima || selectedHorario.capacidad || '?'} alumnos
                        </span>
                    </div>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Fecha seleccionada</p>
                    <p className="text-lg font-semibold text-gray-800">
                    {new Date(filters.fecha + 'T00:00:00').toLocaleDateString('es-MX', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                    </p>
                    {/* ✅ NUEVO: Indicador de asistencias ya registradas */}
                    {asistenciasRegistradas.length > 0 && (
                    <p className="text-sm text-green-600 mt-1 flex items-center justify-end gap-1">
                        <CheckCircle className="h-4 w-4" />
                        {asistenciasRegistradas.length} asistencia(s) ya registrada(s)
                    </p>
                    )}
                </div>
                </div>

                {/* Acciones Grupales */}
                <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                    {/* ✅ MEJORA: Botón con estado visual que indica si todos están presentes */}
                    <button
                    onClick={handleMarcarTodosPresentes}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                        todosTienenEstado('presente')
                        ? 'bg-green-700 text-white ring-2 ring-green-400'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    disabled={alumnosInscritos.length === 0}
                    title={todosTienenEstado('presente') ? 'Clic para desmarcar todos' : 'Marcar todos como presentes'}
                    >
                    <CheckCircle className="h-4 w-4" />
                    {todosTienenEstado('presente') ? 'Todos Presentes ✓' : 'Marcar Todos Presentes'}
                    </button>
                    {/* ✅ MEJORA: Botón con estado visual que indica si todos están ausentes */}
                    <button
                    onClick={handleMarcarTodosAusentes}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                        todosTienenEstado('ausente')
                        ? 'bg-red-700 text-white ring-2 ring-red-400'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                    disabled={alumnosInscritos.length === 0}
                    title={todosTienenEstado('ausente') ? 'Clic para desmarcar todos' : 'Marcar todos como ausentes'}
                    >
                    <XCircle className="h-4 w-4" />
                    {todosTienenEstado('ausente') ? 'Todos Ausentes ✓' : 'Marcar Todos Ausentes'}
                    </button>
                    {/* ✅ NUEVO: Botón para limpiar todas las selecciones */}
                    {contarMarcados() > 0 && (
                    <button
                        onClick={handleLimpiarTodo}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
                        title="Limpiar todas las selecciones"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Limpiar Todo
                    </button>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                    {contarMarcados()} de {alumnosInscritos.length} marcados
                    </span>
                    <button
                    onClick={handleGuardarAsistencias}
                    disabled={saving || contarMarcados() !== alumnosInscritos.length}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                    <Save className="h-4 w-4" />
                    {saving ? 'Guardando...' : 'Guardar Asistencias'}
                    </button>
                </div>
                </div>
            </div>

            {/* Lista de Alumnos */}
            {alumnosInscritos.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay alumnos inscritos
                </h3>
                <p className="text-gray-500">
                    Este horario no tiene alumnos inscritos aún
                </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-700">
                    Lista de Alumnos ({alumnosInscritos.length})
                    </h3>
                </div>
                <div className="divide-y">
                    {/* ✅ CORRECCIÓN PRINCIPAL: Iterar sobre inscripciones y acceder a inscripcion.alumno */}
                    {alumnosInscritos.map(inscripcion => {
                    // Extraer el objeto alumno de la inscripción
                    const alumno = inscripcion.alumno;
                    
                    // Verificación de seguridad
                    if (!alumno || !alumno._id) {
                        console.warn('⚠️ Inscripción sin datos de alumno:', inscripcion);
                        return null;
                    }
                    
                    const alumnoId = alumno._id;
                    const asistenciaActual = asistenciasTemp[alumnoId];
                    const estadoActual = asistenciaActual?.estado;
                    const yaRegistrada = asistenciaActual?.yaRegistrada;
                    const colors = estadoActual ? getEstadoColor(estadoActual) : null;

                    return (
                        <div
                        key={alumnoId}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                            colors ? colors.bg : ''
                        }`}
                        >
                        <div className="flex items-center justify-between">
                            {/* Información del Alumno */}
                            <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
                                {/* ✅ CORRECCIÓN: Usar profilePhoto.url */}
                                {alumno.profilePhoto?.url ? (
                                <img
                                    src={`http://localhost:3005${alumno.profilePhoto.url}`}
                                    alt={`${alumno.firstName} ${alumno.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                                ) : (
                                <User className="h-6 w-6 text-gray-400" />
                                )}
                                {/* ✅ NUEVO: Indicador de asistencia ya registrada */}
                                {yaRegistrada && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                                )}
                            </div>
                            <div className="flex-1">
                                {/* ✅ CORRECCIÓN: Usar firstName y lastName */}
                                <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-800">
                                    {alumno.firstName} {alumno.lastName}
                                </h4>
                                {/* ✅ NUEVO: Badge de estado si ya está registrada */}
                                {yaRegistrada && estadoActual && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors?.bg} ${colors?.text}`}>
                                    ✓ {estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1)}
                                    </span>
                                )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {/* ✅ CORRECCIÓN: Usar enrollment.studentId */}
                                    {alumno.enrollment?.studentId || 'Sin matrícula'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    {/* ✅ CORRECCIÓN: Usar belt.level */}
                                    {alumno.belt?.level || 'Sin cinturón'}
                                </span>
                                </div>
                            </div>
                            </div>

                            {/* Botones de Asistencia */}
                            <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleMarcarAsistencia(alumnoId, 'presente')}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                                estadoActual === 'presente'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                }`}
                                title="Presente"
                            >
                                <CheckCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Presente</span>
                            </button>
                            <button
                                onClick={() => handleMarcarAsistencia(alumnoId, 'ausente')}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                                estadoActual === 'ausente'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                }`}
                                title="Ausente"
                            >
                                <XCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">Ausente</span>
                            </button>
                            <button
                                onClick={() => handleMarcarAsistencia(alumnoId, 'retardo')}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                                estadoActual === 'retardo'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                                }`}
                                title="Retardo"
                            >
                                <Clock className="h-4 w-4" />
                                <span className="hidden sm:inline">Retardo</span>
                            </button>
                            <button
                                onClick={() => handleMarcarAsistencia(alumnoId, 'justificado')}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-1 ${
                                estadoActual === 'justificado'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                                }`}
                                title="Justificado"
                            >
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Justificado</span>
                            </button>
                            {/* ✅ CORRECCIÓN: Pasar la inscripción completa al modal */}
                            <button
                                onClick={() => handleOpenModal(inscripcion)}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                title="Ver historial"
                            >
                                <FileText className="h-4 w-4" />
                            </button>
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
                </div>
            )}
            </div>
        ) : null}

        {/* Modal de Detalles */}
        {showModal && selectedAlumno && (
            <AsistenciaModal
            alumno={selectedAlumno}
            onClose={handleCloseModal}
            />
        )}
        </div>
    );
};

export default AsistenciasPage;