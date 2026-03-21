import React, { useState } from 'react'
import {
  Plus, Edit2, Trash2, Upload, X, Save, Loader,
  Image, ToggleLeft, ToggleRight, Dumbbell
} from 'lucide-react'
import { disciplinasAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// ── Paleta de colores predefinidos ────────────────────────────────────────────
const COLOR_PALETTE = [
  '#3B82F6','#2563EB','#1D4ED8', // azules
  '#10B981','#059669','#16A34A', // verdes
  '#F59E0B','#D97706','#EAB308', // amarillos/ámbar
  '#EF4444','#DC2626','#B91C1C', // rojos
  '#8B5CF6','#7C3AED','#A855F7', // púrpuras
  '#F97316','#EA580C','#FB923C', // naranjas
  '#EC4899','#DB2777','#F472B6', // rosas
  '#6B7280','#4B5563','#374151', // grises
  '#0EA5E9','#0284C7','#38BDF8', // cielo
  '#14B8A6','#0F766E','#2DD4BF', // teal
]

// ── Emojis sugeridos ──────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['🥋','🥊','🤸','⚔️','🐉','🥷','🎯','🏆','💪','🌀','🔥','⚡','🌟','🎖️']

// ── Modal crear/editar disciplina ─────────────────────────────────────────────
const DisciplinaModal = ({ disciplina, onClose, onSuccess }) => {
  const isEdit = !!disciplina
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre:      disciplina?.nombre      || '',
    descripcion: disciplina?.descripcion || '',
    color:       (disciplina?.color || '#3B82F6').toLowerCase(),
    emoji:       disciplina?.emoji       || '🥋',
  })
  const [logoFile, setLogoFile]       = useState(null)
  const [logoPreview, setLogoPreview] = useState(disciplina?.logoUrl || null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleLogo = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setLogoFile(f)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) return toast.error('El nombre es requerido')
    setLoading(true)
    // Normalizar color a minúsculas para compatibilidad con HTML color input
    const formData = { ...form, color: form.color.toLowerCase() }
    try {
      let res
      if (isEdit) {
        res = await disciplinasAPI.update(disciplina._id, formData)
      } else {
        res = await disciplinasAPI.create(formData)
      }

      // Si hay logo nuevo, subirlo
      if (logoFile && res.data?._id) {
        await disciplinasAPI.updateLogo(res.data._id, logoFile)
      }

      toast.success(isEdit ? 'Disciplina actualizada' : 'Disciplina creada')
      onSuccess()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Editar Disciplina' : 'Nueva Disciplina'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input className="input-field w-full"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Tae Kwon Do"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea className="input-field w-full resize-none" rows={2}
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              placeholder="Breve descripción de la disciplina..."
            />
          </div>

          {/* Emoji + Color en fila */}
          <div className="grid grid-cols-2 gap-4">
            {/* Emoji */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Ícono</label>
              <div className="relative">
                <button type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="input-field w-full flex items-center gap-2 text-left"
                >
                  <span className="text-2xl">{form.emoji}</span>
                  <span className="text-sm text-gray-500">Cambiar emoji</span>
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-10 grid grid-cols-7 gap-1.5">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} type="button"
                        onClick={() => { set('emoji', e); setShowEmojiPicker(false) }}
                        className={`text-xl p-1 rounded-lg hover:bg-gray-100 transition-colors
                          ${form.emoji === e ? 'bg-primary-100 ring-2 ring-primary-400' : ''}`}
                      >{e}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="color"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                    className="w-10 h-9 rounded border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input type="text"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                    className="input-field flex-1 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
                {/* Paleta rápida */}
                <div className="flex flex-wrap gap-1">
                  {COLOR_PALETTE.map(c => (
                    <button key={c} type="button"
                      onClick={() => set('color', c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110
                        ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
              style={{ backgroundColor: form.color }}>
              {form.emoji}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{form.nombre || 'Nombre de disciplina'}</p>
              <p className="text-xs text-gray-400">{form.descripcion || 'Sin descripción'}</p>
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo <span className="text-gray-400 text-xs font-normal">(opcional — reemplaza el emoji)</span>
            </label>
            <div className="flex items-center gap-3">
              {logoPreview && (
                <div className="relative flex-shrink-0">
                  <img src={logoPreview} alt="logo" className="w-14 h-14 object-contain rounded-lg border border-gray-200" />
                  <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                    ×
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </label>
              <p className="text-xs text-gray-400">PNG, JPG, SVG. Máx 5MB.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">Cancelar</button>
          <button onClick={handleSubmit} type="button" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader className="w-4 h-4 animate-spin" />Guardando...</> : <><Save className="w-4 h-4" />Guardar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
const DisciplinasTab = ({ disciplinas = [], loadingLogo = {}, onUpload, onDelete, onReload }) => {
  const [modal, setModal]       = useState(false)
  const [editItem, setEditItem] = useState(null)

  const handleDelete = async (disc) => {
    if (!window.confirm(`¿Desactivar la disciplina "${disc.nombre}"? Los alumnos inscritos no serán afectados.`)) return
    try {
      await disciplinasAPI.delete(disc._id)
      toast.success(`"${disc.nombre}" desactivada`)
      onReload?.()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleSuccess = () => {
    setModal(false)
    setEditItem(null)
    onReload?.()
  }

  if (!disciplinas.length) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="mx-auto w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-gray-500 font-medium mb-1">Sin disciplinas registradas</h3>
        <p className="text-sm text-gray-400 mb-4">Agrega las disciplinas que se imparten en tu escuela</p>
        <button type="button" onClick={() => { setEditItem(null); setModal(true) }} className="btn-primary">
          <Plus className="w-4 h-4 inline mr-1" /> Nueva Disciplina
        </button>
        {modal && <DisciplinaModal disciplina={editItem} onClose={() => setModal(false)} onSuccess={handleSuccess} />}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{disciplinas.length} disciplina{disciplinas.length !== 1 ? 's' : ''} registrada{disciplinas.length !== 1 ? 's' : ''}</p>
        <button type="button" onClick={() => { setEditItem(null); setModal(true) }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Disciplina
        </button>
      </div>

      {/* Tabla */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Disciplina</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Logo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {disciplinas.map(disc => (
              <tr key={disc._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0"
                      style={{ backgroundColor: disc.color || '#6B7280' }}>
                      {disc.logoUrl
                        ? <img src={disc.logoUrl} alt={disc.nombre} className="w-7 h-7 object-contain" />
                        : (disc.emoji || '🥋')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{disc.nombre}</p>
                      {disc.descripcion && <p className="text-xs text-gray-400 truncate max-w-[180px]">{disc.descripcion}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{disc.slug}</code>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {disc.logoUrl ? (
                      <div className="flex items-center gap-2">
                        <img src={disc.logoUrl} alt="logo" className="w-8 h-8 object-contain rounded border border-gray-200" />
                        <button type="button" onClick={() => onDelete?.(disc._id, disc.nombre)}
                          disabled={loadingLogo[disc._id]}
                          className="text-xs text-red-500 hover:text-red-700">
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-1.5 text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                        {loadingLogo[disc._id]
                          ? <Loader className="w-3.5 h-3.5 animate-spin" />
                          : <Image className="w-3.5 h-3.5" />}
                        Subir
                        <input type="file" accept="image/*" className="hidden"
                          onChange={e => e.target.files[0] && onUpload?.(disc._id, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${disc.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {disc.isActive ? '● Activa' : '○ Inactiva'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => { setEditItem(disc); setModal(true) }}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(disc)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Desactivar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <DisciplinaModal
          disciplina={editItem}
          onClose={() => { setModal(false); setEditItem(null) }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}

export default DisciplinasTab