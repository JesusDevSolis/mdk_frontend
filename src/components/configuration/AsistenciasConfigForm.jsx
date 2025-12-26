import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, ClipboardCheck, Clock, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'

const AsistenciasConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
        defaultValues: {
            asistencia_tolerancia_retardo: configuraciones.asistencia_tolerancia_retardo || 15,
            asistencia_dias_justificar: configuraciones.asistencia_dias_justificar || 3,
            asistencia_requiere_justificante: configuraciones.asistencia_requiere_justificante || false
        }
    })

    useEffect(() => {
        reset({
            asistencia_tolerancia_retardo: configuraciones.asistencia_tolerancia_retardo || 15,
            asistencia_dias_justificar: configuraciones.asistencia_dias_justificar || 3,
            asistencia_requiere_justificante: configuraciones.asistencia_requiere_justificante || false
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        const valores = {
            asistencia_tolerancia_retardo: parseInt(data.asistencia_tolerancia_retardo),
            asistencia_dias_justificar: parseInt(data.asistencia_dias_justificar),
            asistencia_requiere_justificante: data.asistencia_requiere_justificante
        }
        onSave(valores)
    }

    const toleranciaRetardo = watch('asistencia_tolerancia_retardo')
    const diasJustificar = watch('asistencia_dias_justificar')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Control de Retardos */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    Control de Retardos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tolerancia para Retardo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tolerancia para Retardo *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="60"
                                {...register('asistencia_tolerancia_retardo', {
                                    required: 'La tolerancia es requerida',
                                    min: { value: 0, message: 'Mínimo 0 minutos' },
                                    max: { value: 60, message: 'Máximo 60 minutos' }
                                })}
                                className={`input-field pr-20 ${errors.asistencia_tolerancia_retardo ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-sm text-gray-500">minutos</span>
                            </div>
                        </div>
                        {errors.asistencia_tolerancia_retardo && (
                            <p className="mt-1 text-sm text-red-600">{errors.asistencia_tolerancia_retardo.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Minutos de tolerancia antes de marcar como retardo
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium mb-2">Ejemplo:</p>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• Hora de clase: <span className="font-semibold">16:00</span></p>
                            <p>• Tolerancia: <span className="font-semibold">{toleranciaRetardo} min</span></p>
                            <p>• Retardo después de: <span className="font-semibold">16:{toleranciaRetardo.toString().padStart(2, '0')}</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Justificaciones */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Justificaciones de Inasistencias
                </h3>

                <div className="space-y-4">
                    {/* Días para Justificar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días Máximos para Justificar *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        {...register('asistencia_dias_justificar', {
                                            required: 'Los días son requeridos',
                                            min: { value: 0, message: 'Mínimo 0 días' },
                                            max: { value: 30, message: 'Máximo 30 días' }
                                        })}
                                        className={`input-field pr-20 ${errors.asistencia_dias_justificar ? 'border-red-300' : ''}`}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-sm text-gray-500">días</span>
                                    </div>
                                </div>
                                {errors.asistencia_dias_justificar && (
                                    <p className="mt-1 text-sm text-red-600">{errors.asistencia_dias_justificar.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Días después de la inasistencia para presentar justificación
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 font-medium mb-2">Plazo de justificación:</p>
                                <div className="text-sm text-green-700">
                                    <p>Hasta <span className="font-semibold">{diasJustificar} días</span> después de la inasistencia</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requiere Justificante Médico */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="asistencia_requiere_justificante"
                            {...register('asistencia_requiere_justificante')}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="asistencia_requiere_justificante" className="font-medium text-gray-900 cursor-pointer">
                                Requerir justificante médico
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Si se activa, las inasistencias justificadas deberán incluir un comprobante médico
                            </p>
                        </div>
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <ClipboardCheck className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">Control de Asistencias</p>
                        <ul className="list-disc list-inside space-y-1 text-purple-700">
                            <li>Los instructores pueden marcar asistencia desde sus dispositivos</li>
                            <li>La tolerancia se aplica automáticamente al registrar asistencias</li>
                            <li>Las justificaciones pueden ser aprobadas por administradores</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default AsistenciasConfigForm