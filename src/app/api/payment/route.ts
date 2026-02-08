import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { formatCentsToMoney, parseMoneyToCents, signLinuxDoParams } from "@/lib/payment/linuxdo"
import { fulfillPaidMembershipOrder } from "@/lib/payment/order-fulfillment"

interface PaymentRequest {
    planId: string
}

interface LinuxDoConfig {
    pid: string
    key: string
    gatewayBase: string
    notifyUrl?: string
    returnUrl?: string
}

interface LinuxDoSubmitResponse {
    error_msg?: string
    msg?: string
    data?: unknown
}

interface LinuxDoOrderQueryResponse {
    code?: number
    msg?: string
    trade_no?: string
    out_trade_no?: string
    type?: string
    pid?: string
    money?: string
    status?: number | string
}

const SYSTEM_SETTING_KEYS = [
    "payment_url",
    "payment_linuxdo_pid",
    "payment_linuxdo_key",
    "payment_linuxdo_gateway",
    "payment_linuxdo_notify_url",
    "payment_linuxdo_return_url",
    "app_url",
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

async function fetchSystemSettingsMap(supabase: Awaited<ReturnType<typeof createServerClient>>) {
    const { data: settingsRows } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("key", [...SYSTEM_SETTING_KEYS])

    const settings = new Map<string, string>()
    for (const row of settingsRows || []) {
        settings.set(row.key, sanitizeSettingValue(row.value))
    }

    return settings
}

function buildCallbackUrls(orderId: string, appUrl: string | null) {
    if (!appUrl) return { notifyUrl: undefined, returnUrl: undefined }

    try {
        const notifyUrl = new URL("/api/payment/callback", appUrl).toString()
        const returnUrlObj = new URL("/pricing", appUrl)
        returnUrlObj.searchParams.set("orderId", orderId)
        return { notifyUrl, returnUrl: returnUrlObj.toString() }
    } catch {
        return { notifyUrl: undefined, returnUrl: undefined }
    }
}

function resolveLinuxDoConfig(settings: Map<string, string>, orderId: string): LinuxDoConfig | null {
    const pid = process.env.LINUX_DO_CREDIT_PID?.trim() || settings.get("payment_linuxdo_pid") || ""
    const key = process.env.LINUX_DO_CREDIT_KEY?.trim() || settings.get("payment_linuxdo_key") || ""

    if (!pid || !key) return null

    const gatewayBase =
        process.env.LINUX_DO_CREDIT_GATEWAY?.trim() ||
        settings.get("payment_linuxdo_gateway") ||
        "https://credit.linux.do/epay"

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || settings.get("app_url") || null
    const fallbackUrls = buildCallbackUrls(orderId, appUrl)

    const notifyUrl =
        process.env.LINUX_DO_CREDIT_NOTIFY_URL?.trim() ||
        settings.get("payment_linuxdo_notify_url") ||
        fallbackUrls.notifyUrl
    const returnUrl =
        process.env.LINUX_DO_CREDIT_RETURN_URL?.trim() ||
        settings.get("payment_linuxdo_return_url") ||
        fallbackUrls.returnUrl

    return {
        pid,
        key,
        gatewayBase: gatewayBase.replace(/\/+$/, ""),
        notifyUrl,
        returnUrl,
    }
}

function extractPaymentUrl(submitResponse: Response, responseBody: string, parsedJson: LinuxDoSubmitResponse | null): string | null {
    if (submitResponse.redirected && submitResponse.url) {
        return submitResponse.url
    }

    const location = submitResponse.headers.get("location")
    if (location) {
        return location
    }

    if (
        parsedJson?.data &&
        typeof parsedJson.data === "object" &&
        "payurl" in parsedJson.data &&
        typeof parsedJson.data.payurl === "string"
    ) {
        return parsedJson.data.payurl
    }

    const payingUrlMatch = responseBody.match(/https?:\/\/credit\.linux\.do\/paying\?order_no=[^\s"'<>]+/i)
    if (payingUrlMatch) {
        return payingUrlMatch[0]
    }

    return null
}

function isLinuxDoOrderPaid(data: LinuxDoOrderQueryResponse | null) {
    if (!data) return false
    return Number(data.code) === 1 && Number(data.status) === 1
}

async function queryLinuxDoOrderStatus(orderId: string, config: LinuxDoConfig): Promise<LinuxDoOrderQueryResponse | null> {
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
    return safeParseJson<LinuxDoOrderQueryResponse>(rawText)
}

async function syncPendingLinuxDoOrder(orderId: string, settings: Map<string, string>) {
    try {
        const config = resolveLinuxDoConfig(settings, orderId)
        if (!config) return

        const queryResult = await queryLinuxDoOrderStatus(orderId, config)
        if (!isLinuxDoOrderPaid(queryResult)) return

        if (queryResult?.type && queryResult.type !== "epay") return
        if (queryResult?.out_trade_no && queryResult.out_trade_no !== orderId) return

        const moneyCents = parseMoneyToCents(queryResult?.money)
        if (!moneyCents) return

        const tradeNo = queryResult?.trade_no || orderId
        await fulfillPaidMembershipOrder({
            orderId,
            tradeNo,
            moneyCents,
        })
    } catch (error) {
        console.error("轮询 Linux DO 订单失败:", { orderId, error })
    }
}

/**
 * 创建支付订单
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

        if (!planId) {
            return NextResponse.json(
                { error: "缺少套餐参数" },
                { status: 400 }
            )
        }

        const supabase = await createServerClient()

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

        if (!Number.isInteger(plan.price) || plan.price <= 0) {
            return NextResponse.json(
                { error: "当前套餐不支持在线支付" },
                { status: 400 }
            )
        }

        const settings = await fetchSystemSettingsMap(supabase)

        const orderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        const linuxDoConfig = resolveLinuxDoConfig(settings, orderId)
        const manualPaymentUrl = settings.get("payment_url") || null

        const { error: orderError } = await supabase.from("orders").insert({
            id: orderId,
            user_id: userId,
            plan_id: plan.id,
            amount: plan.price,
            payment_method: linuxDoConfig ? "linuxdo_credit" : "xianyu",
            payment_url: linuxDoConfig ? null : manualPaymentUrl,
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

        if (!linuxDoConfig) {
            if (!manualPaymentUrl) {
                return NextResponse.json(
                    { error: "支付功能未配置：请配置 Linux DO PID/KEY 或 payment_url" },
                    { status: 503 }
                )
            }

            return NextResponse.json({
                success: true,
                data: {
                    orderId,
                    planId: plan.id,
                    planName: plan.name,
                    amount: plan.price,
                    paymentUrl: manualPaymentUrl,
                    paymentProvider: "manual",
                    message: `请前往支付页面完成支付，备注订单号：${orderId}`,
                },
            })
        }

        const money = formatCentsToMoney(plan.price)
        const linuxDoName = `${plan.name}会员订阅`.slice(0, 64)
        const submitParams = {
            pid: linuxDoConfig.pid,
            type: "epay",
            out_trade_no: orderId,
            name: linuxDoName,
            money,
            notify_url: linuxDoConfig.notifyUrl,
            return_url: linuxDoConfig.returnUrl,
        }

        const sign = signLinuxDoParams(submitParams, linuxDoConfig.key)
        const formData = new URLSearchParams()
        formData.set("pid", submitParams.pid)
        formData.set("type", submitParams.type)
        formData.set("out_trade_no", submitParams.out_trade_no)
        formData.set("name", submitParams.name)
        formData.set("money", submitParams.money)

        if (submitParams.notify_url) {
            formData.set("notify_url", submitParams.notify_url)
        }
        if (submitParams.return_url) {
            formData.set("return_url", submitParams.return_url)
        }

        formData.set("sign", sign)
        formData.set("sign_type", "MD5")

        const submitResponse = await fetch(`${linuxDoConfig.gatewayBase}/pay/submit.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData.toString(),
            cache: "no-store",
            redirect: "follow",
        })

        const rawText = await submitResponse.text()
        const parsedJson = safeParseJson<LinuxDoSubmitResponse>(rawText)
        const gatewayError = parsedJson?.error_msg || parsedJson?.msg

        if (gatewayError) {
            return NextResponse.json(
                { error: `支付网关返回错误：${gatewayError}` },
                { status: 502 }
            )
        }

        const paymentUrl = extractPaymentUrl(submitResponse, rawText, parsedJson)
        if (!paymentUrl) {
            return NextResponse.json(
                { error: "无法获取支付跳转链接，请稍后重试" },
                { status: 502 }
            )
        }

        await supabase
            .from("orders")
            .update({
                payment_url: paymentUrl,
                updated_at: new Date().toISOString(),
            } as never)
            .eq("id", orderId)

        return NextResponse.json({
            success: true,
            data: {
                orderId,
                planId: plan.id,
                planName: plan.name,
                amount: plan.price,
                paymentUrl,
                paymentProvider: "linuxdo_credit",
                message: "请在 Linux DO Credit 页面完成认证支付",
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

            if (order.status === "pending" && order.payment_method === "linuxdo_credit") {
                const settings = await fetchSystemSettingsMap(supabase)
                await syncPendingLinuxDoOrder(order.id, settings)
            }

            const { data: refreshedOrder } = await supabase
                .from("orders")
                .select("*, plan:membership_plans(*)")
                .eq("id", orderId)
                .eq("user_id", userId)
                .single()

            return NextResponse.json({
                success: true,
                data: refreshedOrder || order,
            })
        }

        let { data: orders, error } = await supabase
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

        const pendingLinuxDoOrders = (orders || []).filter(
            (order) => order.status === "pending" && order.payment_method === "linuxdo_credit"
        )

        if (pendingLinuxDoOrders.length > 0) {
            const settings = await fetchSystemSettingsMap(supabase)
            await Promise.all(
                pendingLinuxDoOrders.map((order) => syncPendingLinuxDoOrder(order.id, settings))
            )

            const { data: refreshedOrders } = await supabase
                .from("orders")
                .select("*, plan:membership_plans(*)")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(20)

            if (refreshedOrders) {
                orders = refreshedOrders
            }
        }

        return NextResponse.json({
            success: true,
            data: orders,
        })
    } catch (error) {
        console.error("查询订单错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
