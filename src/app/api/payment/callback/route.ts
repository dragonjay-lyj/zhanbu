import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import crypto from "crypto"
import { createServerClient } from "@/lib/supabase/server"

function verifyPaymentSignature(rawBody: string, signature: string, secret: string) {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex")

    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expected)
        )
    } catch {
        return false
    }
}

/**
 * 支付回调处理
 * 处理来自支付网关的回调通知
 */
export async function POST(request: NextRequest) {
    try {
        const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET
        if (!webhookSecret) {
            return NextResponse.json(
                { error: "支付回调未配置密钥" },
                { status: 500 }
            )
        }

        const signature = request.headers.get("x-payment-signature")
        const rawBody = await request.text()

        if (!signature || !verifyPaymentSignature(rawBody, signature, webhookSecret)) {
            return NextResponse.json(
                { error: "回调签名验证失败" },
                { status: 401 }
            )
        }

        let body: { orderId?: string; status?: string; transactionId?: string; amount?: number; planId?: string }
        try {
            body = JSON.parse(rawBody)
        } catch {
            return NextResponse.json(
                { error: "无效的回调数据" },
                { status: 400 }
            )
        }

        // TODO: 验证支付网关签名
        // const isValid = verifySignature(body)

        const { orderId, status, transactionId, amount, planId } = body

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

        if (planId && order.plan_id !== planId) {
            return NextResponse.json(
                { error: "订单信息不匹配" },
                { status: 400 }
            )
        }

        const amountValue = typeof amount === "string" ? Number(amount) : amount
        if (typeof amountValue === "number" && Number.isFinite(amountValue) && amountValue !== order.amount) {
            return NextResponse.json(
                { error: "订单金额不匹配" },
                { status: 400 }
            )
        }

        // 更新订单状态
        if (status === "success") {
            if (order.status === "paid") {
                return NextResponse.json({ success: true })
            }
            if (order.status !== "pending") {
                return NextResponse.json(
                    { error: "订单状态异常" },
                    { status: 409 }
                )
            }

            await supabase.from("orders").update({
                status: "paid",
                transaction_id: transactionId,
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
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
            await supabase.from("users").update({
                role: "member",
                updated_at: new Date().toISOString(),
            } as never).eq("clerk_id", order.user_id)

        } else if (status === "failed") {
            if (order.status === "paid") {
                return NextResponse.json(
                    { error: "订单已完成，无法标记失败" },
                    { status: 409 }
                )
            }
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
