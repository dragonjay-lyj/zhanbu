"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useUser } from "@clerk/nextjs"
import {
    Hexagon,
    Calendar,
    Clock,
    MapPin,
    User,
    Sparkles,
    RefreshCw,
    Info,
    ChevronLeft,
    ChevronRight,
    Brain,
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
import { cn, ZIWEI_STARS, ZIWEI_PALACES } from "@/lib/utils"

// 中国省份数据
const provinces = [
    "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
    "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
    "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾",
]

// 年份范围
const years = Array.from({ length: 200 }, (_, i) => 1924 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const hours = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"][i] + "时",
}))

// 表单数据类型
interface ZiweiFormData {
    name: string
    gender: "male" | "female"
    birthYear: string
    birthMonth: string
    birthDay: string
    birthHour: string
    isLunar: boolean
    useTrueSolar: boolean
    province: string
    chartType: "natal" | "flow_year"
    flowYear: string
}

// 宫位数据类型
interface Palace {
    name: string
    position: number
    mainStar: string | null
    otherStars: string[]
    sihua: string | null
}

// 紫微命盘结果
interface ZiweiResult {
    palaces: Palace[]
    mingGong: number
    shenGong: number
    dayunStart: number
}

/**
 * 紫微斗数排盘页面
 */
export default function ZiweiPage() {
    const { isSignedIn, user } = useUser()
    const [result, setResult] = useState<ZiweiResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState("input")
    const [selectedPalace, setSelectedPalace] = useState<number | null>(null)
    const [currentDayun, setCurrentDayun] = useState(1)

    const form = useForm<ZiweiFormData>({
        defaultValues: {
            name: "",
            gender: "male",
            birthYear: "1990",
            birthMonth: "1",
            birthDay: "1",
            birthHour: "0",
            isLunar: false,
            useTrueSolar: true,
            province: "北京",
            chartType: "natal",
            flowYear: new Date().getFullYear().toString(),
        },
    })

    // 模拟紫微排盘（实际需要使用专业算法库）
    const calculateZiwei = (data: ZiweiFormData): ZiweiResult => {
        // 简化的模拟计算，实际需要复杂的紫微排盘算法
        const palaces: Palace[] = ZIWEI_PALACES.map((name, index) => ({
            name,
            position: index,
            mainStar: index < ZIWEI_STARS.length ? ZIWEI_STARS[index % ZIWEI_STARS.length] : null,
            otherStars: index % 2 === 0 ? ["文昌", "文曲"] : ["左辅", "右弼"],
            sihua: index === 0 ? "化禄" : index === 8 ? "化权" : null,
        }))

        return {
            palaces,
            mingGong: 0,
            shenGong: 6,
            dayunStart: 5,
        }
    }

    const onSubmit = async (data: ZiweiFormData) => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const calculated = calculateZiwei(data)
        setResult(calculated)
        setActiveTab("result")
        setIsLoading(false)
    }

    // 获取宫位在网格中的位置
    const getGridPosition = (index: number) => {
        // 紫微命盘的十二宫按照特定顺序排列
        // 从右上角开始逆时针排列
        const positions = [
            { col: 4, row: 4 }, // 命宫 - 右下
            { col: 4, row: 3 }, // 兄弟
            { col: 4, row: 2 }, // 夫妻
            { col: 4, row: 1 }, // 子女 - 右上
            { col: 3, row: 1 }, // 财帛
            { col: 2, row: 1 }, // 疾厄
            { col: 1, row: 1 }, // 迁移 - 左上
            { col: 1, row: 2 }, // 交友
            { col: 1, row: 3 }, // 官禄
            { col: 1, row: 4 }, // 田宅 - 左下
            { col: 2, row: 4 }, // 福德
            { col: 3, row: 4 }, // 父母
        ]
        return positions[index] || { col: 1, row: 1 }
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10">
                    <Hexagon className="h-8 w-8 text-violet-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">紫微斗数排盘</h1>
                    <p className="text-muted-foreground">
                        十二宫位深度解析，揭示命盘核心结构与人生运势
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="input" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        输入信息
                    </TabsTrigger>
                    <TabsTrigger value="result" disabled={!result} className="cursor-pointer">
                        <Sparkles className="mr-2 h-4 w-4" />
                        命盘结果
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
                                        基本信息
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">姓名</Label>
                                        <Input
                                            id="name"
                                            placeholder="请输入姓名"
                                            {...form.register("name")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>性别</Label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="male"
                                                    {...form.register("gender")}
                                                    className="w-4 h-4"
                                                />
                                                <span>男性 (阳)</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="female"
                                                    {...form.register("gender")}
                                                    className="w-4 h-4"
                                                />
                                                <span>女性 (阴)</span>
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
                                        出生时辰
                                    </CardTitle>
                                    <CardDescription>
                                        紫微斗数以时辰定命宫，请确保时辰准确
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-2">
                                            <Label>年</Label>
                                            <Select
                                                value={form.watch("birthYear")}
                                                onValueChange={(v) => form.setValue("birthYear", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                                                            {year}年
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>月</Label>
                                            <Select
                                                value={form.watch("birthMonth")}
                                                onValueChange={(v) => form.setValue("birthMonth", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((month) => (
                                                        <SelectItem key={month} value={month.toString()} className="cursor-pointer">
                                                            {month}月
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>日</Label>
                                            <Select
                                                value={form.watch("birthDay")}
                                                onValueChange={(v) => form.setValue("birthDay", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {days.map((day) => (
                                                        <SelectItem key={day} value={day.toString()} className="cursor-pointer">
                                                            {day}日
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>时辰</Label>
                                        <Select
                                            value={form.watch("birthHour")}
                                            onValueChange={(v) => form.setValue("birthHour", v)}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hours.map((hour) => (
                                                    <SelectItem key={hour.value} value={hour.value} className="cursor-pointer">
                                                        {hour.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="isLunar"
                                            checked={form.watch("isLunar")}
                                            onCheckedChange={(v) => form.setValue("isLunar", v)}
                                        />
                                        <Label htmlFor="isLunar" className="cursor-pointer">
                                            农历日期
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 盘式选择 */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>盘式选择</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="natal"
                                                {...form.register("chartType")}
                                                className="w-4 h-4"
                                            />
                                            <span>先天盘 (本命盘)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                value="flow_year"
                                                {...form.register("chartType")}
                                                className="w-4 h-4"
                                            />
                                            <span>流年盘</span>
                                        </label>
                                    </div>
                                    {form.watch("chartType") === "flow_year" && (
                                        <div className="space-y-2 max-w-xs">
                                            <Label>流年年份</Label>
                                            <Select
                                                value={form.watch("flowYear")}
                                                onValueChange={(v) => form.setValue("flowYear", v)}
                                            >
                                                <SelectTrigger className="cursor-pointer">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year} value={year.toString()} className="cursor-pointer">
                                                            {year}年
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
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
                                                排盘中...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                开始排盘
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
                            {/* 大运切换 */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentDayun(Math.max(1, currentDayun - 1))}
                                            disabled={currentDayun === 1}
                                            className="cursor-pointer"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            上一大运
                                        </Button>
                                        <div className="text-center">
                                            <div className="text-sm text-muted-foreground">当前大运</div>
                                            <div className="font-serif text-xl font-bold">
                                                第 {currentDayun} 大运 ({result.dayunStart + (currentDayun - 1) * 10} - {result.dayunStart + currentDayun * 10 - 1} 岁)
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCurrentDayun(Math.min(12, currentDayun + 1))}
                                            disabled={currentDayun === 12}
                                            className="cursor-pointer"
                                        >
                                            下一大运
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 命盘展示 - 十二宫格 */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hexagon className="h-5 w-5" />
                                        紫微命盘
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-1 aspect-square max-w-2xl mx-auto">
                                        {/* 中央空白区域 */}
                                        <div className="col-start-2 col-span-2 row-start-2 row-span-2 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-dashed">
                                            <div className="text-center p-4">
                                                <div className="font-serif text-lg font-bold text-primary mb-1">紫微斗数</div>
                                                <div className="text-sm text-muted-foreground">
                                                    命宫: {ZIWEI_PALACES[result.mingGong]}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    身宫: {ZIWEI_PALACES[result.shenGong]}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 十二宫位 */}
                                        {result.palaces.map((palace, index) => {
                                            const pos = getGridPosition(index)
                                            const isMing = index === result.mingGong
                                            const isShen = index === result.shenGong
                                            return (
                                                <div
                                                    key={palace.name}
                                                    className={cn(
                                                        "p-2 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                                                        isMing && "border-primary bg-primary/10",
                                                        isShen && !isMing && "border-secondary bg-secondary/10",
                                                        !isMing && !isShen && "border-border/50 bg-card hover:bg-accent",
                                                        selectedPalace === index && "ring-2 ring-primary"
                                                    )}
                                                    style={{
                                                        gridColumn: pos.col,
                                                        gridRow: pos.row,
                                                    }}
                                                    onClick={() => setSelectedPalace(index)}
                                                >
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                        {palace.name}
                                                        {isMing && <Badge variant="default" className="text-[10px] px-1">命</Badge>}
                                                        {isShen && <Badge variant="secondary" className="text-[10px] px-1">身</Badge>}
                                                    </div>
                                                    {palace.mainStar && (
                                                        <div className={cn(
                                                            "font-serif text-sm font-bold mt-1",
                                                            palace.sihua && "text-primary"
                                                        )}>
                                                            {palace.mainStar}
                                                            {palace.sihua && (
                                                                <span className="text-xs ml-1 text-amber-500">
                                                                    {palace.sihua}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                                        {palace.otherStars.slice(0, 2).join(" ")}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 选中宫位详情 */}
                            {selectedPalace !== null && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Info className="h-5 w-5" />
                                            {result.palaces[selectedPalace].name}详解
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <h4 className="font-semibold mb-2">主星</h4>
                                                <div className="font-serif text-2xl text-primary">
                                                    {result.palaces[selectedPalace].mainStar || "无主星"}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold mb-2">其他星曜</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.palaces[selectedPalace].otherStars.map((star) => (
                                                        <Badge key={star} variant="outline">
                                                            {star}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

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
                                                <h3 className="font-semibold">AI 智能解读</h3>
                                            </div>
                                            {aiAnalysis ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {aiAnalysis}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={async () => {
                                                        setIsAnalyzing(true)
                                                        // 模拟 AI 分析
                                                        await new Promise(resolve => setTimeout(resolve, 2000))
                                                        setAiAnalysis(`您好，${user?.firstName || "用户"}！\n\n根据您的紫微命盘分析：\n\n1. 命宫主星为${result?.palaces[result?.mingGong || 0]?.mainStar || "紫微"}，显示您具有领导才能和贵人运。\n\n2. 您的命盘格局属于"紫府同宫"，主富贵双全，一生多有贵人相助。\n\n3. 财帛宫有化禄，显示财运亨通，适合经商或投资。\n\n4. 建议在事业上保持谦逊，多与贵人合作，可获更大成就。`)
                                                        setIsAnalyzing(false)
                                                    }}
                                                    disabled={isAnalyzing}
                                                    className="cursor-pointer"
                                                >
                                                    {isAnalyzing ? (
                                                        <>
                                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                            AI 分析中...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            获取 AI 深度解读
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">AI 深度解读</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                登录后获取 AI 智能分析，深入解读您的紫微命盘
                                            </p>
                                            <Button variant="outline" className="cursor-pointer" asChild>
                                                <a href="/sign-in">登录获取解读</a>
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
                                    重新排盘
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
