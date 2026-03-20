import React, { useState } from 'react'
import { Save, RotateCcw, Building2, Mail, Phone, Globe } from 'lucide-react'

const DEFAULTS = {
  sistema_nombre:   'Escuela Bedolla',
  sistema_email:    '',
  sistema_telefono: '',
  sistema_timezone: 'America/Mexico_City'
}

const GeneralConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
  const init = { ...DEFAULTS, ...configuraciones }
  const [form, setForm] = useState(init)

  // Cuando llegan nuevas configuraciones desde el backend, actualizar el form
  React.useEffect(() => {
    if (Object.keys(configuraciones).length > 0) {
      setForm({ ...DEFAULTS, ...configuraciones })
    }
  }, [JSON.stringify(configuraciones)])

  const handleChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          Información del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Sistema *
            </label>
            <input type="text" className="input-field"
              value={form.sistema_nombre}
              onChange={e => handleChange('sistema_nombre', e.target.value)}
              placeholder="Ej: Escuela Bedolla"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Mail className="w-4 h-4" /> Email de Contacto
            </label>
            <input type="email" className="input-field"
              value={form.sistema_email}
              onChange={e => handleChange('sistema_email', e.target.value)}
              placeholder="contacto@escuela.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Phone className="w-4 h-4" /> Teléfono de Contacto
            </label>
            <input type="tel" className="input-field"
              value={form.sistema_telefono}
              onChange={e => handleChange('sistema_telefono', e.target.value)}
              placeholder="961-123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Globe className="w-4 h-4" /> Zona Horaria
            </label>
            <input type="text" className="input-field bg-gray-50" 
              value="America/Mexico_City (GMT-6)" disabled />
            <p className="mt-1 text-xs text-gray-400">No modificable</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button type="button" onClick={onRestore} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className="w-4 h-4" /> Restaurar Valores por Defecto
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

export default GeneralConfigForm