import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 消费积分 API
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const body = await req.json()
        const { action, referenceId } = body

        if (!action) {
            return NextResponse.json({ error: "缺少 action 参数" }, { status: 400 })
        }

        const supabase = await createAdminClient()

        // 获取消费规则
        const { data: rule } = await supabase
            .from("credit_rules")
            .select("*")
            .eq("action", action)
            .eq("is_active", true)
            .single()

        if (!rule) {
            return NextResponse.json({ error: "无效的消费类型" }, { status: 400 })
        }

        const cost = rule.cost

        // 获取用户积分
        const { data: credits } = await supabase
            .from("user_credits")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (!credits) {
            return NextResponse.json({ error: "用户积分记录不存在" }, { status: 404 })
        }

        // 检查余额是否足够
        if (credits.balance < cost) {
            return NextResponse.json({
                success: false,
                error: "积分不足",
                balance: credits.balance,
                required: cost,
            }, { status: 400 })
        }

        // 扣除积分
        const newBalance = credits.balance - cost
        const { error: updateError } = await supabase
            .from("user_credits")
            .update({
                balance: newBalance,
                total_spent: credits.total_spent + cost,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

        if (updateError) {
            console.error("更新积分失败:", updateError)
            return NextResponse.json({ error: "扣除积分失败" }, { status: 500 })
        }

        // 记录交易
        await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: -cost,
            balance_after: newBalance,
            type: "consume",
            description: rule.description,
            reference_id: referenceId,
        })

        return NextResponse.json({
            success: true,
            balance: newBalance,
            cost,
            message: `消费 ${cost} 积分`,
        })
    } catch (error) {
        console.error("消费积分错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
