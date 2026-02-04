import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

// 允许的积分添加类型和对应额度
const REWARD_TYPES: Record<string, { amount: number; maxDaily?: number }> = {
    checkin: { amount: 5, maxDaily: 1 }, // 每日签到，每天最多1次
    invite: { amount: 50 }, // 邀请好友
    community: { amount: 2, maxDaily: 10 }, // 社区互动，每天最多10次
}

/**
 * 添加积分 API（签到、邀请等）
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const body = await req.json()
        const { type, description } = body

        if (!type || !REWARD_TYPES[type]) {
            return NextResponse.json({ error: "无效的奖励类型" }, { status: 400 })
        }

        const reward = REWARD_TYPES[type]
        const amount = reward.amount

        const supabase = await createAdminClient()

        // 检查每日限制
        if (reward.maxDaily) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const { count } = await supabase
                .from("credit_transactions")
                .select("*", { count: "exact", head: true })
                .eq("user_id", userId)
                .eq("type", "reward")
                .ilike("description", `%${type}%`)
                .gte("created_at", today.toISOString())

            if ((count || 0) >= reward.maxDaily) {
                return NextResponse.json({
                    success: false,
                    error: "今日已达到上限",
                }, { status: 400 })
            }
        }

        // 获取用户积分
        let { data: credits } = await supabase
            .from("user_credits")
            .select("*")
            .eq("user_id", userId)
            .single()

        // 如果不存在，创建新记录
        if (!credits) {
            const { data: newCredits } = await supabase
                .from("user_credits")
                .insert({
                    user_id: userId,
                    balance: 100 + amount,
                    total_earned: 100 + amount,
                    total_spent: 0,
                })
                .select()
                .single()
            credits = newCredits
        } else {
            // 增加积分
            const newBalance = credits.balance + amount
            await supabase
                .from("user_credits")
                .update({
                    balance: newBalance,
                    total_earned: credits.total_earned + amount,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", userId)
            credits.balance = newBalance
        }

        // 记录交易
        await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: amount,
            balance_after: credits?.balance || amount,
            type: "reward",
            description: description || `${type} 奖励`,
        })

        return NextResponse.json({
            success: true,
            balance: credits?.balance || amount,
            amount,
            message: `获得 ${amount} 积分`,
        })
    } catch (error) {
        console.error("添加积分错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
