"use client"

import { useState } from "react"
import { Heart, Sparkles, Loader2, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// 分析结果类型
interface MarriageResult {
    male: {
        bazi: { year: string; month: string; day: string; hour: string; shengxiao: string }
        wuxing: Record<string, number>
    }
    female: {
        bazi: { year: string; month: string; day: string; hour: string; shengxiao: string }
        wuxing: Record<string, number>
    }
    analysis: {
        shengxiao: { male: string; female: string; score: number; description: string }
        wuxing: { score: number; details: string[] }
        dayMaster: { score: number }
        overall: { score: number; level: string; summary: string }
    }
}

// 五行颜色
const wuxingColors: Record<string, string> = {
    "木": "bg-green-500",
    "火": "bg-red-500",
    "土": "bg-yellow-500",
    "金": "bg-gray-300",
    "水": "bg-blue-500",
}

// 等级颜色
const levelColors: Record<string, string> = {
    "上上婚": "from-pink-500 to-rose-500",
    "上等婚": "from-green-500 to-emerald-500",
    "中等婚": "from-blue-500 to-cyan-500",
    "下等婚": "from-yellow-500 to-orange-500",
    "下下婚": "from-gray-500 to-slate-500",
}

export default function MarriagePage() {
    const [maleInfo, setMaleInfo] = useState({ year: "", month: "", day: "", hour: "" })
    const [femaleInfo, setFemaleInfo] = useState({ year: "", month: "", day: "", hour: "" })
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<MarriageResult | null>(null)

    // 提交分析
    const handleSubmit = async () => {
        if (!maleInfo.year || !maleInfo.month || !maleInfo.day ||
            !femaleInfo.year || !femaleInfo.month || !femaleInfo.day) {
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch("/api/marriage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    male: {
                        year: parseInt(maleInfo.year),
                        month: parseInt(maleInfo.month),
                        day: parseInt(maleInfo.day),
                        hour: maleInfo.hour ? parseInt(maleInfo.hour) : 12,
                    },
                    female: {
                        year: parseInt(femaleInfo.year),
                        month: parseInt(femaleInfo.month),
                        day: parseInt(femaleInfo.day),
                        hour: femaleInfo.hour ? parseInt(femaleInfo.hour) : 12,
                    },
                }),
            })
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (error) {
            console.error("分析失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 五行柱状图
    const WuxingBar = ({ distribution, label }: { distribution: Record<string, number>; label: string }) => (
        <div className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            <div className="flex gap-1 h-16">
                {Object.entries(distribution).map(([element, count]) => (
                    <div key={element} className="flex-1 flex flex-col items-center">
                        <div className="flex-1 w-full flex items-end">
                            <div
                                className={cn("w-full rounded-t", wuxingColors[element])}
                                style={{ height: `${(count / 8) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs mt-1">{element}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                    <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    八字合婚
                </h1>
                <p className="text-muted-foreground mt-2">
                    输入双方生辰，分析姻缘契合度
                </p>
            </div>

            {/* 输入表单 */}
            {!result && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* 男方信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                男方生辰
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>出生年份</Label>
                                    <Input
                                        type="number"
                                        placeholder="如 1990"
                                        value={maleInfo.year}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>出生月份</Label>
                                    <Input
                                        type="number"
                                        placeholder="1-12"
                                        min="1"
                                        max="12"
                                        value={maleInfo.month}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, month: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>出生日期</Label>
                                    <Input
                                        type="number"
                                        placeholder="1-31"
                                        min="1"
                                        max="31"
                                        value={maleInfo.day}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>出生时辰（可选）</Label>
                                    <Input
                                        type="number"
                                        placeholder="0-23"
                                        min="0"
                                        max="23"
                                        value={maleInfo.hour}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, hour: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 女方信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                女方生辰
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>出生年份</Label>
                                    <Input
                                        type="number"
                                        placeholder="如 1992"
                                        value={femaleInfo.year}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>出生月份</Label>
                                    <Input
                                        type="number"
                                        placeholder="1-12"
                                        min="1"
                                        max="12"
                                        value={femaleInfo.month}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, month: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>出生日期</Label>
                                    <Input
                                        type="number"
                                        placeholder="1-31"
                                        min="1"
                                        max="31"
                                        value={femaleInfo.day}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>出生时辰（可选）</Label>
                                    <Input
                                        type="number"
                                        placeholder="0-23"
                                        min="0"
                                        max="23"
                                        value={femaleInfo.hour}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, hour: e.target.value })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || !maleInfo.year || !femaleInfo.year}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    正在分析...
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    开始合婚分析
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* 分析结果 */}
            {result && (
                <div className="space-y-6">
                    {/* 综合评分 */}
                    <Card className={cn(
                        "overflow-hidden bg-gradient-to-r text-white",
                        levelColors[result.analysis.overall.level] || "from-gray-500 to-slate-500"
                    )}>
                        <CardContent className="p-6 text-center">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="text-center">
                                    <div className="text-4xl">🧑</div>
                                    <p className="text-sm mt-1">属{result.male.bazi.shengxiao}</p>
                                </div>
                                <div className="text-4xl">💕</div>
                                <div className="text-center">
                                    <div className="text-4xl">👩</div>
                                    <p className="text-sm mt-1">属{result.female.bazi.shengxiao}</p>
                                </div>
                            </div>
                            <div className="text-5xl font-bold mb-2">{result.analysis.overall.score}分</div>
                            <Badge className="bg-white/20 text-lg px-4 py-1">
                                {result.analysis.overall.level}
                            </Badge>
                            <p className="mt-4 text-white/90">{result.analysis.overall.summary}</p>
                        </CardContent>
                    </Card>

                    {/* 详细分析 */}
                    <Tabs defaultValue="shengxiao">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="shengxiao">生肖配对</TabsTrigger>
                            <TabsTrigger value="wuxing">五行互补</TabsTrigger>
                            <TabsTrigger value="bazi">八字详情</TabsTrigger>
                        </TabsList>

                        <TabsContent value="shengxiao" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>生肖配对分析</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {result.analysis.shengxiao.score}分
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center gap-8 mb-6">
                                        <div className="text-center">
                                            <div className="text-6xl">🧑</div>
                                            <p className="font-bold mt-2">{result.analysis.shengxiao.male}</p>
                                        </div>
                                        <Heart className="w-12 h-12 text-pink-500" />
                                        <div className="text-center">
                                            <div className="text-6xl">👩</div>
                                            <p className="font-bold mt-2">{result.analysis.shengxiao.female}</p>
                                        </div>
                                    </div>
                                    <Progress value={result.analysis.shengxiao.score} className="h-3 mb-4" />
                                    <p className="text-center text-muted-foreground">
                                        {result.analysis.shengxiao.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="wuxing" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>五行互补分析</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {result.analysis.wuxing.score}分
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <WuxingBar distribution={result.male.wuxing} label="男方五行分布" />
                                        <WuxingBar distribution={result.female.wuxing} label="女方五行分布" />
                                    </div>
                                    {result.analysis.wuxing.details.length > 0 && (
                                        <div className="space-y-2">
                                            {result.analysis.wuxing.details.map((detail, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm">{detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="bazi" className="mt-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-blue-600">男方八字</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            {["年柱", "月柱", "日柱", "时柱"].map((label, i) => {
                                                const value = [
                                                    result.male.bazi.year,
                                                    result.male.bazi.month,
                                                    result.male.bazi.day,
                                                    result.male.bazi.hour,
                                                ][i]
                                                return (
                                                    <div key={label}>
                                                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2">
                                                            <p className="font-bold text-lg">{value}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-pink-600">女方八字</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            {["年柱", "月柱", "日柱", "时柱"].map((label, i) => {
                                                const value = [
                                                    result.female.bazi.year,
                                                    result.female.bazi.month,
                                                    result.female.bazi.day,
                                                    result.female.bazi.hour,
                                                ][i]
                                                return (
                                                    <div key={label}>
                                                        <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                                        <div className="bg-pink-50 dark:bg-pink-950/30 rounded p-2">
                                                            <p className="font-bold text-lg">{value}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* 重新分析按钮 */}
                    <Button
                        variant="outline"
                        onClick={() => setResult(null)}
                        className="w-full"
                    >
                        重新分析
                    </Button>
                </div>
            )}
        </div>
    )
}
