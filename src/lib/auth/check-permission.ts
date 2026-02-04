import { auth, currentUser } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import {
    UserRole,
    Permission,
    hasPermission,
    isAdminRole,
} from "./roles"

/**
 * 获取当前用户角色
 */
export async function getUserRole(): Promise<UserRole> {
    try {
        const { userId } = await auth()

        if (!userId) {
            return UserRole.USER
        }

        // 从 Supabase 获取用户角色
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (error || !data?.role) {
            return UserRole.USER
        }

        // 验证角色有效性
        if (Object.values(UserRole).includes(data.role as UserRole)) {
            return data.role as UserRole
        }

        return UserRole.USER
    } catch {
        return UserRole.USER
    }
}

/**
 * 检查当前用户是否拥有指定权限
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
    const role = await getUserRole()
    return hasPermission(role, permission)
}

/**
 * 检查当前用户是否为管理员
 */
export async function checkIsAdmin(): Promise<boolean> {
    const role = await getUserRole()
    return isAdminRole(role)
}

/**
 * 需要特定权限的中间件包装器
 */
export function requirePermission(permission: Permission) {
    return async function checkAuth() {
        const hasAccess = await checkPermission(permission)
        if (!hasAccess) {
            throw new Error("权限不足")
        }
    }
}

/**
 * 需要管理员的中间件包装器
 */
export async function requireAdmin() {
    const isAdmin = await checkIsAdmin()
    if (!isAdmin) {
        throw new Error("需要管理员权限")
    }
}
