import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logFortune } from "@/lib/history/log-fortune"

/**
 * 星座运势 API
 */

// 十二星座数据
const zodiacSigns = [
    { id: "aries", name: "白羊座", symbol: "♈", dates: "3/21-4/19", element: "火" },
    { id: "taurus", name: "金牛座", symbol: "♉", dates: "4/20-5/20", element: "土" },
    { id: "gemini", name: "双子座", symbol: "♊", dates: "5/21-6/21", element: "风" },
    { id: "cancer", name: "巨蟹座", symbol: "♋", dates: "6/22-7/22", element: "水" },
    { id: "leo", name: "狮子座", symbol: "♌", dates: "7/23-8/22", element: "火" },
    { id: "virgo", name: "处女座", symbol: "♍", dates: "8/23-9/22", element: "土" },
    { id: "libra", name: "天秤座", symbol: "♎", dates: "9/23-10/23", element: "风" },
    { id: "scorpio", name: "天蝎座", symbol: "♏", dates: "10/24-11/22", element: "水" },
    { id: "sagittarius", name: "射手座", symbol: "♐", dates: "11/23-12/21", element: "火" },
    { id: "capricorn", name: "摩羯座", symbol: "♑", dates: "12/22-1/19", element: "土" },
    { id: "aquarius", name: "水瓶座", symbol: "♒", dates: "1/20-2/18", element: "风" },
    { id: "pisces", name: "双鱼座", symbol: "♓", dates: "2/19-3/20", element: "水" },
]

// 运势描述池
const fortuneDescriptions = {
    overall: [
        "今日整体运势极佳，适合开展新计划，把握机遇。",
        "运势平稳，按部就班处理事务会有不错的收获。",
        "运势有小波动，保持冷静理性处理问题。",
        "贵人相助，事业发展顺利，要懂得感恩。",
        "运势上升，之前的努力将开始显现成果。",
        "今日宜静不宜动，适合思考和规划。",
        "创意灵感爆发，适合从事创作相关工作。",
        "社交运势旺盛，有机会结识新朋友。",
    ],
    love: [
        "感情运势良好，单身者有望遇到心仪对象。",
        "与伴侣关系稳定，适合一起规划未来。",
        "桃花运旺盛，但要谨慎选择。",
        "今日适合表白，成功率较高。",
        "感情需要多一些沟通和理解。",
        "旧情有复燃迹象，需要认真思考。",
        "单身者今日魅力倍增，多参加社交活动。",
        "与伴侣可能有小争执，但很快就能和好。",
    ],
    career: [
        "工作效率高，容易得到领导赏识。",
        "适合洽谈合作项目，成功率较高。",
        "工作中可能遇到小挑战，但能顺利解决。",
        "有晋升机会，要好好把握。",
        "今日适合学习新技能，提升专业能力。",
        "团队合作顺利，分工明确效率高。",
        "创业者今日有好消息。",
        "工作压力较大，注意劳逸结合。",
    ],
    wealth: [
        "财运亨通，有意外收入的可能。",
        "投资需谨慎，不宜冒险。",
        "正财收入稳定，偏财运一般。",
        "有贵人指点理财方向。",
        "适合制定理财计划。",
        "购物欲较强，需要控制消费。",
        "有加薪的机会，要主动争取。",
        "财运平稳，适合储蓄。",
    ],
    health: [
        "身体状况良好，精力充沛。",
        "注意休息，避免过度劳累。",
        "适合运动健身，增强体质。",
        "饮食需要注意，少吃辛辣。",
        "睡眠质量可能不佳，需要调整作息。",
        "心情愉悦，身心健康。",
        "注意保暖，预防感冒。",
        "适合户外活动，呼吸新鲜空气。",
    ],
}

// 幸运元素池
const luckyElements = {
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    colors: ["红色", "橙色", "黄色", "绿色", "蓝色", "紫色", "粉色", "白色", "金色"],
    directions: ["东", "南", "西", "北", "东北", "东南", "西北", "西南"],
}

// 生成随机运势
function generateFortune(sign: string, period: string, date: Date) {
    // 使用日期和星座生成伪随机种子
    const seed = date.getDate() + date.getMonth() * 31 + zodiacSigns.findIndex(z => z.id === sign) * 100
    const random = (max: number, offset = 0) => (seed + offset) % max

    const getScore = (offset: number) => 60 + random(40, offset)
    const getDesc = (arr: string[], offset: number) => arr[random(arr.length, offset)]
    const getLucky = <T,>(arr: T[], offset: number) => arr[random(arr.length, offset)]

    // 根据周期调整
    const periodMultiplier = period === "daily" ? 1 : period === "weekly" ? 7 : 30

    return {
        overall: {
            score: getScore(1),
            description: getDesc(fortuneDescriptions.overall, 1),
        },
        love: {
            score: getScore(2 * periodMultiplier),
            description: getDesc(fortuneDescriptions.love, 2),
        },
        career: {
            score: getScore(3 * periodMultiplier),
            description: getDesc(fortuneDescriptions.career, 3),
        },
        wealth: {
            score: getScore(4 * periodMultiplier),
            description: getDesc(fortuneDescriptions.wealth, 4),
        },
        health: {
            score: getScore(5 * periodMultiplier),
            description: getDesc(fortuneDescriptions.health, 5),
        },
        lucky: {
            number: getLucky(luckyElements.numbers, 6),
            color: getLucky(luckyElements.colors, 7),
            direction: getLucky(luckyElements.directions, 8),
        },
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const sign = searchParams.get("sign")
        const period = searchParams.get("period") || "daily"

        // 返回所有星座列表
        if (!sign) {
            return NextResponse.json({
                success: true,
                data: { signs: zodiacSigns },
            })
        }

        // 验证星座
        const zodiac = zodiacSigns.find(z => z.id === sign)
        if (!zodiac) {
            return NextResponse.json({ error: "无效的星座" }, { status: 400 })
        }

        // 生成运势
        const fortune = generateFortune(sign, period, new Date())

        const responseData = {
            success: true,
            data: {
                sign: zodiac,
                period,
                date: new Date().toISOString().split("T")[0],
                fortune,
            },
        }

        const { userId } = await auth()
        if (userId) {
            const logResult = await logFortune({
                clerkUserId: userId,
                type: "zodiac",
                title: `星座运势 · ${zodiac.name}`,
                summary: `${period} · 综合 ${fortune.overall.score} 分`,
            })
            if (!logResult.ok) {
                console.error("星座历史记录失败:", logResult.error)
            }
        }

        return NextResponse.json(responseData)
    } catch (error) {
        console.error("星座运势 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 根据生日获取星座
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { month, day } = body

        if (!month || !day) {
            return NextResponse.json({ error: "请提供生日月份和日期" }, { status: 400 })
        }

        // 计算星座
        const zodiacRanges = [
            { sign: "capricorn", start: [1, 1], end: [1, 19] },
            { sign: "aquarius", start: [1, 20], end: [2, 18] },
            { sign: "pisces", start: [2, 19], end: [3, 20] },
            { sign: "aries", start: [3, 21], end: [4, 19] },
            { sign: "taurus", start: [4, 20], end: [5, 20] },
            { sign: "gemini", start: [5, 21], end: [6, 21] },
            { sign: "cancer", start: [6, 22], end: [7, 22] },
            { sign: "leo", start: [7, 23], end: [8, 22] },
            { sign: "virgo", start: [8, 23], end: [9, 22] },
            { sign: "libra", start: [9, 23], end: [10, 23] },
            { sign: "scorpio", start: [10, 24], end: [11, 22] },
            { sign: "sagittarius", start: [11, 23], end: [12, 21] },
            { sign: "capricorn", start: [12, 22], end: [12, 31] },
        ]

        const m = parseInt(month)
        const d = parseInt(day)

        let foundSign = "aries"
        for (const range of zodiacRanges) {
            const [startM, startD] = range.start
            const [endM, endD] = range.end
            if ((m === startM && d >= startD) || (m === endM && d <= endD)) {
                foundSign = range.sign
                break
            }
        }

        const zodiac = zodiacSigns.find(z => z.id === foundSign)

        const responseData = {
            success: true,
            data: { sign: zodiac },
        }

        const { userId } = await auth()
        if (userId && zodiac) {
            const logResult = await logFortune({
                clerkUserId: userId,
                type: "zodiac",
                title: "星座查询",
                summary: `生日 ${m}/${d} · 星座 ${zodiac.name}`,
            })
            if (!logResult.ok) {
                console.error("星座历史记录失败:", logResult.error)
            }
        }

        return NextResponse.json(responseData)
    } catch (error) {
        console.error("星座计算 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
