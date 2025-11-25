/**
 * Configuración Central de Permisos
 * 
 * Define qué puede hacer cada rol en cada módulo del sistema.
 * 
 * Estructura:
 * - create: Crear nuevos registros
 * - read: Ver/listar registros
 * - update: Editar registros existentes
 * - delete: Eliminar registros
 * - custom: Permisos especiales personalizados
 */

const PERMISSIONS = {
    // ============================================
    // DASHBOARD
    // ============================================
    dashboard: {
        admin: {
            read: true,
            viewAllSucursales: true,
            viewAllStats: true,
            exportData: true
        },
        instructor: {
            read: true,
            viewAllSucursales: false, // Solo ve su sucursal
            viewAllStats: false, // Solo ve stats de su sucursal
            exportData: false
        },
        padre: {
            read: false
        }
    },

    // ============================================
    // ALUMNOS
    // ============================================
    alumnos: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true, // Ve todos los alumnos
            exportData: true,
            manageEnrollment: true
        },
        instructor: {
            create: true,
            read: true,
            update: true,
            delete: false, // No puede eliminar
            viewAll: false, // Solo ve alumnos de su sucursal
            exportData: true,
            manageEnrollment: true
        },
        padre: {
            create: false,
            read: false, // Solo verá sus propios hijos (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            exportData: false,
            manageEnrollment: false
        }
    },

    // ============================================
    // SUCURSALES
    // ============================================
    sucursales: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            manageLogo: true,
            manageSettings: true
        },
        instructor: {
            create: false,
            read: true,
            update: false,
            delete: false,
            viewAll: false, // Solo ve su sucursal
            manageLogo: false,
            manageSettings: false
        },
        padre: {
            create: false,
            read: false,
            update: false,
            delete: false,
            viewAll: false,
            manageLogo: false,
            manageSettings: false
        }
    },

    // ============================================
    // HORARIOS
    // ============================================
    horarios: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            assignInstructors: true,
            manageCapacity: true
        },
        instructor: {
            create: false, // Admin asigna horarios
            read: true,
            update: true, // Puede editar horarios donde es instructor
            delete: false,
            viewAll: false, // Solo ve sus horarios
            assignInstructors: false,
            manageCapacity: false
        },
        padre: {
            create: false,
            read: false, // Solo verá horarios de sus hijos (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            assignInstructors: false,
            manageCapacity: false
        }
    },

    // ============================================
    // PAGOS
    // ============================================
    pagos: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            approvePayments: true,
            generateReports: true,
            viewFinancialStats: true
        },
        instructor: {
            create: false, // Solo admin registra pagos
            read: true,
            update: false,
            delete: false,
            viewAll: false, // Solo ve pagos de su sucursal
            approvePayments: false,
            generateReports: false,
            viewFinancialStats: false
        },
        padre: {
            create: false,
            read: false, // Solo verá sus propios pagos (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            approvePayments: false,
            generateReports: false,
            viewFinancialStats: false
        }
    },

    // ============================================
    // ASISTENCIAS
    // ============================================
    asistencias: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            markAttendance: true,
            bulkMark: true,
            viewReports: true
        },
        instructor: {
            create: true,
            read: true,
            update: true,
            delete: false,
            viewAll: false, // Solo ve asistencias de sus horarios
            markAttendance: true, // Solo en sus horarios
            bulkMark: true, // Solo en sus horarios
            viewReports: true // Solo de sus clases
        },
        padre: {
            create: false,
            read: false, // Solo verá asistencias de sus hijos (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            markAttendance: false,
            bulkMark: false,
            viewReports: false
        }
    },

    // ============================================
    // INSTRUCTORES
    // ============================================
    instructores: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            manageSchedule: true,
            manageCertifications: true,
            viewSalary: true,
            toggleStatus: true // ✅ Activar/Desactivar instructores
        },
        instructor: {
            create: false,
            read: true,
            update: false, // ✅ CORREGIDO: No puede editar (ni siquiera su perfil)
            delete: false,
            viewAll: false, // Solo ve instructores de su sucursal
            manageSchedule: false,
            manageCertifications: false,
            viewSalary: false, // No ve salarios de otros
            toggleStatus: false // ✅ No puede cambiar estados
        },
        padre: {
            create: false,
            read: false,
            update: false,
            delete: false,
            viewAll: false,
            manageSchedule: false,
            manageCertifications: false,
            viewSalary: false
        }
    },

    // ============================================
    // CALIFICACIONES (Módulo futuro)
    // ============================================
    calificaciones: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            approveBeltPromotion: true,
            generateCertificates: true
        },
        instructor: {
            create: true,
            read: true,
            update: true,
            delete: false,
            viewAll: false, // Solo ve calificaciones de sus alumnos
            approveBeltPromotion: false, // Solo admin aprueba promociones
            generateCertificates: false
        },
        padre: {
            create: false,
            read: false, // Solo verá calificaciones de sus hijos (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            approveBeltPromotion: false,
            generateCertificates: false
        }
    },

    // ============================================
    // CONFIGURACIÓN
    // ============================================
    configuracion: {
        admin: {
            read: true,
            update: true,
            manageUsers: true,
            manageSystemSettings: true,
            viewLogs: true,
            manageBackup: true
        },
        instructor: {
            read: false,
            update: false,
            manageUsers: false,
            manageSystemSettings: false,
            viewLogs: false,
            manageBackup: false
        },
        padre: {
            read: false,
            update: false,
            manageUsers: false,
            manageSystemSettings: false,
            viewLogs: false,
            manageBackup: false
        }
    },

    // ============================================
    // TUTORES
    // ============================================
    tutores: {
        admin: {
            create: true,
            read: true,
            update: true,
            delete: true,
            viewAll: true,
            manageRelationships: true
        },
        instructor: {
            create: true,
            read: true,
            update: true,
            delete: false,
            viewAll: false, // Solo ve tutores de alumnos de su sucursal
            manageRelationships: true
        },
        padre: {
            create: false,
            read: false, // Solo verá su propio perfil (implementar después)
            update: false,
            delete: false,
            viewAll: false,
            manageRelationships: false
        }
    }
};

/**
 * Obtener permisos de un rol para un módulo específico
 * @param {string} module - Nombre del módulo (ej: 'alumnos', 'pagos')
 * @param {string} role - Rol del usuario (ej: 'admin', 'instructor', 'padre')
 * @returns {object} - Objeto con los permisos del rol para ese módulo
 */
export const getModulePermissions = (module, role) => {
    if (!PERMISSIONS[module]) {
        console.warn(`Módulo "${module}" no encontrado en configuración de permisos`);
        return {};
    }

    if (!PERMISSIONS[module][role]) {
        console.warn(`Rol "${role}" no encontrado para módulo "${module}"`);
        return {};
    }

    return PERMISSIONS[module][role];
};

/**
 * Verificar si un rol tiene un permiso específico en un módulo
 * @param {string} module - Nombre del módulo
 * @param {string} role - Rol del usuario
 * @param {string} action - Acción a verificar (ej: 'create', 'read', 'update', 'delete')
 * @returns {boolean} - true si tiene el permiso, false si no
 */
export const hasPermission = (module, role, action) => {
    const modulePermissions = getModulePermissions(module, role);
    return modulePermissions[action] === true;
};

/**
 * Verificar si un rol puede acceder a un módulo (tiene al menos lectura)
 * @param {string} module - Nombre del módulo
 * @param {string} role - Rol del usuario
 * @returns {boolean} - true si puede acceder, false si no
 */
export const canAccessModule = (module, role) => {
    const modulePermissions = getModulePermissions(module, role);
    return modulePermissions.read === true;
};

/**
 * Obtener lista de módulos accesibles para un rol
 * @param {string} role - Rol del usuario
 * @returns {array} - Array con nombres de módulos accesibles
 */
export const getAccessibleModules = (role) => {
    const accessibleModules = [];
    
    for (const module in PERMISSIONS) {
        if (canAccessModule(module, role)) {
            accessibleModules.push(module);
        }
    }
    
    return accessibleModules;
};

export default PERMISSIONS;