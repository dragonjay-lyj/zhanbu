import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 获取所有用户积分列表 (管理员)
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

        // 获取用户积分列表
        const { data: credits, error } = await supabase
            .from("user_credits")
            .select("*")
            .order("balance", { ascending: false })

        if (error) {
            console.error("获取用户积分失败:", error)
            return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
        }

        // 获取用户信息
        const { data: users } = await supabase
            .from("users")
            .select("id, clerk_id, name, email")

        // 合并数据
        const usersMap = new Map(users?.map((u) => [u.clerk_id, u]) || [])
        const result = (credits || []).map((c) => {
            const user = usersMap.get(c.user_id)
            return {
                userId: c.user_id,
                userName: user?.name || "未知用户",
                email: user?.email || "",
                balance: c.balance,
                totalEarned: c.total_earned,
                totalSpent: c.total_spent,
            }
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error("获取用户积分错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
