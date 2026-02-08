import { createServerClient } from "@/lib/supabase/server"
import { parseMoneyToCents } from "@/lib/payment/linuxdo"

export type FulfillOrderStatus =
    | "paid"
    | "already_paid"
    | "not_found"
    | "amount_mismatch"
    | "invalid_state"
    | "plan_not_found"
    | "error"

export interface FulfillOrderResult {
    status: FulfillOrderStatus
    error?: unknown
}

interface FulfillOrderInput {
    orderId: string
    tradeNo: string
    moneyCents: number
}

export async function fulfillPaidMembershipOrder({
    orderId,
    tradeNo,
    moneyCents,
}: FulfillOrderInput): Promise<FulfillOrderResult> {
    try {
        if (!orderId || !tradeNo || !Number.isInteger(moneyCents) || moneyCents <= 0) {
            return { status: "error", error: "invalid input" }
        }

        const supabase = await createServerClient()

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single()

        if (orderError || !order) {
            return { status: "not_found", error: orderError }
        }

        const expectedMoneyCents = order.payment_amount
            ? parseMoneyToCents(order.payment_amount)
            : order.amount

        if (!expectedMoneyCents || expectedMoneyCents !== moneyCents) {
            return { status: "amount_mismatch" }
        }

        if (order.status === "paid") {
            return { status: "already_paid" }
        }

        if (order.status !== "pending") {
            return { status: "invalid_state" }
        }

        const { data: plan, error: planError } = await supabase
            .from("membership_plans")
            .select("id, duration_days")
            .eq("id", order.plan_id)
            .single()

        if (planError || !plan) {
            return { status: "plan_not_found", error: planError }
        }

        const now = new Date()
        const { data: existingMembership } = await supabase
            .from("memberships")
            .select("expires_at")
            .eq("user_id", order.user_id)
            .single()

        const existingExpires = existingMembership?.expires_at ? new Date(existingMembership.expires_at) : null
        const baseDate =
            existingExpires && existingExpires.getTime() > now.getTime() ? existingExpires : now

        const expiresAt = new Date(baseDate)
        if (plan.duration_days < 0) {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100)
        } else {
            expiresAt.setDate(expiresAt.getDate() + plan.duration_days)
        }

        const nowIso = new Date().toISOString()

        const { error: updateOrderError } = await supabase
            .from("orders")
            .update({
                status: "paid",
                transaction_id: tradeNo,
                paid_at: nowIso,
                updated_at: nowIso,
            } as never)
            .eq("id", order.id)
            .eq("status", "pending")

        if (updateOrderError) {
            return { status: "error", error: updateOrderError }
        }

        const { error: upsertMembershipError } = await supabase
            .from("memberships")
            .upsert({
                user_id: order.user_id,
                plan_id: order.plan_id,
                expires_at: expiresAt.toISOString(),
                updated_at: nowIso,
            } as never, {
                onConflict: "user_id",
            })

        if (upsertMembershipError) {
            return { status: "error", error: upsertMembershipError }
        }

        await supabase
            .from("users")
            .update({
                role: "member",
                updated_at: nowIso,
            } as never)
            .eq("clerk_id", order.user_id)

        return { status: "paid" }
    } catch (error) {
        return { status: "error", error }
    }
}
