import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 检查是否为管理员
        const { data: adminUser } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (adminUser?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const search = searchParams.get("search") || ""
        const role = searchParams.get("role") || ""

        const offset = (page - 1) * limit

        // 构建查询 - 使用 users 表
        let query = supabase
            .from("users")
            .select(`
                id,
                clerk_id,
                email,
                name,
                role,
                avatar_url,
                created_at,
                updated_at
            `, { count: "exact" })

        if (search) {
            query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
        }

        if (role && role !== "all") {
            query = query.eq("role", role)
        }

        const { data: users, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("获取用户列表错误:", error)
            return NextResponse.json({ error: "获取用户列表失败" }, { status: 500 })
        }

        // 获取会员信息
        const clerkIds = (users || []).map(u => u.clerk_id)
        const { data: memberships } = await supabase
            .from("user_memberships")
            .select("*")
            .in("user_id", clerkIds)

        // 合并数据
        const membershipsMap = new Map(memberships?.map(m => [m.user_id, m]) || [])
        const formattedUsers = (users || []).map(u => ({
            ...u,
            membership: membershipsMap.get(u.clerk_id) || null,
        }))

        return NextResponse.json({
            success: true,
            data: {
                users: formattedUsers,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error("获取用户列表错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 更新用户
 */
export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 检查是否为管理员
        const { data: adminUser } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (adminUser?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const body = await request.json()
        const { targetUserId, role, isPremium, planId, expiresAt } = body

        // 更新用户角色
        if (role) {
            await supabase
                .from("users")
                .update({ role, updated_at: new Date().toISOString() })
                .eq("clerk_id", targetUserId)
        }

        // 更新会员状态
        if (isPremium !== undefined) {
            if (isPremium && planId) {
                // 设置为会员
                await supabase.from("user_memberships").upsert({
                    user_id: targetUserId,
                    plan_id: planId,
                    expires_at: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" })
            } else {
                // 取消会员
                await supabase
                    .from("user_memberships")
                    .delete()
                    .eq("user_id", targetUserId)
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("更新用户错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
