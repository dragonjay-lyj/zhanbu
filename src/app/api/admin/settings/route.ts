import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 获取系统设置
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        // 检查是否为管理员
        const { data: user } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        // 获取系统设置
        const { data: settings, error } = await supabase
            .from("system_settings")
            .select("*")

        if (error) {
            console.error("获取设置错误:", error)
            return NextResponse.json({ error: "获取设置失败" }, { status: 500 })
        }

        // 获取会员套餐
        const { data: plans } = await supabase
            .from("membership_plans")
            .select("*")
            .order("sort_order", { ascending: true })

        // 转换为键值对
        const settingsMap: Record<string, unknown> = {}
        settings?.forEach((s) => {
            settingsMap[s.key] = s.value
        })

        return NextResponse.json({
            success: true,
            data: {
                settings: settingsMap,
                plans: plans || [],
            },
        })
    } catch (error) {
        console.error("获取设置错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 更新系统设置
 */
export async function PATCH(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        // 检查是否为管理员
        const { data: user } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const body = await request.json()
        const { key, value } = body

        if (!key) {
            return NextResponse.json({ error: "缺少 key 参数" }, { status: 400 })
        }

        // 更新或插入设置
        const { error } = await supabase
            .from("system_settings")
            .upsert({
                key,
                value: typeof value === "string" ? value : JSON.stringify(value),
                updated_at: new Date().toISOString(),
            }, { onConflict: "key" })

        if (error) {
            console.error("更新设置错误:", error)
            return NextResponse.json({ error: "更新设置失败" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("更新设置错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 更新会员套餐
 */
export async function PUT(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        // 检查是否为管理员
        const { data: user } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const body = await request.json()
        const { id, ...planData } = body

        if (!id) {
            return NextResponse.json({ error: "缺少套餐 ID" }, { status: 400 })
        }

        // 更新套餐
        const { error } = await supabase
            .from("membership_plans")
            .update({
                ...planData,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)

        if (error) {
            console.error("更新套餐错误:", error)
            return NextResponse.json({ error: "更新套餐失败" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("更新套餐错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
