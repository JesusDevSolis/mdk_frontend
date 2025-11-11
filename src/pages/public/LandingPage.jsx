import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Users, Calendar, BookOpen, Award, ArrowRight } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Gestión de Alumnos",
      description: "Control completo de estudiantes, tutores y datos académicos"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Horarios y Clases",
      description: "Organización de horarios, asistencias y programación de clases"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Seguimiento Académico",
      description: "Calificaciones, evaluaciones y progreso de estudiantes"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Gestión de Pagos",
      description: "Control de colegiaturas, uniformes y pagos diversos"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Graduaciones",
      description: "Registro de cintas, grados y ceremonias de graduación"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  🥋 TaekwondoSys
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
            Sistema de Gestión para
            <span className="block text-yellow-300">Escuelas de Taekwondo</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto">
            Administra tu escuela de taekwondo de manera profesional con nuestro sistema completo de gestión
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              Acceder al Sistema
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
              Ver Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todo lo que necesitas para administrar tu escuela de taekwondo de manera eficiente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir nuestro sistema?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-4">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Seguro y Confiable</h3>
                    <p className="text-gray-600">Todos los datos están protegidos y respaldados en la nube</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Fácil de Usar</h3>
                    <p className="text-gray-600">Interfaz intuitiva diseñada para administradores y padres</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-4">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Acceso 24/7</h3>
                    <p className="text-gray-600">Disponible desde cualquier dispositivo, en cualquier momento</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-secondary rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">¿Listo para comenzar?</h3>
              <p className="mb-6 text-blue-100">
                Únete a las escuelas de taekwondo que ya confían en nuestro sistema
              </p>
              <Link
                to="/login"
                className="bg-white text-secondary-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link> 
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">🥋 TaekwondoSys</h3>
            <p className="text-gray-400 mb-4">
              Sistema de gestión profesional para escuelas de taekwondo
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 TaekwondoSys. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage