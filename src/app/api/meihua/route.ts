import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDbUserIdByClerkId } from "@/lib/auth/user"
import { logFortune } from "@/lib/history/log-fortune"

// 八卦基本信息
const BA_GUA: Record<string, { binary: string; element: string; nature: string }> = {
    乾: { binary: "111", element: "金", nature: "天" },
    兑: { binary: "011", element: "金", nature: "泽" },
    离: { binary: "101", element: "火", nature: "火" },
    震: { binary: "001", element: "木", nature: "雷" },
    巽: { binary: "110", element: "木", nature: "风" },
    坎: { binary: "010", element: "水", nature: "水" },
    艮: { binary: "100", element: "土", nature: "山" },
    坤: { binary: "000", element: "土", nature: "地" },
}

// 五行生克关系
const WUXING_RELATION: Record<string, Record<string, string>> = {
    金: { 金: "比和", 木: "我克", 水: "我生", 火: "克我", 土: "生我" },
    木: { 木: "比和", 土: "我克", 火: "我生", 金: "克我", 水: "生我" },
    水: { 水: "比和", 火: "我克", 木: "我生", 土: "克我", 金: "生我" },
    火: { 火: "比和", 金: "我克", 土: "我生", 水: "克我", 木: "生我" },
    土: { 土: "比和", 水: "我克", 金: "我生", 木: "克我", 火: "生我" },
}

interface MeihuaRequest {
    question?: string
    method: "time" | "number" | "word"
    input: string
    upperGua: string
    lowerGua: string
    movingLine: number
}

/**
 * 创建梅花易数记录
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

        const body: MeihuaRequest = await request.json()
        const { question, method, input, upperGua, lowerGua, movingLine } = body

        if (!upperGua || !lowerGua || !movingLine) {
            return NextResponse.json(
                { error: "缺少卦象数据" },
                { status: 400 }
            )
        }

        // 验证卦名
        if (!BA_GUA[upperGua] || !BA_GUA[lowerGua]) {
            return NextResponse.json(
                { error: "无效的卦名" },
                { status: 400 }
            )
        }

        // 计算本卦
        const upperBinary = BA_GUA[upperGua].binary
        const lowerBinary = BA_GUA[lowerGua].binary
        const benGuaBinary = upperBinary + lowerBinary
        const benGuaName = `${BA_GUA[upperGua].nature}${BA_GUA[lowerGua].nature}卦`

        // 计算互卦
        const huUpperBinary = benGuaBinary.slice(1, 4)
        const huLowerBinary = benGuaBinary.slice(2, 5)
        const huUpperGua =
            Object.entries(BA_GUA).find(([, v]) => v.binary === huUpperBinary)?.[0] || "未知"
        const huLowerGua =
            Object.entries(BA_GUA).find(([, v]) => v.binary === huLowerBinary)?.[0] || "未知"

        // 计算变卦
        const binaryArr = benGuaBinary.split("")
        binaryArr[6 - movingLine] = binaryArr[6 - movingLine] === "1" ? "0" : "1"
        const bianGuaBinary = binaryArr.join("")
        const bianUpperBinary = bianGuaBinary.slice(0, 3)
        const bianLowerBinary = bianGuaBinary.slice(3, 6)
        const bianUpperGua =
            Object.entries(BA_GUA).find(([, v]) => v.binary === bianUpperBinary)?.[0] || "未知"
        const bianLowerGua =
            Object.entries(BA_GUA).find(([, v]) => v.binary === bianLowerBinary)?.[0] || "未知"

        // 判断体用
        const isMovingInUpper = movingLine > 3
        const tiGua = isMovingInUpper ? lowerGua : upperGua
        const yongGua = isMovingInUpper ? upperGua : lowerGua
        const tiElement = BA_GUA[tiGua].element
        const yongElement = BA_GUA[yongGua].element
        const tiYongRelation = WUXING_RELATION[tiElement][yongElement]

        // 构建结果
        const meihuaResult = {
            benGua: { name: benGuaName, upper: upperGua, lower: lowerGua, binary: benGuaBinary },
            huGua: {
                name: `${BA_GUA[huUpperGua]?.nature || ""}${BA_GUA[huLowerGua]?.nature || ""}互卦`,
                upper: huUpperGua,
                lower: huLowerGua,
            },
            bianGua: {
                name: `${BA_GUA[bianUpperGua]?.nature || ""}${BA_GUA[bianLowerGua]?.nature || ""}变卦`,
                upper: bianUpperGua,
                lower: bianLowerGua,
            },
            movingLine,
            tiYong: {
                ti: tiGua,
                tiElement,
                yong: yongGua,
                yongElement,
                relation: tiYongRelation,
            },
        }

        // 保存到数据库
        const { data: record, error: insertError } = await supabase
            .from("meihua_records")
            .insert({
                user_id: dbUserId,
                question,
                cast_method: method,
                cast_input: input,
                meihua_result: meihuaResult,
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
            type: "meihua",
            recordId: (record as { id: string }).id,
            title: "梅花易数",
            summary: `${benGuaName} - 体${tiGua}(${tiElement}) ${tiYongRelation} 用${yongGua}(${yongElement})`,
        })
        if (!fortuneResult.ok) {
            console.error("保存梅花历史失败:", fortuneResult.error)
        }

        // 构建 AI 提示
        const prompt = `你是一位精通梅花易数的占卜师。请对以下卦象进行详细解读。

用户问题: ${question || "请为我解读此卦"}
起卦方式: ${method === "time" ? "时间起卦" : method === "number" ? "数字起卦" : "文字起卦"}
起卦依据: ${input}

本卦: ${benGuaName}
- 上卦: ${upperGua}(${BA_GUA[upperGua].element}/${BA_GUA[upperGua].nature})
- 下卦: ${lowerGua}(${BA_GUA[lowerGua].element}/${BA_GUA[lowerGua].nature})

互卦: ${meihuaResult.huGua.name}
- 上卦: ${huUpperGua}
- 下卦: ${huLowerGua}

变卦: ${meihuaResult.bianGua.name}
- 上卦: ${bianUpperGua}
- 下卦: ${bianLowerGua}

动爻: 第${movingLine}爻

体用关系:
- 体卦: ${tiGua}(${tiElement})
- 用卦: ${yongGua}(${yongElement})
- 关系: ${tiYongRelation}

请给出详细的解读，包括:
1. 卦象整体分析
2. 体用关系详解（${tiYongRelation}的含义）
3. 互卦和变卦分析
4. 针对用户问题的具体判断
5. 吉凶预测与建议

请用中文回答，语言专业但通俗易懂。`

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
                            .from("meihua_records")
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
                meihua_result: meihuaResult,
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
 * 获取梅花易数记录
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
                .from("meihua_records")
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
                .from("meihua_records")
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
