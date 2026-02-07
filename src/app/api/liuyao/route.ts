import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"
import { logFortune } from "@/lib/history/log-fortune"

// 八卦数据
const BA_GUA: Record<string, { element: string; nature: string }> = {
    乾: { element: "金", nature: "天" },
    兑: { element: "金", nature: "泽" },
    离: { element: "火", nature: "火" },
    震: { element: "木", nature: "雷" },
    巽: { element: "木", nature: "风" },
    坎: { element: "水", nature: "水" },
    艮: { element: "土", nature: "山" },
    坤: { element: "土", nature: "地" },
}

// 六十四卦卦辞（部分示例）
const HEXAGRAM_MEANINGS: Record<string, { name: string; meaning: string }> = {
    "111111": { name: "乾为天", meaning: "元亨利贞。刚健中正，自强不息。" },
    "000000": { name: "坤为地", meaning: "元亨，利牝马之贞。厚德载物，柔顺中正。" },
    "010001": { name: "水雷屯", meaning: "元亨利贞，勿用有攸往，利建侯。万事开头难，坚持终有成。" },
    "100010": { name: "山水蒙", meaning: "亨。匪我求童蒙，童蒙求我。启蒙教育，循序渐进。" },
    "010010": { name: "坎为水", meaning: "习坎，有孚，维心亨。涉险履难，诚信可济。" },
    "101101": { name: "离为火", meaning: "利贞，亨。光明正大，依附正道。" },
}

interface LiuyaoLine {
    position: number
    type: "yang" | "yin"
    changing: boolean
    coinResult?: number[]
    diZhi?: string
    liuQin?: string
    liuShen?: string
}

interface LiuyaoRequest {
    question?: string
    category?: string
    lines: LiuyaoLine[]
    method: "coin" | "time" | "number"
}

/**
 * 创建六爻占卜记录
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

        const body: LiuyaoRequest = await request.json()
        const { question, category, lines, method } = body

        if (!lines || lines.length !== 6) {
            return NextResponse.json(
                { error: "需要六爻数据" },
                { status: 400 }
            )
        }

        // 计算本卦二进制
        const benGuaBinary = lines
            .map((l) => (l.type === "yang" ? "1" : "0"))
            .join("")

        // 计算变卦二进制
        const hasChanging = lines.some((l) => l.changing)
        let bianGuaBinary = ""
        if (hasChanging) {
            bianGuaBinary = lines
                .map((l) => {
                    if (l.changing) {
                        return l.type === "yang" ? "0" : "1"
                    }
                    return l.type === "yang" ? "1" : "0"
                })
                .join("")
        }

        // 获取卦名和卦辞
        const benGua = HEXAGRAM_MEANINGS[benGuaBinary] || {
            name: "未知卦",
            meaning: "卦象待解",
        }
        const bianGua = bianGuaBinary
            ? HEXAGRAM_MEANINGS[bianGuaBinary] || { name: "变卦", meaning: "" }
            : null

        // 计算世爻应爻
        const shiYao = (parseInt(benGuaBinary, 2) % 6) + 1
        const yingYao = ((shiYao + 2) % 6) + 1

        // 构建卦象结果
        const hexagramResult = {
            benGua: {
                name: benGua.name,
                binary: benGuaBinary,
                meaning: benGua.meaning,
            },
            bianGua: bianGua
                ? {
                    name: bianGua.name,
                    binary: bianGuaBinary,
                    meaning: bianGua.meaning,
                }
                : null,
            shiYao,
            yingYao,
            changingLines: lines
                .filter((l) => l.changing)
                .map((l) => l.position),
        }

        // 保存到数据库
        const { data: record, error: insertError } = await supabase
            .from("liuyao_records")
            .insert({
                user_id: dbUserId,
                question,
                question_category: category,
                cast_method: method,
                yao_data: lines,
                hexagram_result: hexagramResult,
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
            type: "liuyao",
            recordId: (record as { id: string }).id,
            title: "六爻排盘",
            summary: `${benGua.name}${bianGua ? " → " + bianGua.name : ""}`,
        })
        if (!fortuneResult.ok) {
            console.error("保存六爻历史失败:", fortuneResult.error)
        }

        // 构建 AI 提示
        const changingLinesDesc = hexagramResult.changingLines.length > 0
            ? `动爻: ${hexagramResult.changingLines.join("、")}爻`
            : "无动爻"

        const prompt = `你是一位资深的六爻占卜师。请对以下卦象进行专业解读。

用户问题: ${question || "请为我解读此卦"}
问卦类别: ${category || "综合"}

本卦: ${benGua.name}
卦辞: ${benGua.meaning}
${bianGua ? `变卦: ${bianGua.name}\n卦辞: ${bianGua.meaning}` : ""}
${changingLinesDesc}
世爻: 第${shiYao}爻
应爻: 第${yingYao}爻

请给出详细的解读，包括:
1. 卦象总论
2. 六爻逐爻分析
3. 世应关系分析
4. 针对用户问题的具体建议
5. 吉凶判断与注意事项

请用中文回答。`

        // 尝试调用 AI
        let interpretation = ""
        const aiApiKey = process.env.AI_API_KEY

        if (aiApiKey) {
            try {
                const aiResponse = await fetch(
                    `${process.env.AI_BASE_URL || "https://api.deepseek.com"}/chat/completions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${aiApiKey}`,
                        },
                        body: JSON.stringify({
                            model: process.env.AI_MODEL || "deepseek-chat",
                            messages: [{ role: "user", content: prompt }],
                            temperature: 0.7,
                            max_tokens: 2000,
                        }),
                    }
                )

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json()
                    interpretation = aiData.choices?.[0]?.message?.content || ""

                    if (interpretation) {
                        await supabase
                            .from("liuyao_records")
                            .update({
                                ai_interpretation: interpretation,
                                ai_model: process.env.AI_MODEL || "deepseek-chat",
                                ai_generated_at: new Date().toISOString(),
                            } as never)
                            .eq("id", (record as { id: string }).id)
                    }
                }
            } catch (aiError) {
                console.error("AI 解读失败:", aiError)
            }
        }

        return NextResponse.json({
            success: true,
            record: {
                ...(record as object),
                hexagram_result: hexagramResult,
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
 * 获取六爻记录
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
            const { data, error } = await supabase
                .from("liuyao_records")
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
            const { data, error, count } = await supabase
                .from("liuyao_records")
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
