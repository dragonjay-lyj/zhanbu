import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 获取用户积分信息、套餐和规则
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 获取用户积分（不存在则创建）
        let { data: credits } = await supabase
            .from("user_credits")
            .select("*")
            .eq("user_id", userId)
            .single()

        // 如果不存在，创建新记录
        if (!credits) {
            const { data: newCredits, error: insertError } = await supabase
                .from("user_credits")
                .insert({
                    user_id: userId,
                    balance: 100, // 新用户赠送100积分
                    total_earned: 100,
                    total_spent: 0,
                })
                .select()
                .single()

            if (insertError) {
                console.error("创建用户积分失败:", insertError)
                return NextResponse.json({ error: "创建用户积分失败" }, { status: 500 })
            }
            credits = newCredits

            // 记录注册赠送交易
            await supabase.from("credit_transactions").insert({
                user_id: userId,
                amount: 100,
                balance_after: 100,
                type: "reward",
                description: "新用户注册赠送",
            })
        }

        // 获取充值套餐
        const { data: packages } = await supabase
            .from("credit_packages")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })

        // 获取消费规则
        const { data: rules } = await supabase
            .from("credit_rules")
            .select("*")
            .eq("is_active", true)

        return NextResponse.json({
            success: true,
            data: {
                credits: {
                    balance: credits.balance,
                    totalEarned: credits.total_earned,
                    totalSpent: credits.total_spent,
                },
                packages: (packages || []).map((p) => ({
                    id: p.id,
                    name: p.name,
                    credits: p.credits,
                    price: p.price,
                    bonusCredits: p.bonus_credits,
                    isPopular: p.is_popular,
                })),
                rules: (rules || []).map((r) => ({
                    action: r.action,
                    cost: r.cost,
                    description: r.description,
                })),
            },
        })
    } catch (error) {
        console.error("获取积分信息错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
