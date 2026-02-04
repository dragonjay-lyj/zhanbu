import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 获取后台统计数据
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        // 检查是否为管理员
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single()

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        // 获取统计数据
        const today = new Date()
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

        // 总用户数
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })

        // 今日新增用户
        const { count: todayUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfToday)

        // 本月占卜次数
        const { count: monthlyDivinations } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth)

        // 今日占卜次数
        const { count: todayDivinations } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfToday)

        // 付费会员数
        const { count: premiumUsers } = await supabase
            .from("memberships")
            .select("*", { count: "exact", head: true })
            .gte("expires_at", new Date().toISOString())

        // 本月订单数
        const { count: monthlyOrders } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("status", "paid")
            .gte("created_at", startOfMonth)

        // 本月收入
        const { data: monthlyRevenue } = await supabase
            .from("orders")
            .select("amount")
            .eq("status", "paid")
            .gte("created_at", startOfMonth)

        const totalRevenue = (monthlyRevenue || []).reduce((sum, order) => sum + (order.amount || 0), 0)

        // 最近活动
        const { data: recentActivities } = await supabase
            .from("fortunes")
            .select(`
        id,
        type,
        created_at,
        user:profiles(email, full_name)
      `)
            .order("created_at", { ascending: false })
            .limit(10)

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: totalUsers || 0,
                todayUsers: todayUsers || 0,
                monthlyDivinations: monthlyDivinations || 0,
                todayDivinations: todayDivinations || 0,
                premiumUsers: premiumUsers || 0,
                monthlyOrders: monthlyOrders || 0,
                monthlyRevenue: totalRevenue,
                recentActivities: recentActivities || [],
            },
        })
    } catch (error) {
        console.error("获取统计数据错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
