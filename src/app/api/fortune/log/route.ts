import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logFortune } from "@/lib/history/log-fortune"
import { normalizeFortuneType } from "@/lib/history/types"

interface LogRequestBody {
    type?: string
    title?: string
    summary?: string
    recordId?: string
    meta?: Record<string, unknown>
    occurredAt?: string
}

/**
 * 统一历史记录入口
 * - 未登录：返回成功但不写库
 * - 已登录：必须成功写库，否则返回可观测错误
 */
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as LogRequestBody
        const rawType = body?.type || ""
        const type = normalizeFortuneType(rawType)

        if (!type) {
            return NextResponse.json(
                { success: false, error: "无效的历史类型" },
                { status: 400 }
            )
        }

        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({
                success: true,
                data: {
                    logged: false,
                    reason: "anonymous",
                },
            })
        }

        const result = await logFortune({
            clerkUserId: userId,
            type,
            title: body.title,
            summary: body.summary,
            recordId: body.recordId,
            meta: body.meta,
            occurredAt: body.occurredAt,
            strict: true,
        })

        if (!result.ok) {
            const status = result.reason === "user_not_synced" ? 404 : 500
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || "写入历史失败",
                    reason: result.reason || "error",
                },
                { status }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                logged: !result.skipped,
                reason: result.reason || null,
                id: result.id || null,
            },
        })
    } catch (error) {
        console.error("Fortune log API error:", error)
        return NextResponse.json(
            { success: false, error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
