import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * 获取订单列表（管理员）
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }

        const supabase = await createServerClient()

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "无权限访问" }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)))
        const status = (searchParams.get("status") || "").trim()
        const method = (searchParams.get("method") || "").trim()
        const search = (searchParams.get("search") || "").trim()
        const offset = (page - 1) * limit

        let query = supabase
            .from("orders")
            .select(`
                id,
                user_id,
                plan_id,
                amount,
                payment_amount,
                payment_method,
                payment_url,
                status,
                transaction_id,
                created_at,
                paid_at,
                updated_at,
                plan:membership_plans(id, name, period),
                user:users(email, name)
            `, { count: "exact" })

        if (status && status !== "all") {
            query = query.eq("status", status)
        }

        if (method && method !== "all") {
            query = query.eq("payment_method", method)
        }

        if (search) {
            query = query.or(`id.ilike.%${search}%,transaction_id.ilike.%${search}%,user_id.ilike.%${search}%`)
        }

        const { data: orders, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("获取订单失败:", error)
            return NextResponse.json({ error: "获取订单失败" }, { status: 500 })
        }

        const formattedOrders = (orders || []).map((order) => {
            const user = Array.isArray(order.user) ? order.user[0] : order.user
            const plan = Array.isArray(order.plan) ? order.plan[0] : order.plan

            return {
                ...order,
                user: user
                    ? {
                        email: user.email,
                        full_name: user.name,
                    }
                    : null,
                plan: plan
                    ? {
                        id: plan.id,
                        name: plan.name,
                        period: plan.period,
                    }
                    : null,
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                orders: formattedOrders,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error("获取订单错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
