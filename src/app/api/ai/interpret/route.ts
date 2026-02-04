import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

// 支持的占卜类型
type DivinationType =
    | "bazi"
    | "ziwei"
    | "liuyao"
    | "meihua"
    | "tarot"
    | "qimen"
    | "fengshui"
    | "relationship"
    | "daily"
    | "general"

// AI 解读消费积分数量
const AI_INTERPRET_COST = 10

// 各类型的系统提示
const SYSTEM_PROMPTS: Record<DivinationType, string> = {
    bazi: `你是一位精通八字命理的资深命理师。你的解读风格专业、详实，既有传统智慧又通俗易懂。
在解读中，你会：
1. 分析日主强弱和格局
2. 解读十神关系和五行生克
3. 分析大运流年的影响
4. 给出具体而实用的建议`,

    ziwei: `你是一位紫微斗数大师，对命盘有深刻的理解。
在解读中，你会：
1. 分析命宫主星和格局
2. 解读十二宫位的含义
3. 分析四化星的影响
4. 结合大限流年给出建议`,

    liuyao: `你是一位精通六爻占卜的卦师。
在解读中，你会：
1. 分析本卦和变卦的含义
2. 解读世应关系和用神
3. 分析动爻和变爻的影响
4. 给出明确的吉凶判断和建议`,

    meihua: `你是一位梅花易数高手。
在解读中，你会：
1. 分析体用关系和五行生克
2. 解读本卦、互卦、变卦的含义
3. 结合时空因素给出判断
4. 提供实用的行动建议`,

    tarot: `你是一位资深塔罗占卜师，擅长心理分析和直觉解读。
在解读中，你会：
1. 分析每张牌在其位置的含义
2. 解读正逆位的不同影响
3. 揭示牌面间的关联
4. 给出温暖而有洞察力的建议`,

    qimen: `你是一位奇门遁甲专家。
在解读中，你会：
1. 分析九宫布局和格局
2. 解读八门、九星、八神的组合
3. 判断时空的吉凶
4. 给出择时择向的建议`,

    fengshui: `你是一位玄空风水大师。
在解读中，你会：
1. 分析九宫飞星的布局
2. 解读山星和向星的吉凶
3. 指出旺衰方位和化解方法
4. 给出具体的风水调整建议`,

    relationship: `你是一位擅长关系分析的命理咨询师。
在解读中，你会：
1. 分析双方八字的契合度
2. 解读五行相生相克的影响
3. 指出关系中的优势和挑战
4. 给出改善关系的具体建议`,

    daily: `你是一位每日运势分析师。
在解读中，你会：
1. 分析当日的整体运势趋势
2. 解读各方面运势（事业、感情、财运等）
3. 指出需要注意的事项
4. 给出积极可行的建议`,

    general: `你是一位博学多才的占卜大师，精通各类占卜术。
在解读中，你会：
1. 多角度分析问题
2. 结合各种占卜智慧给出建议
3. 注重实用性和可操作性
4. 以温和睿智的方式传递信息`,
}

// 解读风格
const STYLE_MODIFIERS: Record<string, string> = {
    standard: "请用专业、客观、易懂的语言进行解读。",
    fire: "请用直白、犀利、不绕弯子的风格进行解读，直击问题核心。",
    moon: "请用温柔、优雅、富有诗意的语言进行解读，给人温暖的感觉。",
    wise: "请从哲学和人生智慧的角度进行深度分析，引导思考。",
    humorous: "请用幽默风趣的方式进行解读，让用户在轻松氛围中获得启发。",
}

interface InterpretRequest {
    type: DivinationType
    data: Record<string, unknown>
    question?: string
    style?: string
}

/**
 * AI 解读 API
 */
export async function POST(request: NextRequest) {
    try {
        // 使用 Clerk 验证用户
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const supabase = await createAdminClient()

        // 检查用户积分余额
        const { data: credits } = await supabase
            .from("user_credits")
            .select("balance")
            .eq("user_id", userId)
            .single()

        const currentBalance = credits?.balance || 0

        if (currentBalance < AI_INTERPRET_COST) {
            return NextResponse.json(
                {
                    error: "积分不足",
                    required: AI_INTERPRET_COST,
                    current: currentBalance,
                    message: `AI 解读需要 ${AI_INTERPRET_COST} 积分，您当前余额 ${currentBalance} 积分`,
                },
                { status: 402 }
            )
        }

        const body: InterpretRequest = await request.json()
        const { type, data, question, style = "standard" } = body

        // 验证类型
        if (!SYSTEM_PROMPTS[type]) {
            return NextResponse.json({ error: "不支持的占卜类型" }, { status: 400 })
        }

        // 构建提示
        const systemPrompt = SYSTEM_PROMPTS[type]
        const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.standard

        // 构建用户输入
        let userContent = ""
        if (question) {
            userContent += `用户问题：${question}\n\n`
        }
        userContent += `占卜数据：\n${JSON.stringify(data, null, 2)}\n\n`
        userContent += `${styleModifier}\n\n请给出详细的解读。`

        // 获取 AI 配置（从数据库读取，fallback 到环境变量）
        const { getAiConfig } = await import("@/lib/settings")
        const aiConfig = await getAiConfig()

        if (!aiConfig.apiKey) {
            return NextResponse.json(
                { error: "AI 服务未配置，请联系管理员" },
                { status: 503 }
            )
        }

        // 调用 AI API
        const aiResponse = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${aiConfig.apiKey}`,
            },
            body: JSON.stringify({
                model: aiConfig.model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent },
                ],
                temperature: 0.8,
                max_tokens: 2000,
                stream: false,
            }),
        })

        if (!aiResponse.ok) {
            const error = await aiResponse.text()
            console.error("AI API 错误:", error)
            return NextResponse.json(
                { error: "AI 解读生成失败，请稍后重试" },
                { status: 502 }
            )
        }

        const aiData = await aiResponse.json()
        const interpretation = aiData.choices?.[0]?.message?.content || ""

        if (!interpretation) {
            return NextResponse.json(
                { error: "AI 未返回有效内容" },
                { status: 502 }
            )
        }

        // 扣除积分
        const newBalance = currentBalance - AI_INTERPRET_COST
        await supabase
            .from("user_credits")
            .update({
                balance: newBalance,
                total_spent: (credits?.balance || 0) + AI_INTERPRET_COST,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

        // 记录积分消费
        await supabase.from("credit_transactions").insert({
            user_id: userId,
            amount: -AI_INTERPRET_COST,
            balance_after: newBalance,
            type: "consume",
            description: `AI ${type} 解读`,
            reference_type: "ai_interpret",
        })

        // 记录 AI 使用量
        await supabase.from("ai_usage_logs").insert({
            user_id: userId,
            divination_type: type,
            model: aiConfig.model,
            tokens_used: aiData.usage?.total_tokens || 0,
            credits_cost: AI_INTERPRET_COST,
            created_at: new Date().toISOString(),
        })

        return NextResponse.json({
            success: true,
            interpretation,
            model: aiConfig.model,
            tokens: aiData.usage?.total_tokens || 0,
            creditsUsed: AI_INTERPRET_COST,
            remainingCredits: newBalance,
        })
    } catch (error) {
        console.error("AI 解读 API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 流式 AI 解读（可选）
 */
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    })
}
