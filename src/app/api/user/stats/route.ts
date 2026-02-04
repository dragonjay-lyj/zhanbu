import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 获取用户占卜统计
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // 总占卜次数
        const { count: totalFortunes } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

        // 本月占卜次数
        const { count: monthlyFortunes } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", startOfMonth)

        // 最爱占卜类型
        const { data: typeStats } = await supabase
            .from("fortunes")
            .select("type")
            .eq("user_id", userId)

        const typeCounts: Record<string, number> = {}
        typeStats?.forEach((item) => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1
        })

        const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

        const typeLabels: Record<string, string> = {
            bazi: "八字",
            ziwei: "紫微",
            liuyao: "六爻",
            meihua: "梅花",
            tarot: "塔罗",
            daily: "每日运势",
        }

        // 最近占卜
        const { data: recentFortunes } = await supabase
            .from("fortunes")
            .select("id, type, title, question, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(5)

        return NextResponse.json({
            success: true,
            data: {
                totalFortunes: totalFortunes || 0,
                monthlyFortunes: monthlyFortunes || 0,
                favoriteType: favoriteType ? typeLabels[favoriteType] || favoriteType : null,
                recentFortunes: recentFortunes || [],
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
