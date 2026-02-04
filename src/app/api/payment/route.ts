import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

interface PaymentRequest {
    planId: string
}

/**
 * 创建支付订单，返回闲鱼支付链接
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "未授权访问" },
                { status: 401 }
            )
        }

        const body: PaymentRequest = await request.json()
        const { planId } = body

        const supabase = await createServerClient()

        // 获取套餐信息
        const { data: plan, error: planError } = await supabase
            .from("membership_plans")
            .select("*")
            .eq("id", planId)
            .eq("is_active", true)
            .single()

        if (planError || !plan) {
            return NextResponse.json(
                { error: "无效的套餐" },
                { status: 400 }
            )
        }

        // 获取闲鱼支付链接
        const { data: paymentSetting } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "payment_url")
            .single()

        const paymentUrl = paymentSetting?.value?.replace(/"/g, "") ?? null

        if (!paymentUrl) {
            return NextResponse.json(
                { error: "支付功能未配置" },
                { status: 503 }
            )
        }

        // 生成订单号
        const orderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`

        // 保存订单到数据库
        const { error: orderError } = await supabase.from("orders").insert({
            id: orderId,
            user_id: userId,
            plan_id: plan.id,
            amount: plan.price,
            payment_method: "xianyu",
            payment_url: paymentUrl,
            status: "pending",
            created_at: new Date().toISOString(),
        })

        if (orderError) {
            console.error("创建订单错误:", orderError)
            return NextResponse.json(
                { error: "创建订单失败" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId,
                planId: plan.id,
                planName: plan.name,
                amount: plan.price,
                paymentUrl,
                message: `请前往闲鱼完成支付，备注订单号：${orderId}`,
            },
        })
    } catch (error) {
        console.error("支付 API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 查询订单状态
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "未授权访问" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get("orderId")

        const supabase = await createServerClient()

        if (orderId) {
            // 查询单个订单
            const { data: order, error } = await supabase
                .from("orders")
                .select("*, plan:membership_plans(*)")
                .eq("id", orderId)
                .eq("user_id", userId)
                .single()

            if (error || !order) {
                return NextResponse.json(
                    { error: "订单不存在" },
                    { status: 404 }
                )
            }

            return NextResponse.json({
                success: true,
                data: order,
            })
        } else {
            // 查询用户所有订单
            const { data: orders, error } = await supabase
                .from("orders")
                .select("*, plan:membership_plans(*)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(20)

            if (error) {
                return NextResponse.json(
                    { error: "查询订单失败" },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: true,
                data: orders,
            })
        }
    } catch (error) {
        console.error("查询订单错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
