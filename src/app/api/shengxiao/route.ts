import { NextRequest, NextResponse } from "next/server"

/**
 * 生肖运程 API
 */

// 十二生肖数据
const zodiacAnimals = [
    { id: "rat", name: "鼠", emoji: "🐀", years: [2020, 2008, 1996, 1984, 1972, 1960] },
    { id: "ox", name: "牛", emoji: "🐂", years: [2021, 2009, 1997, 1985, 1973, 1961] },
    { id: "tiger", name: "虎", emoji: "🐅", years: [2022, 2010, 1998, 1986, 1974, 1962] },
    { id: "rabbit", name: "兔", emoji: "🐇", years: [2023, 2011, 1999, 1987, 1975, 1963] },
    { id: "dragon", name: "龙", emoji: "🐉", years: [2024, 2012, 2000, 1988, 1976, 1964] },
    { id: "snake", name: "蛇", emoji: "🐍", years: [2025, 2013, 2001, 1989, 1977, 1965] },
    { id: "horse", name: "马", emoji: "🐴", years: [2026, 2014, 2002, 1990, 1978, 1966] },
    { id: "goat", name: "羊", emoji: "🐏", years: [2027, 2015, 2003, 1991, 1979, 1967] },
    { id: "monkey", name: "猴", emoji: "🐒", years: [2028, 2016, 2004, 1992, 1980, 1968] },
    { id: "rooster", name: "鸡", emoji: "🐓", years: [2029, 2017, 2005, 1993, 1981, 1969] },
    { id: "dog", name: "狗", emoji: "🐕", years: [2030, 2018, 2006, 1994, 1982, 1970] },
    { id: "pig", name: "猪", emoji: "🐷", years: [2031, 2019, 2007, 1995, 1983, 1971] },
]

// 太岁关系
const taisuiRelations: Record<string, string[]> = {
    "犯太岁": [], // 当年生肖
    "冲太岁": [], // 对冲生肖
    "刑太岁": [], // 相刑生肖
    "害太岁": [], // 相害生肖
    "破太岁": [], // 相破生肖
}

// 根据年份计算太岁关系
function calculateTaisui(year: number) {
    const currentYearAnimal = zodiacAnimals[(year - 4) % 12]
    const currentIndex = zodiacAnimals.findIndex(a => a.id === currentYearAnimal.id)

    return {
        yearAnimal: currentYearAnimal,
        relations: {
            "犯太岁": [currentYearAnimal.name],
            "冲太岁": [zodiacAnimals[(currentIndex + 6) % 12].name],
            "刑太岁": [zodiacAnimals[(currentIndex + 3) % 12].name],
            "害太岁": [zodiacAnimals[(currentIndex + 5) % 12].name],
            "破太岁": [zodiacAnimals[(currentIndex + 9) % 12].name],
        }
    }
}

// 运势描述
const fortuneDescriptions = {
    year: {
        good: [
            "今年运势大旺，事业财运双收，是大展宏图的好年份。",
            "贵人运势极佳，遇到困难总有人相助，事半功倍。",
            "今年桃花运旺盛，单身者有望脱单，已婚者感情甜蜜。",
            "财运亨通，正财偏财皆有收获，适合投资理财。",
        ],
        medium: [
            "今年运势平稳，虽无大起大落，但稳中有进。",
            "上半年运势略有起伏，下半年渐入佳境。",
            "事业运势一般，需要多加努力才能有所突破。",
            "财运平平，适合守成，不宜冒险投资。",
        ],
        bad: [
            "今年运势欠佳，凡事宜保守，不宜冒进。",
            "犯太岁之年，需注意健康和人际关系。",
            "事业易遇阻碍，需要耐心等待时机。",
            "财运不佳，需注意开源节流，避免大额支出。",
        ],
    },
    month: {
        good: [
            "本月运势旺盛，适合开展新项目。",
            "贵人相助，工作进展顺利。",
            "感情运势良好，适合表白或约会。",
            "财运上升，有意外收入的可能。",
        ],
        medium: [
            "本月运势平稳，按部就班即可。",
            "工作中可能有小挑战，但能顺利解决。",
            "感情需要多沟通，避免误会。",
            "财运一般，适合储蓄。",
        ],
        bad: [
            "本月运势较弱，需要注意小人。",
            "工作压力较大，注意劳逸结合。",
            "感情可能有小波折，需要耐心。",
            "财运不佳，避免冲动消费。",
        ],
    },
}

// 生成运势
function generateFortune(animal: string, period: "year" | "month", year: number) {
    const taisui = calculateTaisui(year)
    const animalData = zodiacAnimals.find(a => a.id === animal)
    if (!animalData) return null

    // 检查太岁关系
    let taisuiStatus = "无"
    let fortuneLevel: "good" | "medium" | "bad" = "medium"

    for (const [relation, animals] of Object.entries(taisui.relations)) {
        if (animals.includes(animalData.name)) {
            taisuiStatus = relation
            fortuneLevel = "bad"
            break
        }
    }

    // 使用生肖索引生成伪随机
    const index = zodiacAnimals.findIndex(a => a.id === animal)
    const seed = (index + year) % 10

    if (seed >= 7) fortuneLevel = "good"
    else if (seed >= 4 && taisuiStatus === "无") fortuneLevel = "medium"

    const descriptions = period === "year" ? fortuneDescriptions.year : fortuneDescriptions.month
    const descList = descriptions[fortuneLevel]
    const description = descList[seed % descList.length]

    // 计算各项分数
    const baseScore = fortuneLevel === "good" ? 80 : fortuneLevel === "medium" ? 60 : 40
    const randomOffset = (s: number) => (seed * s) % 15

    return {
        animal: animalData,
        period,
        year,
        taisui: {
            yearAnimal: taisui.yearAnimal,
            status: taisuiStatus,
        },
        fortune: {
            level: fortuneLevel,
            description,
            scores: {
                overall: baseScore + randomOffset(1),
                career: baseScore + randomOffset(2) - 5,
                wealth: baseScore + randomOffset(3) - 3,
                love: baseScore + randomOffset(4) - 2,
                health: baseScore + randomOffset(5) + 2,
            },
            lucky: {
                colors: ["红色", "金色", "黄色"][seed % 3],
                numbers: [seed + 1, (seed * 2 + 3) % 10],
                direction: ["东", "南", "西", "北"][seed % 4],
            },
            advice: fortuneLevel === "bad"
                ? "建议佩戴红绳或本命佛，多行善事化解太岁。"
                : fortuneLevel === "good"
                    ? "运势大好，把握机会，积极进取。"
                    : "保持平常心，稳扎稳打，静待时机。"
        },
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const animal = searchParams.get("animal")
        const period = (searchParams.get("period") || "year") as "year" | "month"
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

        // 返回所有生肖列表
        if (!animal) {
            const taisui = calculateTaisui(year)
            return NextResponse.json({
                success: true,
                data: {
                    animals: zodiacAnimals,
                    year,
                    taisui,
                },
            })
        }

        // 验证生肖
        const animalData = zodiacAnimals.find(a => a.id === animal)
        if (!animalData) {
            return NextResponse.json({ error: "无效的生肖" }, { status: 400 })
        }

        // 生成运势
        const fortune = generateFortune(animal, period, year)

        return NextResponse.json({
            success: true,
            data: fortune,
        })
    } catch (error) {
        console.error("生肖运程 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 根据出生年份获取生肖
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { birthYear } = body

        if (!birthYear) {
            return NextResponse.json({ error: "请提供出生年份" }, { status: 400 })
        }

        const year = parseInt(birthYear)
        const animalIndex = (year - 4) % 12
        const animal = zodiacAnimals[animalIndex]

        return NextResponse.json({
            success: true,
            data: { animal },
        })
    } catch (error) {
        console.error("生肖计算 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
