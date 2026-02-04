import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 获取当前用户的会员信息
 */
export async function GET() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "未授权访问" },
                { status: 401 }
            )
        }

        const supabase = await createServerClient()
        const today = new Date().toISOString().split("T")[0]

        // 获取用户会员信息
        const { data: membership } = await supabase
            .from("memberships")
            .select(`
        *,
        plan:membership_plans(*)
      `)
            .eq("user_id", userId)
            .single()

        // 获取今日配额使用
        const { data: quotaUsage } = await supabase
            .from("quota_usage")
            .select("used_count")
            .eq("user_id", userId)
            .eq("date", today)
            .single()

        // 获取默认免费套餐信息
        const { data: freePlan } = await supabase
            .from("membership_plans")
            .select("*")
            .eq("id", "free")
            .single()

        const isPremium = membership && new Date(membership.expires_at) > new Date()
        const currentPlan = isPremium ? membership.plan : freePlan
        const dailyQuota = currentPlan?.daily_quota ?? 3
        const usedQuota = quotaUsage?.used_count ?? 0
        const remainingQuota = dailyQuota === -1 ? -1 : Math.max(0, dailyQuota - usedQuota)

        return NextResponse.json({
            success: true,
            data: {
                isPremium,
                planId: currentPlan?.id ?? "free",
                planName: currentPlan?.name ?? "免费版",
                expiresAt: membership?.expires_at ?? null,
                dailyQuota: dailyQuota === -1 ? "无限" : dailyQuota,
                usedQuota,
                remainingQuota: remainingQuota === -1 ? "无限" : remainingQuota,
                features: currentPlan?.features ?? [],
            },
        })
    } catch (error) {
        console.error("获取会员信息错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 使用一次配额
 */
export async function POST() {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "未授权访问" },
                { status: 401 }
            )
        }

        const supabase = await createServerClient()
        const today = new Date().toISOString().split("T")[0]

        // 获取用户会员信息
        const { data: membership } = await supabase
            .from("memberships")
            .select("*, plan:membership_plans(*)")
            .eq("user_id", userId)
            .single()

        const isPremium = membership && new Date(membership.expires_at) > new Date()
        const dailyQuota = isPremium ? (membership.plan?.daily_quota ?? -1) : 3

        // 如果是无限配额，直接返回成功
        if (dailyQuota === -1) {
            return NextResponse.json({ success: true, remaining: "无限" })
        }

        // 获取今日使用量
        const { data: quotaUsage } = await supabase
            .from("quota_usage")
            .select("*")
            .eq("user_id", userId)
            .eq("date", today)
            .single()

        const currentUsed = quotaUsage?.used_count ?? 0

        if (currentUsed >= dailyQuota) {
            return NextResponse.json(
                { error: "今日配额已用完", remaining: 0 },
                { status: 429 }
            )
        }

        // 更新或插入配额记录
        if (quotaUsage) {
            await supabase
                .from("quota_usage")
                .update({ used_count: currentUsed + 1 })
                .eq("id", quotaUsage.id)
        } else {
            await supabase.from("quota_usage").insert({
                user_id: userId,
                date: today,
                used_count: 1,
            })
        }

        return NextResponse.json({
            success: true,
            remaining: dailyQuota - currentUsed - 1,
        })
    } catch (error) {
        console.error("使用配额错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
