import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Importar páginas
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'

// Importar contextos
import { AuthProvider } from './context/AuthContext'

// Importar componentes
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas protegidas - Administración */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'instructor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta 404 */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Página no encontrada</p>
                    <a 
                      href="/" 
                      className="btn-primary"
                    >
                      Volver al inicio
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App