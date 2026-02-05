"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Home,
    Compass,
    Grid3X3,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ArrowUpLeft,
    ArrowDownRight,
    ArrowDownLeft,
    Sparkles,
    RefreshCw,
    Info,
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
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 九宫飞星基础
const FLYING_STARS = [
    { number: 1, name: "一白", element: "水", nature: "贪狼", fortune: "桃花、文昌" },
    { number: 2, name: "二黑", element: "土", nature: "巨门", fortune: "病符" },
    { number: 3, name: "三碧", element: "木", nature: "禄存", fortune: "是非、官讼" },
    { number: 4, name: "四绿", element: "木", nature: "文曲", fortune: "文昌、桃花" },
    { number: 5, name: "五黄", element: "土", nature: "廉贞", fortune: "灾祸" },
    { number: 6, name: "六白", element: "金", nature: "武曲", fortune: "权力、财运" },
    { number: 7, name: "七赤", element: "金", nature: "破军", fortune: "破财、口舌" },
    { number: 8, name: "八白", element: "土", nature: "左辅", fortune: "财运" },
    { number: 9, name: "九紫", element: "火", nature: "右弼", fortune: "喜庆" },
]

// 二十四山向
const TWENTY_FOUR_MOUNTAINS = [
    { name: "壬", direction: "北", degrees: "337.5-352.5" },
    { name: "子", direction: "北", degrees: "352.5-7.5" },
    { name: "癸", direction: "北", degrees: "7.5-22.5" },
    { name: "丑", direction: "东北", degrees: "22.5-37.5" },
    { name: "艮", direction: "东北", degrees: "37.5-52.5" },
    { name: "寅", direction: "东北", degrees: "52.5-67.5" },
    { name: "甲", direction: "东", degrees: "67.5-82.5" },
    { name: "卯", direction: "东", degrees: "82.5-97.5" },
    { name: "乙", direction: "东", degrees: "97.5-112.5" },
    { name: "辰", direction: "东南", degrees: "112.5-127.5" },
    { name: "巽", direction: "东南", degrees: "127.5-142.5" },
    { name: "巳", direction: "东南", degrees: "142.5-157.5" },
    { name: "丙", direction: "南", degrees: "157.5-172.5" },
    { name: "午", direction: "南", degrees: "172.5-187.5" },
    { name: "丁", direction: "南", degrees: "187.5-202.5" },
    { name: "未", direction: "西南", degrees: "202.5-217.5" },
    { name: "坤", direction: "西南", degrees: "217.5-232.5" },
    { name: "申", direction: "西南", degrees: "232.5-247.5" },
    { name: "庚", direction: "西", degrees: "247.5-262.5" },
    { name: "酉", direction: "西", degrees: "262.5-277.5" },
    { name: "辛", direction: "西", degrees: "277.5-292.5" },
    { name: "戌", direction: "西北", degrees: "292.5-307.5" },
    { name: "乾", direction: "西北", degrees: "307.5-322.5" },
    { name: "亥", direction: "西北", degrees: "322.5-337.5" },
]

// 方位对应
const DIRECTIONS = [
    { name: "东南", gong: "巽", icon: ArrowUpRight, position: { row: 1, col: 1 } },
    { name: "南", gong: "离", icon: ArrowUp, position: { row: 1, col: 2 } },
    { name: "西南", gong: "坤", icon: ArrowUpLeft, position: { row: 1, col: 3 } },
    { name: "东", gong: "震", icon: ArrowRight, position: { row: 2, col: 1 } },
    { name: "中", gong: "中", icon: Home, position: { row: 2, col: 2 } },
    { name: "西", gong: "兑", icon: ArrowLeft, position: { row: 2, col: 3 } },
    { name: "东北", gong: "艮", icon: ArrowDownRight, position: { row: 3, col: 1 } },
    { name: "北", gong: "坎", icon: ArrowDown, position: { row: 3, col: 2 } },
    { name: "西北", gong: "乾", icon: ArrowDownLeft, position: { row: 3, col: 3 } },
]

interface FengShuiResult {
    year: number
    period: number
    mountain: string
    facing: string
    grid: {
        direction: string
        gong: string
        mountainStar: number
        facingStar: number
        periodStar: number
        interpretation: string
        isGood: boolean
    }[]
    analysis: {
        wealthPosition: string[]
        sicknessPosition: string[]
        peachBlossomPosition: string[]
        studyPosition: string[]
    }
}

/**
 * 玄空风水排盘页面
 */
export default function FengshuiPage() {
    const { t } = useTranslation()
    const [step, setStep] = useState<"input" | "result">("input")
    const [result, setResult] = useState<FengShuiResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            year: new Date().getFullYear().toString(),
            mountain: "子",
            facing: "午",
        },
    })

    // 计算元运
    const getPeriod = (year: number): number => {
        if (year >= 2024 && year <= 2043) return 9
        if (year >= 2004 && year <= 2023) return 8
        if (year >= 1984 && year <= 2003) return 7
        if (year >= 1964 && year <= 1983) return 6
        return 8
    }

    // 计算玄空飞星盘
    const calculateFengShui = (): FengShuiResult => {
        const year = parseInt(form.getValues("year"))
        const mountain = form.getValues("mountain")
        const facing = form.getValues("facing")
        const period = getPeriod(year)

        // 顺飞九宫位置
        const flyingOrder = [5, 6, 7, 8, 9, 1, 2, 3, 4]

        // 计算各宫星曜
        const grid = DIRECTIONS.map((dir, i) => {
            const mountainStar = ((period + i) % 9) + 1
            const facingStar = ((period + 8 - i) % 9) + 1
            const periodStar = ((period + i * 2) % 9) + 1

            const starInfo = FLYING_STARS.find((s) => s.number === periodStar)
            const isGood = [1, 4, 6, 8, 9].includes(periodStar)

            return {
                direction: dir.name,
                gong: dir.gong,
                mountainStar,
                facingStar,
                periodStar,
                interpretation: starInfo?.fortune || "",
                isGood,
            }
        })

        // 分析重要方位
        const findPositions = (stars: number[]) =>
            grid.filter((g) => stars.includes(g.periodStar)).map((g) => g.direction)

        return {
            year,
            period,
            mountain,
            facing,
            grid,
            analysis: {
                wealthPosition: findPositions([8, 9]),
                sicknessPosition: findPositions([2, 5]),
                peachBlossomPosition: findPositions([1, 4]),
                studyPosition: findPositions([4]),
            },
        }
    }

    const onSubmit = async () => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const calculated = calculateFengShui()
        setResult(calculated)
        setStep("result")
        setIsLoading(false)
    }

    const getStarColor = (star: number) => {
        if ([8, 9].includes(star)) return "text-green-500"
        if ([1, 6].includes(star)) return "text-blue-500"
        if ([4].includes(star)) return "text-purple-500"
        if ([2, 5].includes(star)) return "text-red-500"
        if ([3, 7].includes(star)) return "text-orange-500"
        return "text-gray-500"
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                    <Home className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.fengshui.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.fengshui.subtitle")}
                    </p>
                </div>
            </div>

            {step === "input" ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.fengshui.sections.input.title")}</CardTitle>
                            <CardDescription>
                                {t("pages.fengshui.sections.input.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>{t("pages.fengshui.labels.year")}</Label>
                                <Select
                                    value={form.watch("year")}
                                    onValueChange={(v) => form.setValue("year", v)}
                                >
                                    <SelectTrigger className="cursor-pointer">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 60 }, (_, i) => 1980 + i).map((year) => (
                                            <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                                                {formatMessage(t("pages.fengshui.options.year"), {
                                                    year,
                                                    period: getPeriod(year),
                                                })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("pages.fengshui.labels.mountain")}</Label>
                                    <Select
                                        value={form.watch("mountain")}
                                        onValueChange={(v) => form.setValue("mountain", v)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TWENTY_FOUR_MOUNTAINS.map((m) => (
                                                <SelectItem key={m.name} value={m.name} className="cursor-pointer">
                                                    {m.name} ({m.direction})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("pages.fengshui.labels.facing")}</Label>
                                    <Select
                                        value={form.watch("facing")}
                                        onValueChange={(v) => form.setValue("facing", v)}
                                    >
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TWENTY_FOUR_MOUNTAINS.map((m) => (
                                                <SelectItem key={m.name} value={m.name} className="cursor-pointer">
                                                    {m.name} ({m.direction})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50">
                                <div className="flex items-start gap-2">
                                    <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                    <div className="text-sm text-muted-foreground">
                                        {t("pages.fengshui.help")}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        size="lg"
                        className="w-full cursor-pointer"
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                {t("pages.fengshui.actions.calculating")}
                            </>
                        ) : (
                            <>
                                <Grid3X3 className="mr-2 h-4 w-4" />
                                {t("pages.fengshui.actions.start")}
                            </>
                        )}
                    </Button>
                </div>
            ) : result ? (
                <div className="space-y-6">
                    {/* 基本信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.fengshui.sections.summary.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.fengshui.summary.year")}</span>
                                    <Badge variant="outline">
                                        {formatMessage(t("pages.fengshui.summary.yearValue"), { year: result.year })}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.fengshui.summary.period")}</span>
                                    <Badge>
                                        {formatMessage(t("pages.fengshui.summary.periodValue"), { period: result.period })}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.fengshui.summary.orientation")}</span>
                                    <Badge variant="secondary">
                                        {formatMessage(t("pages.fengshui.summary.orientationValue"), {
                                            mountain: result.mountain,
                                            facing: result.facing,
                                        })}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 九宫飞星盘 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Grid3X3 className="h-5 w-5" />
                                {t("pages.fengshui.sections.chart.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                                {result.grid.map((cell) => {
                                    const dir = DIRECTIONS.find((d) => d.name === cell.direction)
                                    const Icon = dir?.icon || Home
                                    return (
                                        <div
                                            key={cell.direction}
                                            className={cn(
                                                "aspect-square p-2 rounded-lg border flex flex-col",
                                                cell.isGood ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                                            )}
                                        >
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{cell.direction}</span>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="flex justify-center gap-1">
                                                        <span className={cn("font-bold", getStarColor(cell.mountainStar))}>
                                                            {cell.mountainStar}
                                                        </span>
                                                        <span className={cn("font-bold text-lg", getStarColor(cell.periodStar))}>
                                                            {cell.periodStar}
                                                        </span>
                                                        <span className={cn("font-bold", getStarColor(cell.facingStar))}>
                                                            {cell.facingStar}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {cell.interpretation}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-4 flex justify-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-current text-muted-foreground" />
                                    <span>{t("pages.fengshui.chart.mountainStar")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-current text-primary" />
                                    <span>{t("pages.fengshui.chart.periodStar")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-current text-muted-foreground" />
                                    <span>{t("pages.fengshui.chart.facingStar")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 方位分析 */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="border-green-500/20">
                            <CardHeader>
                                <CardTitle className="text-green-500">{t("pages.fengshui.positions.wealth.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.wealthPosition.map((pos) => (
                                        <Badge key={pos} className="bg-green-500">{pos}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t("pages.fengshui.positions.wealth.desc")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-500/20">
                            <CardHeader>
                                <CardTitle className="text-purple-500">{t("pages.fengshui.positions.study.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.studyPosition.map((pos) => (
                                        <Badge key={pos} className="bg-purple-500">{pos}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t("pages.fengshui.positions.study.desc")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-pink-500/20">
                            <CardHeader>
                                <CardTitle className="text-pink-500">{t("pages.fengshui.positions.peach.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.peachBlossomPosition.map((pos) => (
                                        <Badge key={pos} className="bg-pink-500">{pos}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t("pages.fengshui.positions.peach.desc")}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-red-500/20">
                            <CardHeader>
                                <CardTitle className="text-red-500">{t("pages.fengshui.positions.sickness.title")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.sicknessPosition.map((pos) => (
                                        <Badge key={pos} variant="destructive">{pos}</Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {t("pages.fengshui.positions.sickness.desc")}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="general" title={t("pages.fengshui.aiTitle")} />

                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setResult(null)
                                setStep("input")
                            }}
                            className="cursor-pointer"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("pages.fengshui.actions.reset")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
