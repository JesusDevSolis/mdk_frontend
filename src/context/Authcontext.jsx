import React, { createContext, useContext, useReducer, useEffect } from 'react'
import Cookies from 'js-cookie'
import { authAPI } from '../services/APIservice'
import toast from 'react-hot-toast'

// Estados iniciales
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  role: null
}

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER'
}

// Reducer para manejar el estado de autenticación
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        role: action.payload.user.role
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        role: null
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false
      }
    default:
      return state
  }
}

// Crear el contexto
const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      verifyToken(token)
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  // Verificar token con la API real
  const verifyToken = async (token) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      // Llamada real a la API
      const response = await authAPI.verifyToken()
      
      if (response.success && response.data.user) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { 
            user: response.data.user, 
            token: token 
          }
        })
      } else {
        throw new Error('Token inválido')
      }
    } catch (error) {
      console.error('Error verificando token:', error)
      Cookies.remove('token')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Función de login con API real
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      // Llamada real a la API
      const response = await authAPI.login(email, password)
      
      if (response.success && response.data) {
        const { user, token } = response.data
        
        // Guardar token en cookies
        Cookies.set('token', token, { expires: 30 }) // 30 días
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        })
        
        return { success: true, user }
      } else {
        throw new Error(response.message || 'Error en el login')
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al iniciar sesión'
      
      if (error.response) {
        // Error de respuesta del servidor
        errorMessage = error.response.data?.message || 'Credenciales inválidas'
      } else if (error.request) {
        // Error de red
        errorMessage = 'No se pudo conectar con el servidor'
      } else {
        // Otros errores
        errorMessage = error.message || 'Error desconocido'
      }
      
      throw new Error(errorMessage)
    }
  }

  // Función de logout con API real
  const logout = async () => {
    try {
      // Llamar al endpoint de logout
      await authAPI.logout()
    } catch (error) {
      console.error('Error en logout:', error)
      // Continuar con el logout local aunque falle la API
    } finally {
      // Limpiar estado local
      Cookies.remove('token')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Función para registrar usuarios (solo admin)
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      
      const response = await authAPI.register(userData)
      
      if (response.success) {
        toast.success('Usuario registrado exitosamente')
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Error en el registro')
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      
      let errorMessage = 'Error al registrar usuario'
      
      if (error.response?.data?.errors) {
        // Errores de validación
        const validationErrors = error.response.data.errors
        errorMessage = validationErrors.map(err => err.message).join(', ')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // Función para cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authAPI.changePassword(currentPassword, newPassword)
      
      if (response.success) {
        toast.success('Contraseña actualizada exitosamente')
        return { success: true }
      } else {
        throw new Error(response.message || 'Error al cambiar contraseña')
      }
    } catch (error) {
      let errorMessage = 'Error al cambiar contraseña'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.success && response.data) {
        // Actualizar usuario en el estado
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: response.data.user
        })
        
        toast.success('Perfil actualizado exitosamente')
        return { success: true, user: response.data.user }
      } else {
        throw new Error(response.message || 'Error al actualizar perfil')
      }
    } catch (error) {
      let errorMessage = 'Error al actualizar perfil'
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
        errorMessage = validationErrors.map(err => err.message).join(', ')
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  // Función para obtener perfil actualizado
  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      
      if (response.success && response.data) {
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: response.data.user
        })
        return { success: true, user: response.data.user }
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      // Si falla, mantener el usuario actual
    }
  }

  // Verificar si el usuario tiene un rol específico
  const hasRole = (requiredRole) => {
    return state.user && state.user.role === requiredRole
  }

  // Verificar si el usuario tiene permisos (roles múltiples)
  const hasAnyRole = (roles) => {
    return state.user && roles.includes(state.user.role)
  }

  // Verificar si es administrador
  const isAdmin = () => {
    return hasRole('admin')
  }

  // Verificar si es instructor
  const isInstructor = () => {
    return hasAnyRole(['admin', 'instructor'])
  }

  // Valor del contexto
  const value = {
    ...state,
    login,
    logout,
    register,
    changePassword,
    updateProfile,
    refreshProfile,
    hasRole,
    hasAnyRole,
    isAdmin,
    isInstructor
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext