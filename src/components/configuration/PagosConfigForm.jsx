import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, DollarSign, Calendar, Percent, CreditCard } from 'lucide-react'
import { useForm } from 'react-hook-form'

const PagosConfigForm = ({ configuraciones, onSave, onRestore, saving, onChanges }) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm({
        defaultValues: {
            pago_dias_gracia: configuraciones.pago_dias_gracia || 5,
            pago_recargo_tardio: configuraciones.pago_recargo_tardio || 10,
            pago_requiere_comprobante: configuraciones.pago_requiere_comprobante || false
        }
    })

    useEffect(() => {
        reset({
            pago_dias_gracia: configuraciones.pago_dias_gracia || 5,
            pago_recargo_tardio: configuraciones.pago_recargo_tardio || 10,
            pago_requiere_comprobante: configuraciones.pago_requiere_comprobante || false
        })
    }, [configuraciones, reset])

    useEffect(() => {
        if (onChanges) {
            onChanges(isDirty)
        }
    }, [isDirty, onChanges])

    const onSubmit = (data) => {
        const valores = {
            pago_dias_gracia: parseInt(data.pago_dias_gracia),
            pago_recargo_tardio: parseFloat(data.pago_recargo_tardio),
            pago_requiere_comprobante: data.pago_requiere_comprobante
        }
        onSave(valores)
    }

    const diasGracia = watch('pago_dias_gracia')
    const recargoTardio = watch('pago_recargo_tardio')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Políticas de Pago */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-600" />
                    Políticas de Pago
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Días de Gracia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Días de Gracia *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                {...register('pago_dias_gracia', {
                                    required: 'Los días de gracia son requeridos',
                                    min: { value: 0, message: 'Mínimo 0 días' },
                                    max: { value: 30, message: 'Máximo 30 días' }
                                })}
                                className={`input-field pr-20 ${errors.pago_dias_gracia ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-sm text-gray-500">días</span>
                            </div>
                        </div>
                        {errors.pago_dias_gracia && (
                            <p className="mt-1 text-sm text-red-600">{errors.pago_dias_gracia.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Días después del vencimiento antes de aplicar recargo
                        </p>
                    </div>

                    {/* Recargo por Pago Tardío */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recargo por Pago Tardío *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                {...register('pago_recargo_tardio', {
                                    required: 'El recargo es requerido',
                                    min: { value: 0, message: 'Mínimo 0%' },
                                    max: { value: 100, message: 'Máximo 100%' }
                                })}
                                className={`input-field pr-12 ${errors.pago_recargo_tardio ? 'border-red-300' : ''}`}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Percent className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        {errors.pago_recargo_tardio && (
                            <p className="mt-1 text-sm text-red-600">{errors.pago_recargo_tardio.message}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Porcentaje de recargo sobre el monto original
                        </p>
                    </div>
                </div>
            </div>

            {/* Comprobantes y Validaciones */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Comprobantes y Validaciones
                </h3>

                <div className="space-y-4">
                    {/* Requiere Comprobante */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="checkbox"
                            id="pago_requiere_comprobante"
                            {...register('pago_requiere_comprobante')}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                            <label htmlFor="pago_requiere_comprobante" className="font-medium text-gray-900 cursor-pointer">
                                Requerir comprobante para todos los pagos
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                                Si se activa, todos los pagos deberán incluir un comprobante obligatorio
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vista previa de cálculo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Ejemplo de Cálculo de Recargo</h4>
                <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                        <span>Monto original:</span>
                        <span className="font-semibold">$1,000.00</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Días de gracia:</span>
                        <span className="font-semibold">{diasGracia} días</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Recargo ({recargoTardio}%):</span>
                        <span className="font-semibold">${(1000 * recargoTardio / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                        <span className="font-semibold">Total con recargo:</span>
                        <span className="font-bold text-lg">${(1000 + (1000 * recargoTardio / 100)).toFixed(2)}</span>
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Importante</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-700">
                            <li>Los días de gracia se cuentan a partir de la fecha de vencimiento</li>
                            <li>El recargo se aplica automáticamente después del periodo de gracia</li>
                            <li>Puedes modificar el recargo manualmente en cada pago individual</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PagosConfigForm