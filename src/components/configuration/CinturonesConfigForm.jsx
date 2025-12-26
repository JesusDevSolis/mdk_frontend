import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Award, Calendar, Info } from 'lucide-react'
import { useForm } from 'react-hook-form'

const CinturonesConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
        defaultValues: {
            cinturon_tiempo_minimo_blanco: configuraciones.cinturon_tiempo_minimo_blanco || 60,
            cinturon_tiempo_minimo_color: configuraciones.cinturon_tiempo_minimo_color || 90
        }
    })

    useEffect(() => {
        reset({
            cinturon_tiempo_minimo_blanco: configuraciones.cinturon_tiempo_minimo_blanco || 60,
            cinturon_tiempo_minimo_color: configuraciones.cinturon_tiempo_minimo_color || 90
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        const valores = {
            cinturon_tiempo_minimo_blanco: parseInt(data.cinturon_tiempo_minimo_blanco),
            cinturon_tiempo_minimo_color: parseInt(data.cinturon_tiempo_minimo_color)
        }
        onSave(valores)
    }

    const tiempoBlanco = watch('cinturon_tiempo_minimo_blanco')
    const tiempoColor = watch('cinturon_tiempo_minimo_color')

    // Orden de progresión de cinturones (hardcoded según el sistema)
    const ordenProgresion = [
        { nivel: 'blanco', nombre: 'Blanco', color: '#FFFFFF', border: true },
        { nivel: 'blanco-amarillo', nombre: 'Blanco-Amarillo', color: '#FFE599' },
        { nivel: 'amarillo', nombre: 'Amarillo', color: '#FFD700' },
        { nivel: 'amarillo-naranja', nombre: 'Amarillo-Naranja', color: '#FFB347' },
        { nivel: 'naranja', nombre: 'Naranja', color: '#FFA500' },
        { nivel: 'naranja-verde', nombre: 'Naranja-Verde', color: '#90EE90' },
        { nivel: 'verde', nombre: 'Verde', color: '#228B22' },
        { nivel: 'verde-azul', nombre: 'Verde-Azul', color: '#20B2AA' },
        { nivel: 'azul', nombre: 'Azul', color: '#1E90FF' },
        { nivel: 'azul-marron', nombre: 'Azul-Marrón', color: '#8B4513' },
        { nivel: 'marron', nombre: 'Marrón', color: '#A0522D' },
        { nivel: 'marron-negro', nombre: 'Marrón-Negro', color: '#5D4037' },
        { nivel: 'negro-1', nombre: 'Negro 1° Dan', color: '#000000' }
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Tiempos Mínimos por Cinturón */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Tiempo Mínimo por Cinturón
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tiempo Mínimo Cinturón Blanco */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo Mínimo - Cinturón Blanco *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                {...register('cinturon_tiempo_minimo_blanco', {
                                    required: 'El tiempo mínimo es requerido',
                                    min: { value: 0, message: 'Mínimo 0 días' }
                                })}
                                className={`input-field pr-20 ${errors.cinturon_tiempo_minimo_blanco ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-sm text-gray-500">días</span>
                            </div>
                        </div>
                        {errors.cinturon_tiempo_minimo_blanco && (
                            <p className="mt-1 text-sm text-red-600">{errors.cinturon_tiempo_minimo_blanco.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Días mínimos antes de examen a blanco-amarillo
                        </p>
                        <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <div 
                                className="w-6 h-6 rounded border-2 border-gray-300"
                                style={{ backgroundColor: '#FFFFFF' }}
                            />
                            <span className="text-sm text-gray-700">
                                Aproximadamente <span className="font-semibold">{Math.round(tiempoBlanco / 30)} meses</span>
                            </span>
                        </div>
                    </div>

                    {/* Tiempo Mínimo Cinturones de Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiempo Mínimo - Cinturones de Color *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                {...register('cinturon_tiempo_minimo_color', {
                                    required: 'El tiempo mínimo es requerido',
                                    min: { value: 0, message: 'Mínimo 0 días' }
                                })}
                                className={`input-field pr-20 ${errors.cinturon_tiempo_minimo_color ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-sm text-gray-500">días</span>
                            </div>
                        </div>
                        {errors.cinturon_tiempo_minimo_color && (
                            <p className="mt-1 text-sm text-red-600">{errors.cinturon_tiempo_minimo_color.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Días mínimos para todos los demás cinturones
                        </p>
                        <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: '#FFD700' }} />
                                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: '#FFA500' }} />
                                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: '#228B22' }} />
                            </div>
                            <span className="text-sm text-gray-700">
                                Aproximadamente <span className="font-semibold">{Math.round(tiempoColor / 30)} meses</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orden de Progresión */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary-600" />
                    Orden de Progresión de Cinturones
                </h3>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ordenProgresion.map((cinturon, index) => (
                            <div 
                                key={cinturon.nivel}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-500 w-6">{index + 1}.</span>
                                    <div 
                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                        style={{ 
                                            backgroundColor: cinturon.color,
                                            border: cinturon.border ? '2px solid #d1d5db' : 'none'
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {cinturon.nombre}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Progresión del Sistema</p>
                            <p className="text-blue-700">
                                El orden de progresión está definido por el sistema y no puede ser modificado desde la interfaz. 
                                Solo puedes ajustar los tiempos mínimos requeridos para cada nivel.
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
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Requisitos de Graduación</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                            <li>El tiempo mínimo se cuenta desde la fecha de la última graduación</li>
                            <li>Los alumnos deben cumplir este requisito además de asistencia y calificación</li>
                            <li>El sistema valida automáticamente estos requisitos al crear exámenes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default CinturonesConfigForm