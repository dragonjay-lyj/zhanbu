import { NextRequest, NextResponse } from "next/server"

/**
 * 八字合婚 API - 双方配对分析
 */

// 天干
const tianGan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
// 地支
const diZhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
// 生肖
const shengxiao = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
// 五行
const wuxing: Record<string, string> = {
    "甲": "木", "乙": "木", "丙": "火", "丁": "火", "戊": "土",
    "己": "土", "庚": "金", "辛": "金", "壬": "水", "癸": "水",
    "子": "水", "丑": "土", "寅": "木", "卯": "木", "辰": "土",
    "巳": "火", "午": "火", "未": "土", "申": "金", "酉": "金", "戌": "土", "亥": "水",
}

// 生肖配对表（相合程度：100=大吉, 80=吉, 60=中, 40=差, 20=凶）
const shengxiaoMatch: Record<string, Record<string, number>> = {
    "鼠": { "鼠": 70, "牛": 95, "虎": 60, "兔": 50, "龙": 90, "蛇": 70, "马": 30, "羊": 50, "猴": 90, "鸡": 70, "狗": 60, "猪": 80 },
    "牛": { "鼠": 95, "牛": 70, "虎": 50, "兔": 60, "龙": 70, "蛇": 85, "马": 40, "羊": 30, "猴": 60, "鸡": 90, "狗": 50, "猪": 70 },
    "虎": { "鼠": 60, "牛": 50, "虎": 70, "兔": 80, "龙": 75, "蛇": 40, "马": 90, "羊": 60, "猴": 30, "鸡": 50, "狗": 85, "猪": 85 },
    "兔": { "鼠": 50, "牛": 60, "虎": 80, "兔": 70, "龙": 40, "蛇": 60, "马": 70, "羊": 90, "猴": 60, "鸡": 30, "狗": 85, "猪": 90 },
    "龙": { "鼠": 90, "牛": 70, "虎": 75, "兔": 40, "龙": 70, "蛇": 80, "马": 70, "羊": 60, "猴": 90, "鸡": 85, "狗": 30, "猪": 75 },
    "蛇": { "鼠": 70, "牛": 85, "虎": 40, "兔": 60, "龙": 80, "蛇": 70, "马": 60, "羊": 50, "猴": 75, "鸡": 90, "狗": 60, "猪": 30 },
    "马": { "鼠": 30, "牛": 40, "虎": 90, "兔": 70, "龙": 70, "蛇": 60, "马": 70, "羊": 90, "猴": 60, "鸡": 50, "狗": 85, "猪": 70 },
    "羊": { "鼠": 50, "牛": 30, "虎": 60, "兔": 90, "龙": 60, "蛇": 50, "马": 90, "羊": 70, "猴": 60, "鸡": 50, "狗": 40, "猪": 85 },
    "猴": { "鼠": 90, "牛": 60, "虎": 30, "兔": 60, "龙": 90, "蛇": 75, "马": 60, "羊": 60, "猴": 70, "鸡": 70, "狗": 60, "猪": 40 },
    "鸡": { "鼠": 70, "牛": 90, "虎": 50, "兔": 30, "龙": 85, "蛇": 90, "马": 50, "羊": 50, "猴": 70, "鸡": 70, "狗": 40, "猪": 60 },
    "狗": { "鼠": 60, "牛": 50, "虎": 85, "兔": 85, "龙": 30, "蛇": 60, "马": 85, "羊": 40, "猴": 60, "鸡": 40, "狗": 70, "猪": 80 },
    "猪": { "鼠": 80, "牛": 70, "虎": 85, "兔": 90, "龙": 75, "蛇": 30, "马": 70, "羊": 85, "猴": 40, "鸡": 60, "狗": 80, "猪": 70 },
}

// 计算八字
function calculateBazi(year: number, month: number, day: number, hour: number) {
    // 年柱
    const yearGanIndex = (year - 4) % 10
    const yearZhiIndex = (year - 4) % 12
    const yearGan = tianGan[yearGanIndex]
    const yearZhi = diZhi[yearZhiIndex]

    // 月柱（简化计算）
    const monthGanBase = (yearGanIndex % 5) * 2
    const monthGanIndex = (monthGanBase + month - 1) % 10
    const monthZhiIndex = (month + 1) % 12
    const monthGan = tianGan[monthGanIndex]
    const monthZhi = diZhi[monthZhiIndex]

    // 日柱（简化计算）
    const baseDate = new Date(1900, 0, 31)
    const targetDate = new Date(year, month - 1, day)
    const dayDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    const dayGanIndex = dayDiff % 10
    const dayZhiIndex = dayDiff % 12
    const dayGan = tianGan[(dayGanIndex + 10) % 10]
    const dayZhi = diZhi[(dayZhiIndex + 12) % 12]

    // 时柱
    const hourZhiIndex = Math.floor((hour + 1) / 2) % 12
    const hourGanBase = (dayGanIndex % 5) * 2
    const hourGanIndex = (hourGanBase + hourZhiIndex) % 10
    const hourGan = tianGan[hourGanIndex]
    const hourZhi = diZhi[hourZhiIndex]

    return {
        year: yearGan + yearZhi,
        month: monthGan + monthZhi,
        day: dayGan + dayZhi,
        hour: hourGan + hourZhi,
        shengxiao: shengxiao[(year - 4) % 12],
    }
}

// 计算五行分布
function calculateWuxingDistribution(bazi: ReturnType<typeof calculateBazi>) {
    const distribution: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 }
    const chars = (bazi.year + bazi.month + bazi.day + bazi.hour).split("")

    for (const char of chars) {
        const element = wuxing[char]
        if (element) distribution[element]++
    }

    return distribution
}

// 五行互补分析
function analyzeWuxingComplement(dist1: Record<string, number>, dist2: Record<string, number>) {
    let complementScore = 0
    const elements = ["木", "火", "土", "金", "水"]
    const analysis: string[] = []

    for (const element of elements) {
        const count1 = dist1[element]
        const count2 = dist2[element]

        // 互补：一方缺、另一方多
        if (count1 === 0 && count2 >= 2) {
            complementScore += 15
            analysis.push(`男方缺${element}，女方${element}旺，互补良好`)
        } else if (count2 === 0 && count1 >= 2) {
            complementScore += 15
            analysis.push(`女方缺${element}，男方${element}旺，互补良好`)
        } else if (count1 >= 1 && count2 >= 1) {
            complementScore += 10
        }
    }

    return { score: Math.min(100, complementScore), analysis }
}

// 综合评分
function calculateOverallScore(
    shengxiaoScore: number,
    wuxingScore: number,
    dayMasterScore: number
) {
    const overall = Math.round(shengxiaoScore * 0.4 + wuxingScore * 0.35 + dayMasterScore * 0.25)

    let level: string
    let summary: string

    if (overall >= 85) {
        level = "上上婚"
        summary = "天作之合，百年好合，此婚大吉！"
    } else if (overall >= 70) {
        level = "上等婚"
        summary = "良缘天定，夫妻和睦，家庭美满。"
    } else if (overall >= 55) {
        level = "中等婚"
        summary = "姻缘可成，需多包容，经营婚姻。"
    } else if (overall >= 40) {
        level = "下等婚"
        summary = "略有不合，需多沟通，互相理解。"
    } else {
        level = "下下婚"
        summary = "配对欠佳，建议慎重考虑。"
    }

    return { score: overall, level, summary }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { male, female } = body

        // 验证输入
        if (!male || !female) {
            return NextResponse.json({ error: "请提供双方的生辰信息" }, { status: 400 })
        }

        const { year: mYear, month: mMonth, day: mDay, hour: mHour } = male
        const { year: fYear, month: fMonth, day: fDay, hour: fHour } = female

        if (!mYear || !mMonth || !mDay || !fYear || !fMonth || !fDay) {
            return NextResponse.json({ error: "生辰信息不完整" }, { status: 400 })
        }

        // 计算八字
        const maleBazi = calculateBazi(mYear, mMonth, mDay, mHour || 12)
        const femaleBazi = calculateBazi(fYear, fMonth, fDay, fHour || 12)

        // 生肖配对
        const shengxiaoScore = shengxiaoMatch[maleBazi.shengxiao]?.[femaleBazi.shengxiao] || 60

        // 五行分布
        const maleWuxing = calculateWuxingDistribution(maleBazi)
        const femaleWuxing = calculateWuxingDistribution(femaleBazi)
        const wuxingComplement = analyzeWuxingComplement(maleWuxing, femaleWuxing)

        // 日主配对（简化）
        const dayMasterScore = 70 + Math.floor(Math.random() * 20)

        // 综合评分
        const overall = calculateOverallScore(shengxiaoScore, wuxingComplement.score, dayMasterScore)

        return NextResponse.json({
            success: true,
            data: {
                male: {
                    bazi: maleBazi,
                    wuxing: maleWuxing,
                },
                female: {
                    bazi: femaleBazi,
                    wuxing: femaleWuxing,
                },
                analysis: {
                    shengxiao: {
                        male: maleBazi.shengxiao,
                        female: femaleBazi.shengxiao,
                        score: shengxiaoScore,
                        description: shengxiaoScore >= 80
                            ? `${maleBazi.shengxiao}${femaleBazi.shengxiao}相合，是绝佳的生肖配对！`
                            : shengxiaoScore >= 60
                                ? `${maleBazi.shengxiao}${femaleBazi.shengxiao}尚可，相处融洽。`
                                : `${maleBazi.shengxiao}${femaleBazi.shengxiao}需多磨合。`,
                    },
                    wuxing: {
                        score: wuxingComplement.score,
                        details: wuxingComplement.analysis,
                    },
                    dayMaster: {
                        score: dayMasterScore,
                    },
                    overall,
                },
            },
        })
    } catch (error) {
        console.error("八字合婚 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
