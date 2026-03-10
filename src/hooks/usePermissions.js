import { useMemo } from 'react';
import { useAuth } from '../context/Authcontext';
import { getModulePermissions, hasPermission, canAccessModule } from '../config/permissions';

/**
 * Hook personalizado para gestionar permisos en componentes
 * 
 * @param {string} module - Nombre del módulo (ej: 'alumnos', 'pagos', 'horarios')
 * @returns {object} - Objeto con permisos y funciones helper
 * 
 * @example
 * const { canCreate, canEdit, canDelete, canView, permissions } = usePermissions('alumnos');
 * 
 * {canCreate && <button>Crear Alumno</button>}
 */
export const usePermissions = (module) => {
    const { user } = useAuth();
    
    // Obtener rol del usuario
    const role = user?.role || 'padre';

    // Memorizar permisos para evitar recalcular en cada render
    const permissions = useMemo(() => {
        if (!module) {
            console.warn('usePermissions: No se especificó módulo');
            return {};
        }
        
        return getModulePermissions(module, role);
    }, [module, role]);

    // Funciones helper para acciones comunes (CRUD)
    const canCreate = permissions.create === true;
    const canRead = permissions.read === true;
    const canUpdate = permissions.update === true;
    const canDelete = permissions.delete === true;
    const canView = permissions.read === true; // Alias para canRead

    // Función para verificar permisos personalizados
    const can = (action) => {
        return permissions[action] === true;
    };

    // Verificar si puede acceder al módulo
    const canAccess = canAccessModule(module, role);

    // Información del usuario
    const isAdmin = role === 'admin';
    const isInstructor = role === 'instructor';
    const isPadre = role === 'padre';

    // Información de la sucursal del usuario (útil para filtrado)
    const userSucursal = user?.sucursal;

    return {
        // Permisos CRUD básicos
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        canView,
        canAccess,

        // Función para verificar permisos personalizados
        can,

        // Objeto completo de permisos
        permissions,

        // Información del rol
        role,
        isAdmin,
        isInstructor,
        isPadre,

        // Información del usuario
        user,
        userSucursal
    };
};

/**
 * Hook para verificar si el usuario tiene permiso para una acción específica
 * Útil para verificaciones rápidas sin importar el módulo completo
 * 
 * @param {string} module - Nombre del módulo
 * @param {string} action - Acción a verificar
 * @returns {boolean} - true si tiene el permiso, false si no
 * 
 * @example
 * const canDeleteAlumno = useHasPermission('alumnos', 'delete');
 * {canDeleteAlumno && <button>Eliminar</button>}
 */
export const useHasPermission = (module, action) => {
    const { user } = useAuth();
    const role = user?.role || 'padre';

    return useMemo(() => {
        return hasPermission(module, role, action);
    }, [module, role, action]);
};

/**
 * Hook para obtener todos los módulos accesibles para el usuario actual
 * Útil para generar menús dinámicos
 * 
 * @returns {array} - Array con nombres de módulos accesibles
 * 
 * @example
 * const accessibleModules = useAccessibleModules();
 * // ['dashboard', 'alumnos', 'horarios', ...]
 */
export const useAccessibleModules = () => {
    const { user } = useAuth();
    const role = user?.role || 'padre';

    return useMemo(() => {
        const modules = [];
        const moduleNames = [
            'dashboard',
            'alumnos',
            'sucursales',
            'tutores',
            'horarios',
            'pagos',
            'asistencias',
            'instructores',
            'calificaciones',
            'configuracion'
        ];

        for (const module of moduleNames) {
            if (canAccessModule(module, role)) {
                modules.push(module);
            }
        }

        return modules;
    }, [role]);
};

/**
 * Hook para verificar si se debe filtrar por sucursal
 * Los instructores solo ven datos de su sucursal
 * 
 * @returns {object} - { shouldFilter, sucursalId }
 * 
 * @example
 * const { shouldFilter, sucursalId } = useSucursalFilter();
 * const filters = shouldFilter ? { sucursal: sucursalId } : {};
 */
export const useSucursalFilter = () => {
    const { user } = useAuth();
    const role = user?.role || 'padre';
    const sucursalId = user?.sucursal;

    return useMemo(() => {
        // Solo instructores tienen filtrado por sucursal
        const shouldFilter = role === 'instructor' && sucursalId;

        return {
            shouldFilter,
            sucursalId: shouldFilter ? sucursalId : null
        };
    }, [role, sucursalId]);
};

export default usePermissions;