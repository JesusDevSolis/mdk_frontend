import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Shield, Lock } from 'lucide-react';

/**
 * Componente para proteger contenido basado en permisos
 * 
 * @param {string} module - Módulo a verificar
 * @param {string} action - Acción requerida (create, read, update, delete, o custom)
 * @param {ReactNode} children - Contenido a mostrar si tiene permiso
 * @param {ReactNode} fallback - Contenido alternativo si no tiene permiso (opcional)
 * @param {boolean} showMessage - Mostrar mensaje de error si no tiene permiso
 * 
 * @example
 * <PermissionGuard module="alumnos" action="create">
 *   <button>Crear Alumno</button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard 
 *   module="pagos" 
 *   action="viewFinancialStats"
 *   fallback={<p>No tienes acceso a estadísticas financieras</p>}
 * >
 *   <FinancialChart />
 * </PermissionGuard>
 */
const PermissionGuard = ({ 
    module, 
    action, 
    children, 
    fallback = null,
    showMessage = false 
}) => {
    const { can, permissions, role } = usePermissions(module);

    // Verificar si tiene el permiso
    const hasAccess = can(action);

    // Si tiene acceso, mostrar el contenido
    if (hasAccess) {
        return <>{children}</>;
    }

    // Si no tiene acceso, mostrar fallback o mensaje
    if (fallback) {
        return <>{fallback}</>;
    }

    if (showMessage) {
        return (
            <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <Lock className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-700">
                    No tienes permisos para acceder a esta funcionalidad
                </p>
            </div>
        );
    }

    // Por defecto, no mostrar nada
    return null;
};

/**
 * Componente para proteger una página completa
 * Si el usuario no tiene acceso, muestra una página de error
 * 
 * @example
 * <PagePermissionGuard module="configuracion" action="read">
 *   <ConfiguracionPage />
 * </PagePermissionGuard>
 */
export const PagePermissionGuard = ({ 
        module, 
        action = 'read', 
        children 
}) => {
    const { can, role } = usePermissions(module);

    if (!can(action)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="mb-6">
                        <Shield className="w-20 h-20 text-red-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Acceso Denegado
                        </h1>
                        <p className="text-gray-600 mb-4">
                            No tienes permisos para acceder a esta página
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700">
                                <strong>Módulo:</strong> {module}<br />
                                <strong>Acción requerida:</strong> {action}<br />
                                <strong>Tu rol:</strong> {role}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

/**
 * Componente para mostrar contenido solo a admins
 * 
 * @example
 * <AdminOnly>
 *   <button onClick={deleteAll}>Eliminar Todo</button>
 * </AdminOnly>
 */
export const AdminOnly = ({ children, fallback = null }) => {
    const { isAdmin } = usePermissions('dashboard');

    if (isAdmin) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
};

/**
 * Componente para mostrar contenido solo a instructores
 * 
 * @example
 * <InstructorOnly>
 *   <button>Marcar Asistencia</button>
 * </InstructorOnly>
 */
export const InstructorOnly = ({ children, fallback = null }) => {
    const { isInstructor, isAdmin } = usePermissions('dashboard');

    if (isInstructor || isAdmin) {
        return <>{children}</>;
    }

    return fallback ? <>{fallback}</> : null;
};

export default PermissionGuard;