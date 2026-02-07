import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"

/**
 * 获取用户占卜统计
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const dbUserId = await getDbUserIdByClerkId(userId)
        if (!dbUserId) {
            return NextResponse.json({ error: "用户未同步" }, { status: 404 })
        }

        const supabase = await createServerClient()
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // 总占卜次数
        const { count: totalFortunes } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", dbUserId)

        // 本月占卜次数
        const { count: monthlyFortunes } = await supabase
            .from("fortunes")
            .select("*", { count: "exact", head: true })
            .eq("user_id", dbUserId)
            .gte("created_at", startOfMonth)

        // 最爱占卜类型
        const { data: typeStats } = await supabase
            .from("fortunes")
            .select("fortune_type")
            .eq("user_id", dbUserId)

        const typeCounts: Record<string, number> = {}
        typeStats?.forEach((item) => {
            typeCounts[item.fortune_type] = (typeCounts[item.fortune_type] || 0) + 1
        })

        const favoriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

        const typeLabels: Record<string, string> = {
            bazi: "八字",
            ziwei: "紫微",
            liuyao: "六爻",
            meihua: "梅花",
            tarot: "塔罗",
            marriage: "关系分析",
            daily: "每日运势",
            name: "姓名测算",
            zodiac: "星座运势",
            shengxiao: "生肖运程",
            liunian: "流年运势",
            qianwen: "抽签占卜",
            jiemeng: "周公解梦",
            zeji: "择吉选日",
            huangli: "黄历查询",
            ai_chat: "AI 解读",
            community_post: "社区发帖",
            qimen: "奇门遁甲",
            liuren: "大六壬",
            jinkouque: "金口诀",
            fengshui: "玄空风水",
        }

        // 最近占卜
        const { data: recentFortunes } = await supabase
            .from("fortunes")
            .select("id, fortune_type, title, summary, created_at")
            .eq("user_id", dbUserId)
            .order("created_at", { ascending: false })
            .limit(5)

        const formattedRecent = (recentFortunes || []).map((fortune) => ({
            id: fortune.id,
            type: fortune.fortune_type,
            title: fortune.title,
            question: fortune.summary,
            created_at: fortune.created_at,
        }))

        return NextResponse.json({
            success: true,
            data: {
                totalFortunes: totalFortunes || 0,
                monthlyFortunes: monthlyFortunes || 0,
                favoriteType: favoriteType ? typeLabels[favoriteType] || favoriteType : null,
                recentFortunes: formattedRecent,
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
