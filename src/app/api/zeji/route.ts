import { NextRequest, NextResponse } from "next/server"

/**
 * 择吉选日 API
 */

// 事项类型
const eventTypes = [
    { id: "wedding", name: "婚嫁", icon: "💒", description: "结婚、订婚、提亲" },
    { id: "business", name: "开业", icon: "🏪", description: "开业、开张、签约" },
    { id: "move", name: "搬家", icon: "🏠", description: "乔迁、搬家、入宅" },
    { id: "travel", name: "出行", icon: "✈️", description: "旅行、出差、远行" },
    { id: "construction", name: "动土", icon: "🏗️", description: "破土、动土、装修" },
    { id: "burial", name: "安葬", icon: "⚱️", description: "下葬、迁坟、祭祀" },
    { id: "trade", name: "交易", icon: "🤝", description: "买卖、交易、合作" },
    { id: "haircut", name: "理发", icon: "💇", description: "剪发、染发、美容" },
]

// 宜忌项目
const activities = {
    yi: ["祭祀", "祈福", "求嗣", "开光", "出行", "解除", "纳采", "冠笄", "嫁娶", "纳婿", "雕刻", "开市", "立券", "纳财", "开仓", "出货", "纳畜", "牧养", "开渠", "穿井", "安碓硙", "开池", "造仓", "开厕", "造畜稠", "修造", "起基", "定磉", "造船", "开光", "安门"],
    ji: ["安葬", "破土", "掘井", "开池", "开渠", "作灶", "修造", "动土", "入殓", "移柩", "破土", "启攒", "安葬", "修坟", "立碑", "诸事不宜"],
}

// 天干地支
const tianGan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const diZhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 计算干支日
function getGanZhi(date: Date) {
    const baseDate = new Date(1900, 0, 31) // 甲子日
    const diff = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    const ganIndex = diff % 10
    const zhiIndex = diff % 12
    return tianGan[(ganIndex + 10) % 10] + diZhi[(zhiIndex + 12) % 12]
}

// 计算农历(简化版)
function getLunarDate(date: Date) {
    const lunarMonths = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"]
    const lunarDays = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"]

    // 简化计算，实际应使用农历算法库
    const day = date.getDate()
    const month = date.getMonth()
    return `${lunarMonths[month % 12]}${lunarDays[(day - 1) % 30]}`
}

// 判断日期吉凶
function getDateFortune(date: Date, eventType: string) {
    const dayOfWeek = date.getDay()
    const day = date.getDate()
    const month = date.getMonth() + 1

    // 简单的吉凶算法（实际应基于黄历数据）
    const seed = day + month * 31

    // 根据事项类型调整
    const typeIndex = eventTypes.findIndex(t => t.id === eventType)
    const adjustedSeed = (seed + typeIndex * 7) % 100

    // 计算分数
    let score = 50 + (adjustedSeed % 50)

    // 周末加分
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        score = Math.min(100, score + 10)
    }

    // 特殊日期调整
    if (day === 1 || day === 15) score = Math.min(100, score + 15)
    if (day === 4 || day === 13) score = Math.max(0, score - 20)

    // 生成宜忌
    const yiCount = Math.floor(score / 20) + 2
    const jiCount = Math.floor((100 - score) / 25) + 1

    const shuffledYi = [...activities.yi].sort(() => (seed % 100) / 100 - 0.5)
    const shuffledJi = [...activities.ji].sort(() => (seed % 50) / 50 - 0.5)

    return {
        score,
        level: score >= 80 ? "大吉" : score >= 60 ? "吉" : score >= 40 ? "平" : "凶",
        yi: shuffledYi.slice(0, yiCount),
        ji: shuffledJi.slice(0, jiCount),
    }
}

// 生成日期信息
function generateDateInfo(date: Date, eventType: string) {
    const fortune = getDateFortune(date, eventType)

    return {
        date: date.toISOString().split("T")[0],
        weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()],
        lunar: getLunarDate(date),
        ganzhi: getGanZhi(date),
        ...fortune,
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const eventType = searchParams.get("type")
        const startDate = searchParams.get("start")
        const endDate = searchParams.get("end")

        // 返回事项类型列表
        if (!eventType) {
            return NextResponse.json({
                success: true,
                data: { eventTypes },
            })
        }

        // 验证事项类型
        const event = eventTypes.find(t => t.id === eventType)
        if (!event) {
            return NextResponse.json({ error: "无效的事项类型" }, { status: 400 })
        }

        // 计算日期范围
        const start = startDate ? new Date(startDate) : new Date()
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)

        // 生成日期列表
        const dates = []
        const current = new Date(start)

        while (current <= end) {
            const info = generateDateInfo(new Date(current), eventType)
            dates.push(info)
            current.setDate(current.getDate() + 1)
        }

        // 筛选吉日（分数 >= 60）
        const auspiciousDates = dates.filter(d => d.score >= 60)

        return NextResponse.json({
            success: true,
            data: {
                event,
                dateRange: { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] },
                auspiciousDates,
                allDates: dates,
            },
        })
    } catch (error) {
        console.error("择吉选日 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
