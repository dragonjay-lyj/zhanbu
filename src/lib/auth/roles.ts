/**
 * 角色权限系统
 */

// 用户角色枚举
export enum UserRole {
    USER = "user",           // 普通用户
    VIP = "vip",             // VIP 用户
    PREMIUM = "premium",     // 高级 VIP
    ADMIN = "admin",         // 管理员
    SUPER_ADMIN = "super_admin", // 超级管理员
}

// 权限枚举
export enum Permission {
    // 基础权限
    VIEW_DIVINATION = "view_divination",
    USE_BASIC_DIVINATION = "use_basic_divination",

    // VIP 权限
    USE_AI_INTERPRETATION = "use_ai_interpretation",
    UNLIMITED_DIVINATION = "unlimited_divination",
    EXPORT_PDF = "export_pdf",
    VIEW_HISTORY = "view_history",

    // 管理员权限
    VIEW_ADMIN_PANEL = "view_admin_panel",
    MANAGE_USERS = "manage_users",
    VIEW_ANALYTICS = "view_analytics",
    MANAGE_CONTENT = "manage_content",

    // 超级管理员权限
    MANAGE_ADMINS = "manage_admins",
    SYSTEM_SETTINGS = "system_settings",
    DATABASE_ACCESS = "database_access",
}

// 角色对应权限映射
export const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.USER]: [
        Permission.VIEW_DIVINATION,
        Permission.USE_BASIC_DIVINATION,
    ],
    [UserRole.VIP]: [
        Permission.VIEW_DIVINATION,
        Permission.USE_BASIC_DIVINATION,
        Permission.USE_AI_INTERPRETATION,
        Permission.VIEW_HISTORY,
        Permission.EXPORT_PDF,
    ],
    [UserRole.PREMIUM]: [
        Permission.VIEW_DIVINATION,
        Permission.USE_BASIC_DIVINATION,
        Permission.USE_AI_INTERPRETATION,
        Permission.UNLIMITED_DIVINATION,
        Permission.VIEW_HISTORY,
        Permission.EXPORT_PDF,
    ],
    [UserRole.ADMIN]: [
        Permission.VIEW_DIVINATION,
        Permission.USE_BASIC_DIVINATION,
        Permission.USE_AI_INTERPRETATION,
        Permission.UNLIMITED_DIVINATION,
        Permission.VIEW_HISTORY,
        Permission.EXPORT_PDF,
        Permission.VIEW_ADMIN_PANEL,
        Permission.MANAGE_USERS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_CONTENT,
    ],
    [UserRole.SUPER_ADMIN]: [
        Permission.VIEW_DIVINATION,
        Permission.USE_BASIC_DIVINATION,
        Permission.USE_AI_INTERPRETATION,
        Permission.UNLIMITED_DIVINATION,
        Permission.VIEW_HISTORY,
        Permission.EXPORT_PDF,
        Permission.VIEW_ADMIN_PANEL,
        Permission.MANAGE_USERS,
        Permission.VIEW_ANALYTICS,
        Permission.MANAGE_CONTENT,
        Permission.MANAGE_ADMINS,
        Permission.SYSTEM_SETTINGS,
        Permission.DATABASE_ACCESS,
    ],
}

/**
 * 检查用户是否拥有指定权限
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    return rolePermissions[role]?.includes(permission) || false
}

/**
 * 检查用户是否拥有所有指定权限
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((p) => hasPermission(role, p))
}

/**
 * 检查用户是否拥有任一指定权限
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((p) => hasPermission(role, p))
}

/**
 * 获取用户角色的所有权限
 */
export function getRolePermissions(role: UserRole): Permission[] {
    return rolePermissions[role] || []
}

/**
 * 判断是否为管理员角色
 */
export function isAdminRole(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}

/**
 * 角色之间的层级比较（返回 true 表示 roleA 高于等于 roleB）
 */
export function isRoleAtLeast(roleA: UserRole, roleB: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
        [UserRole.USER]: 0,
        [UserRole.VIP]: 1,
        [UserRole.PREMIUM]: 2,
        [UserRole.ADMIN]: 3,
        [UserRole.SUPER_ADMIN]: 4,
    }
    return hierarchy[roleA] >= hierarchy[roleB]
}
