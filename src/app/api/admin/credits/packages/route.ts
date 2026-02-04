import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 获取充值套餐列表 (管理员)
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 检查管理员权限
        const { data: adminUser } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (adminUser?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const { data: packages, error } = await supabase
            .from("credit_packages")
            .select("*")
            .order("sort_order", { ascending: true })

        if (error) {
            console.error("获取套餐列表失败:", error)
            return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
        }

        const result = (packages || []).map((p) => ({
            id: p.id,
            name: p.name,
            credits: p.credits,
            price: p.price,
            bonusCredits: p.bonus_credits,
            isPopular: p.is_popular,
            isActive: p.is_active,
        }))

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error("获取套餐列表错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
