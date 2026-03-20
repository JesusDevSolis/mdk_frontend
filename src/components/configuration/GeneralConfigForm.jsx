import React from 'react'
import { Building2, Mail, Phone, Globe, Code2, Shield } from 'lucide-react'

const GeneralConfigForm = () => {
  const info = [
    {
      icon: <Building2 className="w-4 h-4 text-gray-500" />,
      label: 'Nombre del Sistema',
      value: 'TaekwondoSys'
    },
    {
      icon: <Mail className="w-4 h-4 text-gray-500" />,
      label: 'Email de Contacto',
      value: 'jesussolis.dev.23@gmail.com'
    },
    {
      icon: <Phone className="w-4 h-4 text-gray-500" />,
      label: 'Teléfono de Contacto',
      value: '9673 000 525'
    },
    {
      icon: <Globe className="w-4 h-4 text-gray-500" />,
      label: 'Zona Horaria',
      value: 'America/Mexico_City (GMT-6)'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Tarjeta desarrollador */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Información del Sistema</h3>
            <p className="text-xs text-gray-400">Datos del desarrollador — solo lectura</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
            <Shield className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">No editable</span>
          </div>
        </div>

        {/* Campos */}
        <div className="p-6 space-y-4">
          {info.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-48 flex items-center gap-2 flex-shrink-0">
                {item.icon}
                <span className="text-sm text-gray-500">{item.label}</span>
              </div>
              <div className="flex-1">
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium select-all cursor-default">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-600">
            💡 Para modificar estos datos contacta al desarrollador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GeneralConfigForm