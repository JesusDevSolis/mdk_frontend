import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, GraduationCap, Award, DollarSign, Percent } from 'lucide-react'

const DEFAULTS = {
  examen_calificacion_minima:  70,
  examen_asistencia_minima:    80,
  examen_dias_minimos_cinturon: 90,
  examen_costo_base:           500
}

const ExamenesConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
  const [form, setForm] = useState({ ...DEFAULTS, ...configuraciones })

  useEffect(() => {
    if (Object.keys(configuraciones).length > 0) {
      setForm({ ...DEFAULTS, ...configuraciones })
    }
  }, [JSON.stringify(configuraciones)])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      examen_calificacion_minima:   parseInt(form.examen_calificacion_minima),
      examen_asistencia_minima:     parseInt(form.examen_asistencia_minima),
      examen_dias_minimos_cinturon: parseInt(form.examen_dias_minimos_cinturon),
      examen_costo_base:            parseFloat(form.examen_costo_base)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-600" />
          Requisitos para Examen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Percent className="w-4 h-4" /> Calificación Mínima
            </label>
            <div className="relative">
              <input type="number" min="0" max="100" className="input-field pr-8"
                value={form.examen_calificacion_minima}
                onChange={e => set('examen_calificacion_minima', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Calificación mínima para aprobar el examen</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Percent className="w-4 h-4" /> Asistencia Mínima
            </label>
            <div className="relative">
              <input type="number" min="0" max="100" className="input-field pr-8"
                value={form.examen_asistencia_minima}
                onChange={e => set('examen_asistencia_minima', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">%</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Porcentaje mínimo de asistencia requerido</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" /> Días Mínimos en Cinturón Actual
            </label>
            <div className="relative">
              <input type="number" min="0" className="input-field pr-14"
                value={form.examen_dias_minimos_cinturon}
                onChange={e => set('examen_dias_minimos_cinturon', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">≈ {Math.round((Number(form.examen_dias_minimos_cinturon)||0)/30)} meses</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <DollarSign className="w-4 h-4" /> Costo Base del Examen
            </label>
            <div className="relative">
              <input type="number" min="0" step="0.01" className="input-field pl-7"
                value={form.examen_costo_base}
                onChange={e => set('examen_costo_base', e.target.value)}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">$</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Costo estándar por examen de graduación</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button type="button" onClick={onRestore} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className="w-4 h-4" /> Restaurar Valores
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}

export default ExamenesConfigForm