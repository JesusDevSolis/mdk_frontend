import React, { useState, useEffect } from 'react'
import {
  X, GraduationCap, CheckCircle2, Award,
  ArrowRight, Loader, AlertCircle, Users
} from 'lucide-react'
import { examenesAPI, graduacionesAPI, BELT_LEVELS_DISPLAY } from '../../services/APIservice'
import toast from 'react-hot-toast'

const BELT_COLOR = {
  'blanco': '#F3F4F6', 'blanco-amarillo': '#FEF9C3', 'amarillo': '#FDE047',
  'amarillo-naranja': '#FDBA74', 'naranja': '#FB923C', 'naranja-verde': '#A3E635',
  'verde': '#22C55E', 'verde-azul': '#34D399', 'azul': '#3B82F6',
  'azul-marron': '#6366F1', 'marron': '#92400E', 'marron-negro': '#44403C',
}
for (let i = 1; i <= 9; i++) BELT_COLOR[`negro-${i}`] = '#111827'

const BeltBadge = ({ level, size = 'sm' }) => {
  const label = BELT_LEVELS_DISPLAY?.[level] || level?.replace(/-/g, ' ') || 'Sin cinturón'
  const color = BELT_COLOR[level] || '#9CA3AF'
  const isLight = ['blanco', 'blanco-amarillo', 'amarillo', 'amarillo-naranja'].includes(level)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium border
      ${size === 'lg' ? 'text-sm px-4 py-1.5' : 'text-xs'}`}
      style={{
        backgroundColor: color,
        borderColor: isLight ? '#D1D5DB' : color,
        color: isLight ? '#1F2937' : '#FFFFFF',
      }}>
      {label}
    </span>
  )
}

const GraduacionModal = ({ examen, isOpen, onClose, onSuccess }) => {
  const [loadingData, setLoadingData]         = useState(false)
  const [procesando, setProcesando]           = useState(false)
  const [aprobados, setAprobados]             = useState([])
  const [seleccionados, setSeleccionados]     = useState([])

  useEffect(() => {
    if (isOpen && examen) loadAprobados()
  }, [isOpen, examen])

  const loadAprobados = async () => {
    try {
      setLoadingData(true)
      const res = await examenesAPI.getCalificacionesExamen(examen._id)
      if (res.success) {
        setAprobados(res.data.calificaciones?.filter(c => c.resultado === 'aprobado') || [])
      }
    } catch {
      toast.error('Error al cargar alumnos aprobados')
    } finally {
      setLoadingData(false)
    }
  }

  const toggleSeleccion = (calif) => {
    const id = calif.alumno._id
    setSeleccionados(prev =>
      prev.some(s => s.alumnoId === id)
        ? prev.filter(s => s.alumnoId !== id)
        : [...prev, {
            alumnoId:      id,
            calificacionId: calif._id,
            alumnoNombre:  `${calif.alumno.firstName} ${calif.alumno.lastName}`,
            cinturonActual: calif.alumno.belt?.level || 'blanco',
          }]
    )
  }

  const toggleTodos = () => {
    if (seleccionados.length === aprobados.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(aprobados.map(c => ({
        alumnoId:      c.alumno._id,
        calificacionId: c._id,
        alumnoNombre:  `${c.alumno.firstName} ${c.alumno.lastName}`,
        cinturonActual: c.alumno.belt?.level || 'blanco',
      })))
    }
  }

  const handleGraduar = async () => {
    if (seleccionados.length === 0) { toast.error('Selecciona al menos un alumno'); return }
    if (!window.confirm(
      `¿Graduar a ${seleccionados.length} alumno${seleccionados.length !== 1 ? 's' : ''}?\n\n` +
      `Se actualizará su cinturón a ${BELT_LEVELS_DISPLAY?.[examen.cinturonObjetivo] || examen.cinturonObjetivo}.`
    )) return
    try {
      setProcesando(true)
      const res = await graduacionesAPI.procesarGraduaciones({
        examenId:       examen._id,
        alumnosGraduar: seleccionados.map(s => ({
          alumnoId:      s.alumnoId,
          calificacionId: s.calificacionId,
        })),
      })
      if (res.success) {
        const { exitosas, fallidas } = res.data
        if (exitosas.length > 0)
          toast.success(`${exitosas.length} alumno${exitosas.length !== 1 ? 's' : ''} graduado${exitosas.length !== 1 ? 's' : ''} exitosamente`)
        if (fallidas.length > 0)
          toast.error(`${fallidas.length} graduación${fallidas.length !== 1 ? 'es' : ''} fallida${fallidas.length !== 1 ? 's' : ''}`)
        setSeleccionados([])
        await loadAprobados()
        onSuccess?.()
        if (fallidas.length === 0) setTimeout(onClose, 1200)
      }
    } catch {
      toast.error('Error al procesar graduaciones')
    } finally {
      setProcesando(false)
    }
  }

  if (!isOpen) return null

  const todosSeleccionados = seleccionados.length > 0 && seleccionados.length === aprobados.length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-xl">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Procesar Graduaciones</h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{examen.nombre}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cinturón objetivo */}
        <div className="px-6 py-4 bg-purple-50/50 border-b border-purple-100/50">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-500">Cinturón a otorgar:</span>
            <BeltBadge level={examen.cinturonObjetivo} size="lg" />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-7 h-7 animate-spin text-primary-600" />
            </div>
          ) : aprobados.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay alumnos aprobados</p>
              <p className="text-sm text-gray-400 mt-1">Los alumnos deben tener calificación aprobada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Seleccionar todos */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{aprobados.length}</span> alumno{aprobados.length !== 1 ? 's' : ''} aprobado{aprobados.length !== 1 ? 's' : ''}
                </div>
                <button onClick={toggleTodos}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  {todosSeleccionados ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>

              {aprobados.map(calif => {
                const isSelected = seleccionados.some(s => s.alumnoId === calif.alumno._id)
                const alumno     = calif.alumno
                return (
                  <div key={calif._id} onClick={() => toggleSeleccion(calif)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>

                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-600">
                        {alumno.firstName?.[0]}{alumno.lastName?.[0]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {alumno.firstName} {alumno.lastName}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        Calificación: {Math.round(calif.calificacionFinal * 10) / 10}/100
                      </p>
                    </div>

                    {/* Cambio de cinturón */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <BeltBadge level={alumno.belt?.level} />
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <BeltBadge level={examen.cinturonObjetivo} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-500">
            {seleccionados.length > 0
              ? <span className="font-medium text-primary-600">{seleccionados.length} seleccionado{seleccionados.length !== 1 ? 's' : ''}</span>
              : 'Selecciona alumnos para graduar'
            }
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={procesando} className="btn-secondary px-5">
              Cancelar
            </button>
            <button onClick={handleGraduar}
              disabled={seleccionados.length === 0 || procesando}
              className="btn-primary px-5 flex items-center gap-2 disabled:opacity-50">
              {procesando
                ? <><Loader className="w-4 h-4 animate-spin" />Procesando...</>
                : <><Award className="w-4 h-4" />Graduar {seleccionados.length > 0 ? `(${seleccionados.length})` : ''}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GraduacionModal