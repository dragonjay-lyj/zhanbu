import { NextRequest, NextResponse } from "next/server"

/**
 * 流年运势 API - 年度运势曲线
 */

// 天干
const tianGan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
// 地支
const diZhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 计算年份的干支
function getYearGanzhi(year: number) {
    const ganIndex = (year - 4) % 10
    const zhiIndex = (year - 4) % 12
    return tianGan[ganIndex] + diZhi[zhiIndex]
}

// 运势类型
const fortuneTypes = ["事业", "财运", "感情", "健康", "学业"]

// 生成月度运势曲线
function generateMonthlyFortune(birthYear: number, targetYear: number) {
    const birthGan = (birthYear - 4) % 10
    const targetGan = (targetYear - 4) % 10
    const ageDiff = targetYear - birthYear

    // 基础分数根据天干关系计算
    const ganDiff = Math.abs(birthGan - targetGan)
    let baseScore = 60

    // 天干相生相克影响
    if (ganDiff === 0) baseScore += 10 // 同干
    else if (ganDiff === 5) baseScore -= 10 // 对冲
    else if (ganDiff === 1 || ganDiff === 9) baseScore += 5 // 相邻

    // 年龄影响
    if (ageDiff % 12 === 0) baseScore -= 8 // 本命年

    // 生成12个月的运势
    const months = []
    for (let i = 1; i <= 12; i++) {
        const seed = (birthYear * 31 + targetYear * 13 + i * 7) % 100
        const variance = (seed % 30) - 15
        const score = Math.max(20, Math.min(95, baseScore + variance))

        months.push({
            month: i,
            score: Math.round(score),
            level: score >= 75 ? "旺" : score >= 50 ? "平" : "弱",
        })
    }

    return months
}

// 生成各方面运势
function generateCategoryFortune(birthYear: number, targetYear: number) {
    const result: Record<string, { score: number; description: string }> = {}
    const seed = (birthYear * 17 + targetYear * 23) % 100

    for (let i = 0; i < fortuneTypes.length; i++) {
        const type = fortuneTypes[i]
        const variance = ((seed * (i + 1)) % 40) - 20
        const score = Math.max(30, Math.min(95, 60 + variance))

        let description: string
        if (score >= 80) {
            description = `${type}运势大旺，把握机遇可有大收获。`
        } else if (score >= 60) {
            description = `${type}运势平稳，稳扎稳打可有所成。`
        } else if (score >= 40) {
            description = `${type}运势一般，需多努力突破瓶颈。`
        } else {
            description = `${type}运势较弱，宜守不宜攻。`
        }

        result[type] = { score: Math.round(score), description }
    }

    return result
}

// 生成年度建议
function generateAdvice(overallScore: number) {
    if (overallScore >= 80) {
        return [
            "今年运势大好，适合开展新项目、创业投资。",
            "贵人运旺，多参加社交活动可遇良机。",
            "把握上半年的好运势，积极进取。",
        ]
    } else if (overallScore >= 60) {
        return [
            "运势平稳，适合稳步发展，巩固现有成果。",
            "多学习提升，为未来机遇做准备。",
            "保持良好的人际关系，有助于事业发展。",
        ]
    } else {
        return [
            "今年运势较弱，宜守不宜攻，避免大的变动。",
            "注意身体健康，保持良好的生活习惯。",
            "多行善事积累福德，静待运势好转。",
        ]
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const birthYear = searchParams.get("birthYear")
        const targetYear = searchParams.get("year")

        if (!birthYear) {
            // 返回可选年份范围
            const currentYear = new Date().getFullYear()
            return NextResponse.json({
                success: true,
                data: {
                    yearRange: {
                        min: currentYear - 5,
                        max: currentYear + 10,
                        current: currentYear,
                    },
                },
            })
        }

        const birth = parseInt(birthYear)
        const target = targetYear ? parseInt(targetYear) : new Date().getFullYear()

        // 验证年份
        if (birth < 1900 || birth > new Date().getFullYear()) {
            return NextResponse.json({ error: "出生年份无效" }, { status: 400 })
        }

        // 生成流年运势
        const monthlyFortune = generateMonthlyFortune(birth, target)
        const categoryFortune = generateCategoryFortune(birth, target)

        // 计算综合分数
        const overallScore = Math.round(
            monthlyFortune.reduce((sum, m) => sum + m.score, 0) / 12
        )

        // 年份干支
        const ganzhi = getYearGanzhi(target)

        return NextResponse.json({
            success: true,
            data: {
                birthYear: birth,
                targetYear: target,
                ganzhi,
                age: target - birth,
                overall: {
                    score: overallScore,
                    level: overallScore >= 75 ? "吉" : overallScore >= 50 ? "平" : "凶",
                },
                monthly: monthlyFortune,
                categories: categoryFortune,
                advice: generateAdvice(overallScore),
            },
        })
    } catch (error) {
        console.error("流年运势 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
