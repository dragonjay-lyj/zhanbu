/**
 * 农历计算服务
 * 基于 lunar-javascript 库实现精确的农历、节气计算
 */

import { Solar, Lunar, HolidayUtil } from "lunar-javascript"

// 八字类型
export interface BaziInfo {
    year: { gan: string; zhi: string }
    month: { gan: string; zhi: string }
    day: { gan: string; zhi: string }
    hour: { gan: string; zhi: string }
    // 完整八字字符串
    fullBazi: string
    // 五行统计
    wuxing: Record<string, number>
    // 日主
    dayMaster: string
    // 身强身弱
    strength: "strong" | "weak" | "balanced"
}

// 农历信息类型
export interface LunarInfo {
    year: number
    month: number
    day: number
    yearGanZhi: string
    monthGanZhi: string
    dayGanZhi: string
    zodiac: string           // 生肖
    lunarMonthName: string   // 农历月名（如：正月、腊月）
    lunarDayName: string     // 农历日名（如：初一、十五）
    isLeapMonth: boolean     // 是否闰月
    jieQi: string | null     // 当日节气
    festivals: string[]      // 节日列表
}

// 节气信息
export interface JieQiInfo {
    name: string
    date: Date
    solar: { year: number; month: number; day: number }
}

// 天干五行映射
const ganWuxing: Record<string, string> = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

// 地支五行映射
const zhiWuxing: Record<string, string> = {
    "子": "水", "丑": "土", "寅": "木", "卯": "木",
    "辰": "土", "巳": "火", "午": "火", "未": "土",
    "申": "金", "酉": "金", "戌": "土", "亥": "水",
}

/**
 * 获取精确的农历信息
 */
export function getLunarInfo(date: Date): LunarInfo {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()

    // 获取节日
    const festivals: string[] = []
    // 农历节日
    const lunarFestivals = lunar.getFestivals()
    if (lunarFestivals && lunarFestivals.length > 0) {
        festivals.push(...lunarFestivals)
    }
    // 公历节日
    const solarFestivals = solar.getFestivals()
    if (solarFestivals && solarFestivals.length > 0) {
        festivals.push(...solarFestivals)
    }

    return {
        year: lunar.getYear(),
        month: lunar.getMonth(),
        day: lunar.getDay(),
        yearGanZhi: lunar.getYearInGanZhi(),
        monthGanZhi: lunar.getMonthInGanZhi(),
        dayGanZhi: lunar.getDayInGanZhi(),
        zodiac: lunar.getYearShengXiao(),
        lunarMonthName: lunar.getMonthInChinese() + "月",
        lunarDayName: lunar.getDayInChinese(),
        isLeapMonth: lunar.getMonth() < 0,
        jieQi: lunar.getJieQi(),
        festivals,
    }
}

/**
 * 计算精确的八字
 * @param birthDate 出生日期
 * @param birthHour 出生时辰（0-23）
 */
export function calculateBazi(birthDate: Date, birthHour: number): BaziInfo {
    const solar = Solar.fromDate(birthDate)
    const lunar = solar.getLunar()
    const eightChar = lunar.getEightChar()

    // 获取四柱（需要根据时辰调整）
    const yearGan = eightChar.getYearGan()
    const yearZhi = eightChar.getYearZhi()
    const monthGan = eightChar.getMonthGan()
    const monthZhi = eightChar.getMonthZhi()
    const dayGan = eightChar.getDayGan()
    const dayZhi = eightChar.getDayZhi()

    // 计算时柱
    const hourZhiIndex = Math.floor((birthHour + 1) / 2) % 12
    const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
    const hourZhi = zhiList[hourZhiIndex]

    // 时干根据日干计算（日上起时法）
    const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
    const dayGanIndex = ganList.indexOf(dayGan)
    const hourGanStartIndex = (dayGanIndex % 5) * 2
    const hourGan = ganList[(hourGanStartIndex + hourZhiIndex) % 10]

    // 统计五行
    const wuxing: Record<string, number> = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 }
    const allGan = [yearGan, monthGan, dayGan, hourGan]
    const allZhi = [yearZhi, monthZhi, dayZhi, hourZhi]

    allGan.forEach(g => { wuxing[ganWuxing[g]] = (wuxing[ganWuxing[g]] || 0) + 1 })
    allZhi.forEach(z => { wuxing[zhiWuxing[z]] = (wuxing[zhiWuxing[z]] || 0) + 1 })

    // 判断身强身弱（简化算法）
    const dayElement = ganWuxing[dayGan]
    const dayScore = wuxing[dayElement]
    const totalScore = Object.values(wuxing).reduce((a, b) => a + b, 0)
    let strength: "strong" | "weak" | "balanced" = "balanced"
    if (dayScore >= totalScore * 0.4) strength = "strong"
    else if (dayScore <= totalScore * 0.2) strength = "weak"

    return {
        year: { gan: yearGan, zhi: yearZhi },
        month: { gan: monthGan, zhi: monthZhi },
        day: { gan: dayGan, zhi: dayZhi },
        hour: { gan: hourGan, zhi: hourZhi },
        fullBazi: `${yearGan}${yearZhi} ${monthGan}${monthZhi} ${dayGan}${dayZhi} ${hourGan}${hourZhi}`,
        wuxing,
        dayMaster: dayGan,
        strength,
    }
}

/**
 * 获取一年的所有节气
 */
export function getYearJieQi(year: number): JieQiInfo[] {
    const jieQiList: JieQiInfo[] = []
    const solar = Solar.fromYmd(year, 1, 1)

    // 获取该年的所有节气（从立春开始）
    for (let month = 1; month <= 12; month++) {
        const s = Solar.fromYmd(year, month, 1)
        const lunar = s.getLunar()

        // 获取当月的节气
        const jieQiTable = lunar.getJieQiTable()
        for (const [name, jq] of Object.entries(jieQiTable)) {
            if (jq) {
                const jqSolar = (jq as any).getSolar()
                if (jqSolar && jqSolar.getYear() === year) {
                    jieQiList.push({
                        name,
                        date: jqSolar.toDate(),
                        solar: {
                            year: jqSolar.getYear(),
                            month: jqSolar.getMonth(),
                            day: jqSolar.getDay(),
                        },
                    })
                }
            }
        }
    }

    // 去重并排序
    const seen = new Set<string>()
    return jieQiList
        .filter(jq => {
            const key = `${jq.name}-${jq.solar.month}-${jq.solar.day}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * 获取指定日期的宜忌
 */
export function getDayYiJi(date: Date): { yi: string[]; ji: string[] } {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()

    return {
        yi: lunar.getDayYi() || [],
        ji: lunar.getDayJi() || [],
    }
}

/**
 * 判断日期吉凶
 */
export function isAuspiciousDay(date: Date, event?: string): { level: "吉" | "平" | "凶"; reason: string } {
    const { yi, ji } = getDayYiJi(date)

    if (event) {
        if (yi.includes(event)) return { level: "吉", reason: `宜${event}` }
        if (ji.includes(event)) return { level: "凶", reason: `忌${event}` }
        return { level: "平", reason: "无特别宜忌" }
    }

    // 通用判断
    if (yi.length > ji.length) return { level: "吉", reason: `宜事较多` }
    if (ji.length > yi.length) return { level: "凶", reason: `忌事较多` }
    return { level: "平", reason: "宜忌均衡" }
}
