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
import { useTranslation, formatMessage } from "@/lib/i18n"

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
    const { t } = useTranslation()
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
                    {t("pages.marriage.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t("pages.marriage.subtitle")}
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
                                {t("pages.marriage.sections.male")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("pages.marriage.labels.birthYear")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.year")}
                                        value={maleInfo.year}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>{t("pages.marriage.labels.birthMonth")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.month")}
                                        min="1"
                                        max="12"
                                        value={maleInfo.month}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, month: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("pages.marriage.labels.birthDay")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.day")}
                                        min="1"
                                        max="31"
                                        value={maleInfo.day}
                                        onChange={(e) => setMaleInfo({ ...maleInfo, day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>{t("pages.marriage.labels.birthHourOptional")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.hour")}
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
                                {t("pages.marriage.sections.female")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("pages.marriage.labels.birthYear")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.yearFemale")}
                                        value={femaleInfo.year}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, year: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>{t("pages.marriage.labels.birthMonth")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.month")}
                                        min="1"
                                        max="12"
                                        value={femaleInfo.month}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, month: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{t("pages.marriage.labels.birthDay")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.day")}
                                        min="1"
                                        max="31"
                                        value={femaleInfo.day}
                                        onChange={(e) => setFemaleInfo({ ...femaleInfo, day: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>{t("pages.marriage.labels.birthHourOptional")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("pages.marriage.placeholders.hour")}
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
                                    {t("pages.marriage.actions.analyzing")}
                                </>
                            ) : (
                                <>
                                    <Heart className="w-4 h-4 mr-2" />
                                    {t("pages.marriage.actions.start")}
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
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/16">
                                        <User className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm mt-1">
                                        {formatMessage(t("pages.marriage.result.zodiac"), { value: result.male.bazi.shengxiao })}
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/16">
                                    <Heart className="h-7 w-7" />
                                </div>
                                <div className="text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/16">
                                        <Users className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm mt-1">
                                        {formatMessage(t("pages.marriage.result.zodiac"), { value: result.female.bazi.shengxiao })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-5xl font-bold mb-2">
                                {formatMessage(t("pages.marriage.scoreUnit"), { value: result.analysis.overall.score })}
                            </div>
                            <Badge className="bg-white/20 text-lg px-4 py-1">
                                {result.analysis.overall.level}
                            </Badge>
                            <p className="mt-4 text-white/90">{result.analysis.overall.summary}</p>
                        </CardContent>
                    </Card>

                    {/* 详细分析 */}
                    <Tabs defaultValue="shengxiao">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="shengxiao">{t("pages.marriage.tabs.shengxiao")}</TabsTrigger>
                            <TabsTrigger value="wuxing">{t("pages.marriage.tabs.wuxing")}</TabsTrigger>
                            <TabsTrigger value="bazi">{t("pages.marriage.tabs.bazi")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="shengxiao" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{t("pages.marriage.sections.shengxiaoAnalysis")}</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatMessage(t("pages.marriage.scoreUnit"), { value: result.analysis.shengxiao.score })}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-center gap-8 mb-6">
                                        <div className="text-center">
                                            <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <User className="h-8 w-8" />
                                            </div>
                                            <p className="font-bold mt-2">{result.analysis.shengxiao.male}</p>
                                        </div>
                                        <Heart className="w-12 h-12 text-pink-500" />
                                        <div className="text-center">
                                            <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-secondary/18 text-primary">
                                                <Users className="h-8 w-8" />
                                            </div>
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
                                        <span>{t("pages.marriage.sections.wuxingAnalysis")}</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatMessage(t("pages.marriage.scoreUnit"), { value: result.analysis.wuxing.score })}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <WuxingBar distribution={result.male.wuxing} label={t("pages.marriage.sections.maleWuxing")} />
                                        <WuxingBar distribution={result.female.wuxing} label={t("pages.marriage.sections.femaleWuxing")} />
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
                                        <CardTitle className="text-blue-600">{t("pages.marriage.sections.maleBazi")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            {[
                                                t("pages.bazi.pillars.year"),
                                                t("pages.bazi.pillars.month"),
                                                t("pages.bazi.pillars.day"),
                                                t("pages.bazi.pillars.hour"),
                                            ].map((label, i) => {
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
                                        <CardTitle className="text-pink-600">{t("pages.marriage.sections.femaleBazi")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            {[
                                                t("pages.bazi.pillars.year"),
                                                t("pages.bazi.pillars.month"),
                                                t("pages.bazi.pillars.day"),
                                                t("pages.bazi.pillars.hour"),
                                            ].map((label, i) => {
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
                        {t("pages.marriage.actions.reset")}
                    </Button>
                </div>
            )}
        </div>
    )
}
