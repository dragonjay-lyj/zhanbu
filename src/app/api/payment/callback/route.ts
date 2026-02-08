import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseMoneyToCents, verifyLinuxDoSign } from "@/lib/payment/linuxdo"
import { fulfillPaidMembershipOrder } from "@/lib/payment/order-fulfillment"

const SUCCESS_TEXT = "success"

const SYSTEM_SETTING_KEYS = [
    "payment_linuxdo_pid",
    "payment_linuxdo_key",
] as const

function textResponse(message: string, status = 200) {
    return new Response(message, {
        status,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    })
}

function sanitizeSettingValue(value: unknown) {
    if (value === null || value === undefined) return ""
    return String(value).replace(/"/g, "").trim()
}

function normalizePayload(payload: Record<string, string | number | null | undefined>) {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(payload)) {
        if (value === undefined || value === null) continue
        result[key] = String(value)
    }
    return result
}

async function resolveLinuxDoSecrets() {
    const envPid = process.env.LINUX_DO_CREDIT_PID?.trim()
    const envKey = process.env.LINUX_DO_CREDIT_KEY?.trim()
    if (envPid && envKey) {
        return { pid: envPid, key: envKey }
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

    const pid = envPid || settings.get("payment_linuxdo_pid") || ""
    const key = envKey || settings.get("payment_linuxdo_key") || ""

    if (!pid || !key) return null
    return { pid, key }
}

async function activateMembershipByOrder(orderId: string, tradeNo: string, moneyRaw: string, callbackPid: string, callbackType: string, callbackStatus: string, payload: Record<string, string>) {
    const secrets = await resolveLinuxDoSecrets()
    if (!secrets) {
        return textResponse("Linux DO 配置缺失", 500)
    }

    if (callbackPid !== secrets.pid) {
        return textResponse("pid mismatch", 400)
    }

    if (callbackType && callbackType !== "epay") {
        return textResponse("unsupported type", 400)
    }

    if (callbackStatus !== "TRADE_SUCCESS") {
        return textResponse("invalid status", 400)
    }

    const sign = payload.sign || ""
    const verified = verifyLinuxDoSign(payload, sign, secrets.key)
    if (!verified) {
        return textResponse("invalid sign", 401)
    }

    const moneyCents = parseMoneyToCents(moneyRaw)
    if (!moneyCents || moneyCents <= 0) {
        return textResponse("invalid money", 400)
    }

    const result = await fulfillPaidMembershipOrder({
        orderId,
        tradeNo,
        moneyCents,
    })

    if (result.status === "already_paid" || result.status === "paid") {
        return textResponse(SUCCESS_TEXT)
    }

    if (result.status === "not_found") return textResponse("order not found", 404)
    if (result.status === "amount_mismatch") return textResponse("amount mismatch", 400)
    if (result.status === "invalid_state") return textResponse("invalid order status", 409)
    if (result.status === "plan_not_found") return textResponse("plan not found", 400)

    console.error("支付回调处理失败:", result.error || result.status)
    return textResponse("fulfill failed", 500)
}

function extractPayloadFromSearchParams(searchParams: URLSearchParams) {
    const payload: Record<string, string> = {}
    for (const [key, value] of searchParams.entries()) {
        payload[key] = value
    }
    return payload
}

function parseFromPayload(payload: Record<string, string>) {
    const orderId = payload.out_trade_no || ""
    const tradeNo = payload.trade_no || ""
    const money = payload.money || ""
    const pid = payload.pid || ""
    const type = payload.type || ""
    const tradeStatus = payload.trade_status || ""

    return { orderId, tradeNo, money, pid, type, tradeStatus }
}

export async function GET(request: NextRequest) {
    const payload = extractPayloadFromSearchParams(request.nextUrl.searchParams)
    const { orderId, tradeNo, money, pid, type, tradeStatus } = parseFromPayload(payload)

    if (!orderId || !tradeNo || !money || !pid || !tradeStatus) {
        return textResponse("missing params", 400)
    }

    return activateMembershipByOrder(orderId, tradeNo, money, pid, type, tradeStatus, payload)
}

/**
 * 兼容 POST 回调（便于本地调试或第三方代理）
 */
export async function POST(request: NextRequest) {
    const contentType = request.headers.get("content-type") || ""

    let payload: Record<string, string> = {}

    if (contentType.includes("application/json")) {
        const jsonBody = (await request.json()) as Record<string, string | number | null | undefined>
        payload = normalizePayload(jsonBody || {})
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const form = await request.formData()
        for (const [key, value] of form.entries()) {
            payload[key] = String(value)
        }
    } else {
        const textBody = await request.text()
        const params = new URLSearchParams(textBody)
        payload = extractPayloadFromSearchParams(params)
    }

    const { orderId, tradeNo, money, pid, type, tradeStatus } = parseFromPayload(payload)
    if (!orderId || !tradeNo || !money || !pid || !tradeStatus) {
        return textResponse("missing params", 400)
    }

    return activateMembershipByOrder(orderId, tradeNo, money, pid, type, tradeStatus, payload)
}
