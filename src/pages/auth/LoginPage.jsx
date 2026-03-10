import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/Authcontext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  // Obtener la página a la que se debe redirigir después del login
  const from = location.state?.from?.pathname || '/admin'

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password)
      
      if (result.success) {
        toast.success(`¡Bienvenido ${result.user.name}!`)
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(error.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Accede a tu cuenta para gestionar tu escuela de taekwondo
            </p>
          </div>

          {/* Credenciales de prueba */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Credenciales de prueba:
            </h3>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> admin@taekwondo.com<br />
              <strong>Contraseña:</strong> admin123
            </p>
          </div>

          {/* Formulario */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="tu@email.com"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordar sesión
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {/* Botón de submit */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Imagen/Branding */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-primary flex items-center justify-center">
          <div className="text-center text-white px-8">
            <div className="text-6xl mb-6">🥋</div>
            <h2 className="text-3xl font-bold mb-4 text-shadow">
              TaekwondoSys
            </h2>
            <p className="text-xl text-orange-100 max-w-md">
              Sistema completo de gestión para tu escuela de taekwondo
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">Gestión de Alumnos</div>
                <div className="text-orange-200">Control completo</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">Pagos y Finanzas</div>
                <div className="text-orange-200">Administración fácil</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">Horarios</div>
                <div className="text-orange-200">Organización perfecta</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold">Reportes</div>
                <div className="text-orange-200">Información detallada</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage