import React, { useState, useEffect, useCallback } from 'react'
import {
  Award, Search, Filter, ChevronDown, Users, CheckCircle2,
  XCircle, Clock, Download, GraduationCap, Eye,
  Star, AlertCircle, Building2, Calendar, X,
  FileText, Loader, RefreshCw, Plus, Edit3, Trash2,
  UserPlus, MoreVertical, PlayCircle, ChevronRight, DollarSign
} from 'lucide-react'
import {
  examenesAPI, sucursalesAPI, graduacionesAPI,
  utils, BELT_LEVELS_DISPLAY
} from '../../services/APIservice'
import useCinturones from '../../hooks/useCinturones'
import { useAuth } from '../../context/Authcontext'
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton }   from '../../components/dashboard/PermissionButton'
import PermissionGuard    from '../../components/auth/PermissionGuard'
import ExamenForm         from '../../components/forms/ExamenForm'
import InscripcionForm    from '../../components/forms/InscripcionForm'
import CalificacionForm   from '../../components/forms/CalificacionForm'
import GraduacionModal    from '../../components/modals/GraduacionModal'
import toast from 'react-hot-toast'

// ── Constantes ────────────────────────────────────────────────────────────────
const TIPO_LABELS = {
  graduacion:             'Graduación',
  evaluacion_tecnica:     'Evaluación Técnica',
  evaluacion_semestral:   'Evaluación Semestral',
  otro:                   'Otro',
}

const ESTADO_CONFIG = {
  programado: { label: 'Programado', dot: 'bg-blue-400',   pill: 'bg-blue-50 text-blue-700 border-blue-200'   },
  en_curso:   { label: 'En Curso',   dot: 'bg-yellow-400', pill: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  completado: { label: 'Completado', dot: 'bg-green-400',  pill: 'bg-green-50 text-green-700 border-green-200'  },
  cancelado:  { label: 'Cancelado',  dot: 'bg-red-400',    pill: 'bg-red-50 text-red-700 border-red-200'        },
}

const RESULTADO_STYLE = {
  aprobado:  { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50',  label: 'Aprobado'  },
  reprobado: { icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50',    label: 'Reprobado' },
  pendiente: { icon: Clock,        color: 'text-gray-400',  bg: 'bg-gray-50',   label: 'Pendiente' },
}

const getBeltColor = (level) => {
  const map = {
    blanco: '#F3F4F6', 'blanco-amarillo': '#FEF9C3', amarillo: '#FDE047',
    'amarillo-naranja': '#FDBA74', naranja: '#FB923C', 'naranja-verde': '#A3E635',
    verde: '#22C55E', 'verde-azul': '#34D399', azul: '#3B82F6',
    'azul-marron': '#6366F1', marron: '#92400E', 'marron-negro': '#44403C',
    'negro-1': '#111827', 'negro-2': '#111827', 'negro-3': '#111827',
    'negro-4': '#111827', 'negro-5': '#111827', 'negro-6': '#111827',
    'negro-7': '#111827', 'negro-8': '#111827', 'negro-9': '#111827',
  }
  return map[level] || '#9CA3AF'
}

// ── Panel de Calificaciones de un Examen ──────────────────────────────────────
const CalificacionesPanel = ({ examen, onClose, onSuccess }) => {
  const [califs, setCalifs]           = useState([])
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [downloading, setDownloading] = useState({})
  const [showCalifForm, setShowCalifForm]   = useState(false)
  const [showGradModal, setShowGradModal]   = useState(false)
  const { getCinturon } = useCinturones()

  useEffect(() => { loadCalificaciones() }, [examen._id])

  const loadCalificaciones = async () => {
    try {
      setLoading(true)
      const res = await examenesAPI.getCalificacionesExamen(examen._id)
      if (res.success) {
        setCalifs(res.data.calificaciones || [])
        setEstadisticas(res.data.estadisticas || null)
      }
    } catch { toast.error('Error al cargar calificaciones') }
    finally  { setLoading(false) }
  }

  const handleDownloadCert = async (graduacionId, nombre) => {
    try {
      setDownloading(p => ({ ...p, [graduacionId]: true }))
      const res = await graduacionesAPI.getCertificado(graduacionId)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href = url
      a.download = `certificado_${nombre.replace(/ /g, '_')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Certificado descargado')
    } catch { toast.error('Error al descargar certificado') }
    finally { setDownloading(p => ({ ...p, [graduacionId]: false })) }
  }

  const esGraduacion    = examen.tipo === 'graduacion'
  const aprobados       = califs.filter(c => c.resultado === 'aprobado')
  const tieneAprobados  = aprobados.length > 0
  // Todos los aprobados ya tienen graduación registrada
  const todosGraduados  = tieneAprobados && aprobados.every(c => c.graduado)
  const inscritos       = examen.alumnosInscritos?.length || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-xl">
              <Award className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{examen.nombre}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-400">{TIPO_LABELS[examen.tipo]}</span>
                {examen.cinturonObjetivo && (
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-200"
                      style={{ backgroundColor: getBeltColor(examen.cinturonObjetivo) }} />
                    <span className="text-xs text-gray-400">
                      {BELT_LEVELS_DISPLAY[examen.cinturonObjetivo] || examen.cinturonObjetivo}
                    </span>
                  </div>
                )}
                <span className="text-xs text-gray-400">{inscritos} inscrito{inscritos !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {esGraduacion && tieneAprobados && examen.estado === 'completado' && (
              todosGraduados ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
                  <GraduationCap className="w-4 h-4" /> Todos graduados ✓
                </span>
              ) : (
                <button onClick={() => setShowGradModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
                  <GraduationCap className="w-4 h-4" /> Procesar Graduaciones
                </button>
              )
            )}
            {examen.estado !== 'completado' && examen.estado !== 'cancelado' && (
              <button onClick={() => setShowCalifForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
                <Star className="w-4 h-4" /> Calificar
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-5 gap-4">
            {[
              { label: 'Evaluados',  val: estadisticas.totalCalificaciones, color: 'text-gray-700' },
              { label: 'Aprobados',  val: estadisticas.aprobados,           color: 'text-green-600' },
              { label: 'Reprobados', val: estadisticas.reprobados,          color: 'text-red-600'   },
              { label: 'Pendientes', val: estadisticas.pendientes,          color: 'text-gray-400'  },
              { label: '% Aprobación', val: `${estadisticas.porcentajeAprobacion ?? 0}%`, color: 'text-primary-600' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center">
                <div className={`text-xl font-bold ${color}`}>{val}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-500">Cargando calificaciones...</span>
            </div>
          ) : califs.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Sin calificaciones registradas</p>
              <p className="text-sm text-gray-400 mt-1">
                {inscritos > 0 ? 'Haz click en "Calificar" para comenzar' : 'No hay alumnos inscritos aún'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pl-1">Alumno</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Calificación</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Resultado</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Evaluado por</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 pr-1">Certificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {califs.map(calif => {
                  const alumno  = calif.alumno || {}
                  const estilo  = RESULTADO_STYLE[calif.resultado] || RESULTADO_STYLE.pendiente
                  const IcoRes  = estilo.icon
                  return (
                    <tr key={calif._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary-700">
                              {alumno.firstName?.[0]}{alumno.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {alumno.firstName} {alumno.lastName}
                            </div>
                            {alumno.belt?.level && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-2.5 h-2.5 rounded-full border border-gray-200"
                                  style={{ backgroundColor: getBeltColor(alumno.belt.level) }} />
                                <span className="text-xs text-gray-400">
                                  {BELT_LEVELS_DISPLAY[alumno.belt.level] || alumno.belt.level}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-lg font-bold text-gray-900">
                          {calif.calificacionFinal != null ? Math.round(calif.calificacionFinal * 100) / 100 : '—'}
                        </span>
                        {calif.calificacionFinal != null && <span className="text-xs text-gray-400"> /100</span>}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${estilo.bg} ${estilo.color}`}>
                          <IcoRes className="w-3 h-3" />{estilo.label}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-xs text-gray-500">{calif.evaluadoPor?.name || '—'}</span>
                      </td>
                      <td className="py-3 pr-1 text-right">
                        {calif.resultado === 'aprobado' && calif.graduado && (
                          <div className="flex flex-col items-end gap-1">
                            {/* Cinturón obtenido */}
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                                style={{ backgroundColor: getCinturon(calif.cinturonNuevo)?.color || getBeltColor(calif.cinturonNuevo) }} />
                              <span className="text-xs font-medium text-gray-700">
                                {getCinturon(calif.cinturonNuevo)?.nombre || BELT_LEVELS_DISPLAY[calif.cinturonNuevo] || calif.cinturonNuevo}
                              </span>
                            </div>
                            {/* Botón descargar certificado */}
                            <button
                              onClick={() => handleDownloadCert(calif.graduacionId, `${alumno.firstName} ${alumno.lastName}`)}
                              disabled={downloading[calif.graduacionId]}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 disabled:opacity-50">
                              {downloading[calif.graduacionId] ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                              Certificado
                            </button>
                          </div>
                        )}
                        {calif.resultado === 'aprobado' && !calif.graduado && (
                          <span className="text-xs text-amber-500 italic">Pendiente graduar</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showCalifForm && (
        <CalificacionForm examen={examen} isOpen={showCalifForm}
          onClose={() => setShowCalifForm(false)}
          onSuccess={() => { setShowCalifForm(false); loadCalificaciones(); onSuccess?.() }} />
      )}
      {showGradModal && (
        <GraduacionModal examen={examen} isOpen={showGradModal}
          onClose={() => setShowGradModal(false)}
          onSuccess={() => { setShowGradModal(false); loadCalificaciones(); onSuccess?.() }} />
      )}
    </div>
  )
}

// ── Componente Principal ──────────────────────────────────────────────────────
const CalificacionesPage = () => {
  const { user }                     = useAuth()
  const { canCreate, canUpdate, canDelete } = usePermissions('calificaciones')

  const [examenes, setExamenes]         = useState([])
  const [sucursales, setSucursales]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [searchTerm, setSearchTerm]     = useState('')
  const [showFilters, setShowFilters]   = useState(false)

  // Modales
  const [showCrearExamen, setShowCrearExamen]       = useState(false)
  const [showEditarExamen, setShowEditarExamen]     = useState(null)  // examen a editar
  const [showInscripcion, setShowInscripcion]       = useState(null)  // examen al que inscribir
  const [showCalificaciones, setShowCalificaciones] = useState(null)  // examen a ver califs
  const [showMenu, setShowMenu]                     = useState(null)  // id del menú abierto

  const [filters, setFilters] = useState({
    sucursal: '', tipo: 'all', estado: 'all',
  })

  const updateFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  // Cerrar menú al click fuera
  useEffect(() => {
    const handler = () => setShowMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  useEffect(() => { loadInitialData() }, [])

  useEffect(() => {
    const t = setTimeout(() => loadExamenes(), 400)
    return () => clearTimeout(t)
  }, [filters, searchTerm])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [exRes, sucRes] = await Promise.all([
        examenesAPI.getAll(),
        sucursalesAPI.getAll(),
      ])
      if (exRes.success)  setExamenes(exRes.data || [])
      if (sucRes.success) setSucursales(sucRes.data?.sucursales || sucRes.data || [])
    } catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }

  const loadExamenes = async () => {
    try {
      const params = {}
      if (filters.sucursal)         params.sucursal = filters.sucursal
      if (filters.tipo !== 'all')   params.tipo     = filters.tipo
      if (filters.estado !== 'all') params.estado   = filters.estado
      if (searchTerm)               params.search   = searchTerm
      const res = await examenesAPI.getAll(params)
      if (res.success) setExamenes(res.data || [])
    } catch {}
  }

  const handleDeleteExamen = async (examen) => {
    if (!window.confirm(`¿Eliminar el examen "${examen.nombre}"?\nSe eliminarán también sus calificaciones.`)) return
    try {
      const res = await examenesAPI.delete(examen._id)
      if (res.success) {
        toast.success('Examen eliminado')
        loadExamenes()
      } else {
        toast.error(res.message || 'Error al eliminar')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleSincronizarPagos = async (examen) => {
    try {
      const res = await examenesAPI.sincronizarPagos(examen._id)
      if (res.success) {
        toast.success(res.message || 'Pagos sincronizados')
        loadExamenes()
      } else {
        toast.error(res.message || 'Error al sincronizar')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al sincronizar pagos')
    }
    setShowMenu(null)
  }

  const handleCambiarEstado = async (examen, nuevoEstado) => {
    // Validar que todos los alumnos estén calificados antes de completar
    if (nuevoEstado === 'completado') {
      const inscritos   = examen.alumnosInscritos || []
      const sinCalificar = inscritos.filter(i => !i.calificado)
      if (sinCalificar.length > 0) {
        toast.error(
          `No se puede completar: ${sinCalificar.length} alumno${sinCalificar.length !== 1 ? 's' : ''} sin calificar`,
          { duration: 4000 }
        )
        setShowMenu(null)
        return
      }
      if (inscritos.length === 0) {
        toast.error('No se puede completar: el examen no tiene alumnos inscritos')
        setShowMenu(null)
        return
      }
    }
    try {
      const res = await examenesAPI.cambiarEstado(examen._id, nuevoEstado)
      if (res.success) {
        toast.success(`Estado actualizado a "${ESTADO_CONFIG[nuevoEstado]?.label}"`)
        loadExamenes()
      }
    } catch { toast.error('Error al cambiar estado') }
    setShowMenu(null)
  }

  // Filtrar localmente también por búsqueda
  const examenesFiltered = examenes.filter(e => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return e.nombre?.toLowerCase().includes(q) || TIPO_LABELS[e.tipo]?.toLowerCase().includes(q)
  })

  // Agrupar por estado — orden: en_curso, programado, completado, cancelado
  const ORDEN_ESTADOS = ['en_curso', 'programado', 'completado', 'cancelado']
  const grupos = {}
  ORDEN_ESTADOS.forEach(e => { grupos[e] = [] })
  examenesFiltered.forEach(ex => {
    // Normalizar 'en_proceso' (legacy BD) → 'en_curso' para la UI
    let est = ex.estado || 'programado'
    if (est === 'en_proceso') est = 'en_curso'
    if (grupos[est]) grupos[est].push(ex)
    else grupos['programado'].push(ex)
  })

  // Stats rápidas
  const stats = [
    { label: 'Total',       val: examenes.length,                                        color: 'text-gray-700',    bg: 'bg-gray-50',    icon: FileText    },
    { label: 'Programados', val: examenes.filter(e => e.estado === 'programado').length,  color: 'text-blue-600',   bg: 'bg-blue-50',    icon: Calendar    },
    { label: 'En Curso',    val: examenes.filter(e => e.estado === 'en_curso' || e.estado === 'en_proceso').length,    color: 'text-yellow-600', bg: 'bg-yellow-50',  icon: PlayCircle  },
    { label: 'Completados', val: examenes.filter(e => e.estado === 'completado').length,  color: 'text-green-600',  bg: 'bg-green-50',   icon: CheckCircle2},
  ]

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-primary-600" />
            Calificaciones y Exámenes
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gestiona exámenes, califica alumnos y genera certificados de graduación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadInitialData}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <PermissionGuard module="calificaciones" action="create">
            <button onClick={() => setShowCrearExamen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 text-sm shadow-sm">
              <Plus className="w-4 h-4" />
              Nuevo Examen
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, val, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Búsqueda y filtros ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 w-full" placeholder="Buscar examen por nombre o tipo..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors
              ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" />Filtros
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Sucursal</label>
              <select className="input-field w-full text-sm" value={filters.sucursal}
                onChange={e => updateFilter('sucursal', e.target.value)}>
                <option value="">Todas</option>
                {sucursales.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
              <select className="input-field w-full text-sm" value={filters.tipo}
                onChange={e => updateFilter('tipo', e.target.value)}>
                <option value="all">Todos</option>
                {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Estado</label>
              <select className="input-field w-full text-sm" value={filters.estado}
                onChange={e => updateFilter('estado', e.target.value)}>
                <option value="all">Todos</option>
                {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Lista de exámenes ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-3 text-gray-500 font-medium">Cargando exámenes...</span>
        </div>
      ) : examenesFiltered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay exámenes que mostrar</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            {examenes.length === 0 ? 'Crea el primer examen con el botón "+ Nuevo Examen"' : 'Ajusta los filtros de búsqueda'}
          </p>
          {examenes.length === 0 && (
            <button onClick={() => setShowCrearExamen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700">
              <Plus className="w-4 h-4" /> Crear primer examen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {ORDEN_ESTADOS.map(estado => {
            const grupo = grupos[estado]
            if (grupo.length === 0) return null
            const estCfg = ESTADO_CONFIG[estado]

            return (
              <div key={estado}>
                {/* Título de grupo */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${estCfg.dot}`} />
                  <span className="text-sm font-semibold text-gray-700">{estCfg.label}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {grupo.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {grupo.map(examen => {
                    const inscritos   = examen.alumnosInscritos?.length || 0
                    const calificados = examen.alumnosInscritos?.filter(a => a.calificado)?.length || 0
                    const aprobados   = examen.alumnosInscritos?.filter(a => a.aprobado)?.length || 0
                    const pctCal      = inscritos > 0 ? Math.round((calificados / inscritos) * 100) : 0
                    const esMenuOpen  = showMenu === examen._id

                    return (
                      <div key={examen._id}
                        className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all">

                        {/* Cabecera card */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                              {examen.nombre}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${estCfg.pill}`}>
                                {estCfg.label}
                              </span>
                              <span className="text-xs text-gray-400">{TIPO_LABELS[examen.tipo]}</span>
                            </div>
                          </div>

                          {/* Menú de acciones */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={e => { e.stopPropagation(); setShowMenu(esMenuOpen ? null : examen._id) }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {esMenuOpen && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="absolute right-0 top-8 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                {/* Ver calificaciones */}
                                <button
                                  onClick={() => { setShowCalificaciones(examen); setShowMenu(null) }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                  <Eye className="w-4 h-4 text-gray-400" /> Ver calificaciones
                                </button>
                                {/* Agregar alumnos */}
                                {examen.estado !== 'completado' && examen.estado !== 'cancelado' && (
                                  <button
                                    onClick={() => { setShowInscripcion(examen); setShowMenu(null) }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <UserPlus className="w-4 h-4 text-gray-400" /> Agregar alumnos
                                  </button>
                                )}
                                {/* Editar */}
                                <PermissionGuard module="calificaciones" action="update">
                                  <button
                                    onClick={() => { setShowEditarExamen(examen); setShowMenu(null) }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <Edit3 className="w-4 h-4 text-gray-400" /> Editar examen
                                  </button>
                                </PermissionGuard>
                                {/* Cambiar estado */}
                                <div className="border-t border-gray-100 my-1" />
                                <p className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">Cambiar estado</p>
                                {Object.entries(ESTADO_CONFIG)
                                  .filter(([k]) => k !== examen.estado)
                                  .map(([k, v]) => (
                                    <button key={k}
                                      onClick={() => handleCambiarEstado(examen, k)}
                                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                      <div className={`w-2 h-2 rounded-full ${v.dot}`} />
                                      {v.label}
                                    </button>
                                  ))
                                }
                                {/* Eliminar */}
                                <PermissionGuard module="calificaciones" action="delete">
                                  <div className="border-t border-gray-100 my-1" />
                                  <button
                                    onClick={() => { handleDeleteExamen(examen); setShowMenu(null) }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" /> Eliminar examen
                                  </button>
                                </PermissionGuard>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info: fecha y sucursal */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          {examen.fecha && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(examen.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {examen.sucursal?.name && (
                            <div className="flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{examen.sucursal.name}</span>
                            </div>
                          )}
                        </div>

                        {/* Cinturón objetivo */}
                        {examen.cinturonObjetivo && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-3 h-3 rounded-full border border-gray-200"
                              style={{ backgroundColor: getBeltColor(examen.cinturonObjetivo) }} />
                            <span className="text-xs text-gray-500">
                              Objetivo: {BELT_LEVELS_DISPLAY[examen.cinturonObjetivo] || examen.cinturonObjetivo}
                            </span>
                          </div>
                        )}

                        {/* Progreso de alumnos */}
                        {inscritos > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                <Users className="w-3 h-3 inline mr-1" />
                                {inscritos} inscrito{inscritos !== 1 ? 's' : ''}
                              </span>
                              <span className="text-gray-400">{calificados}/{inscritos} calificados</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 rounded-full transition-all"
                                style={{ width: `${pctCal}%` }} />
                            </div>
                            {calificados > 0 && (
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-green-600 flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />{aprobados} aprobados
                                </span>
                                {calificados - aprobados > 0 && (
                                  <span className="text-red-500 flex items-center gap-0.5">
                                    <XCircle className="w-3 h-3" />{calificados - aprobados} reprobados
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Sin alumnos inscritos
                            </div>
                            {examen.estado !== 'completado' && examen.estado !== 'cancelado' && (
                              <button
                                onClick={() => setShowInscripcion(examen)}
                                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5 font-medium">
                                <UserPlus className="w-3 h-3" /> Agregar
                              </button>
                            )}
                          </div>
                        )}

                        {/* Botones de acción rápida */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => setShowCalificaciones(examen)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Ver calificaciones
                          </button>
                          {examen.estado !== 'completado' && examen.estado !== 'cancelado' && (
                            <button
                              onClick={() => setShowInscripcion(examen)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                              <UserPlus className="w-3.5 h-3.5" /> Alumnos
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modales ── */}

      {/* Crear examen */}
      {showCrearExamen && (
        <ExamenForm
          isOpen={showCrearExamen}
          mode="create"
          onClose={() => setShowCrearExamen(false)}
          onSuccess={() => { setShowCrearExamen(false); loadExamenes(); toast.success('Examen creado') }}
        />
      )}

      {/* Editar examen */}
      {showEditarExamen && (
        <ExamenForm
          isOpen={!!showEditarExamen}
          mode="edit"
          examen={showEditarExamen}
          onClose={() => setShowEditarExamen(null)}
          onSuccess={() => { setShowEditarExamen(null); loadExamenes(); toast.success('Examen actualizado') }}
        />
      )}

      {/* Inscribir alumnos */}
      {showInscripcion && (
        <InscripcionForm
          examen={showInscripcion}
          isOpen={!!showInscripcion}
          onClose={() => setShowInscripcion(null)}
          onSuccess={() => { setShowInscripcion(null); loadExamenes() }}
        />
      )}

      {/* Ver calificaciones del examen */}
      {showCalificaciones && (
        <CalificacionesPanel
          examen={showCalificaciones}
          onClose={() => setShowCalificaciones(null)}
          onSuccess={loadExamenes}
        />
      )}
    </div>
  )
}

export default CalificacionesPage