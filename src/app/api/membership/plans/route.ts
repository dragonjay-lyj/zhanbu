import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { normalizeLinuxDoCreditRate } from "@/lib/payment/linuxdo"

const PAYMENT_KEYS = [
    "payment_url",
    "payment_linuxdo_pid",
    "payment_linuxdo_key",
    "payment_linuxdo_credit_rate",
] as const

function sanitizeSettingValue(value: unknown) {
    if (value === null || value === undefined) return ""
    return String(value).replace(/"/g, "").trim()
}

/**
 * 获取所有会员套餐
 */
export async function GET() {
    try {
        const supabase = await createServerClient()

        const { data: plans, error } = await supabase
            .from("membership_plans")
            .select("*")
            .eq("is_active", true)
            .order("sort_order", { ascending: true })

        if (error) {
            console.error("获取套餐错误:", error)
            return NextResponse.json(
                { error: "获取套餐失败" },
                { status: 500 }
            )
        }

        const { data: paymentSetting } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "payment_url")
            .single()

        const paymentUrl = sanitizeSettingValue(paymentSetting?.value ?? "")

        const { data: paymentRows } = await supabase
            .from("system_settings")
            .select("key, value")
            .in("key", [...PAYMENT_KEYS])

        const settingsMap = new Map<string, string>()
        for (const row of paymentRows || []) {
            settingsMap.set(row.key, sanitizeSettingValue(row.value))
        }

        const linuxDoPid =
            process.env.LINUX_DO_CREDIT_PID?.trim() ||
            settingsMap.get("payment_linuxdo_pid") ||
            ""
        const linuxDoKey =
            process.env.LINUX_DO_CREDIT_KEY?.trim() ||
            settingsMap.get("payment_linuxdo_key") ||
            ""
        const linuxDoCreditRate = normalizeLinuxDoCreditRate(
            process.env.LINUX_DO_CREDIT_RATE?.trim() ||
                settingsMap.get("payment_linuxdo_credit_rate") ||
                10
        )
        const linuxDoEnabled = Boolean(linuxDoPid && linuxDoKey)
        const manualEnabled = Boolean(paymentUrl)
        const defaultProvider = linuxDoEnabled
            ? "linuxdo_credit"
            : manualEnabled
                ? "xianyu"
                : null

        return NextResponse.json({
            success: true,
            data: {
                plans,
                paymentUrl: paymentUrl || null,
                paymentOptions: {
                    linuxDoEnabled,
                    manualEnabled,
                    defaultProvider,
                    linuxDoCreditRate,
                },
            },
        })
    } catch (error) {
        console.error("获取套餐错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
