import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Bell, Mail, Server, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'

const NotificacionesConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
        defaultValues: {
            notif_email_habilitado: configuraciones.notif_email_habilitado || false,
            notif_email_smtp_host: configuraciones.notif_email_smtp_host || '',
            notif_email_smtp_port: configuraciones.notif_email_smtp_port || 587,
            notif_email_smtp_user: configuraciones.notif_email_smtp_user || '',
            notif_recordatorio_pagos: configuraciones.notif_recordatorio_pagos || true
        }
    })

    useEffect(() => {
        reset({
            notif_email_habilitado: configuraciones.notif_email_habilitado || false,
            notif_email_smtp_host: configuraciones.notif_email_smtp_host || '',
            notif_email_smtp_port: configuraciones.notif_email_smtp_port || 587,
            notif_email_smtp_user: configuraciones.notif_email_smtp_user || '',
            notif_recordatorio_pagos: configuraciones.notif_recordatorio_pagos || true
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        const valores = {
            notif_email_habilitado: data.notif_email_habilitado,
            notif_email_smtp_host: data.notif_email_smtp_host,
            notif_email_smtp_port: parseInt(data.notif_email_smtp_port),
            notif_email_smtp_user: data.notif_email_smtp_user,
            notif_recordatorio_pagos: data.notif_recordatorio_pagos
        }
        onSave(valores)
    }

    const emailHabilitado = watch('notif_email_habilitado')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Configuración de Email */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary-600" />
                    Notificaciones por Email
                </h3>

                <div className="space-y-4">
                    {/* Habilitar Email */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="notif_email_habilitado"
                            {...register('notif_email_habilitado')}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="notif_email_habilitado" className="font-medium text-gray-900 cursor-pointer">
                                Habilitar notificaciones por email
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Permite enviar notificaciones automáticas por correo electrónico
                            </p>
                        </div>
                    </div>

                    {/* Configuración SMTP (solo si email está habilitado) */}
                    {emailHabilitado && (
                        <div className="pl-7 space-y-4 border-l-2 border-primary-200">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Server className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">Configuración SMTP</p>
                                        <p className="text-blue-700">
                                            Necesitas configurar un servidor SMTP para enviar emails. Contacta a tu proveedor de correo para obtener estos datos.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* SMTP Host */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Servidor SMTP
                                    </label>
                                    <input
                                        type="text"
                                        {...register('notif_email_smtp_host')}
                                        className="input-field"
                                        placeholder="smtp.gmail.com"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Dirección del servidor SMTP
                                    </p>
                                </div>

                                {/* SMTP Port */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Puerto SMTP
                                    </label>
                                    <input
                                        type="number"
                                        {...register('notif_email_smtp_port', {
                                            min: { value: 1, message: 'Puerto inválido' },
                                            max: { value: 65535, message: 'Puerto inválido' }
                                        })}
                                        className={`input-field ${errors.notif_email_smtp_port ? 'border-red-300' : ''}`}
                                        placeholder="587"
                                    />
                                    {errors.notif_email_smtp_port && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notif_email_smtp_port.message}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Comúnmente 587 (TLS) o 465 (SSL)
                                    </p>
                                </div>

                                {/* SMTP User */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Usuario SMTP
                                    </label>
                                    <input
                                        type="text"
                                        {...register('notif_email_smtp_user')}
                                        className="input-field"
                                        placeholder="tu-email@ejemplo.com"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Usuario o email para autenticación SMTP
                                    </p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Nota de Seguridad</p>
                                        <p className="text-yellow-700">
                                            La contraseña SMTP debe configurarse directamente en el servidor por motivos de seguridad. No la almacenes en la base de datos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tipos de Notificaciones */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-600" />
                    Tipos de Notificaciones Automáticas
                </h3>

                <div className="space-y-3">
                    {/* Recordatorio de Pagos */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="notif_recordatorio_pagos"
                            {...register('notif_recordatorio_pagos')}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="notif_recordatorio_pagos" className="font-medium text-gray-900 cursor-pointer">
                                Recordatorios de pagos vencidos
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Envía recordatorios automáticos cuando un pago esté próximo a vencer o esté vencido
                            </p>
                        </div>
                    </div>

                    {/* Otras notificaciones (placeholder para futuras expansiones) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-60">
                        <p className="text-sm text-gray-600 italic">
                            Más tipos de notificaciones estarán disponibles próximamente:
                        </p>
                        <ul className="text-sm text-gray-500 mt-2 ml-4 list-disc">
                            <li>Recordatorios de exámenes</li>
                            <li>Notificaciones de cumpleaños</li>
                            <li>Avisos de graduaciones</li>
                            <li>Confirmaciones de asistencia</li>
                        </ul>
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
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-indigo-800">
                        <p className="font-medium mb-1">Sistema de Notificaciones</p>
                        <ul className="list-disc list-inside space-y-1 text-indigo-700">
                            <li>Las notificaciones se envían automáticamente según los eventos configurados</li>
                            <li>Puedes desactivar las notificaciones en cualquier momento</li>
                            <li>Los usuarios pueden configurar sus preferencias de notificación en su perfil</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default NotificacionesConfigForm