import React, { useState, useEffect } from 'react'
import {
  Users, Search, Filter, Plus, Eye, Edit, Trash2,
  Phone, Mail, ChevronDown, ChevronUp, X, Save,
  Loader, AlertCircle, CheckCircle, UserCheck
} from 'lucide-react'
import { tutoresAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'
import { usePermissions } from '../../hooks/usePermissions'
import { CreateButton } from '../../components/dashboard/PermissionButton'
import PermissionGuard from '../../components/auth/PermissionGuard'

// ─── Helper Field — definido FUERA del modal para evitar re-mount en cada render
const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}
      </p>
    )}
  </div>
)

const inputClass = (err) =>
  `input-field w-full ${err ? 'border-red-500 bg-red-50' : ''}`

// ─── Modal de edición ────────────────────────────────────────────────────────
const TutorEditModal = ({ isOpen, tutor, onClose, onSuccess }) => {
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', occupation: '', notes: '',
    phones: { primary: '', secondary: '' },
    identification: { type: 'ine', number: '' },
    address: { street: '', neighborhood: '', city: '', state: '', zipCode: '' }
  })

  useEffect(() => {
    if (tutor) {
      setForm({
        firstName:    tutor.firstName || '',
        lastName:     tutor.lastName  || '',
        email:        tutor.email     || '',
        phones: {
          primary:   tutor.phones?.primary   || '',
          secondary: tutor.phones?.secondary || ''
        },
        identification: {
          type:   tutor.identification?.type   || 'ine',
          number: tutor.identification?.number || ''
        },
        address: {
          street:       tutor.address?.street       || '',
          neighborhood: tutor.address?.neighborhood || '',
          city:         tutor.address?.city         || '',
          state:        tutor.address?.state        || '',
          zipCode:      tutor.address?.zipCode      || ''
        },
        occupation:   tutor.occupation   || '',
        notes:        tutor.notes        || ''
      })
      setErrors({})
    }
  }, [tutor])

  if (!isOpen || !tutor) return null

  const set = (path, value) => {
    setForm(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const validate = () => {
    const errs = {}
    if (!form.firstName?.trim())       errs.firstName = 'El nombre es requerido'
    if (!form.lastName?.trim())        errs.lastName  = 'El apellido es requerido'
    if (!form.email?.trim())           errs.email     = 'El email es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido'
    if (!form.phones?.primary?.trim()) errs.phonePrimary = 'El teléfono es requerido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const idNumber = form.identification?.number?.trim()
      // Limpiar strings vacíos en address para no enviar campos inútiles
      const cleanAddress = Object.fromEntries(
        Object.entries(form.address || {}).filter(([_, v]) => v?.trim())
      )
      const payload = {
        firstName:  form.firstName.trim(),
        lastName:   form.lastName.trim(),
        email:      form.email.trim(),
        occupation: form.occupation?.trim() || undefined,
        notes:      form.notes?.trim()      || undefined,
        phones: {
          primary:   form.phones?.primary?.trim()   || '',
          secondary: form.phones?.secondary?.trim() || ''
        },
        // Solo enviar identification si tiene número
        ...(idNumber
          ? { identification: { type: form.identification?.type || 'ine', number: idNumber } }
          : { identification: { type: form.identification?.type || 'ine' } }
        ),
        ...(Object.keys(cleanAddress).length ? { address: cleanAddress } : {})
      }
      await tutoresAPI.update(tutor._id, payload)
      toast.success('Tutor actualizado correctamente')
      onSuccess()
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al actualizar el tutor'
      // Mostrar error de email duplicado en el campo correspondiente
      if (msg.toLowerCase().includes('email')) {
        setErrors(e => ({ ...e, email: msg }))
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold text-lg">Editar Tutor</h2>
            <p className="text-gray-300 text-sm">{tutor.firstName} {tutor.lastName}</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Datos personales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Datos personales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" required error={errors.firstName}>
                <input className={inputClass(errors.firstName)} value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} />
              </Field>
              <Field label="Apellidos" required error={errors.lastName}>
                <input className={inputClass(errors.lastName)} value={form.lastName}
                  onChange={e => set('lastName', e.target.value)} />
              </Field>
              <Field label="Email" required error={errors.email}>
                <input type="email" className={inputClass(errors.email)} value={form.email}
                  onChange={e => { set('email', e.target.value); setErrors(err => ({ ...err, email: null })) }} />
              </Field>
              <Field label="Ocupación">
                <input className="input-field w-full" value={form.occupation}
                  onChange={e => set('occupation', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Teléfonos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teléfono principal" required error={errors.phonePrimary}>
                <input type="tel" className={inputClass(errors.phonePrimary)}
                  value={form.phones?.primary}
                  onChange={e => set('phones.primary', e.target.value)} />
              </Field>
              <Field label="Teléfono secundario">
                <input type="tel" className="input-field w-full"
                  value={form.phones?.secondary}
                  onChange={e => set('phones.secondary', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Identificación */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Identificación <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Tipo">
                <select className="input-field w-full" value={form.identification?.type}
                  onChange={e => set('identification.type', e.target.value)}>
                  <option value="ine">INE</option>
                  <option value="cedula">Cédula Profesional</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="licencia">Licencia</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>
              <Field label="Número">
                <input className="input-field w-full" value={form.identification?.number}
                  onChange={e => set('identification.number', e.target.value)}
                  placeholder="Opcional" />
              </Field>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Dirección <span className="text-gray-400 font-normal normal-case">(opcional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Calle">
                <input className="input-field w-full" value={form.address?.street}
                  onChange={e => set('address.street', e.target.value)} />
              </Field>
              <Field label="Colonia">
                <input className="input-field w-full" value={form.address?.neighborhood}
                  onChange={e => set('address.neighborhood', e.target.value)} />
              </Field>
              <Field label="Ciudad">
                <input className="input-field w-full" value={form.address?.city}
                  onChange={e => set('address.city', e.target.value)} />
              </Field>
              <Field label="Estado">
                <input className="input-field w-full" value={form.address?.state}
                  onChange={e => set('address.state', e.target.value)} />
              </Field>
              <Field label="Código Postal">
                <input className="input-field w-full" value={form.address?.zipCode}
                  onChange={e => set('address.zipCode', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Notas internas
            </h3>
            <textarea
              className="input-field w-full resize-none"
              rows={2}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Observaciones sobre este tutor..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" />Guardando...</>
              : <><Save className="w-4 h-4" />Guardar cambios</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
const TutoresPage = () => {
  const { canCreate, canUpdate, canDelete } = usePermissions('tutores')

  const [tutores, setTutores]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchTerm, setSearch]   = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters]     = useState({ isActive: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 })
  const [editTutor, setEditTutor] = useState(null)
  const [showEdit, setShowEdit]   = useState(false)

  useEffect(() => {
    loadTutores()
  }, [pagination.page, pagination.limit, searchTerm, filters])

  const loadTutores = async () => {
    setLoading(true)
    try {
      const params = {
        page:   pagination.page,
        limit:  pagination.limit,
        search: searchTerm,
        ...(filters.isActive !== '' ? { isActive: filters.isActive } : {})
      }
      const response = await tutoresAPI.getAll(params)

      // Backend devuelve { success, data: { tutores: [...], pagination: { current, pages, total, limit } } }
      let lista = []
      let paginationData = {}

      if (Array.isArray(response)) {
        lista = response
      } else if (Array.isArray(response.data?.tutores)) {
        lista = response.data.tutores
        paginationData = response.data.pagination || {}
      } else if (Array.isArray(response.data)) {
        lista = response.data
        paginationData = response.pagination || {}
      } else if (Array.isArray(response.tutores)) {
        lista = response.tutores
        paginationData = response.pagination || {}
      }

      setTutores(lista)
      setPagination(prev => ({
        ...prev,
        total:      paginationData.total ?? lista.length,
        // Backend usa "pages" en lugar de "totalPages"
        totalPages: paginationData.totalPages ?? paginationData.pages ?? 1
      }))
    } catch (error) {
      toast.error('Error al cargar tutores')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tutor) => {
    if (!window.confirm(`¿Eliminar a ${tutor.firstName} ${tutor.lastName}?`)) return
    try {
      await tutoresAPI.delete(tutor._id)
      toast.success('Tutor eliminado')
      loadTutores()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleEdit = (tutor) => {
    setEditTutor(tutor)
    setShowEdit(true)
  }

  const handlePageChange = (p) => {
    setPagination(prev => ({ ...prev, page: p }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Badge activo/inactivo ──
  const StatusBadge = ({ isActive }) => isActive
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Activo</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><X className="w-3 h-3" />Inactivo</span>

  // ── Iniciales avatar ──
  const Avatar = ({ tutor }) => {
    const initials = `${tutor.firstName?.[0] || ''}${tutor.lastName?.[0] || ''}`.toUpperCase()
    return (
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{initials}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Tutores</h1>
          <p className="text-gray-600 mt-1">Administra los padres y tutores de los alumnos</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            {pagination.total} tutores
          </span>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Total tutores</p>
            <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><UserCheck className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Activos</p>
            <p className="text-2xl font-bold text-gray-900">
              {tutores.filter(t => t.isActive !== false).length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg"><Mail className="w-6 h-6 text-purple-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Con email</p>
            <p className="text-2xl font-bold text-gray-900">
              {tutores.filter(t => t.email).length}
            </p>
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            Filtros
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.isActive}
                  onChange={e => { setFilters(f => ({ ...f, isActive: e.target.value })); setPagination(p => ({ ...p, page: 1 })) }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => { setFilters({ isActive: '' }); setSearch('') }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : tutores.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">No hay tutores</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Sin resultados para tu búsqueda' : 'Aún no hay tutores registrados'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumnos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tutores.map(tutor => (
                    <tr key={tutor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar tutor={tutor} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {tutor.firstName} {tutor.lastName}
                            </p>
                            {tutor.occupation && (
                              <p className="text-xs text-gray-400">{tutor.occupation}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {tutor.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate max-w-[180px]">{tutor.email}</span>
                            </div>
                          )}
                          {tutor.phones?.primary && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {tutor.phones.primary}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Users className="w-3 h-3" />
                          {tutor.childrenCount ?? tutor.alumnosCount ?? tutor.alumnos?.length ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge isActive={tutor.isActive !== false} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <PermissionGuard module="tutores" action="update">
                            <button
                              onClick={() => handleEdit(tutor)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </PermissionGuard>
                          <PermissionGuard module="tutores" action="delete">
                            <button
                              onClick={() => handleDelete(tutor)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {tutores.map(tutor => (
                <div key={tutor._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar tutor={tutor} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tutor.firstName} {tutor.lastName}</p>
                        {tutor.occupation && <p className="text-xs text-gray-400">{tutor.occupation}</p>}
                      </div>
                    </div>
                    <StatusBadge isActive={tutor.isActive !== false} />
                  </div>
                  <div className="space-y-1 mb-3">
                    {tutor.email && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />{tutor.email}
                      </div>
                    )}
                    {tutor.phones?.primary && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />{tutor.phones.primary}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Users className="w-3 h-3" />
                        {tutor.childrenCount ?? 0} alumno{(tutor.childrenCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <PermissionGuard module="tutores" action="update">
                      <button onClick={() => handleEdit(tutor)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded">
                        <Edit className="w-5 h-5" />
                      </button>
                    </PermissionGuard>
                    <PermissionGuard module="tutores" action="delete">
                      <button onClick={() => handleDelete(tutor)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </PermissionGuard>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginado */}
            {pagination.total > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>
                      Mostrando{' '}
                      <span className="font-semibold text-gray-900">
                        {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                      </span>
                      {' '}–{' '}
                      <span className="font-semibold text-gray-900">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-semibold text-gray-900">{pagination.total}</span>
                    </span>
                    <select
                      value={pagination.limit}
                      onChange={e => setPagination(p => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {[10, 15, 20, 25, 50].map(n => (
                        <option key={n} value={n}>{n} por página</option>
                      ))}
                    </select>
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handlePageChange(1)} disabled={pagination.page === 1}
                        className="px-2 py-1.5 rounded border border-gray-300 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">«</button>
                      <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">‹ Ant</button>
                      {[...Array(pagination.totalPages)].map((_, i) => {
                        const p = i + 1
                        const visible = p === 1 || p === pagination.totalPages || (p >= pagination.page - 1 && p <= pagination.page + 1)
                        const ellipsis = p === pagination.page - 2 || p === pagination.page + 2
                        if (visible) return (
                          <button key={p} onClick={() => handlePageChange(p)}
                            className={`min-w-[36px] py-1.5 rounded border text-sm font-medium transition-colors
                              ${p === pagination.page ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            {p}
                          </button>
                        )
                        if (ellipsis) return <span key={p} className="px-1 text-gray-400">…</span>
                        return null
                      })}
                      <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40">Sig ›</button>
                      <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.page === pagination.totalPages}
                        className="px-2 py-1.5 rounded border border-gray-300 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40">»</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de edición */}
      <TutorEditModal
        isOpen={showEdit}
        tutor={editTutor}
        onClose={() => { setShowEdit(false); setEditTutor(null) }}
        onSuccess={() => { setShowEdit(false); setEditTutor(null); loadTutores() }}
      />
    </div>
  )
}

export default TutoresPage