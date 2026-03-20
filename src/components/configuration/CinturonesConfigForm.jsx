import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Award, Calendar, Info } from 'lucide-react'

// Progresión actualizada con los nuevos niveles
const PROGRESION_CINTURONES = [
  { nivel: 'principiante',    nombre: 'Principiante (sin grado)', color: '#F3F4F6', border: true,  textColor: '#374151' },
  { nivel: 'blanca-chobocha', nombre: 'Blanca (Chobocha)',        color: '#FFFFFF', border: true,  textColor: '#374151' },
  { nivel: 'blanca-1',        nombre: 'Blanca 1er nivel',         color: '#FFFFFF', border: true,  textColor: '#374151', stripe: '#FDE68A' },
  { nivel: 'blanca-2',        nombre: 'Blanca 2do nivel',         color: '#FFFFFF', border: true,  textColor: '#374151', stripe: '#FDE68A' },
  { nivel: 'blanca-3',        nombre: 'Blanca 3er nivel',         color: '#FFFFFF', border: true,  textColor: '#374151', stripe: '#FDE68A' },
  { nivel: 'blanca-avanzada', nombre: 'Blanca Avanzada',          color: '#FFFFFF', border: true,  textColor: '#374151' },
  { nivel: 'amarilla',        nombre: 'Amarilla',                 color: '#FDE047', border: false, textColor: '#713F12' },
  { nivel: 'amarilla-avanzada', nombre: 'Amarilla Avanzada',      color: '#EAB308', border: false, textColor: '#713F12' },
  { nivel: 'naranja',         nombre: 'Naranja',                  color: '#FB923C', border: false, textColor: '#431407' },
  { nivel: 'verde',           nombre: 'Verde',                    color: '#22C55E', border: false, textColor: '#14532D' },
  { nivel: 'verde-avanzada',  nombre: 'Verde Avanzada',           color: '#16A34A', border: false, textColor: '#14532D' },
  { nivel: 'azul',            nombre: 'Azul',                     color: '#3B82F6', border: false, textColor: '#1E3A5F' },
  { nivel: 'azul-avanzada',   nombre: 'Azul Avanzada',            color: '#2563EB', border: false, textColor: '#1E3A5F' },
  { nivel: 'morada',          nombre: 'Morada',                   color: '#A855F7', border: false, textColor: '#3B0764' },
  { nivel: 'marron',          nombre: 'Marrón',                   color: '#92400E', border: false, textColor: '#FEF3C7' },
  { nivel: 'marron-avanzada', nombre: 'Marrón Avanzada',          color: '#78350F', border: false, textColor: '#FEF3C7' },
  { nivel: 'cafe',            nombre: 'Café',                     color: '#A16207', border: false, textColor: '#FEF3C7' },
  { nivel: 'roja',            nombre: 'Roja',                     color: '#EF4444', border: false, textColor: '#450A0A' },
  { nivel: 'roja-ieby',       nombre: 'Roja Ieby',                color: '#DC2626', border: false, textColor: '#450A0A' },
  { nivel: 'negra-1-poom',    nombre: 'Negra 1er Poom',           color: '#1C1917', border: false, textColor: '#E7E5E4' },
  { nivel: 'negra-2-poom',    nombre: 'Negra 2do Poom',           color: '#1C1917', border: false, textColor: '#E7E5E4' },
  { nivel: 'negra-3-poom',    nombre: 'Negra 3er Poom',           color: '#1C1917', border: false, textColor: '#E7E5E4' },
  { nivel: 'negra-1-dan',     nombre: 'Negra 1er Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 1 },
  { nivel: 'negra-2-dan',     nombre: 'Negra 2do Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 2 },
  { nivel: 'negra-3-dan',     nombre: 'Negra 3er Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 3 },
  { nivel: 'negra-4-dan',     nombre: 'Negra 4to Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 4 },
  { nivel: 'negra-5-dan',     nombre: 'Negra 5to Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 5 },
  { nivel: 'negra-6-dan',     nombre: 'Negra 6to Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 6 },
  { nivel: 'negra-7-dan',     nombre: 'Negra 7mo Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 7 },
  { nivel: 'negra-8-dan',     nombre: 'Negra 8vo Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 8 },
  { nivel: 'negra-9-dan',     nombre: 'Negra 9no Dan',            color: '#000000', border: false, textColor: '#F5F5F5', dan: 9 },
  { nivel: '1-parcial',       nombre: '1er Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
  { nivel: '2-parcial',       nombre: '2do Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
  { nivel: '3-parcial',       nombre: '3er Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
  { nivel: '4-parcial',       nombre: '4to Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
  { nivel: '5-parcial',       nombre: '5to Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
  { nivel: '6-parcial',       nombre: '6to Parcial',              color: '#D1D5DB', border: true,  textColor: '#111827' },
]

const CinturonesConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
  const DEFAULTS = { cinturon_tiempo_minimo_blanco: 60, cinturon_tiempo_minimo_color: 90 }
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
      cinturon_tiempo_minimo_blanco: parseInt(form.cinturon_tiempo_minimo_blanco),
      cinturon_tiempo_minimo_color:  parseInt(form.cinturon_tiempo_minimo_color)
    })
  }

  const tiempoBlanco = form.cinturon_tiempo_minimo_blanco
  const tiempoColor  = form.cinturon_tiempo_minimo_color

  // Cinturón visual
  const BeltBadge = ({ c, idx }) => (
    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <span className="text-xs font-bold text-gray-400 w-5 text-right flex-shrink-0">{idx + 1}</span>
      {/* Cinturón visual */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-4 rounded-sm flex-shrink-0 flex items-center justify-center"
          style={{
            backgroundColor: c.color,
            border: c.border ? '1.5px solid #9CA3AF' : `1.5px solid ${c.color}`,
            boxShadow: '0 1px 2px rgba(0,0,0,.15)'
          }}
        >
          {/* Rayas de parciales */}
          {c.nivel.includes('parcial') && (
            <div className="flex gap-0.5">
              {[...Array(parseInt(c.nivel[0]))].map((_, i) => (
                <div key={i} className="w-0.5 h-3 bg-gray-500 rounded" />
              ))}
            </div>
          )}
          {/* Dans — número dorado */}
          {c.dan && (
            <span className="text-[8px] font-bold" style={{ color: '#F59E0B' }}>{c.dan}</span>
          )}
          {/* Stripe para Peq. Dragones */}
          {c.stripe && (
            <div className="absolute bottom-0 left-0 right-0 h-1 rounded-sm" style={{ backgroundColor: c.stripe }} />
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-gray-700 leading-tight">{c.nombre}</span>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Tiempos mínimos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Tiempo Mínimo por Cinturón
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cinturones iniciales (blanca/principiante)
            </label>
            <div className="relative">
              <input type="number" min="0"
                value={form.cinturon_tiempo_minimo_blanco} onChange={e => set('cinturon_tiempo_minimo_blanco', e.target.value)}
                className="input-field pr-16"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              ≈ {Math.round((tiempoBlanco || 0) / 30)} meses
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cinturones de color (avanzados)
            </label>
            <div className="relative">
              <input type="number" min="0"
                value={form.cinturon_tiempo_minimo_color} onChange={e => set('cinturon_tiempo_minimo_color', e.target.value)}
                className="input-field pr-16"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              ≈ {Math.round((tiempoColor || 0) / 30)} meses
            </p>
          </div>
        </div>
      </div>

      {/* Progresión de cinturones */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary-600" />
          Progresión de Cinturones
          <span className="text-sm font-normal text-gray-400 ml-1">({PROGRESION_CINTURONES.length} niveles)</span>
        </h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {PROGRESION_CINTURONES.map((c, idx) => (
              <BeltBadge key={c.nivel} c={c} idx={idx} />
            ))}
          </div>
        </div>

        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            El orden de progresión está definido por el sistema. Solo puedes ajustar los tiempos mínimos requeridos.
          </p>
        </div>
      </div>

      {/* Botones */}
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

export default CinturonesConfigForm