import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, GraduationCap, Percent, Calendar, DollarSign } from 'lucide-react'
import { useForm } from 'react-hook-form'

const ExamenesConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
        defaultValues: {
            examen_calificacion_minima: configuraciones.examen_calificacion_minima || 60,
            examen_asistencia_minima: configuraciones.examen_asistencia_minima || 75,
            examen_dias_minimos_cinturon: configuraciones.examen_dias_minimos_cinturon || 90,
            examen_costo_base: configuraciones.examen_costo_base || 500
        }
    })

    useEffect(() => {
        reset({
            examen_calificacion_minima: configuraciones.examen_calificacion_minima || 60,
            examen_asistencia_minima: configuraciones.examen_asistencia_minima || 75,
            examen_dias_minimos_cinturon: configuraciones.examen_dias_minimos_cinturon || 90,
            examen_costo_base: configuraciones.examen_costo_base || 500
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        // Convertir a números
        const valores = {
            examen_calificacion_minima: parseFloat(data.examen_calificacion_minima),
            examen_asistencia_minima: parseFloat(data.examen_asistencia_minima),
            examen_dias_minimos_cinturon: parseInt(data.examen_dias_minimos_cinturon),
            examen_costo_base: parseFloat(data.examen_costo_base)
        }
        onSave(valores)
    }

    const calificacionMinima = watch('examen_calificacion_minima')
    const asistenciaMinima = watch('examen_asistencia_minima')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Requisitos de Aprobación */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary-600" />
                    Requisitos de Aprobación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calificación Mínima */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Calificación Mínima para Aprobar *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                {...register('examen_calificacion_minima', {
                                    required: 'La calificación mínima es requerida',
                                    min: { value: 0, message: 'Mínimo 0' },
                                    max: { value: 100, message: 'Máximo 100' }
                                })}
                                className={`input-field pr-12 ${errors.examen_calificacion_minima ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Percent className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {errors.examen_calificacion_minima && (
                            <p className="mt-1 text-sm text-red-600">{errors.examen_calificacion_minima.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Valor actual: <span className="font-semibold">{calificacionMinima} puntos</span>
                        </p>
                    </div>

                    {/* Asistencia Mínima */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asistencia Mínima Requerida *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                {...register('examen_asistencia_minima', {
                                    required: 'La asistencia mínima es requerida',
                                    min: { value: 0, message: 'Mínimo 0' },
                                    max: { value: 100, message: 'Máximo 100' }
                                })}
                                className={`input-field pr-12 ${errors.examen_asistencia_minima ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Percent className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {errors.examen_asistencia_minima && (
                            <p className="mt-1 text-sm text-red-600">{errors.examen_asistencia_minima.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Valor actual: <span className="font-semibold">{asistenciaMinima}% de asistencias</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Tiempos y Costos */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Tiempos y Costos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Días Mínimos con Cinturón */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días Mínimos con Cinturón Actual *
                        </label>
                        <input
                            type="number"
                            min="0"
                            {...register('examen_dias_minimos_cinturon', {
                                required: 'Los días mínimos son requeridos',
                                min: { value: 0, message: 'Mínimo 0 días' }
                            })}
                            className={`input-field ${errors.examen_dias_minimos_cinturon ? 'border-red-300' : ''}`}
                        />
                        {errors.examen_dias_minimos_cinturon && (
                            <p className="mt-1 text-sm text-red-600">{errors.examen_dias_minimos_cinturon.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Días requeridos antes de presentar examen
                        </p>
                    </div>

                    {/* Costo Base de Examen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Costo Base de Examen *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register('examen_costo_base', {
                                    required: 'El costo base es requerido',
                                    min: { value: 0, message: 'Mínimo $0' }
                                })}
                                className={`input-field pl-10 ${errors.examen_costo_base ? 'border-red-300' : ''}`}
                                placeholder="500.00"
                            />
                        </div>
                        {errors.examen_costo_base && (
                            <p className="mt-1 text-sm text-red-600">{errors.examen_costo_base.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Costo predeterminado para exámenes de graduación
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">Configuración de Exámenes</p>
                        <ul className="list-disc list-inside space-y-1 text-green-700">
                            <li>Estos valores se aplican a todos los exámenes nuevos</li>
                            <li>Puedes modificar valores individuales en cada examen</li>
                            <li>Los exámenes existentes no se verán afectados</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default ExamenesConfigForm