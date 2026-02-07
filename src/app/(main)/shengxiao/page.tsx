"use client"

import { useState, useEffect } from "react"
import { Sparkles, AlertTriangle, Loader2, TrendingUp, Heart, Briefcase, Coins, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 生肖数据接口
interface ZodiacAnimal {
    id: string
    name: string
    emoji: string
    years: number[]
}

// 运势数据接口
interface Fortune {
    animal: ZodiacAnimal
    period: string
    year: number
    taisui: {
        yearAnimal: ZodiacAnimal
        status: string
    }
    fortune: {
        level: string
        description: string
        scores: {
            overall: number
            career: number
            wealth: number
            love: number
            health: number
        }
        lucky: {
            colors: string
            numbers: number[]
            direction: string
        }
        advice: string
    }
}

// 太岁状态颜色
const taisuiColors: Record<string, string> = {
    "犯太岁": "bg-red-500",
    "冲太岁": "bg-orange-500",
    "刑太岁": "bg-yellow-500",
    "害太岁": "bg-amber-500",
    "破太岁": "bg-rose-400",
    "无": "bg-green-500",
}

export default function ShengxiaoPage() {
    const { t } = useTranslation()
    const [animals, setAnimals] = useState<ZodiacAnimal[]>([])
    const [selectedAnimal, setSelectedAnimal] = useState<ZodiacAnimal | null>(null)
    const [period, setPeriod] = useState<"year" | "month">("year")
    const [fortune, setFortune] = useState<Fortune | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentYear] = useState(new Date().getFullYear())

    // 加载生肖列表
    useEffect(() => {
        fetch(`/api/shengxiao?year=${currentYear}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAnimals(data.data.animals)
                }
            })
    }, [currentYear])

    // 获取运势
    const fetchFortune = async (animal: ZodiacAnimal) => {
        setSelectedAnimal(animal)
        setIsLoading(true)

        try {
            const res = await fetch(`/api/shengxiao?animal=${animal.id}&period=${period}&year=${currentYear}`)
            const data = await res.json()
            if (data.success) {
                setFortune(data.data)
            }
        } catch (error) {
            console.error("获取运势失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 切换周期重新获取
    useEffect(() => {
        if (selectedAnimal) {
            fetchFortune(selectedAnimal)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period])

    // 获取评分颜色
    const getScoreColor = (score: number) => {
        if (score >= 75) return "text-green-500"
        if (score >= 50) return "text-yellow-500"
        return "text-red-500"
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 mb-4">
                    <span className="text-3xl">🐲</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {t("pages.shengxiao.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {formatMessage(t("pages.shengxiao.description"), { year: currentYear })}
                </p>
            </div>

            {/* 生肖选择 */}
            {!selectedAnimal && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {animals.map((animal) => (
                        <Card key={animal.id} className="p-0 overflow-hidden border-2 border-transparent hover:border-primary/50">
                            <button
                                type="button"
                                className={cn(
                                    "w-full cursor-pointer transition-all hover:scale-105 hover:shadow-lg text-left",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                )}
                                onClick={() => fetchFortune(animal)}
                            >
                                <CardContent className="p-4 text-center">
                                    <div className="text-4xl mb-2">{animal.emoji}</div>
                                    <h3 className="font-medium text-lg">{animal.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {animal.years.slice(0, 3).join("、")}...
                                    </p>
                                </CardContent>
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* 运势详情 */}
            {selectedAnimal && (
                <div className="space-y-6">
                    {/* 生肖信息卡 */}
                    <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-6xl">{selectedAnimal.emoji}</div>
                                    <div>
                                        <CardTitle className="text-2xl">
                                            {formatMessage(t("pages.shengxiao.cardTitle"), { animal: selectedAnimal.name })}
                                        </CardTitle>
                                        <CardDescription className="text-white/80">
                                            {formatMessage(t("pages.shengxiao.bornYears"), { years: selectedAnimal.years.join("、") })}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setSelectedAnimal(null)
                                        setFortune(null)
                                    }}
                                >
                                    {t("pages.shengxiao.switchAnimal")}
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* 太岁提醒 */}
                    {fortune && fortune.taisui.status !== "无" && (
                        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                    <div>
                                        <h4 className="font-medium text-red-700 dark:text-red-400">
                                            {formatMessage(t("pages.shengxiao.taisuiTitle"), {
                                                year: currentYear,
                                                status: fortune.taisui.status,
                                            })}
                                        </h4>
                                        <p className="text-sm text-red-600 dark:text-red-300">
                                            {formatMessage(t("pages.shengxiao.taisuiDesc"), {
                                                animal: fortune.taisui.yearAnimal.name,
                                                self: selectedAnimal.name,
                                                status: fortune.taisui.status,
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* 周期选择 */}
                    <Tabs value={period} onValueChange={(v) => setPeriod(v as "year" | "month")}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="year">{t("pages.shengxiao.periodYear")}</TabsTrigger>
                            <TabsTrigger value="month">{t("pages.shengxiao.periodMonth")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value={period} className="mt-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : fortune ? (
                                <div className="space-y-6">
                                    {/* 综合运势 */}
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-primary" />
                                                    <CardTitle>{t("pages.shengxiao.overall")}</CardTitle>
                                                    <Badge className={taisuiColors[fortune.taisui.status]}>
                                                        {fortune.taisui.status === "无"
                                                            ? t("pages.shengxiao.safeYear")
                                                            : fortune.taisui.status}
                                                    </Badge>
                                                </div>
                                                <div className={cn(
                                                    "text-3xl font-bold",
                                                    getScoreColor(fortune.fortune.scores.overall)
                                                )}>
                                                    {fortune.fortune.scores.overall}{t("pages.shengxiao.scoreUnit")}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Progress value={fortune.fortune.scores.overall} className="h-3 mb-4" />
                                            <p className="text-muted-foreground mb-4">{fortune.fortune.description}</p>
                                            <div className="p-4 rounded-lg bg-muted/50">
                                                <p className="text-sm font-medium">{t("pages.shengxiao.adviceTitle")}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{fortune.fortune.advice}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 幸运元素 */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                                    {fortune.fortune.lucky.colors}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground mt-2">{t("pages.shengxiao.luckyColor")}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-xl font-bold text-primary">
                                                    {fortune.fortune.lucky.numbers.join("、")}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">{t("pages.shengxiao.luckyNumber")}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="text-center">
                                            <CardContent className="pt-6">
                                                <div className="text-xl font-bold text-primary">
                                                    {fortune.fortune.lucky.direction}方
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">{t("pages.shengxiao.luckyDirection")}</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* 各项运势 */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[
                                            { icon: <Briefcase className="w-5 h-5 text-blue-500" />, title: t("pages.shengxiao.career"), score: fortune.fortune.scores.career },
                                            { icon: <Coins className="w-5 h-5 text-yellow-500" />, title: t("pages.shengxiao.wealth"), score: fortune.fortune.scores.wealth },
                                            { icon: <Heart className="w-5 h-5 text-pink-500" />, title: t("pages.shengxiao.love"), score: fortune.fortune.scores.love },
                                            { icon: <Activity className="w-5 h-5 text-green-500" />, title: t("pages.shengxiao.health"), score: fortune.fortune.scores.health },
                                        ].map((item) => (
                                            <Card key={item.title}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {item.icon}
                                                            <span className="font-medium">{item.title}</span>
                                                        </div>
                                                        <span className={cn("font-bold", getScoreColor(item.score))}>
                                                            {item.score}{t("pages.shengxiao.scoreUnit")}
                                                        </span>
                                                    </div>
                                                    <Progress value={item.score} className="h-2" />
                                                </CardContent>
                                            </Card>
                                        ))}
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
