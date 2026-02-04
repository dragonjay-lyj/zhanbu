"use client"

import { useState } from "react"
import { User, Sparkles, Calculator, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// 五格结果接口
interface WugeItem {
    value: number
    luck: string
    meaning: string
    element: string
}

interface NameResult {
    surname: string
    givenName: string
    strokes: {
        surname: number
        givenName: number[]
        total: number
    }
    wuge: {
        tianGe: WugeItem
        renGe: WugeItem
        diGe: WugeItem
        waiGe: WugeItem
        zongGe: WugeItem
    }
    sancai: {
        tian: string
        ren: string
        di: string
        score: number
        luck: string
        description: string
    }
    totalScore: number
}

// 五行颜色
const elementColors: Record<string, string> = {
    "木": "text-green-500",
    "火": "text-red-500",
    "土": "text-yellow-600",
    "金": "text-amber-400",
    "水": "text-blue-500",
}

// 吉凶颜色
const luckColors: Record<string, string> = {
    "大吉": "bg-green-500",
    "吉": "bg-emerald-500",
    "半吉": "bg-yellow-500",
    "凶": "bg-red-500",
}

export default function NamePage() {
    const [surname, setSurname] = useState("")
    const [givenName, setGivenName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<NameResult | null>(null)
    const [error, setError] = useState("")

    // 计算姓名
    const calculateName = async () => {
        if (!surname.trim() || !givenName.trim()) {
            setError("请输入完整的姓名")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const response = await fetch("/api/name", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ surname: surname.trim(), givenName: givenName.trim() }),
            })

            const data = await response.json()

            if (data.success) {
                setResult(data.data)
            } else {
                setError(data.error || "计算失败")
            }
        } catch {
            setError("网络错误，请稍后重试")
        } finally {
            setIsLoading(false)
        }
    }

    // 重置
    const handleReset = () => {
        setSurname("")
        setGivenName("")
        setResult(null)
        setError("")
    }

    // 渲染五格卡片
    const renderWugeCard = (title: string, data: WugeItem, description: string) => (
        <Card className="relative overflow-hidden">
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                luckColors[data.luck] || "bg-gray-400"
            )} />
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Badge variant={data.luck === "凶" ? "destructive" : "secondary"}>
                        {data.luck}
                    </Badge>
                </div>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">{data.value}</div>
                    <div className={cn("text-lg font-medium", elementColors[data.element])}>
                        {data.element}
                    </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{data.meaning}</p>
            </CardContent>
        </Card>
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    姓名测算
                </h1>
                <p className="text-muted-foreground mt-2">
                    基于五格剖象法，分析姓名的数理吉凶
                </p>
            </div>

            {/* 输入表单 */}
            {!result && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5" />
                            输入姓名
                        </CardTitle>
                        <CardDescription>
                            请输入您要测算的姓名（支持单姓和复姓）
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="surname">姓氏</Label>
                                <Input
                                    id="surname"
                                    placeholder="如：王、欧阳"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    maxLength={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="givenName">名字</Label>
                                <Input
                                    id="givenName"
                                    placeholder="如：建国、小明"
                                    value={givenName}
                                    onChange={(e) => setGivenName(e.target.value)}
                                    maxLength={4}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}

                        <Button
                            onClick={calculateName}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    计算中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    开始测算
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 结果展示 */}
            {result && (
                <div className="space-y-6">
                    {/* 综合评分 */}
                    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">
                                        {result.surname}{result.givenName}
                                    </CardTitle>
                                    <CardDescription>
                                        总笔画：{result.strokes.total} 画
                                    </CardDescription>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        {result.totalScore}
                                    </div>
                                    <div className="text-sm text-muted-foreground">综合评分</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Progress value={result.totalScore} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>0</span>
                                <span>50</span>
                                <span>100</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 三才配置 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                三才配置
                                <Badge variant={result.sancai.luck === "凶" ? "destructive" : "secondary"}>
                                    {result.sancai.luck}
                                </Badge>
                            </CardTitle>
                            <CardDescription>{result.sancai.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center gap-8">
                                {[
                                    { label: "天", value: result.sancai.tian },
                                    { label: "人", value: result.sancai.ren },
                                    { label: "地", value: result.sancai.di },
                                ].map((item) => (
                                    <div key={item.label} className="text-center">
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                                            "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
                                            elementColors[item.value]
                                        )}>
                                            {item.value}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-2">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-center">
                                <Progress value={result.sancai.score} className="h-2 max-w-xs mx-auto" />
                                <p className="text-sm text-muted-foreground mt-2">
                                    三才评分：{result.sancai.score} 分
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 五格详解 */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">五格详解</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {renderWugeCard("天格", result.wuge.tianGe, "代表先天运势，由姓氏决定")}
                            {renderWugeCard("人格", result.wuge.renGe, "代表主运，影响一生运势")}
                            {renderWugeCard("地格", result.wuge.diGe, "代表前运，影响中年前")}
                            {renderWugeCard("外格", result.wuge.waiGe, "代表副运，影响人际关系")}
                        </div>
                        <div className="mt-4">
                            {renderWugeCard("总格", result.wuge.zongGe, "代表后运，影响中年后")}
                        </div>
                    </div>

                    {/* 重新测算 */}
                    <div className="flex justify-center">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            重新测算
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
