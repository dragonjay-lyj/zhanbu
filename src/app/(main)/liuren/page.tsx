"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useUser } from "@clerk/nextjs"
import {
    Orbit,
    Calendar,
    Clock,
    Sparkles,
    RefreshCw,
    Brain,
    Target,
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
import { logFortuneClient } from "@/lib/history/client-log"

// 十二将神
const TWELVE_GENERALS = ["贵人", "腾蛇", "朱雀", "六合", "勾陈", "青龙", "天空", "白虎", "太常", "玄武", "太阴", "天后"]
// 十二地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
// 四课
const SI_KE = ["一课", "二课", "三课", "四课"]
// 三传
const SAN_CHUAN = ["初传", "中传", "末传"]

// 时辰数据
const hours = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    zhi: DI_ZHI[i],
}))

interface LiurenFormData {
    question: string
    year: string
    month: string
    day: string
    hour: string
}

interface LiurenResult {
    siKe: { name: string; tianPan: string; diPan: string; general: string }[]
    sanChuan: { name: string; zhi: string; general: string }[]
    riGan: string
    riZhi: string
    analysis: string
}

/**
 * 大六壬排盘页面
 */
export default function LiurenPage() {
    const { t } = useTranslation()
    const { isSignedIn, user } = useUser()
    const [result, setResult] = useState<LiurenResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState("input")

    const form = useForm<LiurenFormData>({
        defaultValues: {
            question: "",
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            day: new Date().getDate().toString(),
            hour: Math.floor(new Date().getHours() / 2).toString(),
        },
    })

    // 模拟大六壬排盘
    const calculateLiuren = (data: LiurenFormData): LiurenResult => {
        const siKe = SI_KE.map((name, i) => ({
            name,
            tianPan: DI_ZHI[(i * 3 + 2) % 12],
            diPan: DI_ZHI[(i * 2 + 1) % 12],
            general: TWELVE_GENERALS[i % 12],
        }))

        const sanChuan = SAN_CHUAN.map((name, i) => ({
            name,
            zhi: DI_ZHI[(i * 4 + 3) % 12],
            general: TWELVE_GENERALS[(i + 6) % 12],
        }))

        return {
            siKe,
            sanChuan,
            riGan: "甲",
            riZhi: "子",
            analysis: t("pages.liuren.analysis.sample"),
        }
    }

    const buildAiAnalysis = (data: LiurenResult) => {
        const name = user?.firstName || t("nav.userFallback")
        const sanChuan = data.sanChuan.map((c) => c.zhi).join("、")
        return [
            formatMessage(t("pages.liuren.ai.greeting"), { name }),
            t("pages.liuren.ai.intro"),
            formatMessage(t("pages.liuren.ai.lines.line1"), { riGan: data.riGan, riZhi: data.riZhi, sanChuan }),
            t("pages.liuren.ai.lines.line2"),
            t("pages.liuren.ai.lines.line3"),
            t("pages.liuren.ai.lines.line4"),
        ].join("\n\n")
    }

    const onSubmit = async (data: LiurenFormData) => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const calculated = calculateLiuren(data)
        setResult(calculated)
        setActiveTab("result")
        void logFortuneClient({
            type: "liuren",
            title: "大六壬",
            summary: `${data.year}-${data.month}-${data.day} · ${String(data.question || "起课").slice(0, 120)}`,
        })
        setIsLoading(false)
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10">
                    <Orbit className="h-8 w-8 text-cyan-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.liuren.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.liuren.subtitle")}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="input" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t("pages.liuren.tabs.input")}
                    </TabsTrigger>
                    <TabsTrigger value="result" disabled={!result} className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t("pages.liuren.tabs.result")}
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
                                    {t("pages.liuren.sections.question")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Input
                                    placeholder={t("pages.liuren.placeholders.question")}
                                    {...form.register("question")}
                                />
                            </CardContent>
                        </Card>

                            {/* 时间选择 */}
                            <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {t("pages.liuren.sections.time")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.liuren.sections.timeDesc")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t("pages.liuren.labels.year")}</Label>
                                        <Input {...form.register("year")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.liuren.labels.month")}</Label>
                                        <Input {...form.register("month")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.liuren.labels.day")}</Label>
                                        <Input {...form.register("day")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.liuren.labels.hour")}</Label>
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
                                                        {formatMessage(t("pages.liuren.options.hour"), { value: hour.zhi })}
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
                                                {t("pages.liuren.actions.calculating")}
                                            </>
                                        ) : (
                                            <>
                                                <Orbit className="mr-2 h-4 w-4" />
                                                {t("pages.liuren.actions.start")}
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
                            {/* 日干支 */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-center gap-8">
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">{t("pages.liuren.labels.dayGan")}</div>
                                            <div className="font-serif text-3xl font-bold text-primary">{result.riGan}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">{t("pages.liuren.labels.dayZhi")}</div>
                                            <div className="font-serif text-3xl font-bold">{result.riZhi}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 四课 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.liuren.sections.siKe")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        {result.siKe.map((ke) => (
                                            <div key={ke.name} className="text-center p-4 rounded-lg border bg-card">
                                                <div className="text-xs text-muted-foreground mb-2">{ke.name}</div>
                                                <div className="font-bold text-primary">{ke.tianPan}</div>
                                                <div className="text-xs my-1">—</div>
                                                <div className="font-bold">{ke.diPan}</div>
                                                <Badge variant="outline" className="mt-2 text-xs">{ke.general}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 三传 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.liuren.sections.sanChuan")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        {result.sanChuan.map((chuan) => (
                                            <div key={chuan.name} className="text-center p-4 rounded-lg border bg-card">
                                                <div className="text-xs text-muted-foreground mb-2">{chuan.name}</div>
                                                <div className="font-serif text-2xl font-bold text-primary">{chuan.zhi}</div>
                                                <Badge variant="secondary" className="mt-2">{chuan.general}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 基础分析 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.liuren.sections.analysis")}</CardTitle>
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
                                                <h3 className="font-semibold">{t("pages.liuren.ai.title")}</h3>
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
                                                            {t("pages.liuren.ai.analyzing")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            {t("pages.liuren.ai.action")}
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">{t("pages.liuren.ai.loginTitle")}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {t("pages.liuren.ai.loginDesc")}
                                            </p>
                                            <Button variant="outline" className="cursor-pointer" asChild>
                                                <a href="/sign-in">{t("pages.liuren.ai.loginAction")}</a>
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
                                    {t("pages.liuren.actions.reset")}
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
