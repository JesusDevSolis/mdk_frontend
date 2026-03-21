import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Award, Calendar, Plus, Trash2, Edit2, X, Check, Loader } from 'lucide-react'
import { configuracionesAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// Paleta de colores para cinturones
const COLOR_PALETTE = [
  '#FFFFFF','#F3F4F6','#FDE047','#EAB308','#FB923C','#F97316',
  '#22C55E','#16A34A','#3B82F6','#2563EB','#A855F7','#7C3AED',
  '#EF4444','#DC2626','#92400E','#78350F','#A16207','#000000',
  '#1C1917','#D1D5DB','#9CA3AF','#4B5563',
]

const DEFAULTS_TIEMPOS = {
  cinturon_tiempo_minimo_blanco: 60,
  cinturon_tiempo_minimo_color:  90
}

// Niveles iniciales del sistema
const NIVELES_INICIALES = [
  { key: 'principiante',    nombre: 'Principiante (sin grado)', color: '#F3F4F6', textDark: true  },
  { key: 'blanca-chobocha', nombre: 'Blanca (Chobocha)',        color: '#FFFFFF', textDark: true  },
  { key: 'blanca-1',        nombre: 'Blanca 1er nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-2',        nombre: 'Blanca 2do nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-3',        nombre: 'Blanca 3er nivel',         color: '#FFFFFF', textDark: true  },
  { key: 'blanca-avanzada', nombre: 'Blanca Avanzada',          color: '#FFFFFF', textDark: true  },
  { key: 'amarilla',        nombre: 'Amarilla',                 color: '#FDE047', textDark: true  },
  { key: 'amarilla-avanzada', nombre: 'Amarilla Avanzada',      color: '#EAB308', textDark: true  },
  { key: 'naranja',         nombre: 'Naranja',                  color: '#FB923C', textDark: false },
  { key: 'verde',           nombre: 'Verde',                    color: '#22C55E', textDark: false },
  { key: 'verde-avanzada',  nombre: 'Verde Avanzada',           color: '#16A34A', textDark: false },
  { key: 'azul',            nombre: 'Azul',                     color: '#3B82F6', textDark: false },
  { key: 'azul-avanzada',   nombre: 'Azul Avanzada',            color: '#2563EB', textDark: false },
  { key: 'morada',          nombre: 'Morada',                   color: '#A855F7', textDark: false },
  { key: 'marron',          nombre: 'Marrón',                   color: '#92400E', textDark: false },
  { key: 'marron-avanzada', nombre: 'Marrón Avanzada',          color: '#78350F', textDark: false },
  { key: 'cafe',            nombre: 'Café',                     color: '#A16207', textDark: false },
  { key: 'roja',            nombre: 'Roja',                     color: '#EF4444', textDark: false },
  { key: 'roja-ieby',       nombre: 'Roja Ieby',                color: '#DC2626', textDark: false },
  { key: 'negra-1-poom',    nombre: 'Negra 1er Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-2-poom',    nombre: 'Negra 2do Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-3-poom',    nombre: 'Negra 3er Poom',           color: '#1C1917', textDark: false },
  { key: 'negra-1-dan',     nombre: 'Negra 1er Dan',            color: '#000000', textDark: false },
  { key: 'negra-2-dan',     nombre: 'Negra 2do Dan',            color: '#000000', textDark: false },
  { key: 'negra-3-dan',     nombre: 'Negra 3er Dan',            color: '#000000', textDark: false },
  { key: 'negra-4-dan',     nombre: 'Negra 4to Dan',            color: '#000000', textDark: false },
  { key: 'negra-5-dan',     nombre: 'Negra 5to Dan',            color: '#000000', textDark: false },
  { key: 'negra-6-dan',     nombre: 'Negra 6to Dan',            color: '#000000', textDark: false },
  { key: 'negra-7-dan',     nombre: 'Negra 7mo Dan',            color: '#000000', textDark: false },
  { key: 'negra-8-dan',     nombre: 'Negra 8vo Dan',            color: '#000000', textDark: false },
  { key: 'negra-9-dan',     nombre: 'Negra 9no Dan',            color: '#000000', textDark: false },
  { key: '1-parcial',       nombre: '1er Parcial',              color: '#D1D5DB', textDark: true  },
  { key: '2-parcial',       nombre: '2do Parcial',              color: '#D1D5DB', textDark: true  },
  { key: '3-parcial',       nombre: '3er Parcial',              color: '#D1D5DB', textDark: true  },
  { key: '4-parcial',       nombre: '4to Parcial',              color: '#D1D5DB', textDark: true  },
  { key: '5-parcial',       nombre: '5to Parcial',              color: '#D1D5DB', textDark: true  },
  { key: '6-parcial',       nombre: '6to Parcial',              color: '#D1D5DB', textDark: true  },
]

// ── Fila editable de cinturón ─────────────────────────────────────────────────
const FilaCinturon = ({ nivel, index, onEdit, onDelete }) => {
  const isDark = !nivel.textDark
  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-3 py-2 text-xs text-gray-400 font-mono w-8">{index + 1}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-4 rounded flex-shrink-0 border"
            style={{
              backgroundColor: nivel.color,
              borderColor: nivel.color === '#FFFFFF' || nivel.color === '#F3F4F6' ? '#D1D5DB' : nivel.color
            }}
          />
          <div
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: nivel.color, color: isDark ? '#F9FAFB' : '#111827',
              border: nivel.color === '#FFFFFF' || nivel.color === '#F3F4F6' ? '1px solid #D1D5DB' : 'none' }}
          >
            {nivel.nombre}
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{nivel.key}</code>
      </td>
      <td className="px-3 py-2">
        <span className="text-xs font-mono text-gray-500">{nivel.color}</span>
      </td>
      <td className="px-3 py-2 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onEdit(nivel, index)}
            className="p-1 text-yellow-500 hover:bg-yellow-50 rounded">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => onDelete(index)}
            className="p-1 text-red-400 hover:bg-red-50 rounded">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Modal editar/agregar nivel ─────────────────────────────────────────────────
const NivelModal = ({ nivel, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre:   nivel?.nombre  || '',
    key:      nivel?.key     || '',
    color:    nivel?.color   || '#3B82F6',
    textDark: nivel?.textDark ?? false,
  })
  const isEdit = !!nivel?.key

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleKey = (nombre) => {
    if (isEdit) return // no regenerar si es edición
    const slug = nombre.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    set('key', slug)
  }

  const handleSubmit = () => {
    if (!form.nombre.trim()) return
    if (!form.key.trim()) return
    onSave({ ...form })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900">{isEdit ? 'Editar nivel' : 'Nuevo nivel de cinturón'}</h3>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input className="input-field w-full" value={form.nombre}
              onChange={e => { set('nombre', e.target.value); handleKey(e.target.value) }}
              placeholder="Ej: Verde Avanzada"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave del sistema *
              <span className="text-xs text-gray-400 ml-1">(se auto-genera, no cambiar si ya hay alumnos)</span>
            </label>
            <input className="input-field w-full font-mono text-sm" value={form.key}
              onChange={e => set('key', e.target.value)}
              placeholder="verde-avanzada"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color del cinturón</label>
            <div className="flex items-center gap-3 mb-2">
              <input type="color" value={form.color}
                onChange={e => set('color', e.target.value)}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
              />
              <input type="text" value={form.color}
                onChange={e => set('color', e.target.value)}
                className="input-field flex-1 font-mono text-sm"
              />
              {/* Preview */}
              <div className="w-12 h-5 rounded-full border border-gray-300"
                style={{ backgroundColor: form.color }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_PALETTE.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform
                    ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #D1D5DB' : 'none' }}
                />
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded"
              checked={form.textDark}
              onChange={e => set('textDark', e.target.checked)}
            />
            <span className="text-sm text-gray-700">Texto oscuro (para cinturones claros como blanco/amarillo)</span>
          </label>
          {/* Preview completo */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-400">Vista previa:</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: form.color,
                color: form.textDark ? '#111827' : '#F9FAFB',
                borderColor: form.color === '#FFFFFF' || form.color === '#F3F4F6' ? '#D1D5DB' : 'transparent'
              }}>
              {form.nombre || 'Nombre del nivel'}
            </span>
          </div>
        </div>
        <div className="flex justify-between px-5 py-4 bg-gray-50 rounded-b-2xl border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} type="button"
            disabled={!form.nombre.trim() || !form.key.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Check className="w-4 h-4" /> {isEdit ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
const CinturonesConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
  const DEFAULTS = { cinturon_tiempo_minimo_blanco: 60, cinturon_tiempo_minimo_color: 90 }
  const [form, setForm]       = useState({ ...DEFAULTS, ...configuraciones })
  const [niveles, setNiveles] = useState(NIVELES_INICIALES)
  const [modal, setModal]     = useState(false)
  const [savingNiveles, setSavingNiveles] = useState(false)

  // Cargar niveles desde BD al montar
  useEffect(() => {
    if (configuraciones.cinturones_niveles) {
      try {
        const saved = typeof configuraciones.cinturones_niveles === 'string'
          ? JSON.parse(configuraciones.cinturones_niveles)
          : configuraciones.cinturones_niveles
        if (Array.isArray(saved) && saved.length > 0) setNiveles(saved)
      } catch {}
    }
  }, [JSON.stringify(configuraciones)])

  useEffect(() => {
    if (Object.keys(configuraciones).length > 0) {
      setForm({ ...DEFAULTS, ...configuraciones })
    }
  }, [JSON.stringify(configuraciones)])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Guardar tiempos mínimos
  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      cinturon_tiempo_minimo_blanco: parseInt(form.cinturon_tiempo_minimo_blanco),
      cinturon_tiempo_minimo_color:  parseInt(form.cinturon_tiempo_minimo_color)
    })
  }

  // Guardar tabla de niveles en configuraciones
  const handleGuardarNiveles = async () => {
    setSavingNiveles(true)
    try {
      await configuracionesAPI.updateMultiple([{
        clave: 'cinturones_niveles',
        valor: JSON.stringify(niveles)
      }])
      toast.success('Niveles de cinturón guardados')
    } catch {
      toast.error('Error al guardar niveles')
    } finally {
      setSavingNiveles(false)
    }
  }

  const handleSaveNivel = (nuevoNivel) => {
    let nuevosNiveles
    if (typeof modal === 'object' && modal !== null) {
      nuevosNiveles = [...niveles]
      nuevosNiveles[modal.index] = nuevoNivel
    } else {
      nuevosNiveles = [...niveles, nuevoNivel]
    }
    setNiveles(nuevosNiveles)
    setModal(false)
  }

  const handleDeleteNivel = (index) => {
    if (!window.confirm('¿Eliminar este nivel?')) return
    setNiveles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Tiempos mínimos ── */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Tiempo Mínimo por Cinturón
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cinturones iniciales (blanca/principiante)</label>
            <div className="relative">
              <input type="number" min="0" className="input-field pr-16"
                value={form.cinturon_tiempo_minimo_blanco}
                onChange={e => set('cinturon_tiempo_minimo_blanco', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">≈ {Math.round((Number(form.cinturon_tiempo_minimo_blanco)||0)/30)} meses</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cinturones de color (avanzados)</label>
            <div className="relative">
              <input type="number" min="0" className="input-field pr-16"
                value={form.cinturon_tiempo_minimo_color}
                onChange={e => set('cinturon_tiempo_minimo_color', e.target.value)}
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500">días</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">≈ {Math.round((Number(form.cinturon_tiempo_minimo_color)||0)/30)} meses</p>
          </div>
        </div>
      </div>

      {/* ── Tabla de niveles ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary-600" />
            Niveles de Cinturón
            <span className="text-sm font-normal text-gray-400">({niveles.length} niveles)</span>
          </h3>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleGuardarNiveles}
              disabled={savingNiveles}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
              {savingNiveles
                ? <><Loader className="w-4 h-4 animate-spin" />Guardando...</>
                : <><Save className="w-4 h-4" />Guardar niveles</>
              }
            </button>
            <button type="button" onClick={() => setModal('new')}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4" /> Nuevo nivel
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase w-8">#</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Nivel</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Clave</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Color HEX</th>
                <th className="px-3 py-2 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {niveles.map((nivel, idx) => (
                <FilaCinturon
                  key={nivel.key + idx}
                  nivel={nivel}
                  index={idx}
                  onEdit={(n, i) => setModal({ nivel: n, index: i })}
                  onDelete={handleDeleteNivel}
                />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 Pasa el cursor sobre una fila para ver las opciones de edición. La <strong>clave</strong> debe coincidir con el enum del modelo Alumno.js en el backend.
        </p>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button type="button" onClick={onRestore} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className="w-4 h-4" /> Restaurar Tiempos
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Tiempos'}
        </button>
      </div>

    </form>

    {/* Modal — fuera del form para que sus botones no hagan submit del form padre */}
    {modal && (
      <NivelModal
        nivel={typeof modal === 'object' ? modal.nivel : null}
        onClose={() => setModal(false)}
        onSave={handleSaveNivel}
      />
    )}
  </>
  )
}

export default CinturonesConfigForm