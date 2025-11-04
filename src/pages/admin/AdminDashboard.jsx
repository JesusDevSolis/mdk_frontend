import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Home, 
  Users, 
  Building2, 
  Calendar, 
  CreditCard, 
  GraduationCap,
  ClipboardCheck,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import BackendStatus from '../../components/common/BackendStatus'

// Componentes de páginas (por ahora simples, los crearemos después)
const DashboardHome = () => (
  <div className="space-y-6">
    {/* Verificador de conexión con backend */}
    <BackendStatus />
    
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Principal</h1>
      <button className="btn-primary">
        Acceso Rápido
      </button>
    </div>
    
    {/* Tarjetas de estadísticas */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Alumnos</p>
            <p className="text-2xl font-bold text-gray-900">156</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
            <p className="text-2xl font-bold text-gray-900">$45,230</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Building2 className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Sucursales</p>
            <p className="text-2xl font-bold text-gray-900">3</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <GraduationCap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Clases Hoy</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Contenido adicional */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Nuevo alumno registrado: Juan Pérez</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Pago recibido: $500 - María García</span>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <span className="text-sm text-gray-600">Clase programada para mañana</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagos Pendientes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-gray-600">Ana López - Colegiatura</span>
            <span className="text-sm font-medium text-red-600">$300</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-gray-600">Carlos Ruiz - Uniforme</span>
            <span className="text-sm font-medium text-red-600">$150</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-gray-600">Sofia Mendez - Examen</span>
            <span className="text-sm font-medium text-red-600">$100</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Importar componente real de SucursalesPage
import SucursalesPage from './SucursalesPage'

// Componentes placeholder para otras páginas
const AlumnosPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Alumnos</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const HorariosPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Horarios</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const PagosPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Pagos</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const CalificacionesPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Calificaciones</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const AsistenciasPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Control de Asistencias</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const InstructoresPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Gestión de Instructores</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>
const ConfiguracionPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1><p className="text-gray-600 mt-2">Página en desarrollo...</p></div>

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  // Navegación del sidebar
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: location.pathname === '/admin' },
    { name: 'Alumnos', href: '/admin/alumnos', icon: Users, current: location.pathname.startsWith('/admin/alumnos') },
    { name: 'Sucursales', href: '/admin/sucursales', icon: Building2, current: location.pathname.startsWith('/admin/sucursales') },
    { name: 'Horarios', href: '/admin/horarios', icon: Calendar, current: location.pathname.startsWith('/admin/horarios') },
    { name: 'Pagos', href: '/admin/pagos', icon: CreditCard, current: location.pathname.startsWith('/admin/pagos') },
    { name: 'Calificaciones', href: '/admin/calificaciones', icon: GraduationCap, current: location.pathname.startsWith('/admin/calificaciones') },
    { name: 'Asistencias', href: '/admin/asistencias', icon: ClipboardCheck, current: location.pathname.startsWith('/admin/asistencias') },
    { name: 'Instructores', href: '/admin/instructores', icon: UserCheck, current: location.pathname.startsWith('/admin/instructores') },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings, current: location.pathname.startsWith('/admin/configuracion') },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada correctamente')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar para móvil */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Contenido del sidebar móvil */}
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">🥋 TaekwondoSys</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Usuario y logout móvil */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-primary-600">🥋 TaekwondoSys</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Usuario y logout desktop */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Buscar..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="alumnos" element={<AlumnosPage />} />
              <Route path="sucursales" element={<SucursalesPage />} />
              <Route path="horarios" element={<HorariosPage />} />
              <Route path="pagos" element={<PagosPage />} />
              <Route path="calificaciones" element={<CalificacionesPage />} />
              <Route path="asistencias" element={<AsistenciasPage />} />
              <Route path="instructores" element={<InstructoresPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard