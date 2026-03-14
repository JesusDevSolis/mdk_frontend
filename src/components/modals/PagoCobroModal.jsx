import React, { useState, useRef, useCallback } from 'react'
import {
    X, Upload, CheckCircle, CreditCard, Calendar,
    FileText, AlertCircle, Loader, DollarSign, Clock
} from 'lucide-react'
import { pagosAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

// Etiquetas de método de pago
const METODOS = [
    { value: 'efectivo',      label: 'Efectivo',       icon: '💵' },
    { value: 'transferencia', label: 'Transferencia',  icon: '🏦' },
    { value: 'tarjeta',       label: 'Tarjeta',        icon: '💳' },
    { value: 'deposito',      label: 'Depósito',       icon: '🏧' },
    { value: 'cheque',        label: 'Cheque',         icon: '📄' },
]

const MESES = ['', 'Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// ─────────────────────────────────────────────────────────────────────────────
const PagoCobroModal = ({ isOpen, onClose, pago, onSuccess }) => {
    const [step, setStep]                 = useState(1)   // 1=método, 2=comprobante, 3=éxito
    const [paymentMethod, setPaymentMethod] = useState('')
    const [paidDate, setPaidDate]         = useState(new Date().toISOString().split('T')[0])
    const [reference, setReference]       = useState('')
    const [notes, setNotes]               = useState('')
    const [aplicarRecargo, setAplicarRecargo] = useState(true)
    const [file, setFile]                 = useState(null)
    const [preview, setPreview]           = useState(null)
    const [dragOver, setDragOver]         = useState(false)
    const [loading, setLoading]           = useState(false)
    const [errors, setErrors]             = useState({})
    const fileRef = useRef()

    if (!isOpen || !pago) return null

    // ── Datos del pago ──────────────────────────────────────────────────────
    const alumnoNombre = [
        pago.alumno?.firstName,
        pago.alumno?.lastName,
        pago.alumno?.secondLastName
    ].filter(Boolean).join(' ') || 'Alumno'

    const periodo = pago.period?.month
        ? `${MESES[pago.period.month]} ${pago.period.year}`
        : null

    const estaVencido = pago.status === 'vencido'
    const montoBase   = pago.amount || 0

    // ── Manejo de archivo ───────────────────────────────────────────────────
    const handleFile = useCallback((f) => {
        if (!f) return
        const allowed = ['image/jpeg','image/jpg','image/png','image/webp','application/pdf']
        if (!allowed.includes(f.type)) {
            setErrors(e => ({ ...e, file: 'Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF' }))
            return
        }
        if (f.size > 5 * 1024 * 1024) {
            setErrors(e => ({ ...e, file: 'El archivo no puede exceder 5MB' }))
            return
        }
        setErrors(e => ({ ...e, file: null }))
        setFile(f)
        if (f.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = ev => setPreview(ev.target.result)
            reader.readAsDataURL(f)
        } else {
            setPreview('pdf')
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }, [handleFile])

    // ── Validar paso 1 ──────────────────────────────────────────────────────
    const validarPaso1 = () => {
        const errs = {}
        if (!paymentMethod)  errs.paymentMethod = 'Selecciona el método de pago'
        if (!paidDate)       errs.paidDate      = 'La fecha de pago es requerida'
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    // ── Enviar ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!file) {
            setErrors(e => ({ ...e, file: 'El comprobante es obligatorio' }))
            return
        }
        setLoading(true)
        try {
            await pagosAPI.cobrarConComprobante(pago._id, {
                paymentMethod,
                paidDate,
                paymentReference : reference,
                notes,
                aplicarRecargo,
                comprobanteFile  : file
            })
            setStep(3)
            if (onSuccess) onSuccess()
        } catch (error) {
            const msg = error.response?.data?.message || 'Error al registrar el pago'
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setStep(1); setPaymentMethod(''); setReference(''); setNotes('')
        setFile(null); setPreview(null); setErrors({}); setAplicarRecargo(true)
        setPaidDate(new Date().toISOString().split('T')[0])
        onClose()
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">Registrar Cobro</h2>
                        <p className="text-gray-300 text-sm">{alumnoNombre}</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-300 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Steps indicator */}
                {step < 3 && (
                <div className="flex border-b border-gray-100">
                    {['Método de pago', 'Comprobante'].map((label, i) => {
                    const n = i + 1
                    const active = step === n
                    const done   = step > n
                    return (
                        <div key={n} className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                        ${active ? 'border-b-2 border-gray-800 text-gray-800' : done ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                            ${active ? 'bg-gray-800 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {done ? '✓' : n}
                        </span>
                        {label}
                        </div>
                    )
                    })}
                </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">

                {/* ── Info del pago ── */}
                {step < 3 && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-start gap-4">
                        <DollarSign className="w-9 h-9 text-gray-500 bg-white rounded-lg p-2 shadow-sm flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{pago.description || 'Colegiatura'}</p>
                            {periodo && <p className="text-sm text-gray-500">{periodo}</p>}
                            <div className="flex items-center gap-3 mt-1">
                            <span className="text-xl font-bold text-gray-900">
                                ${montoBase.toLocaleString('es-MX')} MXN
                            </span>
                            {estaVencido && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Vencido
                                </span>
                            )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ PASO 1: Método de pago ══ */}
                {step === 1 && (
                    <div className="space-y-5">
                    {/* Método */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método de pago <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {METODOS.map(m => (
                            <button
                            key={m.value}
                            type="button"
                            onClick={() => { setPaymentMethod(m.value); setErrors(e => ({ ...e, paymentMethod: null })) }}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                                ${paymentMethod === m.value
                                ? 'border-gray-800 bg-gray-800 text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'}`}
                            >
                            <span>{m.icon}</span> {m.label}
                            </button>
                        ))}
                        </div>
                        {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{errors.paymentMethod}
                        </p>
                        )}
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Fecha de pago <span className="text-red-500">*</span>
                        </label>
                        <input
                        type="date"
                        value={paidDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={e => setPaidDate(e.target.value)}
                        className="input-field w-full"
                        />
                        {errors.paidDate && (
                        <p className="text-red-500 text-xs mt-1">{errors.paidDate}</p>
                        )}
                    </div>

                    {/* Referencia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4 inline mr-1" />
                        Referencia / Folio <span className="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        <input
                        type="text"
                        value={reference}
                        onChange={e => setReference(e.target.value)}
                        placeholder="Número de operación, folio, etc."
                        className="input-field w-full"
                        />
                    </div>

                    {/* Recargo */}
                    {estaVencido && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-800">Pago vencido — posible recargo</p>
                            <p className="text-xs text-amber-600 mt-0.5">El sistema calculará el recargo según la configuración.</p>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={aplicarRecargo}
                                onChange={e => setAplicarRecargo(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm text-amber-800">Aplicar recargo por mora</span>
                            </label>
                        </div>
                        </div>
                    )}

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Notas internas <span className="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Observaciones sobre este pago..."
                        className="input-field w-full resize-none"
                        />
                    </div>
                    </div>
                )}

                {/* ══ PASO 2: Comprobante ══ */}
                {step === 2 && (
                    <div className="space-y-4">
                    <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>El comprobante es <strong>obligatorio</strong> para finalizar el registro. Acepta JPG, PNG, WEBP o PDF (máx. 5MB).</span>
                    </div>

                    {/* Zona de drop */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                        ${dragOver ? 'border-gray-800 bg-gray-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'}`}
                    >
                        {!file ? (
                        <>
                            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">Arrastra el comprobante aquí</p>
                            <p className="text-xs text-gray-400 mt-1">o haz click para seleccionar</p>
                        </>
                        ) : preview === 'pdf' ? (
                        <>
                            <FileText className="w-10 h-10 mx-auto text-green-500 mb-2" />
                            <p className="text-sm font-semibold text-green-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Click para cambiar</p>
                        </>
                        ) : (
                        <div className="relative">
                            <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                            <p className="text-xs text-gray-400 mt-2">Click para cambiar</p>
                        </div>
                        )}
                        <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={e => handleFile(e.target.files[0])}
                        />
                    </div>

                    {errors.file && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />{errors.file}
                        </p>
                    )}

                    {/* Resumen antes de confirmar */}
                    <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                        <h4 className="font-semibold text-gray-700 mb-2">Resumen del cobro</h4>
                        <div className="flex justify-between">
                        <span className="text-gray-500">Método</span>
                        <span className="font-medium capitalize">{METODOS.find(m => m.value === paymentMethod)?.label}</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-gray-500">Fecha de pago</span>
                        <span className="font-medium">{new Date(paidDate + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        {reference && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Referencia</span>
                            <span className="font-medium">{reference}</span>
                        </div>
                        )}
                        <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-700 font-semibold">Total</span>
                        <span className="font-bold text-gray-900">${montoBase.toLocaleString('es-MX')} MXN</span>
                        </div>
                    </div>
                    </div>
                )}

                {/* ══ PASO 3: Éxito ══ */}
                {step === 3 && (
                    <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-9 h-9 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¡Pago registrado!</h3>
                    <p className="text-gray-500 text-sm mb-1">{alumnoNombre}</p>
                    {periodo && <p className="text-gray-400 text-sm">{periodo}</p>}
                    <p className="text-2xl font-bold text-green-600 mt-3">
                        ${montoBase.toLocaleString('es-MX')} MXN
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Comprobante adjuntado correctamente</p>
                    </div>
                )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50">
                {step === 1 && (
                    <>
                    <button onClick={handleClose} className="btn-secondary">Cancelar</button>
                    <button
                        onClick={() => { if (validarPaso1()) setStep(2) }}
                        className="btn-primary"
                    >
                        Continuar →
                    </button>
                    </>
                )}
                {step === 2 && (
                    <>
                    <button onClick={() => setStep(1)} className="btn-secondary" disabled={loading}>
                        ← Atrás
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading
                        ? <><Loader className="w-4 h-4 animate-spin" /> Registrando...</>
                        : <><CheckCircle className="w-4 h-4" /> Confirmar cobro</>
                        }
                    </button>
                    </>
                )}
                {step === 3 && (
                    <button onClick={handleClose} className="btn-primary w-full">
                    Cerrar
                    </button>
                )}
                </div>

            </div>
        </div>
    )
}

export default PagoCobroModal