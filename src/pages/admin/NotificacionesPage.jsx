import React, { useState, useEffect } from 'react'
import {
  Bell, Plus, Send, Edit, Trash2, Eye, Search, Filter,
  ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle,
  XCircle, Mail, Users, X, Save, Loader, Megaphone,
  Calendar, Tag, BarChart2
} from 'lucide-react'
import { notificacionesAPI, sucursalesAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// ── Constantes ────────────────────────────────────────────────────────────────
const TIPOS = [
  { value: 'notificacion', label: 'Notificación',  color: 'blue',   icon: '🔔' },
  { value: 'promocion',    label: 'Promoción',      color: 'green',  icon: '🎁' },
  { value: 'recordatorio', label: 'Recordatorio',   color: 'yellow', icon: '⏰' },
  { value: 'evento',       label: 'Evento',         color: 'purple', icon: '📅' },
  { value: 'otro',         label: 'Otro',           color: 'gray',   icon: '📌' },
]

const ESTADOS = {
  borrador:   { label: 'Borrador',   bg: 'bg-gray-100',   text: 'text-gray-700',   icon: <Clock className="w-3 h-3" /> },
  programada: { label: 'Programada', bg: 'bg-blue-100',   text: 'text-blue-700',   icon: <Calendar className="w-3 h-3" /> },
  enviando:   { label: 'Enviando',   bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Loader className="w-3 h-3 animate-spin" /> },
  enviada:    { label: 'Enviada',    bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle className="w-3 h-3" /> },
  cancelada:  { label: 'Cancelada', bg: 'bg-red-100',    text: 'text-red-700',    icon: <XCircle className="w-3 h-3" /> },
}

const PROGRAMAS = [
  { value: 'tae-kwon-do',       label: 'Tae Kwon Do' },
  { value: 'tang-soo-do',       label: 'Tang Soo Do' },
  { value: 'hapkido',           label: 'Hapkido' },
  { value: 'gumdo',             label: 'Gumdo' },
  { value: 'pequenos-dragones', label: 'Pequeños Dragones' },
]

// ── Badge de estado ───────────────────────────────────────────────────────────
const EstadoBadge = ({ estado }) => {
  const cfg = ESTADOS[estado] || ESTADOS.borrador
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ── Badge de tipo ─────────────────────────────────────────────────────────────
const TipoBadge = ({ tipo }) => {
  const t = TIPOS.find(t => t.value === tipo) || TIPOS[4]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-${t.color}-100 text-${t.color}-800`}>
      {t.icon} {t.label}
    </span>
  )
}

// ── Modal de crear / editar ───────────────────────────────────────────────────
const NotificacionModal = ({ isOpen, notificacion, onClose, onSuccess, sucursales }) => {
  const [loading, setLoading]       = useState(false)
  const [preview, setPreview]       = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [form, setForm]             = useState({
    tipo:    'notificacion',
    titulo:  '',
    mensaje: '',
    fechaInicio: '',
    fechaFin:    '',
    destinatarios: {
      tipo:      'todos',
      sucursales: [],
      programas:  []
    }
  })

  useEffect(() => {
    if (notificacion) {
      setForm({
        tipo:    notificacion.tipo    || 'notificacion',
        titulo:  notificacion.titulo  || '',
        mensaje: notificacion.mensaje || '',
        fechaInicio: notificacion.fechaInicio ? notificacion.fechaInicio.split('T')[0] : '',
        fechaFin:    notificacion.fechaFin    ? notificacion.fechaFin.split('T')[0]    : '',
        destinatarios: notificacion.destinatarios || { tipo: 'todos', sucursales: [], programas: [] }
      })
    } else {
      setForm({
        tipo: 'notificacion', titulo: '', mensaje: '', fechaInicio: '', fechaFin: '',
        destinatarios: { tipo: 'todos', sucursales: [], programas: [] }
      })
    }
    setPreview(null)
  }, [notificacion, isOpen])

  if (!isOpen) return null

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const setDest = (key, val) => setForm(prev => ({
    ...prev,
    destinatarios: { ...prev.destinatarios, [key]: val }
  }))

  const handlePreview = async () => {
    setLoadingPreview(true)
    try {
      const res = await notificacionesAPI.previewDestinatarios(form.destinatarios)
      setPreview(res)
    } catch { toast.error('Error al obtener destinatarios') }
    finally { setLoadingPreview(false) }
  }

  const handleSubmit = async () => {
    if (!form.titulo.trim()) return toast.error('El título es requerido')
    if (!form.mensaje.trim()) return toast.error('El mensaje es requerido')
    setLoading(true)
    try {
      if (notificacion) {
        await notificacionesAPI.update(notificacion._id, form)
        toast.success('Notificación actualizada')
      } else {
        await notificacionesAPI.create(form)
        toast.success('Notificación creada')
      }
      onSuccess()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar')
    } finally { setLoading(false) }
  }

  const tipoActual = TIPOS.find(t => t.value === form.tipo)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold text-lg">
              {notificacion ? 'Editar' : 'Nueva'} {tipoActual?.icon} {tipoActual?.label}
            </h2>
            <p className="text-gray-300 text-sm">Campañas de comunicación</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de mensaje</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {TIPOS.map(t => (
                <button key={t.value} type="button"
                  onClick={() => set('tipo', t.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-xs font-medium transition-all
                    ${form.tipo === t.value
                      ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-700`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <span className="text-xl">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asunto / Título <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field w-full"
              placeholder="Ej: ¡Promoción de inscripción gratuita!"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input-field w-full resize-none"
              rows={5}
              placeholder="Escribe el contenido del mensaje aquí..."
              value={form.mensaje}
              onChange={e => set('mensaje', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.mensaje.length}/5000</p>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Fecha inicio <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input type="date" className="input-field w-full"
                value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Fecha fin <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input type="date" className="input-field w-full"
                value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} />
            </div>
          </div>

          {/* Destinatarios */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <Users className="w-4 h-4" /> Destinatarios
              </label>
              <button type="button" onClick={handlePreview}
                disabled={loadingPreview}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                {loadingPreview
                  ? <><Loader className="w-3 h-3 animate-spin" /> Calculando...</>
                  : <><Eye className="w-3 h-3" /> Ver destinatarios</>
                }
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { value: 'todos',     label: '👥 Todos' },
                { value: 'sucursal',  label: '🏠 Por sucursal' },
                { value: 'programa',  label: '🥋 Por programa' },
                { value: 'manual',    label: '✍️ Manual' },
              ].map(op => (
                <button key={op.value} type="button"
                  onClick={() => setDest('tipo', op.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all
                    ${form.destinatarios.tipo === op.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >{op.label}</button>
              ))}
            </div>

            {/* Sub-opciones por sucursal */}
            {form.destinatarios.tipo === 'sucursal' && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Selecciona las sucursales:</p>
                <div className="space-y-1">
                  {sucursales.map(s => (
                    <label key={s._id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={form.destinatarios.sucursales?.includes(s._id)}
                        onChange={e => {
                          const arr = form.destinatarios.sucursales || []
                          setDest('sucursales', e.target.checked
                            ? [...arr, s._id]
                            : arr.filter(id => id !== s._id))
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-opciones por programa */}
            {form.destinatarios.tipo === 'programa' && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Selecciona los programas:</p>
                <div className="grid grid-cols-2 gap-1">
                  {PROGRAMAS.map(p => (
                    <label key={p.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                        checked={form.destinatarios.programas?.includes(p.value)}
                        onChange={e => {
                          const arr = form.destinatarios.programas || []
                          setDest('programas', e.target.checked
                            ? [...arr, p.value]
                            : arr.filter(v => v !== p.value))
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Preview de destinatarios */}
            {preview && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-800">
                  📧 {preview.conEmail} destinatarios con email
                </p>
                {preview.preview?.length > 0 && (
                  <ul className="mt-1 text-xs text-blue-700 space-y-0.5">
                    {preview.preview.map((d, i) => (
                      <li key={i}>• {d.nombre} — {d.email}</li>
                    ))}
                    {preview.total > 10 && (
                      <li className="text-blue-500 italic">...y {preview.total - 10} más</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />Guardar</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal de detalle / envío ───────────────────────────────────────────────────
const EnvioModal = ({ isOpen, notificacion, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  if (!isOpen || !notificacion) return null

  const handleEnviar = async () => {
    if (!window.confirm(`¿Enviar "${notificacion.titulo}" por email ahora?`)) return
    setLoading(true)
    try {
      const res = await notificacionesAPI.enviar(notificacion._id)
      toast.success(res.message)
      onSuccess()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al enviar')
    } finally { setLoading(false) }
  }

  const t = TIPOS.find(t => t.value === notificacion.tipo)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-white font-bold">Detalles de la notificación</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{t?.icon}</span>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{notificacion.titulo}</h3>
              <div className="flex items-center gap-2 mt-1">
                <TipoBadge tipo={notificacion.tipo} />
                <EstadoBadge estado={notificacion.estado} />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 whitespace-pre-line">{notificacion.mensaje}</p>
          </div>

          {notificacion.estado === 'enviada' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-1">
                <BarChart2 className="w-4 h-4" /> Resultado del envío
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{notificacion.envio?.totalDestinatarios || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{notificacion.envio?.enviados || 0}</p>
                  <p className="text-xs text-gray-500">Enviados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">{notificacion.envio?.fallidos || 0}</p>
                  <p className="text-xs text-gray-500">Fallidos</p>
                </div>
              </div>
              {notificacion.envio?.fechaEnvio && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Enviado el {new Date(notificacion.envio.fechaEnvio).toLocaleString('es-MX')}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
          {notificacion.estado !== 'enviada' && notificacion.estado !== 'cancelada' && (
            <button
              onClick={handleEnviar}
              disabled={loading}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {loading
                ? <><Loader className="w-4 h-4 animate-spin" />Enviando...</>
                : <><Send className="w-4 h-4" />Enviar ahora</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
const NotificacionesPage = () => {
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchTerm, setSearch]   = useState('')
  const [filtroTipo, setFiltroTipo]     = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 })
  const [sucursales, setSucursales] = useState([])

  const [modalForm, setModalForm]   = useState(false)
  const [modalEnvio, setModalEnvio] = useState(false)
  const [selected, setSelected]     = useState(null)

  useEffect(() => {
    loadSucursales()
  }, [])

  useEffect(() => {
    loadItems()
  }, [pagination.page, pagination.limit, searchTerm, filtroTipo, filtroEstado])

  const loadSucursales = async () => {
    try {
      const res = await sucursalesAPI.getAll()
      setSucursales(res.data?.sucursales || [])
    } catch {}
  }

  const loadItems = async () => {
    setLoading(true)
    try {
      const res = await notificacionesAPI.getAll({
        page: pagination.page, limit: pagination.limit,
        search: searchTerm, tipo: filtroTipo, estado: filtroEstado
      })
      setItems(res.data || [])
      setPagination(prev => ({
        ...prev,
        total:      res.pagination?.total      ?? 0,
        totalPages: res.pagination?.totalPages ?? 1
      }))
    } catch { toast.error('Error al cargar notificaciones') }
    finally { setLoading(false) }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.titulo}"?`)) return
    try {
      await notificacionesAPI.delete(item._id)
      toast.success('Eliminada')
      loadItems()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const handlePageChange = (p) => {
    setPagination(prev => ({ ...prev, page: p }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Stats
  const stats = {
    total:     items.length,
    enviadas:  items.filter(i => i.estado === 'enviada').length,
    borradores: items.filter(i => i.estado === 'borrador').length,
    programadas: items.filter(i => i.estado === 'programada').length,
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            Notificaciones y Promociones
          </h1>
          <p className="text-gray-600 mt-1">Gestiona las campañas de comunicación con alumnos y tutores</p>
        </div>
        <button
          onClick={() => { setSelected(null); setModalForm(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nueva campaña
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: pagination.total,    icon: <Bell className="w-5 h-5 text-blue-600" />,   bg: 'bg-blue-100' },
          { label: 'Enviadas',    value: stats.enviadas,      icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-100' },
          { label: 'Borradores',  value: stats.borradores,    icon: <Clock className="w-5 h-5 text-gray-500" />,   bg: 'bg-gray-100' },
          { label: 'Programadas', value: stats.programadas,   icon: <Calendar className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-100' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
            <div className={`${s.bg} p-2.5 rounded-lg`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text" placeholder="Buscar por título o mensaje..."
              value={searchTerm}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />Filtros
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Todos</option>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Todos</option>
                {Object.entries(ESTADOS).map(([v, cfg]) => (
                  <option key={v} value={v}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-gray-600 font-medium">No hay campañas</h3>
            <p className="text-sm text-gray-400 mt-1">Crea tu primera notificación o promoción</p>
            <button onClick={() => { setSelected(null); setModalForm(true) }}
              className="mt-4 btn-primary">
              <Plus className="w-4 h-4 inline mr-1" /> Nueva campaña
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatarios</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creada</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-xs">{item.titulo}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">{item.mensaje}</p>
                      </td>
                      <td className="px-6 py-4"><TipoBadge tipo={item.tipo} /></td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.destinatarios?.tipo === 'todos' ? 'Todos'
                            : item.destinatarios?.tipo === 'sucursal' ? 'Por sucursal'
                            : item.destinatarios?.tipo === 'programa' ? 'Por programa'
                            : 'Manual'}
                        </span>
                        {item.estado === 'enviada' && (
                          <span className="text-xs text-green-600 ml-1">
                            ({item.envio?.enviados || 0} enviados)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4"><EstadoBadge estado={item.estado} /></td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setSelected(item); setModalEnvio(true) }}
                            className="text-blue-600 hover:text-blue-900" title="Ver detalles">
                            <Eye className="w-5 h-5" />
                          </button>
                          {item.estado !== 'enviada' && (
                            <>
                              <button onClick={() => { setSelected(item); setModalForm(true) }}
                                className="text-yellow-600 hover:text-yellow-900" title="Editar">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button onClick={() => { setSelected(item); setModalEnvio(true) }}
                                className="text-green-600 hover:text-green-900" title="Enviar">
                                <Send className="w-5 h-5" />
                              </button>
                              <button onClick={() => handleDelete(item)}
                                className="text-red-500 hover:text-red-700" title="Eliminar">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {items.map(item => (
                <div key={item._id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.titulo}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{item.mensaje}</p>
                    </div>
                    <EstadoBadge estado={item.estado} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <TipoBadge tipo={item.tipo} />
                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('es-MX')}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setSelected(item); setModalEnvio(true) }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    {item.estado !== 'enviada' && (
                      <>
                        <button onClick={() => { setSelected(item); setModalForm(true) }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setSelected(item); setModalEnvio(true) }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginado */}
            {pagination.total > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>
                    Mostrando <b>{Math.min((pagination.page-1)*pagination.limit+1, pagination.total)}</b>
                    {' '}–{' '}
                    <b>{Math.min(pagination.page*pagination.limit, pagination.total)}</b>
                    {' '}de <b>{pagination.total}</b>
                  </span>
                  <select value={pagination.limit}
                    onChange={e => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm">
                    {[10,15,20,50].map(n => <option key={n} value={n}>{n} por página</option>)}
                  </select>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => handlePageChange(1)} disabled={pagination.page===1}
                      className="px-2 py-1 rounded border text-sm disabled:opacity-40">«</button>
                    <button onClick={() => handlePageChange(pagination.page-1)} disabled={pagination.page===1}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-40">‹</button>
                    <span className="px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span>
                    <button onClick={() => handlePageChange(pagination.page+1)} disabled={pagination.page===pagination.totalPages}
                      className="px-3 py-1 rounded border text-sm disabled:opacity-40">›</button>
                    <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.page===pagination.totalPages}
                      className="px-2 py-1 rounded border text-sm disabled:opacity-40">»</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <NotificacionModal
        isOpen={modalForm}
        notificacion={selected && modalForm ? selected : null}
        onClose={() => { setModalForm(false); setSelected(null) }}
        onSuccess={() => { setModalForm(false); setSelected(null); loadItems() }}
        sucursales={sucursales}
      />
      <EnvioModal
        isOpen={modalEnvio}
        notificacion={selected}
        onClose={() => { setModalEnvio(false); setSelected(null) }}
        onSuccess={() => { setModalEnvio(false); setSelected(null); loadItems() }}
      />
    </div>
  )
}

export default NotificacionesPage