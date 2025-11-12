import React, { useState } from 'react'
import { 
    X, 
    Upload, 
    Loader,
    FileText,
    Image,
    CheckCircle,
    AlertCircle
} from 'lucide-react'
import { pagosAPI } from '../../services/APIservice'
import toast from 'react-hot-toast'

const ComprobanteUploadModal = ({ isOpen, onClose, onSuccess, pago }) => {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    if (!isOpen || !pago) return null

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0]
        processFile(selectedFile)
    }

    const processFile = (selectedFile) => {
        if (!selectedFile) return

        console.log('📎 Archivo seleccionado:', selectedFile)
        console.log('  - Nombre:', selectedFile.name)
        console.log('  - Tipo:', selectedFile.type)
        console.log('  - Tamaño:', selectedFile.size, 'bytes')

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!validTypes.includes(selectedFile.type)) {
            toast.error('Tipo de archivo no permitido. Solo JPG, PNG, PDF, DOC o DOCX')
            return
        }

        // Validar tamaño (5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande. Máximo 5MB')
            return
        }

        setFile(selectedFile)
        console.log('✅ Archivo válido y listo para subir')

        // Generar preview para imágenes
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(selectedFile)
        } else {
            setPreview(null)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) {
            toast.error('Por favor selecciona un archivo')
            return
        }

        try {
            setLoading(true)
            
            console.log('📤 Iniciando subida de comprobante...')
            console.log('  - Pago ID:', pago._id)
            console.log('  - Archivo:', file.name)

            // 🔧 CORREGIDO: Pasar directamente el archivo (File object)
            // El método uploadComprobante en APIservice.js creará el FormData
            await pagosAPI.uploadComprobante(pago._id, file)
            
            console.log('✅ Comprobante subido exitosamente')
            toast.success('Comprobante subido exitosamente')
            onSuccess()
            onClose()
        } catch (error) {
            console.error('❌ Error al subir comprobante:', error)
            console.error('  - Response:', error.response)
            toast.error(error.response?.data?.message || 'Error al subir el comprobante')
        } finally {
            setLoading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFileIcon = () => {
        if (!file) return FileText
        if (file.type.startsWith('image/')) return Image
        return FileText
    }

    const FileIcon = getFileIcon()

    // ===== RENDER =====

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Subir Comprobante de Pago
                            </h2>
                            <p className="text-purple-100 text-sm">
                                {pago.alumno?.firstName} {pago.alumno?.lastName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-6">
                    {/* Información del pago */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Tipo de Pago</p>
                                <p className="font-medium text-gray-900 capitalize">{pago.type}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Monto Total</p>
                                <p className="font-medium text-gray-900">
                                    {new Intl.NumberFormat('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN'
                                    }).format(pago.total)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Zona de arrastre */}
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                            dragActive
                                ? 'border-purple-500 bg-purple-50'
                                : file
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300 bg-gray-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {!file ? (
                            <>
                                <Upload className={`mx-auto w-12 h-12 mb-4 ${
                                    dragActive ? 'text-purple-500' : 'text-gray-400'
                                }`} />
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    {dragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta tu comprobante'}
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    o haz clic para seleccionar
                                </p>
                                <label className="btn-primary cursor-pointer inline-block">
                                    <span>Seleccionar Archivo</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
                                        disabled={loading}
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-4">
                                    Formatos permitidos: JPG, PNG, PDF, DOC, DOCX (Máximo 5MB)
                                </p>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {/* Preview de imagen */}
                                {preview && (
                                    <div className="flex justify-center">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-h-64 rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}

                                {/* Info del archivo */}
                                <div className="bg-white rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-100 rounded-lg">
                                            <FileIcon className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-gray-900">{file.name}</p>
                                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                        </div>
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>

                                {/* Botón para cambiar archivo */}
                                <label className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                                    Cambiar archivo
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                        accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Instrucciones */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium mb-1">Importante:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>El comprobante debe ser legible</li>
                                    <li>Debe incluir la referencia del pago</li>
                                    <li>El monto debe coincidir con el total del pago</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleUpload}
                        className="btn-primary flex items-center gap-2"
                        disabled={!file || loading}
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Subir Comprobante
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ComprobanteUploadModal