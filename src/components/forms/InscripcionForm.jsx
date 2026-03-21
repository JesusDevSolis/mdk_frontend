import React, { useState, useEffect } from 'react'
import {
  X, UserPlus, Search, AlertCircle, CheckCircle2,
  Users, Award, Calendar, DollarSign, Percent,
  Save, Loader, XCircle, Trash2, ChevronRight
} from 'lucide-react'
import { examenesAPI, alumnosAPI, utils } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

const BELT_COLOR = {
  'blanco': '#F3F4F6', 'blanco-amarillo': '#FEF9C3', 'amarillo': '#FDE047',
  'amarillo-naranja': '#FDBA74', 'naranja': '#FB923C', 'naranja-verde': '#A3E635',
  'verde': '#22C55E', 'verde-azul': '#34D399', 'azul': '#3B82F6',
  'azul-marron': '#6366F1', 'marron': '#92400E', 'marron-negro': '#44403C',
  'negro-1': '#111827', 'negro-2': '#111827', 'negro-3': '#111827',
  'negro-4': '#111827', 'negro-5': '#111827', 'negro-6': '#111827',
  'negro-7': '#111827', 'negro-8': '#111827', 'negro-9': '#111827',
}

const BeltPill = ({ level }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
    <div className="w-2.5 h-2.5 rounded-full border border-gray-200 flex-shrink-0"
      style={{ backgroundColor: BELT_COLOR[level] || '#9CA3AF' }} />
    <span className="capitalize">{level?.replace(/-/g, ' ') || 'Sin cinturón'}</span>
  </span>
)

const RequisitosBadge = ({ requisitos }) => {
  if (!requisitos) return null
  if (requisitos.cumpleTodos) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Cumple requisitos
      </span>
    )
  }
  const faltantes = []
  if (!requisitos.detalles?.asistencia?.cumple)    faltantes.push('Asistencia')
  if (!requisitos.detalles?.diasConCinturon?.cumple) faltantes.push('Días cinturón')
  if (!requisitos.detalles?.pagosAlCorriente?.cumple) faltantes.push('Pagos')
  if (faltantes.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {faltantes.map(f => (
        <span key={f} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">
          {f}
        </span>
      ))}
    </div>
  )
}

const InscripcionForm = ({ examen, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [loading, setLoading]                   = useState(false)
  const [examenActual, setExamenActual]           = useState(null)
  const [alumnosElegibles, setAlumnosElegibles]   = useState([])
  const [alumnosInscritos, setAlumnosInscritos]   = useState([])
  const [searchTerm, setSearchTerm]               = useState('')
  const [selectedAlumnos, setSelectedAlumnos]     = useState([])
  const [loadingAlumnos, setLoadingAlumnos]       = useState(true)
  const [showTab, setShowTab]                     = useState('disponibles')

  useEffect(() => {
    if (isOpen && examen) {
      setExamenActual(examen)
      setAlumnosElegibles([])
      setSelectedAlumnos([])
      setSearchTerm('')
      setShowTab('disponibles')
      if (examen._id) loadAlumnosElegibles(examen)
    }
  }, [isOpen, examen])

  const loadAlumnosElegibles = async (examenParam = null) => {
    const ex = examenParam || examenActual
    if (!ex?._id) return
    try {
      setLoadingAlumnos(true)

      // ── Siempre cargar el examen completo para tener alumnosInscritos populados ──
      let exCompleto = ex
      const primeraInscripcion = ex.alumnosInscritos?.[0]
      const alumnoPopulado = primeraInscripcion?.alumno
      const necesitaPopulate = ex.alumnosInscritos?.length > 0
        && !(alumnoPopulado && typeof alumnoPopulado === 'object' && alumnoPopulado.firstName)

      if (necesitaPopulate) {
        const exRes = await examenesAPI.getById(ex._id)
        if (exRes.success && exRes.data) exCompleto = exRes.data
      }

      // IDs ya inscritos (para excluirlos de disponibles)
      const idsInscritos = (exCompleto.alumnosInscritos || []).map(i =>
        i.alumno?._id?.toString() || i.alumno?.toString() || null
      ).filter(Boolean)

      // ── Cargar alumnos disponibles ──
      const eligiblesRes = await examenesAPI.getAlumnosElegibles(ex._id)
      if (eligiblesRes.success && eligiblesRes.data?.length > 0) {
        setAlumnosElegibles(eligiblesRes.data)
      } else {
        // Fallback: todos los activos de la sucursal
        const alumnosRes = await alumnosAPI.getAll({
          sucursal: ex.sucursal?._id || ex.sucursal,
          status: 'activo'
        })
        if (alumnosRes.success && alumnosRes.data) {
          const arr = alumnosRes.data.alumnos || alumnosRes.data
          if (Array.isArray(arr)) {
            const cinturonReq = exCompleto.cinturonActualRequerido
            setAlumnosElegibles(
              arr
                // Excluir ya inscritos
                .filter(a => !idsInscritos.includes(a._id?.toString()))
                // Filtrar por cinturón requerido si el examen es de graduación
                .filter(a => {
                  if (exCompleto.tipo !== 'graduacion' || !cinturonReq) return true
                  return a.belt?.level === cinturonReq
                })
                .map(a => ({ ...a, requisitos: { cumpleTodos: false, detalles: {} } }))
            )
          }
        }
      }

      // ── Procesar inscritos con datos populados ──
      setAlumnosInscritos(
        (exCompleto.alumnosInscritos || []).map(inscrito => {
          // alumno viene populado de getById o del examen original si ya tenía datos
          const a = (typeof inscrito.alumno === 'object' && inscrito.alumno?.firstName)
            ? inscrito.alumno
            : inscrito
          return {
            _id:               a._id,
            firstName:         a.firstName  || '—',
            lastName:          a.lastName   || '',
            belt:              a.belt,
            fechaInscripcion:  inscrito.inscritoEn || inscrito.fechaInscripcion,
            descuentoAplicado: inscrito.pagoExamen?.descuentoAplicado || 0,
            montoPagado:       inscrito.pagoExamen?.monto || 0,
            pagado:            inscrito.pagoExamen?.pagado || false,
          }
        })
      )
    } catch (err) {
      toast.error('Error al cargar alumnos')
    } finally {
      setLoadingAlumnos(false)
    }
  }

  const toggleAlumno = (alumno) => {
    const ya = selectedAlumnos.find(a => a._id === alumno._id)
    if (ya) {
      setSelectedAlumnos(prev => prev.filter(a => a._id !== alumno._id))
    } else {
      const costo = examenActual?.requisitos?.costoExamen || 0
      setSelectedAlumnos(prev => [...prev, { ...alumno, descuento: 0, montoFinal: costo, autorizadoSinPago: false }])
    }
  }

  const updateDescuento = (id, desc) => {
    setSelectedAlumnos(prev => prev.map(a => {
      if (a._id !== id) return a
      const costo = examenActual?.requisitos?.costoExamen || 0
      const d     = parseFloat(desc) || 0
      return { ...a, descuento: d, montoFinal: costo - (costo * d / 100) }
    }))
  }

  const handleInscribir = async () => {
    if (selectedAlumnos.length === 0) { toast.error('Selecciona al menos un alumno'); return }
    try {
      setLoading(true)
      const results = await Promise.all(
        selectedAlumnos.map(a =>
          examenesAPI.inscribirAlumno(examenActual._id, {
            alumnoId: a._id,
            descuento: a.descuento || 0,
            autorizadoSinPago: a.autorizadoSinPago || false,
          })
        )
      )
      const ok   = results.filter(r => r.success).length
      const fail = results.length - ok
      if (ok   > 0) toast.success(`${ok} alumno${ok !== 1 ? 's' : ''} inscrito${ok !== 1 ? 's' : ''} correctamente`)
      if (fail > 0) toast.error(`${fail} inscripción${fail !== 1 ? 'es' : ''} fallida${fail !== 1 ? 's' : ''}`)
      if (ok > 0) { onSuccess?.(); handleClose() }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al inscribir')
    } finally {
      setLoading(false)
    }
  }

  const handleDesinscribir = async (alumno) => {
    if (!window.confirm(`¿Desinscribir a ${alumno.firstName} ${alumno.lastName}?`)) return
    try {
      setLoading(true)
      const res = await examenesAPI.desinscribirAlumno(examenActual._id, alumno._id)
      if (res.success) {
        toast.success('Alumno desinscrito')
        const exActualizado = await examenesAPI.getById(examenActual._id)
        if (exActualizado.success) {
          setExamenActual(exActualizado.data)
          loadAlumnosElegibles(exActualizado.data)
          onSuccess?.()
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al desinscribir')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { setSelectedAlumnos([]); setSearchTerm(''); onClose() }

  const filteredElegibles = alumnosElegibles.filter(a =>
    `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen || !examenActual) return null

  const costoBase = examenActual.requisitos?.costoExamen || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Gestionar Inscripciones</h2>
              <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{examenActual.nombre}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              {utils.formatDate(examenActual.fecha)}
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-gray-400" />
              Costo: ${costoBase.toFixed(2)}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              {alumnosInscritos.length} inscrito{alumnosInscritos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[
            { id: 'disponibles', label: 'Disponibles', count: alumnosElegibles.length },
            { id: 'inscritos',   label: 'Inscritos',   count: alumnosInscritos.length   },
          ].map(tab => (
            <button key={tab.id} onClick={() => setShowTab(tab.id)}
              className={`flex items-center gap-2 px-1 py-3 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors
                ${showTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs
                ${showTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">

          {/* Tab: Disponibles */}
          {showTab === 'disponibles' && (
            <div className="h-full grid grid-cols-2 divide-x divide-gray-100">

              {/* Columna izquierda — lista de disponibles */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9 w-full text-sm"
                      placeholder="Buscar alumno..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingAlumnos ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader className="w-6 h-6 animate-spin text-primary-600" />
                    </div>
                  ) : filteredElegibles.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No hay alumnos disponibles</p>
                    </div>
                  ) : filteredElegibles.map(alumno => {
                    const isSelected = selectedAlumnos.some(a => a._id === alumno._id)
                    return (
                      <div key={alumno._id} onClick={() => toggleAlumno(alumno)}
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors
                          ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {alumno.firstName} {alumno.lastName}
                          </p>
                          <BeltPill level={alumno.belt?.level} />
                          <RequisitosBadge requisitos={alumno.requisitos} />
                        </div>
                        {isSelected && <ChevronRight className="w-4 h-4 text-primary-400 mt-1 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Columna derecha — seleccionados con configuración */}
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700">
                    Seleccionados
                    <span className="ml-2 text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      {selectedAlumnos.length}
                    </span>
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {selectedAlumnos.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Selecciona alumnos de la izquierda</p>
                    </div>
                  ) : selectedAlumnos.map(alumno => (
                    <div key={alumno._id} className="px-4 py-3 border-b border-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {alumno.firstName} {alumno.lastName}
                          </p>
                          <BeltPill level={alumno.belt?.level} />
                        </div>
                        <button onClick={() => toggleAlumno(alumno)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>

                      {costoBase > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500 flex items-center gap-1 w-24 flex-shrink-0">
                              <Percent className="w-3 h-3" /> Descuento
                            </label>
                            <input type="number" min="0" max="100"
                              value={alumno.descuento || 0}
                              onChange={e => updateDescuento(alumno._id, e.target.value)}
                              className="input-field text-xs py-1.5 w-20 text-center" />
                          </div>
                          <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                            <span className="text-gray-500">Total a pagar:</span>
                            <span className="font-semibold text-gray-800">${alumno.montoFinal?.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox"
                          checked={alumno.autorizadoSinPago || false}
                          onChange={e => setSelectedAlumnos(prev =>
                            prev.map(a => a._id === alumno._id ? { ...a, autorizadoSinPago: e.target.checked } : a)
                          )}
                          className="w-3.5 h-3.5 text-primary-600 rounded border-gray-300" />
                        <span className="text-xs text-gray-600">Autorizar sin requisitos (cinturón, asistencia, pagos)</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Inscritos */}
          {showTab === 'inscritos' && (
            <div className="overflow-y-auto h-full">
              {loadingAlumnos ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="w-6 h-6 animate-spin text-primary-600" />
                </div>
              ) : alumnosInscritos.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay alumnos inscritos</p>
                </div>
              ) : alumnosInscritos.map(alumno => (
                <div key={alumno._id}
                  className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {alumno.firstName?.[0]}{alumno.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alumno.firstName} {alumno.lastName}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <BeltPill level={alumno.belt?.level} />
                      {alumno.fechaInscripcion && (
                        <span className="text-xs text-gray-400">
                          <Calendar className="w-3 h-3 inline mr-0.5" />
                          {utils.formatDate(alumno.fechaInscripcion)}
                        </span>
                      )}
                    </div>
                  </div>
                  {alumno.pagado
                    ? <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                      </span>
                    : <span className="text-xs text-amber-600 font-medium">Pago pendiente</span>
                  }
                  <button onClick={() => handleDesinscribir(alumno)} disabled={loading}
                    className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                    <Trash2 className="w-3 h-3" /> Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            {showTab === 'disponibles'
              ? <><span className="font-medium text-gray-700">{selectedAlumnos.length}</span> seleccionado{selectedAlumnos.length !== 1 ? 's' : ''}</>
              : <><span className="font-medium text-gray-700">{alumnosInscritos.length}</span> inscrito{alumnosInscritos.length !== 1 ? 's' : ''}</>
            }
          </span>
          <div className="flex items-center gap-3">
            <button onClick={handleClose} disabled={loading} className="btn-secondary px-5">
              Cerrar
            </button>
            {showTab === 'disponibles' && (
              <button onClick={handleInscribir}
                disabled={loading || selectedAlumnos.length === 0}
                className="btn-primary px-5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" />Inscribiendo...</>
                  : <><Save className="w-4 h-4" />Inscribir {selectedAlumnos.length > 0 ? `(${selectedAlumnos.length})` : ''}</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InscripcionForm