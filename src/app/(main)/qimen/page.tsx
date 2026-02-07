"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Compass,
    Calendar,
    Clock,
    Grid3X3,
    Sparkles,
    RefreshCw,
    Info,
    ChevronRight,
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
import { logFortuneClient } from "@/lib/history/client-log"

// 天干地支
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 奇门遁甲九宫
const JIU_GONG = [
    { position: 4, name: "巽", element: "木", number: 4 },
    { position: 9, name: "离", element: "火", number: 9 },
    { position: 2, name: "坤", element: "土", number: 2 },
    { position: 3, name: "震", element: "木", number: 3 },
    { position: 5, name: "中", element: "土", number: 5 },
    { position: 7, name: "兑", element: "金", number: 7 },
    { position: 8, name: "艮", element: "土", number: 8 },
    { position: 1, name: "坎", element: "水", number: 1 },
    { position: 6, name: "乾", element: "金", number: 6 },
]

// 八门
const BA_MEN = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"]

// 九星
const JIU_XING = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"]

// 八神
const BA_SHEN = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"]

interface QimenResult {
    type: "qimen" | "liuren" | "jinkou"
    year: string
    month: string
    day: string
    hour: string
    ganZhi: { year: string; month: string; day: string; hour: string }
    ju: number
    yuan: "上元" | "中元" | "下元"
    grid: {
        position: number
        gong: string
        gan: string
        men: string
        xing: string
        shen: string
    }[]
    zhiFu: string
    zhiShi: string
}

/**
 * 奇门遁甲排盘页面
 */
export default function QimenPage() {
    const { t } = useTranslation()
    const [panType, setPanType] = useState<"qimen" | "liuren" | "jinkou">("qimen")
    const [step, setStep] = useState<"input" | "result">("input")
    const [result, setResult] = useState<QimenResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [useCurrentTime, setUseCurrentTime] = useState(true)

    const form = useForm({
        defaultValues: {
            year: new Date().getFullYear().toString(),
            month: (new Date().getMonth() + 1).toString(),
            day: new Date().getDate().toString(),
            hour: Math.floor(new Date().getHours() / 2).toString(),
        },
    })

    // 模拟奇门排盘计算
    const calculateQimen = (): QimenResult => {
        const now = useCurrentTime ? new Date() : new Date(
            parseInt(form.getValues("year")),
            parseInt(form.getValues("month")) - 1,
            parseInt(form.getValues("day")),
            parseInt(form.getValues("hour")) * 2
        )

        const seed = now.getFullYear() + now.getMonth() * 100 + now.getDate() * 10 + Math.floor(now.getHours() / 2)

        // 计算干支
        const yearGanIndex = (now.getFullYear() - 4) % 10
        const yearZhiIndex = (now.getFullYear() - 4) % 12

        const baseDays = Math.floor((now.getTime() - new Date(1900, 0, 31).getTime()) / (1000 * 60 * 60 * 24))
        const dayGanIndex = (baseDays % 10 + 10) % 10
        const dayZhiIndex = (baseDays % 12 + 12) % 12
        const hourZhiIndex = Math.floor((now.getHours() + 1) / 2) % 12

        // 生成九宫格数据
        const grid = JIU_GONG.map((gong, i) => ({
            position: gong.position,
            gong: gong.name,
            gan: TIAN_GAN[(seed + i) % 10],
            men: BA_MEN[(seed + i) % 8],
            xing: JIU_XING[(seed + i) % 9],
            shen: BA_SHEN[(seed + i) % 8],
        }))

        return {
            type: panType,
            year: now.getFullYear().toString(),
            month: (now.getMonth() + 1).toString(),
            day: now.getDate().toString(),
            hour: Math.floor(now.getHours() / 2).toString(),
            ganZhi: {
                year: TIAN_GAN[yearGanIndex] + DI_ZHI[yearZhiIndex],
                month: TIAN_GAN[(yearGanIndex * 2 + now.getMonth()) % 10] + DI_ZHI[(now.getMonth() + 2) % 12],
                day: TIAN_GAN[dayGanIndex] + DI_ZHI[dayZhiIndex],
                hour: TIAN_GAN[(dayGanIndex * 2 + hourZhiIndex) % 10] + DI_ZHI[hourZhiIndex],
            },
            ju: (seed % 9) + 1,
            yuan: ["上元", "中元", "下元"][seed % 3] as "上元" | "中元" | "下元",
            grid,
            zhiFu: JIU_XING[seed % 9],
            zhiShi: BA_MEN[seed % 8],
        }
    }

    const onSubmit = async () => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const calculated = calculateQimen()
        setResult(calculated)
        setStep("result")
        const historyType = panType === "jinkou" ? "jinkouque" : panType
        void logFortuneClient({
            type: historyType,
            title: getPanTypeName(),
            summary: `${calculated.year}-${calculated.month}-${calculated.day} ${calculated.ganZhi.day}`,
        })
        setIsLoading(false)
    }

    // 九宫格布局位置
    const getGridStyle = (position: number) => {
        const positions: Record<number, { row: number; col: number }> = {
            4: { row: 1, col: 1 }, 9: { row: 1, col: 2 }, 2: { row: 1, col: 3 },
            3: { row: 2, col: 1 }, 5: { row: 2, col: 2 }, 7: { row: 2, col: 3 },
            8: { row: 3, col: 1 }, 1: { row: 3, col: 2 }, 6: { row: 3, col: 3 },
        }
        return positions[position] || { row: 1, col: 1 }
    }

    const getPanTypeName = () => {
        switch (panType) {
            case "qimen":
                return t("pages.qimen.panTypes.qimen")
            case "liuren":
                return t("pages.qimen.panTypes.liuren")
            case "jinkou":
                return t("pages.qimen.panTypes.jinkou")
            default:
                return t("pages.qimen.panTypes.qimen")
        }
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10">
                    <Compass className="h-8 w-8 text-indigo-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.qimen.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.qimen.subtitle")}
                    </p>
                </div>
            </div>

            {step === "input" ? (
                <div className="space-y-6">
                    {/* 排盘类型选择 */}
                    <Tabs value={panType} onValueChange={(v) => setPanType(v as typeof panType)}>
                        <TabsList className="grid w-full max-w-lg grid-cols-3">
                            <TabsTrigger value="qimen" className="cursor-pointer">{t("pages.qimen.panTypes.qimen")}</TabsTrigger>
                            <TabsTrigger value="liuren" className="cursor-pointer">{t("pages.qimen.panTypes.liuren")}</TabsTrigger>
                            <TabsTrigger value="jinkou" className="cursor-pointer">{t("pages.qimen.panTypes.jinkou")}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="qimen" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.qimen.cards.qimen.title")}</CardTitle>
                                    <CardDescription>
                                        {t("pages.qimen.cards.qimen.description")}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>

                        <TabsContent value="liuren" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.qimen.cards.liuren.title")}</CardTitle>
                                    <CardDescription>
                                        {t("pages.qimen.cards.liuren.description")}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>

                        <TabsContent value="jinkou" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.qimen.cards.jinkou.title")}</CardTitle>
                                    <CardDescription>
                                        {t("pages.qimen.cards.jinkou.description")}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* 时间选择 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                {t("pages.qimen.sections.time")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant={useCurrentTime ? "default" : "outline"}
                                    onClick={() => setUseCurrentTime(true)}
                                    className="cursor-pointer"
                                >
                                    {t("pages.qimen.time.current")}
                                </Button>
                                <Button
                                    variant={!useCurrentTime ? "default" : "outline"}
                                    onClick={() => setUseCurrentTime(false)}
                                    className="cursor-pointer"
                                >
                                    {t("pages.qimen.time.custom")}
                                </Button>
                            </div>

                            {!useCurrentTime && (
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t("pages.qimen.labels.year")}</Label>
                                        <Select
                                            value={form.watch("year")}
                                            onValueChange={(v) => form.setValue("year", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 50 }, (_, i) => 1990 + i).map((year) => (
                                                    <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.qimen.labels.month")}</Label>
                                        <Select
                                            value={form.watch("month")}
                                            onValueChange={(v) => form.setValue("month", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                    <SelectItem key={month} value={month.toString()} className="cursor-pointer">
                                                        {formatMessage(t("pages.qimen.options.month"), { value: month })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.qimen.labels.day")}</Label>
                                        <Select
                                            value={form.watch("day")}
                                            onValueChange={(v) => form.setValue("day", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                    <SelectItem key={day} value={day.toString()} className="cursor-pointer">
                                                        {formatMessage(t("pages.qimen.options.day"), { value: day })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.qimen.labels.hour")}</Label>
                                        <Select
                                            value={form.watch("hour")}
                                            onValueChange={(v) => form.setValue("hour", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DI_ZHI.map((zhi, i) => (
                                                    <SelectItem key={i} value={i.toString()} className="cursor-pointer">
                                                        {formatMessage(t("pages.qimen.options.hour"), { value: zhi })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
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
                                {t("pages.qimen.actions.calculating")}
                            </>
                        ) : (
                            <>
                                <Grid3X3 className="mr-2 h-4 w-4" />
                                {t("pages.qimen.actions.start")}
                            </>
                        )}
                    </Button>
                </div>
            ) : result ? (
                <div className="space-y-6">
                    {/* 基本信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{formatMessage(t("pages.qimen.sections.summaryTitle"), { name: getPanTypeName() })}</CardTitle>
                            <CardDescription>
                                {formatMessage(t("pages.qimen.summary.datetime"), {
                                    year: result.year,
                                    month: result.month,
                                    day: result.day,
                                    hour: DI_ZHI[parseInt(result.hour)],
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.qimen.summary.yearPillar")}</span>
                                    <Badge variant="outline">{result.ganZhi.year}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.qimen.summary.monthPillar")}</span>
                                    <Badge variant="outline">{result.ganZhi.month}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.qimen.summary.dayPillar")}</span>
                                    <Badge variant="outline">{result.ganZhi.day}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.qimen.summary.hourPillar")}</span>
                                    <Badge variant="outline">{result.ganZhi.hour}</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{t("pages.qimen.summary.ju")}</span>
                                    <Badge>{formatMessage(t("pages.qimen.summary.juValue"), { yuan: result.yuan, ju: result.ju })}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 九宫格 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Grid3X3 className="h-5 w-5" />
                                {t("pages.qimen.sections.grid")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                                {result.grid.sort((a, b) => {
                                    const posA = getGridStyle(a.position)
                                    const posB = getGridStyle(b.position)
                                    if (posA.row !== posB.row) return posA.row - posB.row
                                    return posA.col - posB.col
                                }).map((cell) => (
                                    <div
                                        key={cell.position}
                                        className={cn(
                                            "aspect-square p-2 rounded-lg border flex flex-col justify-between",
                                            cell.position === 5 && "bg-primary/5 border-primary/30"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {formatMessage(t("pages.qimen.labels.gong"), { value: cell.gong })}
                                            </span>
                                            <Badge variant="outline" className="text-xs">{cell.position}</Badge>
                                        </div>
                                        <div className="text-center space-y-0.5">
                                            <div className="font-semibold text-sm text-purple-500">{cell.shen}</div>
                                            <div className="font-serif font-bold">{cell.xing}</div>
                                            <div className={cn(
                                                "text-sm font-medium",
                                                cell.men.includes("生") || cell.men.includes("开") || cell.men.includes("休") ? "text-green-500" :
                                                    cell.men.includes("死") || cell.men.includes("惊") || cell.men.includes("伤") ? "text-red-500" :
                                                        "text-yellow-500"
                                            )}>
                                                {cell.men}
                                            </div>
                                        </div>
                                        <div className="text-center text-xs text-muted-foreground">{cell.gan}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground">{t("pages.qimen.labels.zhiFu")}</div>
                                    <div className="font-serif text-xl font-bold">{result.zhiFu}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground">{t("pages.qimen.labels.zhiShi")}</div>
                                    <div className="font-serif text-xl font-bold">{result.zhiShi}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="general" title={t("pages.qimen.aiTitle")} />

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
                            {t("pages.qimen.actions.reset")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
