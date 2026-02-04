import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 获取积分交易记录 (管理员)
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

        // 获取交易记录
        const { data: transactions, error } = await supabase
            .from("credit_transactions")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200)

        if (error) {
            console.error("获取交易记录失败:", error)
            return NextResponse.json({ error: "获取数据失败" }, { status: 500 })
        }

        // 获取用户信息
        const { data: users } = await supabase
            .from("users")
            .select("id, clerk_id, name")

        // 合并数据
        const usersMap = new Map(users?.map((u) => [u.clerk_id, u]) || [])
        const result = (transactions || []).map((t) => {
            const user = usersMap.get(t.user_id)
            return {
                id: t.id,
                userId: t.user_id,
                userName: user?.name || "未知用户",
                amount: t.amount,
                balanceAfter: t.balance_after,
                type: t.type,
                description: t.description,
                createdAt: t.created_at,
            }
        })

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error("获取交易记录错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
