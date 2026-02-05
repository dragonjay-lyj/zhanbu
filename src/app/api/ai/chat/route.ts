import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"
import { defaultLocale, getTranslations, locales, t as translate, type Locale } from "@/lib/i18n"

/**
 * AI 对话占卜 API - 流式响应
 */

// AI 对话消费积分数量
const AI_CHAT_COST = 5

// 对话模式
const chatModes = {
    general: {
        name: "综合占卜",
        systemPrompt: `你是一位博学多才的占卜大师，精通各类占卜术：八字命理、紫微斗数、塔罗牌、周易六爻等。
你的风格是温和睿智、循循善诱。在回答问题时：
1. 先理解用户的困惑和问题
2. 用通俗易懂的方式解释命理概念
3. 给出具体可行的建议
4. 鼓励用户积极面对生活

请用亲切自然的口吻与用户交流，像一位智慧的长者。`,
    },
    love: {
        name: "感情姻缘",
        systemPrompt: `你是一位专精感情姻缘的占卜师，擅长用塔罗牌和八字合婚来分析感情问题。
你的风格温柔细腻，善于倾听和共情。在回答感情问题时：
1. 先共情用户的情感状态
2. 分析感情中的问题和机遇
3. 给出改善关系的具体建议
4. 帮助用户看清自己的内心

请用温暖体贴的口吻与用户交流。`,
    },
    career: {
        name: "事业财运",
        systemPrompt: `你是一位专精事业财运的占卜师，擅长用八字、紫微斗数分析事业发展。
你的风格务实专业，注重可操作性。在回答事业问题时：
1. 分析当前事业运势和机遇
2. 指出需要注意的风险
3. 给出职业发展的具体建议
4. 提供改善财运的方法

请用专业自信的口吻与用户交流。`,
    },
    health: {
        name: "健康运势",
        systemPrompt: `你是一位关注身心健康的占卜师，擅长从命理角度分析健康问题。
你的风格关怀备至，注重养生。在回答健康问题时：
1. 分析命理中的健康信息
2. 指出需要注意的身体部位
3. 给出养生保健的建议
4. 提醒及时就医的重要性

请用关爱温暖的口吻与用户交流。注意：你不是医生，严重健康问题请建议就医。`,
    },
}

const LOCALE_INSTRUCTIONS: Record<Locale, string> = {
    "zh-CN": "请用简体中文回答。",
    "zh-TW": "請用繁體中文回答。",
    en: "Please respond in English.",
    ja: "日本語で回答してください。",
}

function matchAcceptLanguage(headerValue: string | null): Locale | null {
    if (!headerValue) return null
    const parts = headerValue.split(",").map((part) => part.trim().split(";")[0])
    for (const lang of parts) {
        const lower = lang.toLowerCase()
        if (lower.startsWith("zh")) {
            if (lower.includes("tw") || lower.includes("hk") || lower.includes("mo")) {
                return "zh-TW"
            }
            return "zh-CN"
        }
        if (lower.startsWith("ja")) return "ja"
        if (lower.startsWith("en")) return "en"
    }
    return null
}

function resolveLocale(req: NextRequest, bodyLocale?: string): Locale {
    if (bodyLocale && locales.includes(bodyLocale as Locale)) {
        return bodyLocale as Locale
    }
    const cookieLocale = req.cookies.get("locale")?.value
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        return cookieLocale as Locale
    }
    const headerLocale = matchAcceptLanguage(req.headers.get("accept-language"))
    return headerLocale || defaultLocale
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return new Response(JSON.stringify({ error: "请先登录" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            })
        }

        const supabase = await createAdminClient()

        // 检查用户积分余额
        const { data: credits } = await supabase
            .from("user_credits")
            .select("balance, total_spent")
            .eq("user_id", userId)
            .single()

        const currentBalance = credits?.balance || 0

        if (currentBalance < AI_CHAT_COST) {
            return new Response(
                JSON.stringify({
                    error: "积分不足",
                    required: AI_CHAT_COST,
                    current: currentBalance,
                    message: `AI 对话需要 ${AI_CHAT_COST} 积分，您当前余额 ${currentBalance} 积分`,
                }),
                {
                    status: 402,
                    headers: { "Content-Type": "application/json" },
                }
            )
        }

        const body = await req.json()
        const { message, mode = "general", history = [], locale: bodyLocale } = body

        if (!message) {
            return new Response(JSON.stringify({ error: "请输入您的问题" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        // 获取 AI 配置（从数据库读取，fallback 到环境变量）
        const { getAiConfig } = await import("@/lib/settings")
        const aiConfig = await getAiConfig()

        if (!aiConfig.apiKey) {
            return new Response(JSON.stringify({ error: "AI 服务未配置" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
            })
        }

        // 构建消息
        const locale = resolveLocale(req, bodyLocale)
        const chatMode = chatModes[mode as keyof typeof chatModes] || chatModes.general
        const translations = getTranslations(locale)
        const modeLabel = translate(translations, `ai.modes.${mode}`)
        const modeName = modeLabel.startsWith("ai.modes.") ? chatMode.name : modeLabel
        const languageInstruction = LOCALE_INSTRUCTIONS[locale] || LOCALE_INSTRUCTIONS[defaultLocale]
        const messages = [
            { role: "system", content: `${chatMode.systemPrompt}\n\n${languageInstruction}` },
            ...history.slice(-10), // 保留最近10条对话
            { role: "user", content: message },
        ]

        // 调用 AI API（流式）
        const aiResponse = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${aiConfig.apiKey}`,
            },
            body: JSON.stringify({
                model: aiConfig.model,
                messages,
                temperature: 0.8,
                max_tokens: 1500,
                stream: true,
            }),
        })

        if (!aiResponse.ok) {
            const error = await aiResponse.text()
            console.error("AI API 错误:", error)
            return new Response(JSON.stringify({ error: "AI 服务暂时不可用" }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            })
        }

        // 扣除积分（成功调用 AI 后扣除）
        const newBalance = currentBalance - AI_CHAT_COST
        await supabase
            .from("user_credits")
            .update({
                balance: newBalance,
                total_spent: (credits?.total_spent || 0) + AI_CHAT_COST,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

        // 记录积分消费
        await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: -AI_CHAT_COST,
            balance_after: newBalance,
            type: "consume",
            description: `AI Chat (${modeName || chatMode.name})`,
            reference_id: `ai_chat:${mode}`,
        })

        // 返回流式响应
        return new Response(aiResponse.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "X-Credits-Used": AI_CHAT_COST.toString(),
                "X-Credits-Remaining": newBalance.toString(),
            },
        })
    } catch (error) {
        console.error("AI 对话 API 错误:", error)
        return new Response(JSON.stringify({ error: "服务器内部错误" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

// 获取对话模式列表
export async function GET(req: NextRequest) {
    const locale = resolveLocale(req)
    const translations = getTranslations(locale)
    const modes = Object.entries(chatModes).map(([id, mode]) => {
        const label = translate(translations, `ai.modes.${id}`)
        return {
            id,
            name: label.startsWith("ai.modes.") ? mode.name : label,
        }
    })

    return new Response(JSON.stringify({
        success: true,
        data: {
            modes,
            costPerMessage: AI_CHAT_COST,
        }
    }), {
        headers: { "Content-Type": "application/json" },
    })
}
