"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Heart,
    Users,
    Briefcase,
    User,
    UserPlus,
    Sparkles,
    RefreshCw,
    ChevronRight,
    Scale,
    TrendingUp,
    AlertCircle,
    CheckCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 分析类型
const ANALYSIS_TYPES = [
    {
        id: "marriage",
        icon: Heart,
        color: "text-pink-500",
        nameKey: "pages.relationship.types.marriage.title",
        descKey: "pages.relationship.types.marriage.desc",
    },
    {
        id: "mother_in_law",
        icon: Users,
        color: "text-purple-500",
        nameKey: "pages.relationship.types.motherInLaw.title",
        descKey: "pages.relationship.types.motherInLaw.desc",
    },
    {
        id: "business",
        icon: Briefcase,
        color: "text-blue-500",
        nameKey: "pages.relationship.types.business.title",
        descKey: "pages.relationship.types.business.desc",
    },
    {
        id: "friendship",
        icon: Users,
        color: "text-green-500",
        nameKey: "pages.relationship.types.friendship.title",
        descKey: "pages.relationship.types.friendship.desc",
    },
    {
        id: "workplace",
        icon: Briefcase,
        color: "text-orange-500",
        nameKey: "pages.relationship.types.workplace.title",
        descKey: "pages.relationship.types.workplace.desc",
    },
]

// 年份和月份选项
const years = Array.from({ length: 100 }, (_, i) => 1940 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)
const hours = [
    "子时 (23:00-01:00)",
    "丑时 (01:00-03:00)",
    "寅时 (03:00-05:00)",
    "卯时 (05:00-07:00)",
    "辰时 (07:00-09:00)",
    "巳时 (09:00-11:00)",
    "午时 (11:00-13:00)",
    "未时 (13:00-15:00)",
    "申时 (15:00-17:00)",
    "酉时 (17:00-19:00)",
    "戌时 (19:00-21:00)",
    "亥时 (21:00-23:00)",
]

interface PersonInfo {
    name: string
    gender: "male" | "female"
    birthYear: string
    birthMonth: string
    birthDay: string
    birthHour: string
    isLunar: boolean
}

interface AnalysisResult {
    overallScore: number
    compatibility: {
        category: string
        score: number
        description: string
    }[]
    strengths: string[]
    challenges: string[]
    advice: string[]
}

// 类型映射
const TYPE_MAP: Record<string, string> = {
    "business": "business",
    "friendship": "friendship",
    "in-law": "mother_in_law",
    "parent-child": "friendship",
    "workplace": "workplace",
}

interface RelationshipPageProps {
    defaultType?: string
}

/**
 * 关系分析页面
 */
export default function RelationshipPage({ defaultType }: RelationshipPageProps) {
    const { t } = useTranslation()
    const initialType = defaultType ? (TYPE_MAP[defaultType] || "marriage") : "marriage"
    const [analysisType, setAnalysisType] = useState(initialType)
    const [step, setStep] = useState<"input" | "result">("input")
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const form1 = useForm<PersonInfo>({
        defaultValues: {
            name: "",
            gender: "male",
            birthYear: "1990",
            birthMonth: "1",
            birthDay: "1",
            birthHour: "0",
            isLunar: false,
        },
    })

    const form2 = useForm<PersonInfo>({
        defaultValues: {
            name: "",
            gender: "female",
            birthYear: "1992",
            birthMonth: "1",
            birthDay: "1",
            birthHour: "0",
            isLunar: false,
        },
    })

    // 模拟分析计算
    const calculateAnalysis = (): AnalysisResult => {
        const seed = Math.random() * 100

        const categories = analysisType === "marriage"
            ? ["五行相生", "天干合化", "地支六合", "神煞配对", "日主关系"]
            : analysisType === "business"
                ? ["财运配合", "决策风格", "风险偏好", "沟通方式", "目标一致"]
                : ["性格匹配", "沟通方式", "价值观", "互补程度", "长期稳定"]

        return {
            overallScore: Math.floor(50 + seed / 2),
            compatibility: categories.map((category) => ({
                category,
                score: Math.floor(40 + Math.random() * 55),
                description: "两人在此方面有较好的互补性",
            })),
            strengths: [
                "双方性格互补，能够相互支持",
                "沟通方式相近，容易达成共识",
                "价值观一致，对生活有共同追求",
            ].slice(0, Math.floor(Math.random() * 2) + 2),
            challenges: [
                "偶尔可能因小事产生分歧",
                "需要注意情绪管理",
            ].slice(0, Math.floor(Math.random() * 2) + 1),
            advice: [
                "建议多进行深入沟通，增进相互了解",
                "遇到分歧时保持冷静，理性处理",
                "定期进行感情维护，保持关系活力",
            ],
        }
    }

    const onSubmit = async () => {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const analysisResult = calculateAnalysis()
        setResult(analysisResult)
        setStep("result")
        setIsLoading(false)
    }

    const analysisTypes = ANALYSIS_TYPES.map((type) => ({
        ...type,
        name: t(type.nameKey),
        description: t(type.descKey),
    }))

    const selectedType = analysisTypes.find((t) => t.id === analysisType)

    const getScoreLevel = (score: number) => {
        if (score >= 80) return { text: t("pages.relationship.scoreLevels.excellent"), color: "text-green-500" }
        if (score >= 60) return { text: t("pages.relationship.scoreLevels.good"), color: "text-blue-500" }
        if (score >= 40) return { text: t("pages.relationship.scoreLevels.fair"), color: "text-yellow-500" }
        return { text: t("pages.relationship.scoreLevels.caution"), color: "text-red-500" }
    }

    // 渲染人员输入表单
    const renderPersonForm = (
        form: ReturnType<typeof useForm<PersonInfo>>,
        title: string,
        icon: React.ReactNode
    ) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t("pages.relationship.labels.name")}</Label>
                        <Input placeholder={t("pages.relationship.placeholders.name")} {...form.register("name")} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("pages.relationship.labels.gender")}</Label>
                        <Select
                            value={form.watch("gender")}
                            onValueChange={(v) => form.setValue("gender", v as "male" | "female")}
                        >
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male" className="cursor-pointer">
                                    {t("pages.relationship.gender.male")}
                                </SelectItem>
                                <SelectItem value="female" className="cursor-pointer">
                                    {t("pages.relationship.gender.female")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                        <Label>{t("pages.relationship.labels.year")}</Label>
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
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("pages.relationship.labels.month")}</Label>
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
                                        {formatMessage(t("pages.relationship.options.month"), { value: month })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("pages.relationship.labels.day")}</Label>
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
                                        {formatMessage(t("pages.relationship.options.day"), { value: day })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{t("pages.relationship.labels.hour")}</Label>
                    <Select
                        value={form.watch("birthHour")}
                        onValueChange={(v) => form.setValue("birthHour", v)}
                    >
                        <SelectTrigger className="cursor-pointer">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {hours.map((hour, i) => (
                                <SelectItem key={i} value={i.toString()} className="cursor-pointer">
                                    {hour}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id={`lunar-${title}`}
                        checked={form.watch("isLunar")}
                        onCheckedChange={(v) => form.setValue("isLunar", v)}
                    />
                    <Label htmlFor={`lunar-${title}`} className="cursor-pointer">
                        {t("pages.relationship.labels.lunar")}
                    </Label>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl bg-pink-500/10")}>
                    <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.relationship.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.relationship.subtitle")}
                    </p>
                </div>
            </div>

            {step === "input" ? (
                <div className="space-y-6">
                    {/* 分析类型选择 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.relationship.sections.type")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {analysisTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        onClick={() => setAnalysisType(type.id)}
                                        className={cn(
                                            "p-4 rounded-lg border cursor-pointer transition-all text-center",
                                            analysisType === type.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-accent"
                                        )}
                                    >
                                        <type.icon className={cn("h-6 w-6 mx-auto mb-2", type.color)} />
                                        <div className="font-medium text-sm">{type.name}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 双人输入 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {renderPersonForm(
                            form1,
                            analysisType === "mother_in_law"
                                ? t("pages.relationship.form.daughterInLaw")
                                : t("pages.relationship.form.person1"),
                            <User className="h-5 w-5" />
                        )}
                        {renderPersonForm(
                            form2,
                            analysisType === "mother_in_law"
                                ? t("pages.relationship.form.motherInLaw")
                                : t("pages.relationship.form.person2"),
                            <UserPlus className="h-5 w-5" />
                        )}
                    </div>

                    {/* 提交按钮 */}
                    <Button
                        size="lg"
                        className="w-full cursor-pointer"
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                {t("pages.relationship.actions.analyzing")}
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {t("pages.relationship.actions.start")}
                            </>
                        )}
                    </Button>
                </div>
            ) : result ? (
                <div className="space-y-6">
                    {/* 综合评分 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scale className="h-5 w-5" />
                                {t("pages.relationship.sections.overall")}
                            </CardTitle>
                            <CardDescription>{selectedType?.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-8">
                                <div className="text-center">
                                    <div className={cn(
                                        "text-5xl font-bold",
                                        getScoreLevel(result.overallScore).color
                                    )}>
                                        {result.overallScore}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {getScoreLevel(result.overallScore).text}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Progress value={result.overallScore} className="h-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 分项分析 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.relationship.sections.breakdown")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.compatibility.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{item.category}</span>
                                        <span className={cn("font-bold", getScoreLevel(item.score).color)}>
                                            {formatMessage(t("pages.relationship.scoreUnit"), { value: item.score })}
                                        </span>
                                    </div>
                                    <Progress value={item.score} className="h-2" />
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* 优势与挑战 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-500">
                                    <CheckCircle className="h-5 w-5" />
                                    {t("pages.relationship.sections.strengths")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.strengths.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-500">
                                    <AlertCircle className="h-5 w-5" />
                                    {t("pages.relationship.sections.challenges")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {result.challenges.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-1 shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 建议 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.relationship.sections.advice")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.advice.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                        <Badge variant="outline" className="shrink-0">{i + 1}</Badge>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="general" title={t("pages.relationship.aiTitle")} />

                    {/* 重新分析 */}
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
                            {t("pages.relationship.actions.reset")}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
