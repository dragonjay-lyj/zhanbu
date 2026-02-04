import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"

/**
 * 获取用户占卜历史
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

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const type = searchParams.get("type") || ""
        const search = searchParams.get("search") || ""

        const offset = (page - 1) * limit

        // 构建查询
        let query = supabase
            .from("fortunes")
            .select("*", { count: "exact" })
            .eq("user_id", dbUserId)

        if (type) {
            query = query.eq("fortune_type", type)
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
        }

        const { data: records, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error("获取历史记录错误:", error)
            return NextResponse.json({ error: "获取历史记录失败" }, { status: 500 })
        }

        const formattedRecords = (records || []).map((record) => ({
            ...record,
            type: record.fortune_type,
            question: record.summary || record.title || "",
        }))

        return NextResponse.json({
            success: true,
            data: {
                records: formattedRecords,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            },
        })
    } catch (error) {
        console.error("获取历史记录错误:", error)
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

        const supabase = await createServerClient()

        const { searchParams } = new URL(request.url)
        const recordId = searchParams.get("id")

        if (!recordId) {
            return NextResponse.json({ error: "缺少记录 ID" }, { status: 400 })
        }

        // 只能删除自己的记录
        const { error } = await supabase
            .from("fortunes")
            .delete()
            .eq("id", recordId)
            .eq("user_id", dbUserId)

        if (error) {
            console.error("删除记录错误:", error)
            return NextResponse.json({ error: "删除记录失败" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("删除记录错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
