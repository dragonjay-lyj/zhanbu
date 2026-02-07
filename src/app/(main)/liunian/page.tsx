"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Loader2, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 运势数据类型
interface LiunianResult {
    birthYear: number
    targetYear: number
    ganzhi: string
    age: number
    overall: { score: number; level: string }
    monthly: { month: number; score: number; level: string }[]
    categories: Record<string, { score: number; description: string }>
    advice: string[]
}

// 等级颜色
const levelColors: Record<string, string> = {
    "吉": "bg-green-500 text-white",
    "平": "bg-blue-500 text-white",
    "凶": "bg-red-500 text-white",
    "旺": "text-green-600",
    "弱": "text-red-600",
}

export default function LiunianPage() {
    const { t } = useTranslation()
    const [birthYear, setBirthYear] = useState("")
    const [targetYear, setTargetYear] = useState(new Date().getFullYear())
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<LiunianResult | null>(null)

    // 查询运势
    const fetchFortune = async () => {
        if (!birthYear) return

        setIsLoading(true)
        try {
            const res = await fetch(`/api/liunian?birthYear=${birthYear}&year=${targetYear}`)
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (error) {
            console.error("查询失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 切换年份
    const changeYear = (delta: number) => {
        const newYear = targetYear + delta
        setTargetYear(newYear)
        if (result) {
            // 重新查询
            setIsLoading(true)
            fetch(`/api/liunian?birthYear=${birthYear}&year=${newYear}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) setResult(data.data)
                })
                .finally(() => setIsLoading(false))
        }
    }

    // 简单的月度运势曲线图
    const MonthlyChart = ({ data }: { data: { month: number; score: number; level: string }[] }) => {
        const maxScore = Math.max(...data.map(d => d.score))
        const minScore = Math.min(...data.map(d => d.score))
        const range = maxScore - minScore || 1

        return (
            <div className="relative h-48">
                {/* Y轴标签 */}
                <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>{maxScore}</span>
                    <span>{Math.round((maxScore + minScore) / 2)}</span>
                    <span>{minScore}</span>
                </div>
                {/* 图表区域 */}
                <div className="ml-10 h-full flex items-end gap-1">
                    {data.map((item) => {
                        const height = ((item.score - minScore) / range) * 100 + 20
                        return (
                            <div
                                key={item.month}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div
                                    className={cn(
                                        "w-full rounded-t transition-all",
                                        item.score >= 70 ? "bg-green-500" :
                                            item.score >= 50 ? "bg-blue-500" : "bg-red-500"
                                    )}
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-xs mt-1">{item.month}{t("pages.liunian.monthSuffix")}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t("pages.liunian.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t("pages.liunian.description")}
                </p>
            </div>

            {/* 输入区域 */}
            {!result && (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>{t("pages.liunian.inputTitle")}</CardTitle>
                        <CardDescription>{t("pages.liunian.inputDescription")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>{t("pages.liunian.birthYearLabel")}</Label>
                            <Input
                                type="number"
                                placeholder={t("pages.liunian.birthYearPlaceholder")}
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={fetchFortune}
                            disabled={isLoading || !birthYear}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <TrendingUp className="w-4 h-4 mr-2" />
                            )}
                            {t("pages.liunian.startAnalyze")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 结果展示 */}
            {result && (
                <div className="space-y-6">
                    {/* 年份切换 */}
                    <div className="flex items-center justify-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => changeYear(-1)} aria-label="上一年">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="text-center">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-2xl font-bold">{formatMessage(t("pages.liunian.yearLabel"), { year: result.targetYear })}</span>
                                <Badge variant="outline">{formatMessage(t("pages.liunian.yearLabel"), { year: result.ganzhi })}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {formatMessage(t("pages.liunian.birthInfo"), { birthYear: result.birthYear, age: result.age })}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => changeYear(1)} aria-label="下一年">
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* 综合运势 */}
                    <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <CardContent className="p-6 text-center">
                            <div className="text-5xl font-bold mb-2">{result.overall.score}{t("pages.liunian.scoreUnit")}</div>
                            <Badge className={levelColors[result.overall.level]}>
                                {result.overall.level}
                            </Badge>
                            <p className="mt-4 text-white/90">{t("pages.liunian.overallScoreLabel")}</p>
                        </CardContent>
                    </Card>

                    {/* 月度运势曲线 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.liunian.monthlyTitle")}</CardTitle>
                            <CardDescription>{t("pages.liunian.monthlyDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : (
                                <MonthlyChart data={result.monthly} />
                            )}
                        </CardContent>
                    </Card>

                    {/* 分类运势 */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(result.categories).map(([type, data]) => (
                            <Card key={type}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center justify-between">
                                        {type}
                                        <span className={cn(
                                            "text-xl font-bold",
                                            data.score >= 70 ? "text-green-600" :
                                                data.score >= 50 ? "text-blue-600" : "text-red-600"
                                        )}>
                                            {data.score}{t("pages.liunian.scoreUnit")}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Progress value={data.score} className="h-2 mb-2" />
                                    <p className="text-sm text-muted-foreground">{data.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* 年度建议 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.liunian.adviceTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {result.advice.map((advice, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-primary">•</span>
                                        <span className="text-muted-foreground">{advice}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 返回按钮 */}
                    <Button
                        variant="outline"
                        onClick={() => setResult(null)}
                        className="w-full"
                    >
                        {t("pages.liunian.reset")}
                    </Button>
                </div>
            )}
        </div>
    )
}
