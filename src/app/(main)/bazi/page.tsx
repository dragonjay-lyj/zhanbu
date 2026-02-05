"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    LayoutGrid,
    Calendar,
    Clock,
    MapPin,
    User,
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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn, TIAN_GAN, DI_ZHI, getChineseHour } from "@/lib/utils"
import { useTranslation, formatMessage } from "@/lib/i18n"

import { BaziCalculator } from "@/components/bazi/bazi-calculator"
import { BaziReverse } from "@/components/bazi/bazi-reverse"
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"

// 中国省份数据
const provinces = [
    "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
    "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
    "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾",
    "内蒙古", "广西", "西藏", "宁夏", "新疆", "香港", "澳门",
]

// 时辰数据（0-23小时对应子-亥时）
const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: `${i.toString().padStart(2, "0")}:00 (${getChineseHour(i)})`,
}))

// 年份范围
const years = Array.from({ length: 200 }, (_, i) => 1924 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)

// 表单数据类型
interface BaziFormData {
    name: string
    gender: "male" | "female"
    birthYear: string
    birthMonth: string
    birthDay: string
    birthHour: string
    birthMinute: string
    isLunar: boolean
    useTrueSolar: boolean
    province: string
    city: string
}

// 八字结果类型
interface BaziResult {
    yearPillar: { gan: string; zhi: string }
    monthPillar: { gan: string; zhi: string }
    dayPillar: { gan: string; zhi: string }
    hourPillar: { gan: string; zhi: string }
    wuxing: Record<string, number>
    dayMaster: string
    dayMasterElement: string
}

/**
 * 八字排盘页面
 */
export default function BaziPage() {
    const { t } = useTranslation()
    const [result, setResult] = useState<BaziResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("input")

    const form = useForm<BaziFormData>({
        defaultValues: {
            name: "",
            gender: "male",
            birthYear: "1990",
            birthMonth: "1",
            birthDay: "1",
            birthHour: "12",
            birthMinute: "0",
            isLunar: false,
            useTrueSolar: true,
            province: "北京",
            city: "",
        },
    })

    // 模拟八字计算（实际需要使用专业算法库）
    const calculateBazi = (data: BaziFormData): BaziResult => {
        // 这里使用简化的模拟计算
        // 实际应用中需要使用专业的八字计算库
        const yearIndex = (parseInt(data.birthYear) - 4) % 10
        const yearZhiIndex = (parseInt(data.birthYear) - 4) % 12

        return {
            yearPillar: {
                gan: TIAN_GAN[yearIndex],
                zhi: DI_ZHI[yearZhiIndex],
            },
            monthPillar: {
                gan: TIAN_GAN[(yearIndex * 2 + parseInt(data.birthMonth)) % 10],
                zhi: DI_ZHI[(parseInt(data.birthMonth) + 1) % 12],
            },
            dayPillar: {
                gan: TIAN_GAN[parseInt(data.birthDay) % 10],
                zhi: DI_ZHI[parseInt(data.birthDay) % 12],
            },
            hourPillar: {
                gan: TIAN_GAN[(parseInt(data.birthDay) * 2 + Math.floor(parseInt(data.birthHour) / 2)) % 10],
                zhi: DI_ZHI[Math.floor((parseInt(data.birthHour) + 1) / 2) % 12],
            },
            wuxing: {
                木: 2,
                火: 1,
                土: 2,
                金: 2,
                水: 1,
            },
            dayMaster: TIAN_GAN[parseInt(data.birthDay) % 10],
            dayMasterElement: "土",
        }
    }

    const onSubmit = async (data: BaziFormData) => {
        setIsLoading(true)

        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const calculated = calculateBazi(data)
        setResult(calculated)
        setActiveTab("result")
        setIsLoading(false)
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                    <LayoutGrid className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.bazi.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.bazi.subtitle")}
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                    <TabsTrigger value="input" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {t("pages.bazi.tabs.input")}
                    </TabsTrigger>
                    <TabsTrigger value="result" disabled={!result} className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t("pages.bazi.tabs.result")}
                    </TabsTrigger>
                    <TabsTrigger value="calculator" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t("pages.bazi.tabs.calculator")}
                    </TabsTrigger>
                    <TabsTrigger value="reverse" className="cursor-pointer">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("pages.bazi.tabs.reverse")}
                    </TabsTrigger>
                </TabsList>


                {/* 输入表单 */}
                <TabsContent value="input" className="mt-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* 基本信息 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        {t("pages.bazi.sections.basicInfo")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("pages.bazi.sections.basicInfoDesc")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("pages.bazi.labels.name")}</Label>
                                        <Input
                                            id="name"
                                            placeholder={t("pages.bazi.placeholders.name")}
                                            {...form.register("name")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("pages.bazi.labels.gender")}</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="male"
                                                    {...form.register("gender")}
                                                    className="w-4 h-4"
                                                />
                                                <span>{t("pages.bazi.gender.male")}</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="female"
                                                    {...form.register("gender")}
                                                    className="w-4 h-4"
                                                />
                                                <span>{t("pages.bazi.gender.female")}</span>
                                            </label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 出生时间 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        {t("pages.bazi.sections.birthTime")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("pages.bazi.sections.birthTimeDesc")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-2">
                                            <Label>{t("pages.bazi.labels.year")}</Label>
                                            <Select
                                                value={form.watch("birthYear")}
                                                onValueChange={(v) => form.setValue("birthYear", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year}
                                                            value={year.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            {formatMessage(t("pages.bazi.options.year"), { value: year })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("pages.bazi.labels.month")}</Label>
                                            <Select
                                                value={form.watch("birthMonth")}
                                                onValueChange={(v) => form.setValue("birthMonth", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem
                                                            key={month}
                                                            value={month.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            {formatMessage(t("pages.bazi.options.month"), { value: month })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("pages.bazi.labels.day")}</Label>
                                            <Select
                                                value={form.watch("birthDay")}
                                                onValueChange={(v) => form.setValue("birthDay", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {days.map((day) => (
                                                        <SelectItem
                                                            key={day}
                                                            value={day.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            {formatMessage(t("pages.bazi.options.day"), { value: day })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label>{t("pages.bazi.labels.hour")}</Label>
                                            <Select
                                                value={form.watch("birthHour")}
                                                onValueChange={(v) => form.setValue("birthHour", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {hours.map((hour) => (
                                                        <SelectItem
                                                            key={hour.value}
                                                            value={hour.value}
                                                            className="cursor-pointer"
                                                        >
                                                            {hour.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("pages.bazi.labels.minute")}</Label>
                                            <Select
                                                value={form.watch("birthMinute")}
                                                onValueChange={(v) => form.setValue("birthMinute", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 60 }, (_, i) => (
                                                        <SelectItem
                                                            key={i}
                                                            value={i.toString()}
                                                            className="cursor-pointer"
                                                        >
                                                            {formatMessage(t("pages.bazi.options.minute"), { value: i.toString().padStart(2, "0") })}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="isLunar"
                                                checked={form.watch("isLunar")}
                                                onCheckedChange={(v) => form.setValue("isLunar", v)}
                                            />
                                            <Label htmlFor="isLunar" className="cursor-pointer">
                                                {t("pages.bazi.labels.lunarDate")}
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 出生地点 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        {t("pages.bazi.sections.birthLocation")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("pages.bazi.sections.birthLocationDesc")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("pages.bazi.labels.province")}</Label>
                                        <Select
                                            value={form.watch("province")}
                                            onValueChange={(v) => form.setValue("province", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((province) => (
                                                    <SelectItem
                                                        key={province}
                                                        value={province}
                                                        className="cursor-pointer"
                                                    >
                                                        {province}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id="useTrueSolar"
                                                checked={form.watch("useTrueSolar")}
                                                onCheckedChange={(v) => form.setValue("useTrueSolar", v)}
                                            />
                                            <Label htmlFor="useTrueSolar" className="cursor-pointer">
                                                {t("pages.bazi.labels.trueSolar")}
                                            </Label>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            <Info className="mr-1 h-3 w-3" />
                                            {t("pages.bazi.badge.recommended")}
                                        </Badge>
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
                                                {t("pages.bazi.actions.calculating")}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                {t("pages.bazi.actions.start")}
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
                            {/* 四柱展示 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5" />
                                        {t("pages.bazi.results.pillarsTitle")}
                                    </CardTitle>
                                    <CardDescription>
                                        {t("pages.bazi.results.pillarsDesc")}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[
                                            { label: t("pages.bazi.pillars.year"), ...result.yearPillar },
                                            { label: t("pages.bazi.pillars.month"), ...result.monthPillar },
                                            { label: t("pages.bazi.pillars.day"), ...result.dayPillar },
                                            { label: t("pages.bazi.pillars.hour"), ...result.hourPillar },
                                        ].map((pillar) => (
                                            <div
                                                key={pillar.label}
                                                className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50"
                                            >
                                                <div className="text-xs text-muted-foreground mb-2">
                                                    {pillar.label}
                                                </div>
                                                <div className="font-serif text-2xl font-bold text-primary">
                                                    {pillar.gan}
                                                </div>
                                                <div className="font-serif text-2xl font-bold text-secondary">
                                                    {pillar.zhi}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 五行分布 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.bazi.results.wuxingTitle")}</CardTitle>
                                    <CardDescription>
                                        {formatMessage(t("pages.bazi.results.dayMasterLabel"), {
                                            master: result.dayMaster,
                                            element: result.dayMasterElement,
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-5 gap-2">
                                        {Object.entries(result.wuxing).map(([element, count]) => (
                                            <div
                                                key={element}
                                                className={cn(
                                                    "text-center p-3 rounded-lg",
                                                    element === "木" && "bg-green-500/10 text-green-600",
                                                    element === "火" && "bg-red-500/10 text-red-600",
                                                    element === "土" && "bg-yellow-500/10 text-yellow-600",
                                                    element === "金" && "bg-gray-500/10 text-gray-600",
                                                    element === "水" && "bg-blue-500/10 text-blue-600"
                                                )}
                                            >
                                                <div className="font-serif text-xl font-bold">
                                                    {element}
                                                </div>
                                                <div className="text-sm mt-1">{count}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI 解读 */}
                            <AIAnalysisSection type="bazi" />

                            {/* 重新排盘 */}
                            <div className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveTab("input")}
                                    className="cursor-pointer"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    {t("pages.bazi.actions.reset")}
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* 八字计算器 */}
                <TabsContent value="calculator" className="mt-6">
                    <BaziCalculator />
                </TabsContent>

                {/* 八字反推 */}
                <TabsContent value="reverse" className="mt-6">
                    <BaziReverse />
                </TabsContent>
            </Tabs>
        </div>
    )
}
