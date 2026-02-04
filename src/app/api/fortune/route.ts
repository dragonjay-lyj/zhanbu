import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"

// 支持的占卜类型
const DIVINATION_TYPES = [
    "bazi",
    "ziwei",
    "liuyao",
    "meihua",
    "tarot",
    "relationship",
    "daily",
] as const

type DivinationType = (typeof DIVINATION_TYPES)[number]

// 表名映射
const TABLE_MAP: Record<DivinationType, string> = {
    bazi: "bazi_records",
    ziwei: "ziwei_records",
    liuyao: "liuyao_records",
    meihua: "meihua_records",
    tarot: "tarot_records",
    relationship: "relationship_analysis",
    daily: "daily_fortune",
}

/**
 * 获取用户的占卜历史记录
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }
        const dbUserId = await getDbUserIdByClerkId(userId)
        if (!dbUserId) {
            return NextResponse.json({ error: "用户未同步" }, { status: 404 })
        }

        const supabase = await createServerClient()

        // 解析查询参数
        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get("type") as DivinationType | null
        const limit = parseInt(searchParams.get("limit") || "20")
        const offset = parseInt(searchParams.get("offset") || "0")

        // 验证类型
        if (type && !DIVINATION_TYPES.includes(type)) {
            return NextResponse.json(
                { error: "无效的占卜类型" },
                { status: 400 }
            )
        }

        // 根据类型获取记录
        if (type) {
            // 获取特定类型的记录
            const tableName = TABLE_MAP[type]
            const { data, error, count } = await supabase
                .from(tableName)
                .select("*", { count: "exact" })
                .eq("user_id", dbUserId)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                console.error("获取记录失败:", error)
                return NextResponse.json(
                    { error: "获取记录失败" },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                records: data,
                total: count,
                type,
            })
        } else {
            // 获取所有类型的最近记录（从 fortunes 表汇总）
            const { data, error, count } = await supabase
                .from("fortunes")
                .select("*", { count: "exact" })
                .eq("user_id", dbUserId)
                .order("created_at", { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) {
                console.error("获取记录失败:", error)
                return NextResponse.json(
                    { error: "获取记录失败" },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                records: data,
                total: count,
            })
        }
    } catch (error) {
        console.error("API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 删除占卜记录
 */
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "未授权访问" }, { status: 401 })
        }
        const dbUserId = await getDbUserIdByClerkId(userId)
        if (!dbUserId) {
            return NextResponse.json({ error: "用户未同步" }, { status: 404 })
        }

        const supabase = await createServerClient()

        const { id, type } = await request.json()

        if (!id || !type) {
            return NextResponse.json(
                { error: "缺少必要参数" },
                { status: 400 }
            )
        }

        if (!DIVINATION_TYPES.includes(type)) {
            return NextResponse.json(
                { error: "无效的占卜类型" },
                { status: 400 }
            )
        }

        const tableName = TABLE_MAP[type as DivinationType]

        // 删除记录（RLS 会确保只能删除自己的记录）
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq("id", id)
            .eq("user_id", dbUserId)

        if (error) {
            console.error("删除记录失败:", error)
            return NextResponse.json(
                { error: "删除记录失败" },
                { status: 500 }
            )
        }

        // 同时从 fortunes 表删除对应记录
        await supabase
            .from("fortunes")
            .delete()
            .eq("record_id", id)
            .eq("user_id", dbUserId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
