import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, ClipboardCheck, Clock, FileText } from 'lucide-react'

const DEFAULTS = {
  asistencia_tolerancia_retardo:   15,
  asistencia_dias_justificar:       3,
  asistencia_requiere_justificante: false
}

const AsistenciasConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
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
      asistencia_tolerancia_retardo:   parseInt(form.asistencia_tolerancia_retardo),
      asistencia_dias_justificar:       parseInt(form.asistencia_dias_justificar),
      asistencia_requiere_justificante: form.asistencia_requiere_justificante
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary-600" />
          Parámetros de Asistencia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Tolerancia de Retardo
            </label>
            <div className="relative">
              <input type="number" min="0" max="60" className="input-field pr-20"
                value={form.asistencia_tolerancia_retardo}
                onChange={e => set('asistencia_tolerancia_retardo', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">minutos</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Minutos de gracia antes de marcar como retardo</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" /> Días para Justificar
            </label>
            <div className="relative">
              <input type="number" min="1" max="30" className="input-field pr-14"
                value={form.asistencia_dias_justificar}
                onChange={e => set('asistencia_dias_justificar', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Días límite para presentar justificante</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Justificantes
        </h3>
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input type="checkbox" id="asistencia_requiere_justificante"
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded"
            checked={!!form.asistencia_requiere_justificante}
            onChange={e => set('asistencia_requiere_justificante', e.target.checked)}
          />
          <div>
            <label htmlFor="asistencia_requiere_justificante" className="font-medium text-gray-900 cursor-pointer">
              Requerir justificante para faltas
            </label>
            <p className="text-sm text-gray-500 mt-1">Los alumnos deben presentar justificante para ausencias justificadas</p>
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

export default AsistenciasConfigForm