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
    Info
} from 'lucide-react'
import { configuracionesAPI } from '../../services/APIservice'
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
        }
    ]

    useEffect(() => {
        loadConfiguraciones()
        loadEstadisticas()
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

export default ConfiguracionPage