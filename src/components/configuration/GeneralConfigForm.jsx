import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Building2, Mail, Phone, Globe } from 'lucide-react'
import { useForm } from 'react-hook-form'

const GeneralConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
        defaultValues: {
            sistema_nombre: configuraciones.sistema_nombre || 'TaekwondoSys',
            sistema_email: configuraciones.sistema_email || '',
            sistema_telefono: configuraciones.sistema_telefono || '',
            sistema_timezone: configuraciones.sistema_timezone || 'America/Mexico_City'
        }
    })

    useEffect(() => {
        reset({
            sistema_nombre: configuraciones.sistema_nombre || 'TaekwondoSys',
            sistema_email: configuraciones.sistema_email || '',
            sistema_telefono: configuraciones.sistema_telefono || '',
            sistema_timezone: configuraciones.sistema_timezone || 'America/Mexico_City'
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        onSave(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información del Sistema */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    Información del Sistema
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre del Sistema */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Sistema *
                        </label>
                        <input
                            type="text"
                            {...register('sistema_nombre', {
                                required: 'El nombre es requerido'
                            })}
                            className={`input-field ${errors.sistema_nombre ? 'border-red-300' : ''}`}
                            placeholder="TaekwondoSys"
                        />
                        {errors.sistema_nombre && (
                            <p className="mt-1 text-sm text-red-600">{errors.sistema_nombre.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Nombre que se mostrará en todo el sistema
                        </p>
                    </div>

                    {/* Email de Contacto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email de Contacto
                        </label>
                        <input
                            type="email"
                            {...register('sistema_email', {
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email inválido'
                                }
                            })}
                            className={`input-field ${errors.sistema_email ? 'border-red-300' : ''}`}
                            placeholder="contacto@taekwondo.com"
                        />
                        {errors.sistema_email && (
                            <p className="mt-1 text-sm text-red-600">{errors.sistema_email.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Email principal para contacto y notificaciones
                        </p>
                    </div>

                    {/* Teléfono de Contacto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Teléfono de Contacto
                        </label>
                        <input
                            type="tel"
                            {...register('sistema_telefono')}
                            className="input-field"
                            placeholder="961-123-4567"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Teléfono principal de la escuela
                        </p>
                    </div>

                    {/* Zona Horaria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Zona Horaria
                        </label>
                        <select
                            {...register('sistema_timezone')}
                            className="input-field bg-gray-100 cursor-not-allowed"
                            disabled
                        >
                            <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Zona horaria del sistema (no modificable)
                        </p>
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onRestore}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar Valores por Defecto
                </button>

                <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Información del Sistema</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Esta información se mostrará en todo el sistema</li>
                            <li>El email será usado para notificaciones automáticas</li>
                            <li>Los cambios se aplicarán inmediatamente</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default GeneralConfigForm