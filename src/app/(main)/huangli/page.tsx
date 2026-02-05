"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Sun,
    Moon,
    ChevronLeft,
    ChevronRight,
    Info,
    CheckCircle,
    XCircle,
    Clock,
    Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useI18n, useTranslation, formatMessage } from "@/lib/i18n"

// 天干地支
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]

// 廿八宿
const ERBA_XIU = [
    "角", "亢", "氐", "房", "心", "尾", "箕",
    "斗", "牛", "女", "虚", "危", "室", "壁",
    "奎", "娄", "胃", "昴", "毕", "觜", "参",
    "井", "鬼", "柳", "星", "张", "翼", "轸"
]

// 宜忌事项
const YI_ITEMS = [
    "嫁娶", "开业", "动土", "入宅", "出行", "祭祀", "祈福", "求嗣",
    "安葬", "破土", "修造", "装修", "订盟", "纳采", "会亲友", "开光",
    "搬家", "立券", "交易", "挂匾", "安床", "栽种", "牧养", "纳畜",
]

const JI_ITEMS = [
    "诸事不宜", "嫁娶", "出行", "入宅", "开业", "动土", "安葬", "破土",
    "祭祀", "祈福", "求嗣", "装修", "开光", "搬家", "栽种",
]

// 时辰吉凶
const SHICHEN = [
    { name: "子时", range: "23:00-01:00", zhi: "子" },
    { name: "丑时", range: "01:00-03:00", zhi: "丑" },
    { name: "寅时", range: "03:00-05:00", zhi: "寅" },
    { name: "卯时", range: "05:00-07:00", zhi: "卯" },
    { name: "辰时", range: "07:00-09:00", zhi: "辰" },
    { name: "巳时", range: "09:00-11:00", zhi: "巳" },
    { name: "午时", range: "11:00-13:00", zhi: "午" },
    { name: "未时", range: "13:00-15:00", zhi: "未" },
    { name: "申时", range: "15:00-17:00", zhi: "申" },
    { name: "酉时", range: "17:00-19:00", zhi: "酉" },
    { name: "戌时", range: "19:00-21:00", zhi: "戌" },
    { name: "亥时", range: "21:00-23:00", zhi: "亥" },
]

interface HuangliData {
    date: Date
    lunar: { year: number; month: number; day: number; monthName: string; dayName: string }
    ganZhi: { year: string; month: string; day: string }
    zodiac: string
    xingXiu: string
    pengZu: string[]
    chongSha: { chong: string; sha: string }
    yi: string[]
    ji: string[]
    shiChen: { name: string; range: string; jiXiong: "吉" | "凶" | "中" }[]
    jieQi?: string
    festival?: string
}

/**
 * 黄历查询页面
 */
export default function HuangliPage() {
    const { locale } = useI18n()
    const { t } = useTranslation()
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [huangliData, setHuangliData] = useState<HuangliData | null>(null)

    const jiXiongLabels: Record<"吉" | "凶" | "中", string> = {
        吉: t("pages.huangli.jiXiong.good"),
        凶: t("pages.huangli.jiXiong.bad"),
        中: t("pages.huangli.jiXiong.neutral"),
    }

    const directionLabels: Record<string, string> = {
        东: t("pages.huangli.directions.east"),
        南: t("pages.huangli.directions.south"),
        西: t("pages.huangli.directions.west"),
        北: t("pages.huangli.directions.north"),
    }

    // 农历月份名
    const lunarMonthNames = [
        "正月", "二月", "三月", "四月", "五月", "六月",
        "七月", "八月", "九月", "十月", "冬月", "腊月"
    ]

    // 农历日期名
    const lunarDayNames = [
        "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
        "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
        "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
    ]

    // 计算黄历数据
    const calculateHuangli = (date: Date): HuangliData => {
        const baseDate = new Date(1900, 0, 31)
        const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))

        // 计算干支
        const yearGanIndex = (date.getFullYear() - 4) % 10
        const yearZhiIndex = (date.getFullYear() - 4) % 12
        const dayGanIndex = (diffDays % 10 + 10) % 10
        const dayZhiIndex = (diffDays % 12 + 12) % 12

        // 简化的农历计算
        const lunarMonth = ((date.getMonth() + 11) % 12) + 1
        const lunarDay = ((date.getDate() + 28) % 30) + 1

        // 伪随机生成宜忌
        const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear()
        const randomItems = (items: string[], count: number) => {
            const shuffled = [...items].sort(() => Math.sin(seed * 9999) - 0.5)
            return shuffled.slice(0, count)
        }

        return {
            date,
            lunar: {
                year: date.getFullYear(),
                month: lunarMonth,
                day: lunarDay,
                monthName: lunarMonthNames[(lunarMonth - 1) % 12],
                dayName: lunarDayNames[(lunarDay - 1) % 30],
            },
            ganZhi: {
                year: TIAN_GAN[yearGanIndex] + DI_ZHI[yearZhiIndex],
                month: TIAN_GAN[(yearGanIndex * 2 + date.getMonth()) % 10] + DI_ZHI[(date.getMonth() + 2) % 12],
                day: TIAN_GAN[dayGanIndex] + DI_ZHI[dayZhiIndex],
            },
            zodiac: ZODIAC[yearZhiIndex],
            xingXiu: ERBA_XIU[diffDays % 28],
            pengZu: [
                `${TIAN_GAN[dayGanIndex]}不开仓财物耗散`,
                `${DI_ZHI[dayZhiIndex]}不词讼理弱敌强`
            ],
            chongSha: {
                chong: `冲${ZODIAC[(dayZhiIndex + 6) % 12]}`,
                sha: ["东", "南", "西", "北"][seed % 4],
            },
            yi: randomItems(YI_ITEMS, Math.floor(Math.random() * 5) + 4),
            ji: randomItems(JI_ITEMS, Math.floor(Math.random() * 4) + 2),
            shiChen: SHICHEN.map((s, i) => ({
                ...s,
                jiXiong: ((seed + i) % 3 === 0 ? "吉" : (seed + i) % 3 === 1 ? "凶" : "中") as "吉" | "凶" | "中",
            })),
        }
    }

    useEffect(() => {
        setHuangliData(calculateHuangli(selectedDate))
    }, [selectedDate])

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + days)
        setSelectedDate(newDate)
    }

    const formatGregorian = (date: Date) => {
        return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        })
    }

    if (!huangliData) return null

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/10">
                    <Calendar className="h-8 w-8 text-red-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.huangli.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.huangli.subtitle")}
                    </p>
                </div>
            </div>

            {/* 日期导航 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)} className="cursor-pointer">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="text-center">
                            <div className="text-xl font-semibold">{formatGregorian(selectedDate)}</div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Badge variant="outline">
                                    {formatMessage(t("pages.huangli.ganZhi.year"), { value: huangliData.ganZhi.year })}
                                </Badge>
                                <Badge variant="outline">
                                    {formatMessage(t("pages.huangli.ganZhi.month"), { value: huangliData.ganZhi.month })}
                                </Badge>
                                <Badge variant="secondary">
                                    {formatMessage(t("pages.huangli.ganZhi.day"), { value: huangliData.ganZhi.day })}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => navigateDate(1)} className="cursor-pointer">
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} className="cursor-pointer">
                            {t("pages.huangli.actions.today")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 农历信息 */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="h-5 w-5" />
                            {t("pages.huangli.sections.lunar")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <div className="font-serif text-4xl font-bold text-primary">
                                {huangliData.lunar.monthName}{huangliData.lunar.dayName}
                            </div>
                            <div className="mt-4 flex justify-center gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("pages.huangli.labels.zodiac")}</div>
                                    <div className="font-semibold">
                                        {formatMessage(t("pages.huangli.labels.zodiacYear"), { value: huangliData.zodiac })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">{t("pages.huangli.labels.xingXiu")}</div>
                                    <div className="font-semibold">
                                        {formatMessage(t("pages.huangli.labels.xingXiuValue"), { value: huangliData.xingXiu })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Compass className="h-5 w-5" />
                            {t("pages.huangli.sections.chongSha")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-sm text-muted-foreground">{t("pages.huangli.labels.todayChong")}</div>
                                <div className="font-serif text-2xl font-bold text-red-500">
                                    {formatMessage(t("pages.huangli.labels.chongValue"), { value: huangliData.chongSha.chong })}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">{t("pages.huangli.labels.shaDirection")}</div>
                                <div className="font-serif text-2xl font-bold">
                                    {directionLabels[huangliData.chongSha.sha] || huangliData.chongSha.sha}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground mb-1">{t("pages.huangli.labels.pengZu")}</div>
                            <div className="text-sm space-y-1">
                                {huangliData.pengZu.map((item, i) => (
                                    <div key={i}>{item}</div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 宜忌 */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-500">
                            <CheckCircle className="h-5 w-5" />
                            {t("pages.huangli.sections.yi")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {huangliData.yi.map((item) => (
                                <Badge
                                    key={item}
                                    variant="outline"
                                    className="text-green-500 border-green-500/30 bg-green-500/5"
                                >
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            {t("pages.huangli.sections.ji")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {huangliData.ji.map((item) => (
                                <Badge
                                    key={item}
                                    variant="outline"
                                    className="text-red-500 border-red-500/30 bg-red-500/5"
                                >
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 时辰吉凶 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t("pages.huangli.sections.shichen")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {huangliData.shiChen.map((s) => (
                            <div
                                key={s.name}
                                className={cn(
                                    "p-3 rounded-lg text-center border",
                                    s.jiXiong === "吉" && "border-green-500/30 bg-green-500/5",
                                    s.jiXiong === "凶" && "border-red-500/30 bg-red-500/5",
                                    s.jiXiong === "中" && "border-yellow-500/30 bg-yellow-500/5"
                                )}
                            >
                                <div className="font-semibold">{s.name}</div>
                                <div className="text-xs text-muted-foreground">{s.range}</div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "mt-1 text-xs",
                                        s.jiXiong === "吉" && "text-green-500 border-green-500/30",
                                        s.jiXiong === "凶" && "text-red-500 border-red-500/30",
                                        s.jiXiong === "中" && "text-yellow-500 border-yellow-500/30"
                                    )}
                                >
                                    {jiXiongLabels[s.jiXiong]}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
