import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { formatCentsToMoney, parseMoneyToCents } from "@/lib/payment/linuxdo"

interface RefundRequest {
    orderId: string
}

interface LinuxDoOrderQueryResponse {
    code?: number
    msg?: string
    trade_no?: string
    out_trade_no?: string
    status?: number | string
}

interface LinuxDoRefundResponse {
    code?: number
    msg?: string
}

interface LinuxDoConfig {
    pid: string
    key: string
    gatewayBase: string
}

const SYSTEM_SETTING_KEYS = [
    "payment_linuxdo_pid",
    "payment_linuxdo_key",
    "payment_linuxdo_gateway",
] as const

function sanitizeSettingValue(value: unknown) {
    if (value === null || value === undefined) return ""
    return String(value).replace(/"/g, "").trim()
}

function safeParseJson<T>(rawText: string): T | null {
    try {
        return JSON.parse(rawText) as T
    } catch {
        return null
    }
}

function isAlreadyRefundedMessage(message: string | undefined) {
    if (!message) return false
    return ["已完成", "已退款", "已退回", "refund"].some((keyword) =>
        message.toLowerCase().includes(keyword.toLowerCase())
    )
}

async function resolveLinuxDoConfig() {
    const envPid = process.env.LINUX_DO_CREDIT_PID?.trim()
    const envKey = process.env.LINUX_DO_CREDIT_KEY?.trim()
    const envGateway = process.env.LINUX_DO_CREDIT_GATEWAY?.trim()

    if (envPid && envKey) {
        return {
            pid: envPid,
            key: envKey,
            gatewayBase: (envGateway || "https://credit.linux.do/epay").replace(/\/+$/, ""),
        } satisfies LinuxDoConfig
    }

    const supabase = await createServerClient()
    const { data: settingsRows } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [...SYSTEM_SETTING_KEYS])

    const settings = new Map<string, string>()
    for (const row of settingsRows || []) {
        settings.set(row.key, sanitizeSettingValue(row.value))
    }

    const pid = settings.get("payment_linuxdo_pid") || ""
    const key = settings.get("payment_linuxdo_key") || ""
    const gatewayBase = (settings.get("payment_linuxdo_gateway") || "https://credit.linux.do/epay").replace(/\/+$/, "")

    if (!pid || !key) return null

    return {
        pid,
        key,
        gatewayBase,
    } satisfies LinuxDoConfig
}

async function fetchTradeNoByOrderId(config: LinuxDoConfig, orderId: string): Promise<string | null> {
    const query = new URLSearchParams({
        act: "order",
        pid: config.pid,
        key: config.key,
        out_trade_no: orderId,
    })

    const response = await fetch(`${config.gatewayBase}/api.php?${query.toString()}`, {
        method: "GET",
        cache: "no-store",
    })

    const rawText = await response.text()
    const parsed = safeParseJson<LinuxDoOrderQueryResponse>(rawText)

    if (!parsed) return null
    if (Number(parsed.code) !== 1) return null
    if (Number(parsed.status) !== 1) return null
    if (parsed.out_trade_no && parsed.out_trade_no !== orderId) return null
    if (!parsed.trade_no) return null

    return parsed.trade_no
}

async function requestLinuxDoRefund(config: LinuxDoConfig, tradeNo: string, orderId: string, money: string) {
    const body = new URLSearchParams({
        pid: config.pid,
        key: config.key,
        trade_no: tradeNo,
        out_trade_no: orderId,
        money,
    })

    const response = await fetch(`${config.gatewayBase}/api.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
    })

    const rawText = await response.text()
    return safeParseJson<LinuxDoRefundResponse>(rawText)
}

/**
 * 管理员退款接口（LINUX DO Credit）
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        const { data: adminUser } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (adminUser?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const body: RefundRequest = await request.json()
        const orderId = body?.orderId?.trim()

        if (!orderId) {
            return NextResponse.json({ error: "缺少订单号" }, { status: 400 })
        }

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: "订单不存在" }, { status: 404 })
        }

        if (order.status === "refunded") {
            return NextResponse.json({
                success: true,
                data: {
                    orderId,
                    status: "refunded",
                    message: "订单已退款",
                },
            })
        }

        if (order.status !== "paid") {
            return NextResponse.json({ error: "仅支持已支付订单退款" }, { status: 409 })
        }

        if (order.payment_method !== "linuxdo_credit") {
            return NextResponse.json({ error: "当前订单不是 Linux DO 支付，无法自动退款" }, { status: 400 })
        }

        const config = await resolveLinuxDoConfig()
        if (!config) {
            return NextResponse.json({ error: "Linux DO 支付配置缺失" }, { status: 503 })
        }

        let tradeNo = order.transaction_id || ""
        if (!tradeNo) {
            const queriedTradeNo = await fetchTradeNoByOrderId(config, orderId)
            if (!queriedTradeNo) {
                return NextResponse.json({ error: "无法获取 trade_no，请稍后重试" }, { status: 502 })
            }
            tradeNo = queriedTradeNo
        }

        const money = order.payment_amount && parseMoneyToCents(order.payment_amount)
            ? order.payment_amount
            : formatCentsToMoney(order.amount)
        const refundResult = await requestLinuxDoRefund(config, tradeNo, orderId, money)

        if (!refundResult) {
            return NextResponse.json({ error: "退款接口响应异常" }, { status: 502 })
        }

        if (Number(refundResult.code) !== 1 && !isAlreadyRefundedMessage(refundResult.msg)) {
            return NextResponse.json(
                { error: refundResult.msg || "退款失败" },
                { status: 502 }
            )
        }

        const nowIso = new Date().toISOString()
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "refunded",
                updated_at: nowIso,
            } as never)
            .eq("id", orderId)
            .eq("status", "paid")

        if (updateError) {
            return NextResponse.json({ error: "退款成功但本地状态更新失败" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            data: {
                orderId,
                status: "refunded",
                message: refundResult.msg || "退款成功",
            },
        })
    } catch (error) {
        console.error("退款接口错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
