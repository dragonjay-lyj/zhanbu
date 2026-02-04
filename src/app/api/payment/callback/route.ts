import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 支付回调处理
 * 处理来自支付网关的回调通知
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // TODO: 验证支付网关签名
        // const isValid = verifySignature(body)

        const { orderId, status, transactionId } = body

        if (!orderId || !status) {
            return NextResponse.json(
                { error: "无效的回调数据" },
                { status: 400 }
            )
        }

        const supabase = await createServerClient()

        // 查询订单
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json(
                { error: "订单不存在" },
                { status: 404 }
            )
        }

        // 更新订单状态
        if (status === "success") {
            await supabase.from("orders").update({
                status: "paid",
                transaction_id: transactionId,
                paid_at: new Date().toISOString(),
            } as never).eq("id", orderId)

            // 更新用户会员状态
            const planDurations: Record<string, number> = {
                monthly: 30,
                yearly: 365,
                lifetime: 36500, // 100年
            }

            const duration = planDurations[order.plan_id] || 30
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + duration)

            // 检查用户是否已有会员记录
            const { data: existingMembership } = await supabase
                .from("memberships")
                .select("*")
                .eq("user_id", order.user_id)
                .single()

            if (existingMembership) {
                // 更新现有会员
                await supabase.from("memberships").update({
                    plan_id: order.plan_id,
                    expires_at: expiresAt.toISOString(),
                    updated_at: new Date().toISOString(),
                } as never).eq("user_id", order.user_id)
            } else {
                // 创建新会员记录
                await supabase.from("memberships").insert({
                    user_id: order.user_id,
                    plan_id: order.plan_id,
                    expires_at: expiresAt.toISOString(),
                    created_at: new Date().toISOString(),
                } as never)
            }

            // 更新用户角色
            await supabase.from("profiles").update({
                role: "member",
                updated_at: new Date().toISOString(),
            } as never).eq("id", order.user_id)

        } else if (status === "failed") {
            await supabase.from("orders").update({
                status: "failed",
                updated_at: new Date().toISOString(),
            } as never).eq("id", orderId)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("支付回调错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
