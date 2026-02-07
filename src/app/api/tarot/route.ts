import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"
import { logFortune } from "@/lib/history/log-fortune"

// 塔罗牌数据
const MAJOR_ARCANA = [
    { id: 0, name: "愚者", upright: "新开始、冒险、无畏", reversed: "鲁莽、恐惧、冒险行为" },
    { id: 1, name: "魔术师", upright: "创造力、技能、意志力", reversed: "操纵、缺乏计划、潜力未发挥" },
    { id: 2, name: "女祭司", upright: "直觉、潜意识、神秘", reversed: "隐藏的议程、需要倾听内心" },
    { id: 3, name: "女皇", upright: "丰饶、母性、自然", reversed: "创意受阻、依赖、虚荣" },
    { id: 4, name: "皇帝", upright: "权威、结构、稳定", reversed: "暴政、刻板、缺乏纪律" },
    { id: 5, name: "教皇", upright: "传统、信仰、指导", reversed: "挑战传统、打破常规" },
    { id: 6, name: "恋人", upright: "爱情、选择、价值观", reversed: "不和谐、失衡、价值观冲突" },
    { id: 7, name: "战车", upright: "意志力、决心、胜利", reversed: "失控、缺乏方向" },
    { id: 8, name: "力量", upright: "勇气、耐心、内在力量", reversed: "自我怀疑、缺乏信心" },
    { id: 9, name: "隐士", upright: "内省、指导、寻找", reversed: "孤立、回避、迷失" },
    { id: 10, name: "命运之轮", upright: "变化、周期、命运", reversed: "抗拒变化、厄运" },
    { id: 11, name: "正义", upright: "公正、真理、因果", reversed: "不公、不诚实" },
    { id: 12, name: "倒吊人", upright: "牺牲、放手、新视角", reversed: "拖延、抗拒" },
    { id: 13, name: "死神", upright: "结束、转变、新生", reversed: "抗拒变化、停滞" },
    { id: 14, name: "节制", upright: "平衡、耐心、适度", reversed: "过度、不平衡" },
    { id: 15, name: "恶魔", upright: "束缚、诱惑、物质", reversed: "释放、打破束缚" },
    { id: 16, name: "塔", upright: "突变、觉醒、释放", reversed: "避免灾难、延迟不可避免" },
    { id: 17, name: "星星", upright: "希望、灵感、宁静", reversed: "失望、缺乏信心" },
    { id: 18, name: "月亮", upright: "幻想、恐惧、潜意识", reversed: "释放恐惧、困惑消退" },
    { id: 19, name: "太阳", upright: "快乐、成功、活力", reversed: "暂时的消极" },
    { id: 20, name: "审判", upright: "重生、觉醒、评估", reversed: "自我怀疑、拒绝自省" },
    { id: 21, name: "世界", upright: "完成、整合、成就", reversed: "未完成、缺乏闭合" },
]

// 解读风格提示
const STYLE_PROMPTS: Record<string, string> = {
    standard: "你是一位专业的塔罗占卜师，请用客观、专业的语言进行解读。",
    fire: "你是火神占卜师，说话直白犀利，不绕弯子，直击问题核心。",
    moon: "你是月光占卜师，用温柔优雅的语言，富有诗意地解读牌面。",
    wise: "你是维斯顿智者，从哲学和人生智慧的角度深度分析每张牌。",
}

interface TarotCard {
    id: number
    position: string
    reversed: boolean
}

interface TarotRequest {
    cards: TarotCard[]
    spread: string
    question?: string
    style?: string
}

/**
 * 创建塔罗占卜记录
 */
export async function POST(request: NextRequest) {
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

        const body: TarotRequest = await request.json()
        const { cards, spread, question, style = "standard" } = body

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json(
                { error: "缺少塔罗牌数据" },
                { status: 400 }
            )
        }

        // 构建牌面信息
        const cardDetails = cards.map((card) => {
            const arcana = MAJOR_ARCANA.find((a) => a.id === card.id)
            return {
                ...card,
                name: arcana?.name || "未知牌",
                meaning: card.reversed ? arcana?.reversed : arcana?.upright,
            }
        })

        // 构建 AI 提示
        const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.standard
        const cardDescriptions = cardDetails
            .map(
                (c) =>
                    `${c.position}: ${c.name}（${c.reversed ? "逆位" : "正位"}）- ${c.meaning}`
            )
            .join("\n")

        const prompt = `${stylePrompt}

用户的问题: ${question || "请为我解读这次塔罗占卜"}

牌阵类型: ${spread}

抽到的牌:
${cardDescriptions}

请根据以上牌面，给出详细的解读。解读应包括:
1. 整体概述
2. 每张牌在其位置的具体含义
3. 牌与牌之间的联系
4. 针对用户问题的具体建议
5. 总结与展望

请用中文回答，保持专业但易于理解。`

        // 保存到数据库
        const { data: record, error: insertError } = await supabase
            .from("tarot_records")
            .insert({
                user_id: dbUserId,
                question,
                spread_type: spread,
                cards: cardDetails,
                reading_style: style,
            } as never)
            .select()
            .single()

        if (insertError) {
            console.error("保存记录失败:", insertError)
            return NextResponse.json(
                { error: "保存记录失败" },
                { status: 500 }
            )
        }

        // 同时写入 fortunes 汇总表（幂等去重）
        const fortuneResult = await logFortune({
            dbUserId,
            type: "tarot",
            recordId: (record as { id: string }).id,
            title: "塔罗占卜",
            summary: `${spread} - ${cardDetails.map((c) => c.name).join("、")}`,
        })
        if (!fortuneResult.ok) {
            console.error("保存塔罗历史失败:", fortuneResult.error)
        }

        // 尝试调用 AI 生成解读
        let interpretation = ""
        const aiApiKey = process.env.AI_API_KEY
        const aiBaseUrl = process.env.AI_BASE_URL || "https://api.deepseek.com"

        if (aiApiKey) {
            try {
                const aiResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${aiApiKey}`,
                    },
                    body: JSON.stringify({
                        model: process.env.AI_MODEL || "deepseek-chat",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.8,
                        max_tokens: 2000,
                    }),
                })

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json()
                    interpretation = aiData.choices?.[0]?.message?.content || ""

                    // 更新记录的 AI 解读
                    if (interpretation) {
                        await supabase
                            .from("tarot_records")
                            .update({
                                ai_interpretation: interpretation,
                                ai_model: process.env.AI_MODEL || "deepseek-chat",
                                ai_generated_at: new Date().toISOString(),
                            } as never)
                            .eq("id", (record as { id: string }).id)
                    }
                }
            } catch (aiError) {
                console.error("AI 解读生成失败:", aiError)
                // 继续返回记录，但没有 AI 解读
            }
        }

        return NextResponse.json({
            success: true,
            record: {
                ...(record as object),
                ai_interpretation: interpretation,
            },
        })
    } catch (error) {
        console.error("API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}

/**
 * 获取塔罗占卜记录
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

        const searchParams = request.nextUrl.searchParams
        const id = searchParams.get("id")
        const limit = parseInt(searchParams.get("limit") || "20")

        if (id) {
            // 获取单条记录
            const { data, error } = await supabase
                .from("tarot_records")
                .select("*")
                .eq("id", id)
                .eq("user_id", dbUserId)
                .single()

            if (error) {
                return NextResponse.json(
                    { error: "记录不存在" },
                    { status: 404 }
                )
            }

            return NextResponse.json({ record: data })
        } else {
            // 获取列表
            const { data, error, count } = await supabase
                .from("tarot_records")
                .select("*", { count: "exact" })
                .eq("user_id", dbUserId)
                .order("created_at", { ascending: false })
                .limit(limit)

            if (error) {
                return NextResponse.json(
                    { error: "获取记录失败" },
                    { status: 500 }
                )
            }

            return NextResponse.json({ records: data, total: count })
        }
    } catch (error) {
        console.error("API 错误:", error)
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        )
    }
}
