import React, { useState, useEffect } from 'react'
import {
  X, Award, Save, Loader, CheckCircle2,
  XCircle, AlertCircle, TrendingUp, Users, ChevronRight, DollarSign, Lock
} from 'lucide-react'
import { examenesAPI } from '../../services/APIservice'
import { useAuth } from '../../context/Authcontext'
import toast from 'react-hot-toast'

const BELT_COLOR = {
  'blanco': '#F3F4F6', 'blanco-amarillo': '#FEF9C3', 'amarillo': '#FDE047',
  'amarillo-naranja': '#FDBA74', 'naranja': '#FB923C', 'naranja-verde': '#A3E635',
  'verde': '#22C55E', 'verde-azul': '#34D399', 'azul': '#3B82F6',
  'azul-marron': '#6366F1', 'marron': '#92400E', 'marron-negro': '#44403C',
}
for (let i = 1; i <= 9; i++) BELT_COLOR[`negro-${i}`] = '#111827'

const CalificacionForm = ({ examen, isOpen, onClose, onSuccess }) => {
  const { user }      = useAuth()
  const [loading, setLoading]               = useState(false)
  const [alumnos, setAlumnos]               = useState([])
  const [selectedAlumno, setSelectedAlumno] = useState(null)
  const [calificaciones, setCalificaciones] = useState({})
  const [loadingAlumnos, setLoadingAlumnos] = useState(true)

  useEffect(() => {
    if (isOpen && examen) loadAlumnos()
  }, [isOpen, examen])

  const loadAlumnos = async () => {
    try {
      setLoadingAlumnos(true)

      // Siempre cargar desde getById para tener pagoExamen.pagado actualizado
      // (el prop examen puede tener datos desactualizados si el pago se hizo después)
      let fuente = examen.alumnosInscritos || []
      if (examen._id) {
        const res = await examenesAPI.getById(examen._id)
        if (res.success && res.data) {
          fuente = res.data.alumnosInscritos || []
        }
      }

      const inscritos = fuente.map(i => {
        const a = i.alumno || i
        return {
          _id: a._id || a,
          firstName: a.firstName || '—',
          lastName:  a.lastName  || '',
          belt:      a.belt,
          calificado:  i.calificado || false,
          aprobado:    i.aprobado,
          pagado:      i.pagoExamen?.pagado || false,
          montoPagado: i.pagoExamen?.montoPagado || 0,
        }
      })
      setAlumnos(inscritos)
      // Seleccionar primer alumno: priorizar los que pagaron y no están calificados
      const primero = inscritos.find(a => a.pagado && !a.calificado)
                   || inscritos.find(a => !a.calificado)
                   || inscritos[0]
      if (primero) selectAlumno(primero)
    } catch {
      toast.error('Error al cargar alumnos')
    } finally {
      setLoadingAlumnos(false)
    }
  }

  const selectAlumno = async (alumno) => {
    setSelectedAlumno(alumno)
    if (alumno.calificado) {
      try {
        const res = await examenesAPI.getCalificacionAlumno(examen._id, alumno._id)
        if (res.success && res.data) {
          const califs = {}
          res.data.calificacionesPorCategoria?.forEach(c => {
            califs[c.categoria] = { puntuacion: c.calificacion, peso: c.peso }
          })
          setCalificaciones(califs)
          return
        }
      } catch {}
    }
    // Inicializar en 0
    const califs = {}
    examen.categorias?.forEach(c => {
      califs[c.nombre] = { puntuacion: 0, peso: c.peso }
    })
    setCalificaciones(califs)
  }

  const updatePuntuacion = (cat, val) => {
    setCalificaciones(prev => ({
      ...prev,
      [cat]: { ...prev[cat], puntuacion: parseFloat(val) || 0 }
    }))
  }

  const calcularFinal = () =>
    Object.values(calificaciones).reduce((s, { puntuacion, peso }) =>
      s + (puntuacion * peso) / 100, 0)

  const handleGuardar = async () => {
    if (!selectedAlumno) { toast.error('Selecciona un alumno'); return }
    const final   = calcularFinal()
    const minimo  = examen.requisitos?.calificacionMinima || 60
    const aprobado = final >= minimo
    try {
      setLoading(true)
      const res = await examenesAPI.calificarAlumno(examen._id, {
        alumnoId:         selectedAlumno._id,
        calificaciones:   Object.entries(calificaciones).map(([nombre, { puntuacion, peso }]) => ({
          categoria: nombre, puntuacion, peso
        })),
        calificacionFinal: final,
        aprobado,
      })
      if (res.success) {
        toast.success('Calificación guardada')
        const updated = alumnos.map(a =>
          a._id === selectedAlumno._id ? { ...a, calificado: true, aprobado } : a
        )
        setAlumnos(updated)
        const siguiente = updated.find(a => a._id !== selectedAlumno._id && !a.calificado)
        if (siguiente) {
          selectAlumno(siguiente)
        } else {
          toast.success('¡Todos los alumnos calificados!')
          setTimeout(() => { onSuccess?.(); handleClose() }, 1200)
        }
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Error al guardar calificación'
      toast.error(msg, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => { setSelectedAlumno(null); setCalificaciones({}); onClose() }

  if (!isOpen || !examen) return null

  const final   = calcularFinal()
  const minimo  = examen.requisitos?.calificacionMinima || 60
  const aprobado = final >= minimo
  const calificados = alumnos.filter(a => a.calificado).length
  const aprobados   = alumnos.filter(a => a.calificado && a.aprobado).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Calificar Alumnos</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{examen.nombre}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
          {[
            { label: 'Inscritos',   val: alumnos.length,  color: 'text-gray-700' },
            { label: 'Calificados', val: `${calificados}/${alumnos.length}`, color: 'text-primary-600' },
            { label: 'Aprobados',   val: aprobados,        color: 'text-green-600' },
          ].map(({ label, val, color }) => (
            <div key={label} className="py-3 text-center">
              <div className={`text-xl font-bold ${color}`}>{val}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-3">

          {/* Columna lista alumnos */}
          <div className="border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alumnos</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingAlumnos ? (
                <div className="flex items-center justify-center h-24">
                  <Loader className="w-5 h-5 animate-spin text-primary-600" />
                </div>
              ) : alumnos.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Sin alumnos inscritos</p>
                </div>
              ) : alumnos.map(alumno => (
                <div key={alumno._id} onClick={() => selectAlumno(alumno)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors
                    ${selectedAlumno?._id === alumno._id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {alumno.firstName?.[0]}{alumno.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alumno.firstName} {alumno.lastName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {alumno.belt?.level && (
                        <div className="w-2 h-2 rounded-full border border-gray-200"
                          style={{ backgroundColor: BELT_COLOR[alumno.belt.level] || '#9CA3AF' }} />
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {alumno.belt?.level?.replace(/-/g, ' ') || 'Sin cinturón'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex flex-col items-center gap-0.5">
                    {alumno.calificado
                      ? alumno.aprobado
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-red-500" />
                      : <AlertCircle className="w-4 h-4 text-gray-300" />
                    }
                    {examen.requisitos?.costoExamen > 0 && (
                      alumno.pagado
                        ? <DollarSign className="w-3 h-3 text-green-500" />
                        : <Lock className="w-3 h-3 text-amber-400" />
                    )}
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna calificación */}
          <div className="col-span-2 flex flex-col overflow-hidden">
            {!selectedAlumno ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Selecciona un alumno para calificar</p>
                </div>
              </div>
            ) : (
              <>
                {/* Alumno seleccionado */}
                <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {selectedAlumno.firstName?.[0]}{selectedAlumno.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedAlumno.firstName} {selectedAlumno.lastName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {selectedAlumno.belt?.level?.replace(/-/g, ' ') || 'Sin cinturón'}
                    </p>
                  </div>
                  {selectedAlumno.calificado && (
                    <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                      Ya calificado — editando
                    </span>
                  )}
                  {examen.requisitos?.costoExamen > 0 && !selectedAlumno.pagado && (
                    <span className="ml-auto text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Sin pago registrado
                    </span>
                  )}
                </div>

                {/* Categorías */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {examen.categorias?.map(cat => {
                    const pts    = calificaciones[cat.nombre]?.puntuacion || 0
                    const aporte = (pts * cat.peso) / 100
                    const pct    = pts / 100
                    return (
                      <div key={cat.nombre}
                        className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{cat.nombre}</p>
                            {cat.descripcion && <p className="text-xs text-gray-400">{cat.descripcion}</p>}
                          </div>
                          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            Peso: {cat.peso}%
                          </span>
                        </div>

                        {/* Slider + input */}
                        <div className="flex items-center gap-3">
                          <input type="range" min="0" max="100" step="1"
                            value={pts}
                            onChange={e => updatePuntuacion(cat.nombre, e.target.value)}
                            className="flex-1 accent-primary-600" />
                          <input type="number" min="0" max="100"
                            value={pts}
                            onChange={e => updatePuntuacion(cat.nombre, e.target.value)}
                            className="input-field w-16 text-center text-sm font-bold py-1.5" />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full mr-3 overflow-hidden">
                            <div className="h-full bg-primary-400 rounded-full transition-all"
                              style={{ width: `${pct * 100}%` }} />
                          </div>
                          <span>Aporte: <strong className="text-gray-700">{aporte.toFixed(1)} pts</strong></span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resultado final + guardar */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className={`flex items-center justify-between p-4 rounded-xl mb-4 border-2
                    ${aprobado ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`w-6 h-6 ${aprobado ? 'text-green-600' : 'text-red-600'}`} />
                      <div>
                        <p className="text-xs text-gray-600">Calificación Final</p>
                        <p className={`text-2xl font-bold ${aprobado ? 'text-green-700' : 'text-red-700'}`}>
                          {final.toFixed(1)}
                          <span className="text-sm font-normal text-gray-400 ml-1">/100</span>
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 text-base font-bold ${aprobado ? 'text-green-700' : 'text-red-600'}`}>
                      {aprobado
                        ? <><CheckCircle2 className="w-5 h-5" /> APROBADO</>
                        : <><XCircle className="w-5 h-5" /> REPROBADO</>
                      }
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mb-3">Mínimo para aprobar: {minimo} puntos</p>
                  <button onClick={handleGuardar} disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                    {loading
                      ? <><Loader className="w-4 h-4 animate-spin" />Guardando...</>
                      : <><Save className="w-4 h-4" />Guardar Calificación</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <span className="text-xs text-gray-500">
            Progreso: <span className="font-semibold text-gray-700">{calificados}/{alumnos.length}</span> calificados
          </span>
          <button onClick={handleClose} disabled={loading} className="btn-secondary text-sm px-4">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalificacionForm