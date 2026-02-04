import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

        // 获取支付链接
        const { data: paymentSetting } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "payment_url")
            .single()

        const paymentUrl = paymentSetting?.value ?? null

        return NextResponse.json({
            success: true,
            data: {
                plans,
                paymentUrl,
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
