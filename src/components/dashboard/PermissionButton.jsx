import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

/**
 * Botón que se muestra solo si el usuario tiene el permiso especificado
 * 
 * @param {string} module - Módulo a verificar
 * @param {string} action - Acción requerida
 * @param {function} onClick - Función al hacer clic
 * @param {string} className - Clases CSS adicionales
 * @param {ReactNode} children - Contenido del botón
 * @param {string} variant - Estilo del botón (primary, secondary, danger, success)
 * @param {boolean} disabled - Deshabilitar botón
 * @param {object} icon - Icono del botón (componente Lucide)
 * 
 * @example
 * <PermissionButton
 *   module="alumnos"
 *   action="create"
 *   onClick={handleCreate}
 *   variant="primary"
 *   icon={<Plus className="w-4 h-4" />}
 * >
 *   Nuevo Alumno
 * </PermissionButton>
 */
const PermissionButton = ({
    module,
    action,
    onClick,
    className = '',
    children,
    variant = 'primary',
    disabled = false,
    icon = null,
    type = 'button',
    ...props
}) => {
    const { can } = usePermissions(module);

    // Si no tiene el permiso, no mostrar el botón
    if (!can(action)) {
        return null;
    }

    // Estilos por variante
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        warning: 'bg-orange-600 hover:bg-orange-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    };

    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${disabled ? disabledStyles : ''}
                ${className}
            `}
            {...props}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
};

/**
 * Botón de creación que solo aparece si puede crear
 */
export const CreateButton = ({ module, onClick, children = 'Crear', icon, ...props }) => (
    <PermissionButton
        module={module}
        action="create"
        onClick={onClick}
        variant="primary"
        icon={icon}
        {...props}
    >
        {children}
    </PermissionButton>
);

/**
 * Botón de edición que solo aparece si puede editar
 */
export const EditButton = ({ module, onClick, children = 'Editar', icon, ...props }) => (
    <PermissionButton
        module={module}
        action="update"
        onClick={onClick}
        variant="secondary"
        icon={icon}
        {...props}
    >
        {children}
    </PermissionButton>
);

/**
 * Botón de eliminación que solo aparece si puede eliminar
 */
export const DeleteButton = ({ module, onClick, children = 'Eliminar', icon, ...props }) => (
    <PermissionButton
        module={module}
        action="delete"
        onClick={onClick}
        variant="danger"
        icon={icon}
        {...props}
    >
        {children}
    </PermissionButton>
);

/**
 * Botón de exportación que solo aparece si puede exportar
 */
export const ExportButton = ({ module, onClick, children = 'Exportar', icon, ...props }) => (
    <PermissionButton
        module={module}
        action="exportData"
        onClick={onClick}
        variant="success"
        icon={icon}
        {...props}
    >
        {children}
    </PermissionButton>
);

export default PermissionButton;