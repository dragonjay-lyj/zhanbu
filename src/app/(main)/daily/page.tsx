"use client"

import { useState, useEffect } from "react"
import {
    Sun,
    Moon,
    Star,
    Calendar,
    Heart,
    Briefcase,
    Wallet,
    Activity,
    TrendingUp,
    TrendingDown,
    Minus,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"

// 天干地支
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]

// 星座数据
const ZODIAC_SIGNS = [
    { name: "白羊座", start: "03-21", end: "04-19", element: "火" },
    { name: "金牛座", start: "04-20", end: "05-20", element: "土" },
    { name: "双子座", start: "05-21", end: "06-21", element: "风" },
    { name: "巨蟹座", start: "06-22", end: "07-22", element: "水" },
    { name: "狮子座", start: "07-23", end: "08-22", element: "火" },
    { name: "处女座", start: "08-23", end: "09-22", element: "土" },
    { name: "天秤座", start: "09-23", end: "10-23", element: "风" },
    { name: "天蝎座", start: "10-24", end: "11-22", element: "水" },
    { name: "射手座", start: "11-23", end: "12-21", element: "火" },
    { name: "摩羯座", start: "12-22", end: "01-19", element: "土" },
    { name: "水瓶座", start: "01-20", end: "02-18", element: "风" },
    { name: "双鱼座", start: "02-19", end: "03-20", element: "水" },
]

// 运势类型
interface FortuneItem {
    type: string
    icon: React.ElementType
    score: number
    trend: "up" | "down" | "stable"
    description: string
}

interface DailyFortune {
    date: Date
    ganZhi: string
    zodiac: string
    overallScore: number
    luckyColor: string
    luckyNumber: number
    luckyDirection: string
    items: FortuneItem[]
    advice: string
    avoid: string[]
    suitable: string[]
}

/**
 * 每日运势页面
 */
export default function DailyFortunePage() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [fortune, setFortune] = useState<DailyFortune | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // 计算日期的干支
    const getGanZhi = (date: Date) => {
        const baseDate = new Date(1900, 0, 31)
        const diffDays = Math.floor(
            (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        const ganIndex = (diffDays % 10 + 10) % 10
        const zhiIndex = (diffDays % 12 + 12) % 12
        return {
            ganZhi: TIAN_GAN[ganIndex] + DI_ZHI[zhiIndex],
            zodiac: ZODIAC[zhiIndex],
        }
    }

    // 生成每日运势
    const generateFortune = (date: Date): DailyFortune => {
        const { ganZhi, zodiac } = getGanZhi(date)
        const seed = date.getDate() + date.getMonth() * 31 + date.getFullYear()

        // 伪随机生成运势分数
        const random = (min: number, max: number) => {
            const x = Math.sin(seed * 9999) * 10000
            return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
        }

        const items: FortuneItem[] = [
            {
                type: "爱情运",
                icon: Heart,
                score: random(40, 100),
                trend: random(0, 2) === 0 ? "up" : random(0, 1) === 0 ? "down" : "stable",
                description: "感情方面需要多一些耐心和理解",
            },
            {
                type: "事业运",
                icon: Briefcase,
                score: random(40, 100),
                trend: random(0, 2) === 0 ? "up" : random(0, 1) === 0 ? "down" : "stable",
                description: "工作中可能会遇到新的机会",
            },
            {
                type: "财运",
                icon: Wallet,
                score: random(40, 100),
                trend: random(0, 2) === 0 ? "up" : random(0, 1) === 0 ? "down" : "stable",
                description: "理财方面宜稳健，避免冲动消费",
            },
            {
                type: "健康运",
                icon: Activity,
                score: random(40, 100),
                trend: random(0, 2) === 0 ? "up" : random(0, 1) === 0 ? "down" : "stable",
                description: "注意作息规律，适当运动",
            },
        ]

        const overallScore = Math.round(
            items.reduce((sum, item) => sum + item.score, 0) / items.length
        )

        const colors = ["红色", "黄色", "蓝色", "绿色", "紫色", "白色", "金色"]
        const directions = ["东", "南", "西", "北", "东南", "东北", "西南", "西北"]

        return {
            date,
            ganZhi,
            zodiac,
            overallScore,
            luckyColor: colors[seed % colors.length],
            luckyNumber: (seed % 9) + 1,
            luckyDirection: directions[seed % directions.length],
            items,
            advice: "今日宜保持积极乐观的心态，遇事不急不躁。",
            suitable: ["出行", "会友", "学习", "运动"].slice(0, (seed % 3) + 2),
            avoid: ["投资", "争执", "熬夜"].slice(0, (seed % 2) + 1),
        }
    }

    // 加载运势
    useEffect(() => {
        setIsLoading(true)
        // 模拟加载
        setTimeout(() => {
            setFortune(generateFortune(selectedDate))
            setIsLoading(false)
        }, 500)
    }, [selectedDate])

    // 日期导航
    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate)
        newDate.setDate(newDate.getDate() + days)
        setSelectedDate(newDate)
    }

    // 格式化日期
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
        })
    }

    const getTrendIcon = (trend: "up" | "down" | "stable") => {
        switch (trend) {
            case "up":
                return <TrendingUp className="h-4 w-4 text-green-500" />
            case "down":
                return <TrendingDown className="h-4 w-4 text-red-500" />
            default:
                return <Minus className="h-4 w-4 text-yellow-500" />
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 60) return "text-yellow-500"
        return "text-red-500"
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                    <Sun className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">每日运势</h1>
                    <p className="text-muted-foreground">
                        了解今日运程，把握人生机遇
                    </p>
                </div>
            </div>

            {/* 日期选择器 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateDate(-1)}
                            className="cursor-pointer"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="text-center">
                            <div className="text-lg font-semibold">{formatDate(selectedDate)}</div>
                            {fortune && (
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <Badge variant="outline">{fortune.ganZhi}日</Badge>
                                    <Badge variant="secondary">生肖{fortune.zodiac}</Badge>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateDate(1)}
                            className="cursor-pointer"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : fortune ? (
                <div className="space-y-6">
                    {/* 综合运势 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                综合运势
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className={cn(
                                        "text-5xl font-bold",
                                        getScoreColor(fortune.overallScore)
                                    )}>
                                        {fortune.overallScore}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">综合评分</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Progress value={fortune.overallScore} className="h-3" />
                                    <p className="text-sm text-muted-foreground">{fortune.advice}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 幸运指南 */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl mb-2">🎨</div>
                                <div className="text-sm text-muted-foreground">幸运颜色</div>
                                <div className="font-semibold">{fortune.luckyColor}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl mb-2">🔢</div>
                                <div className="text-sm text-muted-foreground">幸运数字</div>
                                <div className="font-semibold">{fortune.luckyNumber}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-2xl mb-2">🧭</div>
                                <div className="text-sm text-muted-foreground">幸运方位</div>
                                <div className="font-semibold">{fortune.luckyDirection}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 分项运势 */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {fortune.items.map((item) => (
                            <Card key={item.type}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <item.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold">{item.type}</span>
                                                <div className="flex items-center gap-2">
                                                    {getTrendIcon(item.trend)}
                                                    <span className={cn("font-bold", getScoreColor(item.score))}>
                                                        {item.score}分
                                                    </span>
                                                </div>
                                            </div>
                                            <Progress value={item.score} className="h-2 mb-2" />
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* 宜忌 */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-500">✓ 今日宜</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {fortune.suitable.map((item) => (
                                        <Badge key={item} variant="outline" className="text-green-500 border-green-500/30">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-red-500">✗ 今日忌</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {fortune.avoid.map((item) => (
                                        <Badge key={item} variant="outline" className="text-red-500 border-red-500/30">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI 解读 */}
                    <AIAnalysisSection
                        type="general"
                        title="AI 个性化运势解读"
                        loginPrompt="登录并输入您的生辰八字，获取专属于您的每日运势分析"
                    />
                </div>
            ) : null}
        </div>
    )
}
