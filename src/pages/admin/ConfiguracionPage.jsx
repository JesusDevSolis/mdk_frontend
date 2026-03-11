import React, { useState, useEffect } from 'react'
import { 
    Settings, 
    Save, 
    RotateCcw, 
    Download,
    AlertCircle,
    CheckCircle2,
    Loader,
    GraduationCap,
    DollarSign,
    ClipboardCheck,
    Bell,
    Award,
    Info,
    Layers,
    Upload,
    Trash2,
    ImageIcon
} from 'lucide-react'
import { configuracionesAPI, disciplinasAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'
import { PagePermissionGuard } from '../../components/auth/PermissionGuard'

// Importar componentes de formularios por categoría
import GeneralConfigForm from '../../components/configuration/GeneralConfigForm'
import ExamenesConfigForm from '../../components/configuration/ExamenesConfigForm'
import PagosConfigForm from '../../components/configuration/PagosConfigForm'
import AsistenciasConfigForm from '../../components/configuration/AsistenciasConfigForm'
import NotificacionesConfigForm from '../../components/configuration/NotificacionesConfigForm'
import CinturonesConfigForm from '../../components/configuration/CinturonesConfigForm'

const ConfiguracionPage = () => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [configuraciones, setConfiguraciones] = useState({})
    const [activeTab, setActiveTab] = useState('general')
    const [hasChanges, setHasChanges] = useState(false)
    const [estadisticas, setEstadisticas] = useState(null)
    // v1.5 — Disciplinas
    const [disciplinas, setDisciplinas] = useState([])
    const [loadingLogo, setLoadingLogo] = useState({})

    // Definición de pestañas
    const tabs = [
        { 
            id: 'general', 
            label: 'General', 
            icon: Settings,
            description: 'Configuración general del sistema'
        },
        { 
            id: 'examenes', 
            label: 'Exámenes', 
            icon: GraduationCap,
            description: 'Parámetros de exámenes y graduaciones'
        },
        { 
            id: 'pagos', 
            label: 'Pagos', 
            icon: DollarSign,
            description: 'Configuración de pagos y finanzas'
        },
        { 
            id: 'asistencias', 
            label: 'Asistencias', 
            icon: ClipboardCheck,
            description: 'Parámetros de control de asistencias'
        },
        { 
            id: 'notificaciones', 
            label: 'Notificaciones', 
            icon: Bell,
            description: 'Configuración de notificaciones y alertas'
        },
        { 
            id: 'cinturones', 
            label: 'Cinturones', 
            icon: Award,
            description: 'Progresión y requisitos de cinturones'
        },
        { 
            id: 'disciplinas', 
            label: 'Disciplinas', 
            icon: Layers,
            description: 'Logos e imagen por disciplina'
        }
    ]

    useEffect(() => {
        loadConfiguraciones()
        loadEstadisticas()
        loadDisciplinas()
    }, [])

    // Cargar todas las configuraciones agrupadas
    const loadConfiguraciones = async () => {
        try {
            setLoading(true)
            const response = await configuracionesAPI.getAgrupadas()
            
            if (response.success) {
                setConfiguraciones(response.data)
            }
        } catch (error) {
            console.error('Error cargando configuraciones:', error)
            toast.error('Error al cargar configuraciones')
        } finally {
            setLoading(false)
        }
    }

    // Cargar estadísticas
    const loadEstadisticas = async () => {
        try {
            const response = await configuracionesAPI.getEstadisticas()
            if (response.success) {
                setEstadisticas(response.data)
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
        }
    }

    // v1.5 — Cargar disciplinas
    const loadDisciplinas = async () => {
        try {
            const response = await disciplinasAPI.getAll()
            if (response.success) setDisciplinas(response.data)
        } catch (error) {
            console.error('Error cargando disciplinas:', error)
        }
    }

    // v1.5 — Subir logo de disciplina
    const handleUploadLogo = async (disciplinaId, file) => {
        if (!file) return
        setLoadingLogo(prev => ({ ...prev, [disciplinaId]: true }))
        try {
            await disciplinasAPI.updateLogo(disciplinaId, file)
            toast.success('Logo actualizado correctamente')
            await loadDisciplinas()
        } catch (error) {
            toast.error('Error al subir el logo')
        } finally {
            setLoadingLogo(prev => ({ ...prev, [disciplinaId]: false }))
        }
    }

    // v1.5 — Eliminar logo de disciplina
    const handleDeleteLogo = async (disciplinaId, nombre) => {
        if (!window.confirm(`¿Eliminar el logo de ${nombre}?`)) return
        setLoadingLogo(prev => ({ ...prev, [disciplinaId]: true }))
        try {
            await disciplinasAPI.deleteLogo(disciplinaId)
            toast.success('Logo eliminado')
            await loadDisciplinas()
        } catch (error) {
            toast.error('Error al eliminar el logo')
        } finally {
            setLoadingLogo(prev => ({ ...prev, [disciplinaId]: false }))
        }
    }

    // Guardar cambios de una categoría
    const handleSaveCategoria = async (categoria, valores) => {
        try {
            setSaving(true)

            // Preparar array de configuraciones para actualizar
            const configuracionesActualizar = Object.keys(valores).map(clave => ({
                clave,
                valor: valores[clave]
            }))

            const response = await configuracionesAPI.updateMultiple(configuracionesActualizar)

            if (response.success) {
                toast.success(`Configuración de ${categoria} guardada exitosamente`)
                await loadConfiguraciones()
                setHasChanges(false)
            }

        } catch (error) {
            console.error('Error guardando configuración:', error)
            toast.error(error.response?.data?.message || 'Error al guardar configuración')
        } finally {
            setSaving(false)
        }
    }

    // Restaurar categoría a valores por defecto
    const handleRestaurarCategoria = async (categoria) => {
        const confirmacion = window.confirm(
            `¿Estás seguro de restaurar todas las configuraciones de ${categoria} a sus valores por defecto?\n\n` +
            `Esta acción no se puede deshacer.`
        )

        if (!confirmacion) return

        try {
            setSaving(true)
            
            const response = await configuracionesAPI.restaurarCategoria(categoria)

            if (response.success) {
                toast.success(`Configuración de ${categoria} restaurada`)
                await loadConfiguraciones()
                setHasChanges(false)
            }

        } catch (error) {
            console.error('Error restaurando configuración:', error)
            toast.error('Error al restaurar configuración')
        } finally {
            setSaving(false)
        }
    }

    // Exportar configuraciones
    const handleExportar = async () => {
        try {
            const response = await configuracionesAPI.exportar()

            if (response.success) {
                // Crear archivo JSON y descargarlo
                const dataStr = JSON.stringify(response.data, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `configuraciones_${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                toast.success('Configuraciones exportadas exitosamente')
            }

        } catch (error) {
            console.error('Error exportando configuraciones:', error)
            toast.error('Error al exportar configuraciones')
        }
    }

    // Renderizar formulario según categoría activa
    const renderFormulario = () => {
        const configs = configuraciones[activeTab] || []

        // Convertir array de configuraciones a objeto key-value
        const configsObj = {}
        configs.forEach(config => {
            configsObj[config.clave] = config.valor
        })

        const props = {
            configuraciones: configsObj,
            onSave: (valores) => handleSaveCategoria(activeTab, valores),
            onRestore: () => handleRestaurarCategoria(activeTab),
            saving,
            onChanges: setHasChanges
        }

        switch (activeTab) {
            case 'general':
                return <GeneralConfigForm {...props} />
            case 'examenes':
                return <ExamenesConfigForm {...props} />
            case 'pagos':
                return <PagosConfigForm {...props} />
            case 'asistencias':
                return <AsistenciasConfigForm {...props} />
            case 'notificaciones':
                return <NotificacionesConfigForm {...props} />
            case 'cinturones':
                return <CinturonesConfigForm {...props} />
            case 'disciplinas':
                return <DisciplinasTab
                    disciplinas={disciplinas}
                    loadingLogo={loadingLogo}
                    onUpload={handleUploadLogo}
                    onDelete={handleDeleteLogo}
                />
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        )
    }

    return (
        <PagePermissionGuard module="configuracion" action="read">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-8 h-8 text-primary-600" />
                            Configuración del Sistema
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Administra la configuración global de tu escuela de taekwondo
                        </p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={handleExportar}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total Configuraciones</p>
                                    <p className="text-2xl font-bold text-blue-900">{estadisticas.total}</p>
                                </div>
                                <Settings className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Categorías</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {estadisticas.porCategoria?.length || 0}
                                    </p>
                                </div>
                                <Info className="w-8 h-8 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Última Modificación</p>
                                    <p className="text-sm font-semibold text-purple-900">
                                        {estadisticas.ultimaModificacion?.modificadoPor?.name || 'N/A'}
                                    </p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Advertencia de cambios sin guardar */}
                {hasChanges && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-900">Tienes cambios sin guardar</p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Recuerda guardar los cambios antes de cambiar de categoría
                            </p>
                        </div>
                    </div>
                )}

                {/* Contenedor principal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex overflow-x-auto">
                            {tabs.map(tab => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                const count = configuraciones[tab.id]?.length || 0

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (hasChanges) {
                                                const confirmar = window.confirm(
                                                    'Tienes cambios sin guardar. ¿Deseas continuar sin guardar?'
                                                )
                                                if (!confirmar) return
                                                setHasChanges(false)
                                            }
                                            setActiveTab(tab.id)
                                        }}
                                        className={`
                                            flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm
                                            transition-colors whitespace-nowrap
                                            ${isActive 
                                                ? 'border-primary-600 text-primary-700 bg-white' 
                                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                        <span className={`
                                            ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${isActive 
                                                ? 'bg-primary-100 text-primary-700' 
                                                : 'bg-gray-200 text-gray-600'
                                            }
                                        `}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Descripción de la pestaña activa */}
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Info className="w-4 h-4" />
                            {tabs.find(t => t.id === activeTab)?.description}
                        </div>
                    </div>

                    {/* Contenido del formulario */}
                    <div className="p-6">
                        {renderFormulario()}
                    </div>
                </div>
            </div>
        </PagePermissionGuard>
    )
}

// ── v1.5: Componente de pestaña Disciplinas ───────────────────────────────────
const DISCIPLINA_EMOJIS = {
  'tae-kwon-do'      : '🥋',
  'tang-soo-do'      : '🥊',
  'hapkido'          : '🤼',
  'gumdo'            : '⚔️',
  'pequenos-dragones': '🐉',
}

const DisciplinasTab = ({ disciplinas, loadingLogo, onUpload, onDelete }) => {
    if (!disciplinas.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Layers className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">No hay disciplinas registradas</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-500">
                    Sube el logo de cada disciplina. Se usará en los PDFs de solicitud de ingreso y en reportes.
                    Formatos aceptados: JPG, PNG, WEBP. Máximo 5MB.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {disciplinas.map(disc => {
                    const isLoading = loadingLogo[disc._id]
                    const emoji     = DISCIPLINA_EMOJIS[disc.slug] || '🥋'

                    return (
                        <div key={disc._id}
                            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">

                            {/* Header disciplina */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl">{emoji}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                                        {disc.nombre}
                                    </h3>
                                    <p className="text-xs text-gray-400">{disc.slug}</p>
                                </div>
                            </div>

                            {/* Preview del logo */}
                            <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg mb-4"
                                style={{ height: 100 }}>
                                {disc.logoUrl ? (
                                    <img
                                        src={disc.logoUrl}
                                        alt={`Logo ${disc.nombre}`}
                                        className="max-h-24 max-w-full object-contain rounded"
                                        onError={e => {
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                        }}
                                    />
                                ) : null}
                                <div className={`flex-col items-center text-gray-300 ${disc.logoUrl ? 'hidden' : 'flex'}`}>
                                    <ImageIcon className="w-8 h-8 mb-1" />
                                    <span className="text-xs">Sin logo</span>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2">
                                {/* Botón subir */}
                                <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors
                                    ${isLoading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
                                    {isLoading
                                        ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                        : <Upload className="w-3.5 h-3.5" />}
                                    {disc.logoUrl ? 'Cambiar' : 'Subir logo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isLoading}
                                        onChange={e => {
                                            const file = e.target.files?.[0]
                                            if (file) onUpload(disc._id, file)
                                            e.target.value = ''
                                        }}
                                    />
                                </label>

                                {/* Botón eliminar (solo si hay logo) */}
                                {disc.logoUrl && (
                                    <button
                                        onClick={() => onDelete(disc._id, disc.nombre)}
                                        disabled={isLoading}
                                        className="px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-40"
                                        title="Eliminar logo">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ConfiguracionPage