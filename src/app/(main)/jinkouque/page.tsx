"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useUser } from "@clerk/nextjs"
import {
    Fingerprint,
    Calendar,
    Clock,
    Sparkles,
    RefreshCw,
    Brain,
    Target,
    Hand,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 十二地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
// 十二将神
const TWELVE_GENERALS = ["贵人", "腾蛇", "朱雀", "六合", "勾陈", "青龙", "天空", "白虎", "太常", "玄武", "太阴", "天后"]
// 五行
const WU_XING = ["金", "木", "水", "火", "土"]

// 时辰数据
const hours = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    zhi: DI_ZHI[i],
}))

interface JinkoujueFormData {
    question: string
    method: "time" | "finger"
    year: string
    month: string
    day: string
    hour: string
    fingerPosition?: string
}

interface JinkoujueResult {
    difen: { name: string; zhi: string; general: string }
    jiangShen: { name: string; zhi: string; general: string }
    guiShen: { name: string; zhi: string; general: string }
    renYuan: { name: string; zhi: string; general: string }
    analysis: string
    wuxing: string
}

/**
 * 金口诀排盘页面
 */
export default function JinkoujuePage() {
    const { t } = useTranslation()
    const { isSignedIn, user } = useUser()
    const [result, setResult] = useState<JinkoujueResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState("input")

    const form = useForm<JinkoujueFormData>({
        defaultValues: {
            question: "",
            method: "time",
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            day: new Date().getDate().toString(),
            hour: Math.floor(new Date().getHours() / 2).toString(),
        },
    })

    // 模拟金口诀排盘
    const calculateJinkoujue = (data: JinkoujueFormData): JinkoujueResult => {
        const hourIdx = parseInt(data.hour)
        return {
            difen: { name: "地分", zhi: DI_ZHI[hourIdx], general: TWELVE_GENERALS[hourIdx] },
            jiangShen: { name: "将神", zhi: DI_ZHI[(hourIdx + 4) % 12], general: TWELVE_GENERALS[(hourIdx + 4) % 12] },
            guiShen: { name: "贵神", zhi: DI_ZHI[(hourIdx + 8) % 12], general: TWELVE_GENERALS[(hourIdx + 8) % 12] },
            renYuan: { name: "人元", zhi: "甲", general: "天乙贵人" },
            analysis: t("pages.jinkouque.analysis.sample"),
            wuxing: WU_XING[hourIdx % 5],
        }
    }

    const getDirectionLabel = (wuxing: string) => {
        switch (wuxing) {
            case "金":
                return t("pages.jinkouque.ai.directions.west")
            case "木":
                return t("pages.jinkouque.ai.directions.east")
            case "水":
                return t("pages.jinkouque.ai.directions.north")
            case "火":
                return t("pages.jinkouque.ai.directions.south")
            default:
                return t("pages.jinkouque.ai.directions.center")
        }
    }

    const buildAiAnalysis = (data: JinkoujueResult) => {
        const name = user?.firstName || t("nav.userFallback")
        return [
            formatMessage(t("pages.jinkouque.ai.greeting"), { name }),
            t("pages.jinkouque.ai.intro"),
            formatMessage(t("pages.jinkouque.ai.lines.line1"), {
                difen: data.difen.zhi,
                jiangShen: data.jiangShen.zhi,
                guiShen: data.guiShen.zhi,
                renYuan: data.renYuan.zhi,
            }),
            t("pages.jinkouque.ai.lines.line2"),
            formatMessage(t("pages.jinkouque.ai.lines.line3"), {
                wuxing: data.wuxing,
                direction: getDirectionLabel(data.wuxing),
            }),
            t("pages.jinkouque.ai.lines.line4"),
        ].join("\n\n")
    }

    const onSubmit = async (data: JinkoujueFormData) => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const calculated = calculateJinkoujue(data)
        setResult(calculated)
        setActiveTab("result")
        setIsLoading(false)
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                    <Fingerprint className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.jinkouque.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.jinkouque.subtitle")}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="input" className="cursor-pointer">
                        <Hand className="mr-2 h-4 w-4" />
                        {t("pages.jinkouque.tabs.input")}
                    </TabsTrigger>
                    <TabsTrigger value="result" disabled={!result} className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t("pages.jinkouque.tabs.result")}
                    </TabsTrigger>
                </TabsList>

                {/* 输入表单 */}
                <TabsContent value="input" className="mt-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* 问题描述 */}
                            <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    {t("pages.jinkouque.sections.question")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder={t("pages.jinkouque.placeholders.question")}
                                    {...form.register("question")}
                                />
                            </CardContent>
                        </Card>

                            {/* 起课方式 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.jinkouque.sections.method")}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="time"
                                                {...form.register("method")}
                                                className="w-4 h-4"
                                            />
                                            <span>{t("pages.jinkouque.methods.time")}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="finger"
                                                {...form.register("method")}
                                                className="w-4 h-4"
                                            />
                                            <span>{t("pages.jinkouque.methods.finger")}</span>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 时间选择 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        {t("pages.jinkouque.sections.time")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("pages.jinkouque.labels.month")}</Label>
                                            <Input {...form.register("month")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("pages.jinkouque.labels.day")}</Label>
                                            <Input {...form.register("day")} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label>{t("pages.jinkouque.labels.hour")}</Label>
                                            <Select
                                                value={form.watch("hour")}
                                                onValueChange={(v) => form.setValue("hour", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {hours.map((hour) => (
                                                        <SelectItem key={hour.value} value={hour.value} className="cursor-pointer">
                                                            {formatMessage(t("pages.jinkouque.options.hour"), { value: hour.zhi })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 提交按钮 */}
                            <Card className="md:col-span-2">
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full cursor-pointer"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                {t("pages.jinkouque.actions.calculating")}
                                            </>
                                        ) : (
                                            <>
                                                <Fingerprint className="mr-2 h-4 w-4" />
                                                {t("pages.jinkouque.actions.start")}
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </TabsContent>

                {/* 结果展示 */}
                <TabsContent value="result" className="mt-6">
                    {result && (
                        <div className="space-y-6">
                            {/* 四位一体 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.jinkouque.sections.fourPositions.title")}</CardTitle>
                                    <CardDescription>{t("pages.jinkouque.sections.fourPositions.desc")}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                                        {/* 人元 */}
                                        <div className="text-center p-4 rounded-lg border bg-primary/10 border-primary w-full">
                                            <div className="text-xs text-muted-foreground mb-1">{result.renYuan.name}</div>
                                            <div className="font-serif text-2xl font-bold text-primary">{result.renYuan.zhi}</div>
                                            <Badge variant="secondary" className="mt-1">{result.renYuan.general}</Badge>
                                        </div>
                                        {/* 贵神 */}
                                        <div className="text-center p-4 rounded-lg border bg-card w-full">
                                            <div className="text-xs text-muted-foreground mb-1">{result.guiShen.name}</div>
                                            <div className="font-serif text-2xl font-bold">{result.guiShen.zhi}</div>
                                            <Badge variant="outline" className="mt-1">{result.guiShen.general}</Badge>
                                        </div>
                                        {/* 将神 */}
                                        <div className="text-center p-4 rounded-lg border bg-card w-full">
                                            <div className="text-xs text-muted-foreground mb-1">{result.jiangShen.name}</div>
                                            <div className="font-serif text-2xl font-bold">{result.jiangShen.zhi}</div>
                                            <Badge variant="outline" className="mt-1">{result.jiangShen.general}</Badge>
                                        </div>
                                        {/* 地分 */}
                                        <div className="text-center p-4 rounded-lg border bg-card w-full">
                                            <div className="text-xs text-muted-foreground mb-1">{result.difen.name}</div>
                                            <div className="font-serif text-2xl font-bold">{result.difen.zhi}</div>
                                            <Badge variant="outline" className="mt-1">{result.difen.general}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 五行分析 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.jinkouque.sections.wuxing")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <Badge className="text-lg px-6 py-2">{result.wuxing}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 基础分析 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.jinkouque.sections.analysis")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{result.analysis}</p>
                                </CardContent>
                            </Card>

                            {/* AI 解读区域 */}
                            <Card className={cn(
                                "border-2",
                                isSignedIn ? "border-primary/50 bg-primary/5" : "border-dashed"
                            )}>
                                <CardContent className="pt-6">
                                    {isSignedIn ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Brain className="h-5 w-5 text-primary" />
                                                <h3 className="font-semibold">{t("pages.jinkouque.ai.title")}</h3>
                                            </div>
                                            {aiAnalysis ? (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {aiAnalysis}
                                                </p>
                                            ) : (
                                                <Button
                                                    onClick={async () => {
                                                        setIsAnalyzing(true)
                                                        await new Promise(resolve => setTimeout(resolve, 2000))
                                                        setAiAnalysis(buildAiAnalysis(result))
                                                        setIsAnalyzing(false)
                                                    }}
                                                    disabled={isAnalyzing}
                                                    className="cursor-pointer"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                            {t("pages.jinkouque.ai.analyzing")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            {t("pages.jinkouque.ai.action")}
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">{t("pages.jinkouque.ai.loginTitle")}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {t("pages.jinkouque.ai.loginDesc")}
                                            </p>
                                            <Button variant="outline" className="cursor-pointer" asChild>
                                                <a href="/sign-in">{t("pages.jinkouque.ai.loginAction")}</a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab("input")}
                                    className="cursor-pointer"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t("pages.jinkouque.actions.reset")}
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
