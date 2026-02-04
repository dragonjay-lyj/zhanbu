/**
 * 紫微斗数排盘算法
 * 基于 lunar-javascript 的农历数据实现
 */

import { Solar } from "lunar-javascript"

// 十四主星
const mainStars = [
    "紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府",
    "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"
]

// 六吉星
const luckyStars = ["左辅", "右弼", "天魁", "天钺", "文昌", "文曲"]

// 六煞星
const unluckyStars = ["擎羊", "陀罗", "火星", "铃星", "地劫", "天空"]

// 十二宫位
const palaceNames = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
    "迁移宫", "交友宫", "官禄宫", "田宅宫", "福德宫", "父母宫"
]

// 十二地支
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 五行局
const wuxingJu = ["水二局", "木三局", "金四局", "土五局", "火六局"]

// 宫位类型
interface Palace {
    name: string           // 宫位名称
    branch: string         // 地支
    mainStars: string[]    // 主星
    luckyStars: string[]   // 吉星
    unluckyStars: string[] // 煞星
    minorStars: string[]   // 其他星曜
    description: string    // 宫位说明
}

// 命盘类型
export interface ZiweiChart {
    birthInfo: {
        solar: { year: number; month: number; day: number; hour: number }
        lunar: { year: number; month: number; day: number }
        ganZhi: { year: string; month: string; day: string; hour: string }
    }
    wuxingJu: string       // 五行局
    shenGong: string       // 身宫位置
    mingGong: string       // 命宫地支
    palaces: Palace[]      // 十二宫位
    analysis: {
        career: string
        wealth: string
        love: string
        health: string
    }
}

/**
 * 计算命宫位置
 * 命宫 = 寅 + (生月 - 1) - (生时 / 2)
 */
function calculateMingGong(lunarMonth: number, birthHour: number): number {
    // 时辰转换（0-23 转 0-11）
    const shiChen = Math.floor((birthHour + 1) / 2) % 12
    // 寅的位置是 2
    const yinPos = 2
    // 计算命宫
    let mingGong = (yinPos + lunarMonth - 1 - shiChen + 12) % 12
    return mingGong
}

/**
 * 计算身宫位置
 * 身宫 = 寅 + (生月 - 1) + (生时 / 2)
 */
function calculateShenGong(lunarMonth: number, birthHour: number): number {
    const shiChen = Math.floor((birthHour + 1) / 2) % 12
    const yinPos = 2
    let shenGong = (yinPos + lunarMonth - 1 + shiChen) % 12
    return shenGong
}

/**
 * 计算五行局
 */
function calculateWuxingJu(yearGan: string, mingGongZhi: string): string {
    // 简化算法：根据年干和命宫地支计算
    const ganIndex = "甲乙丙丁戊己庚辛壬癸".indexOf(yearGan)
    const zhiIndex = earthlyBranches.indexOf(mingGongZhi)
    const juIndex = (ganIndex + zhiIndex) % 5
    return wuxingJu[juIndex]
}

/**
 * 安紫微星系
 */
function placeZiweiStars(ju: string, lunarDay: number): number[] {
    // 获取局数
    const juNum = parseInt(ju.charAt(1))
    // 紫微星位置计算（简化）
    const ziweiPos = (lunarDay + juNum - 1) % 12

    // 紫微星系：紫微、天机、太阳、武曲、天同、廉贞
    const positions: number[] = new Array(6).fill(-1)
    positions[0] = ziweiPos                    // 紫微
    positions[1] = (ziweiPos + 11) % 12        // 天机（逆一位）
    positions[2] = (ziweiPos + 9) % 12         // 太阳（逆三位）
    positions[3] = (ziweiPos + 8) % 12         // 武曲（逆四位）
    positions[4] = (ziweiPos + 7) % 12         // 天同（逆五位）
    positions[5] = (ziweiPos + 4) % 12         // 廉贞（逆八位）

    return positions
}

/**
 * 安天府星系
 */
function placeTianfuStars(ziweiPos: number): number[] {
    // 天府与紫微的对宫关系
    const tianfuPos = (12 - ziweiPos) % 12

    // 天府星系：天府、太阴、贪狼、巨门、天相、天梁、七杀、破军
    const positions: number[] = new Array(8).fill(-1)
    positions[0] = tianfuPos                   // 天府
    positions[1] = (tianfuPos + 1) % 12        // 太阴
    positions[2] = (tianfuPos + 2) % 12        // 贪狼
    positions[3] = (tianfuPos + 3) % 12        // 巨门
    positions[4] = (tianfuPos + 4) % 12        // 天相
    positions[5] = (tianfuPos + 5) % 12        // 天梁
    positions[6] = (tianfuPos + 6) % 12        // 七杀
    positions[7] = (tianfuPos + 10) % 12       // 破军

    return positions
}

/**
 * 生成宫位解读
 */
function generatePalaceDescription(palaceName: string, stars: string[]): string {
    if (stars.length === 0) return "宫位清淡，无主星坐守。"

    const starDescriptions: Record<string, string> = {
        "紫微": "帝星坐命，主贵气、领导力",
        "天机": "智慧星，主聪慧、善谋略",
        "太阳": "光明星，主名声、男贵人",
        "武曲": "财星，主正财、刚毅",
        "天同": "福星，主安逸、享乐",
        "廉贞": "正桃花、事业心强",
        "天府": "令星，主稳定、储蓄",
        "太阴": "田财星，主女贵人、房产",
        "贪狼": "偏桃花、欲望、才艺",
        "巨门": "暗曜，主口才、是非",
        "天相": "印星，主贵人提拔",
        "天梁": "荫星，主长辈庇护",
        "七杀": "将星，主权力、开创",
        "破军": "耗星，主变动、改革",
    }

    const descriptions = stars
        .filter(s => starDescriptions[s])
        .map(s => starDescriptions[s])

    return descriptions.join("；") || "星曜组合特殊。"
}

/**
 * 生成命盘分析
 */
function generateAnalysis(palaces: Palace[]): ZiweiChart["analysis"] {
    const mingPalace = palaces.find(p => p.name === "命宫")
    const caiPalace = palaces.find(p => p.name === "财帛宫")
    const fuqiPalace = palaces.find(p => p.name === "夫妻宫")
    const jiePalace = palaces.find(p => p.name === "疾厄宫")

    const hasLuckyStar = (p?: Palace) => p?.luckyStars.length || 0 > 0
    const hasUnluckyStar = (p?: Palace) => p?.unluckyStars.length || 0 > 0

    return {
        career: mingPalace?.mainStars.includes("紫微") || mingPalace?.mainStars.includes("天府")
            ? "事业运势上佳，有领导才能，适合从事管理或自主创业。"
            : mingPalace?.mainStars.includes("武曲")
                ? "善于理财，适合从事金融、财务相关工作。"
                : "事业稳步发展，宜脚踏实地，积累经验。",
        wealth: caiPalace?.mainStars.includes("武曲") || caiPalace?.mainStars.includes("天府")
            ? "财运亨通，有正财运，善于储蓄理财。"
            : hasLuckyStar(caiPalace)
                ? "财运中上，有贵人相助，收入稳定。"
                : "财运平稳，需勤俭持家，避免投机。",
        love: fuqiPalace?.mainStars.includes("太阴") || fuqiPalace?.mainStars.includes("天同")
            ? "感情生活和谐美满，伴侣温柔体贴。"
            : fuqiPalace?.mainStars.includes("贪狼")
                ? "感情丰富多彩，桃花运旺，需慎防诱惑。"
                : "感情运势平稳，需用心经营感情生活。",
        health: hasUnluckyStar(jiePalace)
            ? "需注意身体健康，定期体检，保持良好生活习惯。"
            : "身体健康状况良好，但仍需注意作息规律。",
    }
}

/**
 * 完整的紫微斗数排盘
 */
export function generateZiweiChart(
    birthYear: number,
    birthMonth: number,
    birthDay: number,
    birthHour: number,
    gender: "male" | "female" = "male"
): ZiweiChart {
    // 获取农历信息
    const solar = Solar.fromYmd(birthYear, birthMonth, birthDay)
    const lunar = solar.getLunar()
    const eightChar = lunar.getEightChar()

    // 计算命宫和身宫
    const lunarMonth = Math.abs(lunar.getMonth())
    const lunarDay = lunar.getDay()
    const mingGongIndex = calculateMingGong(lunarMonth, birthHour)
    const shenGongIndex = calculateShenGong(lunarMonth, birthHour)

    // 计算五行局
    const yearGan = eightChar.getYearGan()
    const wuxing = calculateWuxingJu(yearGan, earthlyBranches[mingGongIndex])

    // 安主星
    const ziweiPositions = placeZiweiStars(wuxing, lunarDay)
    const tianfuPositions = placeTianfuStars(ziweiPositions[0])

    // 构建十二宫
    const palaces: Palace[] = []
    for (let i = 0; i < 12; i++) {
        const palaceIndex = (mingGongIndex + 12 - i) % 12
        const branch = earthlyBranches[palaceIndex]

        // 收集该宫位的主星
        const starsInPalace: string[] = []

        // 紫微星系
        const ziweiStarNames = ["紫微", "天机", "太阳", "武曲", "天同", "廉贞"]
        ziweiPositions.forEach((pos, idx) => {
            if (pos === palaceIndex) starsInPalace.push(ziweiStarNames[idx])
        })

        // 天府星系
        const tianfuStarNames = ["天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"]
        tianfuPositions.forEach((pos, idx) => {
            if (pos === palaceIndex) starsInPalace.push(tianfuStarNames[idx])
        })

        // 简化的吉凶星安放
        const luckyInPalace: string[] = []
        const unluckyInPalace: string[] = []

        // 根据地支安吉星（简化）
        if (palaceIndex % 3 === 0) luckyInPalace.push(luckyStars[palaceIndex % luckyStars.length])
        if (palaceIndex % 4 === 0) unluckyInPalace.push(unluckyStars[palaceIndex % unluckyStars.length])

        palaces.push({
            name: palaceNames[i],
            branch,
            mainStars: starsInPalace,
            luckyStars: luckyInPalace,
            unluckyStars: unluckyInPalace,
            minorStars: [],
            description: generatePalaceDescription(palaceNames[i], starsInPalace),
        })
    }

    return {
        birthInfo: {
            solar: { year: birthYear, month: birthMonth, day: birthDay, hour: birthHour },
            lunar: { year: lunar.getYear(), month: lunarMonth, day: lunarDay },
            ganZhi: {
                year: eightChar.getYearGan() + eightChar.getYearZhi(),
                month: eightChar.getMonthGan() + eightChar.getMonthZhi(),
                day: eightChar.getDayGan() + eightChar.getDayZhi(),
                hour: eightChar.getTimeGan() + eightChar.getTimeZhi(),
            },
        },
        wuxingJu: wuxing,
        shenGong: palaceNames[(shenGongIndex - mingGongIndex + 12) % 12],
        mingGong: earthlyBranches[mingGongIndex],
        palaces,
        analysis: generateAnalysis(palaces),
    }
}
