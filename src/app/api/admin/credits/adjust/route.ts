import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 管理员调整用户积分
 */
export async function POST(req: NextRequest) {
    try {
        const { userId: adminId } = await auth()

        if (!adminId) {
            return NextResponse.json({ error: "未授权" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 检查管理员权限
        const { data: adminUser } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", adminId)
            .single()

        if (adminUser?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const body = await req.json()
        const { userId, amount, reason } = body

        if (!userId || amount === undefined) {
            return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
        }

        // 获取用户当前积分
        const { data: credits } = await supabase
            .from("user_credits")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (!credits) {
            return NextResponse.json({ error: "用户积分记录不存在" }, { status: 404 })
        }

        // 计算新余额
        const newBalance = credits.balance + amount
        if (newBalance < 0) {
            return NextResponse.json({ error: "余额不能为负数" }, { status: 400 })
        }

        // 更新积分
        const { error: updateError } = await supabase
            .from("user_credits")
            .update({
                balance: newBalance,
                total_earned: amount > 0 ? credits.total_earned + amount : credits.total_earned,
                total_spent: amount < 0 ? credits.total_spent + Math.abs(amount) : credits.total_spent,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

        if (updateError) {
            console.error("更新积分失败:", updateError)
            return NextResponse.json({ error: "更新积分失败" }, { status: 500 })
        }

        // 记录交易
        await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: amount,
            balance_after: newBalance,
            type: "admin",
            description: reason || "管理员调整",
            reference_id: adminId,
        })

        return NextResponse.json({
            success: true,
            balance: newBalance,
            message: `积分已调整 ${amount > 0 ? "+" : ""}${amount}`,
        })
    } catch (error) {
        console.error("调整积分错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
