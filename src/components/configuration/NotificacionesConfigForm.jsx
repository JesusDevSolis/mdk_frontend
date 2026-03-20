import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Bell, Mail, Phone, MessageCircle, CheckCircle, XCircle, Loader, RefreshCw, AlertCircle } from 'lucide-react'
import { notificacionesAPI } from '../../services/APIservice'

const DEFAULTS = {
  notif_email_habilitado:   false,
  notif_recordatorio_pagos: true
}

const NotificacionesConfigForm = ({ configuraciones = {}, onSave, onRestore, saving }) => {
  const [form, setForm]           = useState({ ...DEFAULTS, ...configuraciones })
  const [emailStatus, setEmailStatus] = useState(null) // null | 'checking' | 'ok' | 'error'
  const [emailError, setEmailError]   = useState('')

  useEffect(() => {
    if (Object.keys(configuraciones).length > 0) {
      setForm({ ...DEFAULTS, ...configuraciones })
    }
  }, [JSON.stringify(configuraciones)])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      notif_email_habilitado:   form.notif_email_habilitado,
      notif_recordatorio_pagos: form.notif_recordatorio_pagos
    })
  }

  const checkEmailConnection = async () => {
    setEmailStatus('checking')
    setEmailError('')
    try {
      const res = await notificacionesAPI.verificarEmail()
      if (res.success) {
        setEmailStatus('ok')
      } else {
        setEmailStatus('error')
        setEmailError(res.message || 'Error de conexión')
      }
    } catch (e) {
      setEmailStatus('error')
      setEmailError(e.response?.data?.message || 'No se pudo verificar la conexión')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── EMAIL ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header canal */}
        <div className="flex items-center gap-3 px-5 py-4 bg-blue-50 border-b border-blue-100">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">Notificaciones por Email</h3>
            <p className="text-xs text-gray-500">Configurado mediante variables de entorno en Railway</p>
          </div>
          {/* Toggle habilitado */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer"
              checked={!!form.notif_email_habilitado}
              onChange={e => set('notif_email_habilitado', e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Estado de conexión */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              {emailStatus === null && <AlertCircle className="w-4 h-4 text-gray-400" />}
              {emailStatus === 'checking' && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
              {emailStatus === 'ok' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {emailStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {emailStatus === null     && 'Estado del servidor de email'}
                  {emailStatus === 'checking' && 'Verificando conexión...'}
                  {emailStatus === 'ok'       && 'Servidor de email conectado ✓'}
                  {emailStatus === 'error'    && 'Error de conexión'}
                </p>
                {emailStatus === 'error' && (
                  <p className="text-xs text-red-500 mt-0.5">{emailError}</p>
                )}
                {emailStatus === null && (
                  <p className="text-xs text-gray-400">Haz clic en verificar para comprobar la conexión con Gmail</p>
                )}
              </div>
            </div>
            <button type="button" onClick={checkEmailConnection}
              disabled={emailStatus === 'checking'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-3 h-3 ${emailStatus === 'checking' ? 'animate-spin' : ''}`} />
              Verificar
            </button>
          </div>

          {/* Info variables entorno */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">Variables de entorno requeridas en Railway:</p>
            <div className="space-y-1">
              {['EMAIL_USER = tu-cuenta@gmail.com', 'EMAIL_PASSWORD = xxxx xxxx xxxx xxxx', 'EMAIL_FROM = "Escuela Bedolla <tu-cuenta@gmail.com>"'].map(v => (
                <code key={v} className="block text-xs bg-amber-100 text-amber-900 px-2 py-1 rounded font-mono">{v}</code>
              ))}
            </div>
          </div>

          {/* Notificaciones automáticas */}
          {form.notif_email_habilitado && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notificaciones automáticas</p>
              <div className="space-y-2">
                {[
                  { key: 'notif_recordatorio_pagos', label: 'Recordatorios de pagos vencidos', desc: 'Avisa cuando un pago lleva más días del período de gracia' },
                ].map(item => (
                  <label key={item.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      checked={!!form[item.key]}
                      onChange={e => set(item.key, e.target.checked)}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TELÉFONO — próximamente ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-60">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-500">Notificaciones por Teléfono (SMS)</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-500 rounded-full">Próximamente</span>
            </div>
            <p className="text-xs text-gray-400">Envío de SMS a alumnos y tutores</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full cursor-not-allowed" />
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-400 text-center py-2">
            📱 Integración con SMS disponible en una próxima versión
          </p>
        </div>
      </div>

      {/* ── WHATSAPP — próximamente ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-60">
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-500">Notificaciones por WhatsApp</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">Próximamente</span>
            </div>
            <p className="text-xs text-gray-400">Mensajes automáticos vía WhatsApp Business API</p>
          </div>
          <div className="w-11 h-6 bg-gray-200 rounded-full cursor-not-allowed" />
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-400 text-center py-2">
            💬 Integración con WhatsApp Business disponible en una próxima versión
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button type="button" onClick={onRestore} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          <RotateCcw className="w-4 h-4" /> Restaurar Valores
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

    </form>
  )
}

export default NotificacionesConfigForm