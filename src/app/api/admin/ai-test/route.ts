import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * AI 连接测试 API
 * 验证 API 配置并获取可用模型列表
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "未授权" }, { status: 401 })
        }

        // 验证管理员权限
        const supabase = await createServerClient()
        const { data: user } = await supabase
            .from("users")
            .select("role")
            .eq("clerk_id", userId)
            .single()

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "权限不足" }, { status: 403 })
        }

        const body = await req.json()
        const { apiKey, baseUrl } = body

        if (!apiKey || !baseUrl) {
            return NextResponse.json({ error: "请提供 API Key 和 Base URL" }, { status: 400 })
        }

        // 测试连接 - 获取模型列表
        const modelsResponse = await fetch(`${baseUrl}/models`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            // 设置超时
            signal: AbortSignal.timeout(10000),
        })

        if (!modelsResponse.ok) {
            const errorText = await modelsResponse.text()
            console.error("AI API 错误:", modelsResponse.status, errorText)

            // 根据状态码返回更友好的错误信息
            if (modelsResponse.status === 401) {
                return NextResponse.json({
                    success: false,
                    error: "API Key 无效或已过期"
                }, { status: 400 })
            }
            if (modelsResponse.status === 403) {
                return NextResponse.json({
                    success: false,
                    error: "API Key 权限不足"
                }, { status: 400 })
            }
            if (modelsResponse.status === 404) {
                // 有些 API 不支持 /models 端点，尝试简单的 chat 请求
                return await testChatEndpoint(apiKey, baseUrl)
            }

            return NextResponse.json({
                success: false,
                error: `API 请求失败: ${modelsResponse.status}`
            }, { status: 400 })
        }

        const modelsData = await modelsResponse.json()

        // 提取模型列表
        let models: string[] = []
        if (modelsData.data && Array.isArray(modelsData.data)) {
            models = modelsData.data
                .map((m: { id?: string }) => m.id)
                .filter((id: string | undefined): id is string => !!id)
                .slice(0, 50) // 限制返回数量
        }

        // 按照常用模型排序
        const priorityModels = [
            "deepseek-chat", "deepseek-reasoner",
            "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo",
            "claude-3-5-sonnet", "claude-3-haiku", "claude-3-opus",
        ]

        models.sort((a, b) => {
            const aIndex = priorityModels.findIndex(p => a.includes(p))
            const bIndex = priorityModels.findIndex(p => b.includes(p))
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
            if (aIndex !== -1) return -1
            if (bIndex !== -1) return 1
            return a.localeCompare(b)
        })

        return NextResponse.json({
            success: true,
            message: "连接成功！",
            models,
        })
    } catch (error) {
        console.error("AI 测试 API 错误:", error)

        if (error instanceof Error) {
            if (error.name === "AbortError" || error.message.includes("timeout")) {
                return NextResponse.json({
                    success: false,
                    error: "连接超时，请检查 Base URL 是否正确"
                }, { status: 400 })
            }
            if (error.message.includes("fetch")) {
                return NextResponse.json({
                    success: false,
                    error: "无法连接到 API 服务器，请检查 Base URL"
                }, { status: 400 })
            }
        }

        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

/**
 * 测试 chat 端点（用于不支持 /models 的 API）
 */
async function testChatEndpoint(apiKey: string, baseUrl: string) {
    try {
        const chatResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-chat", // 尝试默认模型
                messages: [{ role: "user", content: "Hi" }],
                max_tokens: 5,
            }),
            signal: AbortSignal.timeout(15000),
        })

        if (chatResponse.ok) {
            return NextResponse.json({
                success: true,
                message: "连接成功！（该 API 不支持获取模型列表）",
                models: [], // 不返回模型列表
            })
        }

        const errorData = await chatResponse.json().catch(() => ({}))
        return NextResponse.json({
            success: false,
            error: errorData.error?.message || `API 验证失败: ${chatResponse.status}`
        }, { status: 400 })
    } catch {
        return NextResponse.json({
            success: false,
            error: "无法验证 API 连接"
        }, { status: 400 })
    }
}
