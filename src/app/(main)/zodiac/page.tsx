"use client"

import { useState, useEffect } from "react"
import { Star, Sparkles, Heart, Briefcase, Coins, Activity, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// 星座数据
interface ZodiacSign {
    id: string
    name: string
    symbol: string
    dates: string
    element: string
}

// 运势数据
interface Fortune {
    overall: { score: number; description: string }
    love: { score: number; description: string }
    career: { score: number; description: string }
    wealth: { score: number; description: string }
    health: { score: number; description: string }
    lucky: { number: number; color: string; direction: string }
}

// 星座元素颜色
const elementColors: Record<string, string> = {
    "火": "from-red-500 to-orange-500",
    "土": "from-amber-600 to-yellow-500",
    "风": "from-cyan-500 to-blue-500",
    "水": "from-blue-500 to-purple-500",
}

// 星座背景图案
const zodiacPatterns: Record<string, string> = {
    aries: "🐏", taurus: "🐂", gemini: "👯", cancer: "🦀",
    leo: "🦁", virgo: "👧", libra: "⚖️", scorpio: "🦂",
    sagittarius: "🏹", capricorn: "🐐", aquarius: "🏺", pisces: "🐟",
}

export default function ZodiacPage() {
    const [signs, setSigns] = useState<ZodiacSign[]>([])
    const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null)
    const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
    const [fortune, setFortune] = useState<Fortune | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // 加载星座列表
    useEffect(() => {
        fetch("/api/zodiac")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSigns(data.data.signs)
                }
            })
    }, [])

    // 获取运势
    const fetchFortune = async (sign: ZodiacSign) => {
        setSelectedSign(sign)
        setIsLoading(true)

        try {
            const res = await fetch(`/api/zodiac?sign=${sign.id}&period=${period}`)
            const data = await res.json()
            if (data.success) {
                setFortune(data.data.fortune)
            }
        } catch (error) {
            console.error("获取运势失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 切换周期
    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod as "daily" | "weekly" | "monthly")
        if (selectedSign) {
            fetchFortune(selectedSign)
        }
    }

    // 获取评分颜色
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 60) return "text-yellow-500"
        return "text-red-500"
    }

    // 渲染运势项
    const renderFortuneItem = (
        icon: React.ReactNode,
        title: string,
        data: { score: number; description: string }
    ) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">{icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{title}</h4>
                            <span className={cn("font-bold", getScoreColor(data.score))}>
                                {data.score}分
                            </span>
                        </div>
                        <Progress value={data.score} className="h-2 mb-2" />
                        <p className="text-sm text-muted-foreground">{data.description}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
                    <Star className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    星座运势
                </h1>
                <p className="text-muted-foreground mt-2">
                    查看十二星座的每日、每周、每月运势
                </p>
            </div>

            {/* 星座选择 */}
            {!selectedSign && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {signs.map((sign) => (
                        <Card
                            key={sign.id}
                            className={cn(
                                "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
                                "border-2 border-transparent hover:border-primary/50"
                            )}
                            onClick={() => fetchFortune(sign)}
                        >
                            <CardContent className="p-4 text-center">
                                <div className={cn(
                                    "w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-2",
                                    `bg-gradient-to-br ${elementColors[sign.element]}`
                                )}>
                                    {sign.symbol}
                                </div>
                                <h3 className="font-medium">{sign.name}</h3>
                                <p className="text-xs text-muted-foreground">{sign.dates}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 运势详情 */}
            {selectedSign && (
                <div className="space-y-6">
                    {/* 星座信息卡 */}
                    <Card className={cn(
                        "bg-gradient-to-br",
                        elementColors[selectedSign.element],
                        "text-white"
                    )}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-6xl">{zodiacPatterns[selectedSign.id]}</div>
                                    <div>
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            {selectedSign.symbol} {selectedSign.name}
                                        </CardTitle>
                                        <CardDescription className="text-white/80">
                                            {selectedSign.dates} · {selectedSign.element}象星座
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedSign(null)
                                        setFortune(null)
                                    }}
                                >
                                    切换星座
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* 周期选择 */}
                    <Tabs value={period} onValueChange={handlePeriodChange}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="daily">今日运势</TabsTrigger>
                            <TabsTrigger value="weekly">本周运势</TabsTrigger>
                            <TabsTrigger value="monthly">本月运势</TabsTrigger>
                        </TabsList>

                        <TabsContent value={period} className="mt-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : fortune ? (
                                <div className="space-y-6">
                                    {/* 综合运势 */}
                                    <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-primary" />
                                                    <CardTitle>综合运势</CardTitle>
                                                </div>
                                                <div className={cn(
                                                    "text-3xl font-bold",
                                                    getScoreColor(fortune.overall.score)
                                                )}>
                                                    {fortune.overall.score}分
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Progress value={fortune.overall.score} className="h-3 mb-4" />
                                            <p className="text-muted-foreground">{fortune.overall.description}</p>
                                        </CardContent>
                                    </Card>

                                    {/* 幸运元素 */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-primary">
                                                    {fortune.lucky.number}
                                                </div>
                                                <p className="text-sm text-muted-foreground">幸运数字</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                                    {fortune.lucky.color}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground mt-2">幸运颜色</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-primary">
                                                    {fortune.lucky.direction}
                                                </div>
                                                <p className="text-sm text-muted-foreground">幸运方位</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* 各项运势 */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {renderFortuneItem(
                                            <Heart className="w-5 h-5 text-pink-500" />,
                                            "爱情运势",
                                            fortune.love
                                        )}
                                        {renderFortuneItem(
                                            <Briefcase className="w-5 h-5 text-blue-500" />,
                                            "事业运势",
                                            fortune.career
                                        )}
                                        {renderFortuneItem(
                                            <Coins className="w-5 h-5 text-yellow-500" />,
                                            "财富运势",
                                            fortune.wealth
                                        )}
                                        {renderFortuneItem(
                                            <Activity className="w-5 h-5 text-green-500" />,
                                            "健康运势",
                                            fortune.health
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}
