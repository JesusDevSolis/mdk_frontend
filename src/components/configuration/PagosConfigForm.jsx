import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, DollarSign, Percent, CreditCard } from 'lucide-react'

const DEFAULTS = {
  pago_dias_gracia:          5,
  pago_recargo_tardio:       10,
  pago_requiere_comprobante: false
}

const PagosConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
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
      pago_dias_gracia:          parseInt(form.pago_dias_gracia),
      pago_recargo_tardio:       parseFloat(form.pago_recargo_tardio),
      pago_requiere_comprobante: form.pago_requiere_comprobante
    })
  }

  const recargo = Number(form.pago_recargo_tardio) || 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary-600" />
          Políticas de Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días de Gracia
            </label>
            <div className="relative">
              <input type="number" min="0" max="30" className="input-field pr-16"
                value={form.pago_dias_gracia}
                onChange={e => set('pago_dias_gracia', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Días después del vencimiento antes de aplicar recargo</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recargo por Pago Tardío
            </label>
            <div className="relative">
              <input type="number" step="0.1" min="0" max="100" className="input-field pr-10"
                value={form.pago_recargo_tardio}
                onChange={e => set('pago_recargo_tardio', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center">
                <Percent className="w-4 h-4 text-gray-400" />
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Porcentaje sobre el monto original</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-600" />
          Comprobantes
        </h3>
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <input type="checkbox" id="pago_requiere_comprobante"
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded"
            checked={!!form.pago_requiere_comprobante}
            onChange={e => set('pago_requiere_comprobante', e.target.checked)}
          />
          <div>
            <label htmlFor="pago_requiere_comprobante" className="font-medium text-gray-900 cursor-pointer">
              Requerir comprobante para todos los pagos
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Si se activa, todos los pagos deberán incluir comprobante obligatorio
            </p>
          </div>
        </div>
      </div>

      {/* Preview cálculo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">Ejemplo con monto de $1,000:</p>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Recargo ({recargo}%):</span>
            <span className="font-semibold">${(1000 * recargo / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-blue-300 pt-1">
            <span className="font-semibold">Total con recargo:</span>
            <span className="font-bold">${(1000 + 1000 * recargo / 100).toFixed(2)}</span>
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

export default PagosConfigForm