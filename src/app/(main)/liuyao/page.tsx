"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Coins,
    Dices,
    Clock,
    Hash,
    Sparkles,
    RefreshCw,
    ChevronRight,
    Info,
    Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"
import { useTranslation, formatMessage } from "@/lib/i18n"
import { logFortuneClient } from "@/lib/history/client-log"

// 八卦数据
const BA_GUA = {
    乾: { binary: "111", element: "金", nature: "天", number: 1 },
    兑: { binary: "011", element: "金", nature: "泽", number: 2 },
    离: { binary: "101", element: "火", nature: "火", number: 3 },
    震: { binary: "001", element: "木", nature: "雷", number: 4 },
    巽: { binary: "110", element: "木", nature: "风", number: 5 },
    坎: { binary: "010", element: "水", nature: "水", number: 6 },
    艮: { binary: "100", element: "土", nature: "山", number: 7 },
    坤: { binary: "000", element: "土", nature: "地", number: 8 },
}

// 六十四卦名
const HEXAGRAM_NAMES: Record<string, string> = {
    "111111": "乾为天", "000000": "坤为地", "010001": "水雷屯", "100010": "山水蒙",
    "010111": "水天需", "111010": "天水讼", "000010": "地水师", "010000": "水地比",
    "110111": "风天小畜", "111011": "天泽履", "000111": "地天泰", "111000": "天地否",
    "111101": "天火同人", "101111": "火天大有", "000100": "地山谦", "001000": "雷地豫",
    "011001": "泽雷随", "100110": "山风蛊", "000011": "地泽临", "110000": "风地观",
    "101001": "火雷噬嗑", "100101": "山火贲", "100000": "山地剥", "000001": "地雷复",
    "111001": "天雷无妄", "100111": "山天大畜", "100001": "山雷颐", "011110": "泽风大过",
    "010010": "坎为水", "101101": "离为火", "011100": "泽山咸", "001110": "雷风恒",
    "111100": "天山遁", "001111": "雷天大壮", "101000": "火地晋", "000101": "地火明夷",
    "110101": "风火家人", "101011": "火泽睽", "010100": "水山蹇", "001010": "雷水解",
    "100011": "山泽损", "110001": "风雷益", "011111": "泽天夬", "111110": "天风姤",
    "011000": "泽地萃", "000110": "地风升", "011010": "泽水困", "010110": "水风井",
    "011101": "泽火革", "101110": "火风鼎", "001001": "震为雷", "100100": "艮为山",
    "110100": "风山渐", "001011": "雷泽归妹", "001101": "雷火丰", "101100": "火山旅",
    "110110": "巽为风", "011011": "兑为泽", "110010": "风水涣", "010011": "水泽节",
    "110011": "风泽中孚", "001100": "雷山小过", "010101": "水火既济", "101010": "火水未济",
}

// 六亲
const LIU_QIN = ["父母", "兄弟", "子孙", "妻财", "官鬼"]

// 六神
const LIU_SHEN = ["青龙", "朱雀", "勾陈", "螣蛇", "白虎", "玄武"]

// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

interface YaoLine {
    position: number // 1-6，从下到上
    type: "yang" | "yin" // 阳爻或阴爻
    changing: boolean // 是否变爻
    coinResult?: [number, number, number] // 三个铜钱结果
    diZhi?: string // 地支
    liuQin?: string // 六亲
    liuShen?: string // 六神
}

interface HexagramResult {
    lines: YaoLine[]
    benGua: { name: string; binary: string }
    bianGua?: { name: string; binary: string }
    shiYao: number // 世爻位置
    yingYao: number // 应爻位置
}

/**
 * 六爻排盘页面
 */
export default function LiuyaoPage() {
    const { t } = useTranslation()
    const [step, setStep] = useState<"question" | "cast" | "result">("question")
    const [question, setQuestion] = useState("")
    const [category, setCategory] = useState("")
    const [castMethod, setCastMethod] = useState<"coin" | "time" | "number">("coin")
    const [isShaking, setIsShaking] = useState(false)
    const [currentYao, setCurrentYao] = useState(0)
    const [lines, setLines] = useState<YaoLine[]>([])
    const [result, setResult] = useState<HexagramResult | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const categoryOptions = [
        { value: "事业", label: t("pages.liuyao.categories.career") },
        { value: "感情", label: t("pages.liuyao.categories.love") },
        { value: "财运", label: t("pages.liuyao.categories.wealth") },
        { value: "健康", label: t("pages.liuyao.categories.health") },
        { value: "学业", label: t("pages.liuyao.categories.study") },
        { value: "其他", label: t("pages.liuyao.categories.other") },
    ]

    const castMethods = [
        { value: "coin", label: t("pages.liuyao.methods.coin"), icon: Coins },
        { value: "time", label: t("pages.liuyao.methods.time"), icon: Clock },
        { value: "number", label: t("pages.liuyao.methods.number"), icon: Hash },
    ]

    // 模拟摇铜钱
    const shakeCoin = useCallback(async () => {
        if (currentYao >= 6) return

        setIsShaking(true)

        // 模拟摇动动画
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // 生成三个铜钱结果（0=字面，1=花面）
        const coinResult: [number, number, number] = [
            Math.random() > 0.5 ? 1 : 0,
            Math.random() > 0.5 ? 1 : 0,
            Math.random() > 0.5 ? 1 : 0,
        ]

        const sum = coinResult.reduce((a, b) => a + b, 0)
        // 0个花面（3字）= 老阴（变爻）
        // 1个花面（2字1花）= 少阳
        // 2个花面（1字2花）= 少阴
        // 3个花面（3花）= 老阳（变爻）
        const type: "yang" | "yin" = sum === 1 || sum === 3 ? "yang" : "yin"
        const changing = sum === 0 || sum === 3

        const newLine: YaoLine = {
            position: currentYao + 1,
            type,
            changing,
            coinResult,
            diZhi: DI_ZHI[Math.floor(Math.random() * 12)],
            liuQin: LIU_QIN[Math.floor(Math.random() * 5)],
            liuShen: LIU_SHEN[currentYao],
        }

        setLines((prev) => [...prev, newLine])
        setCurrentYao((prev) => prev + 1)
        setIsShaking(false)
    }, [currentYao])

    // 根据时间起卦
    const castByTime = () => {
        const now = new Date()
        const hour = now.getHours()
        const minute = now.getMinutes()
        const second = now.getSeconds()

        const newLines: YaoLine[] = []
        for (let i = 0; i < 6; i++) {
            const seed = (hour + minute + second + i * 17) % 4
            const type: "yang" | "yin" = seed === 0 || seed === 2 ? "yang" : "yin"
            const changing = seed === 0 || seed === 3

            newLines.push({
                position: i + 1,
                type,
                changing,
                diZhi: DI_ZHI[(hour + i) % 12],
                liuQin: LIU_QIN[i % 5],
                liuShen: LIU_SHEN[i],
            })
        }

        setLines(newLines)
        setCurrentYao(6)
    }

    // 完成起卦，生成结果
    const generateResult = useCallback(() => {
        if (lines.length < 6) return

        // 生成本卦二进制
        const benGuaBinary = lines
            .map((l) => (l.type === "yang" ? "1" : "0"))
            .join("")

        // 生成变卦二进制（如果有变爻）
        const hasChanging = lines.some((l) => l.changing)
        let bianGuaBinary = ""
        if (hasChanging) {
            bianGuaBinary = lines
                .map((l) => {
                    if (l.changing) {
                        return l.type === "yang" ? "0" : "1"
                    }
                    return l.type === "yang" ? "1" : "0"
                })
                .join("")
        }

        // 查找卦名
        const benGuaName = HEXAGRAM_NAMES[benGuaBinary] || "未知卦"
        const bianGuaName = bianGuaBinary ? HEXAGRAM_NAMES[bianGuaBinary] || "未知卦" : undefined

        // 确定世爻和应爻（简化版）
        const shiYao = (parseInt(benGuaBinary, 2) % 6) + 1
        const yingYao = ((shiYao + 2) % 6) + 1

        setResult({
            lines,
            benGua: { name: benGuaName, binary: benGuaBinary },
            bianGua: bianGuaBinary ? { name: bianGuaName!, binary: bianGuaBinary } : undefined,
            shiYao,
            yingYao,
        })

        void logFortuneClient({
            type: "liuyao",
            title: "六爻排盘",
            summary: `${benGuaName}${bianGuaName ? ` → ${bianGuaName}` : ""}`,
        })

        setStep("result")
    }, [lines])

    // 当六爻全部完成时自动生成结果
    useEffect(() => {
        if (currentYao === 6 && lines.length === 6) {
            generateResult()
        }
    }, [currentYao, lines.length, generateResult])

    // 重新开始
    const reset = () => {
        setStep("question")
        setQuestion("")
        setCategory("")
        setCurrentYao(0)
        setLines([])
        setResult(null)
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Coins className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.liuyao.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.liuyao.subtitle")}
                    </p>
                </div>
            </div>

            {/* 问卦阶段 */}
            {step === "question" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            {t("pages.liuyao.question.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("pages.liuyao.question.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("pages.liuyao.labels.category")}</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder={t("pages.liuyao.placeholders.category")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("pages.liuyao.labels.question")}</Label>
                            <Textarea
                                placeholder={t("pages.liuyao.placeholders.question")}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("pages.liuyao.labels.method")}</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {castMethods.map((method) => (
                                    <Button
                                        key={method.value}
                                        variant={castMethod === method.value ? "default" : "outline"}
                                        className="h-auto py-4 flex-col gap-2 cursor-pointer"
                                        onClick={() => setCastMethod(method.value as typeof castMethod)}
                                    >
                                        <method.icon className="h-5 w-5" />
                                        <span className="text-xs">{method.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full mt-4 cursor-pointer"
                            onClick={() => setStep("cast")}
                        >
                            <ChevronRight className="mr-2 h-4 w-4" />
                            {t("pages.liuyao.actions.start")}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 起卦阶段 */}
            {step === "cast" && (
                <div className="space-y-6">
                    {/* 铜钱摇卦 */}
                    {castMethod === "coin" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    {t("pages.liuyao.methods.coin")}
                                </CardTitle>
                                <CardDescription>
                                    {formatMessage(t("pages.liuyao.cast.progress"), {
                                        current: Math.min(currentYao + 1, 6),
                                        total: 6,
                                    })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 已摇出的爻 */}
                                <div className="flex flex-col-reverse gap-2">
                                    {lines.map((line, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                                        >
                                            <span className="text-sm text-muted-foreground w-12">
                                                {formatMessage(t("pages.liuyao.cast.lineIndex"), { value: line.position })}
                                            </span>
                                            <div className="flex-1 flex items-center gap-2">
                                                {/* 爻符号 */}
                                                <div className="flex items-center gap-1">
                                                    {line.type === "yang" ? (
                                                        <div className="w-16 h-2 bg-foreground rounded" />
                                                    ) : (
                                                        <>
                                                            <div className="w-6 h-2 bg-foreground rounded" />
                                                            <div className="w-2" />
                                                            <div className="w-6 h-2 bg-foreground rounded" />
                                                        </>
                                                    )}
                                                </div>
                                                {/* 铜钱结果 */}
                                                {line.coinResult && (
                                                    <div className="flex gap-1 ml-4">
                                                        {line.coinResult.map((c, i) => (
                                                            <div
                                                                key={i}
                                                                className={cn(
                                                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                                    c === 1 ? "bg-yellow-500 text-yellow-950" : "bg-gray-300 text-gray-700"
                                                                )}
                                                            >
                                                                {c === 1 ? t("pages.liuyao.coin.flower") : t("pages.liuyao.coin.text")}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {line.type === "yang" ? t("pages.liuyao.labels.yang") : t("pages.liuyao.labels.yin")}
                                                </Badge>
                                                {line.changing && (
                                                    <Badge variant="destructive">{t("pages.liuyao.labels.changing")}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 摇卦按钮 */}
                                {currentYao < 6 && (
                                    <div className="text-center">
                                        <Button
                                            size="lg"
                                            onClick={shakeCoin}
                                            disabled={isShaking}
                                            className="cursor-pointer min-w-[200px]"
                                        >
                                            {isShaking ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {t("pages.liuyao.actions.shaking")}
                                                </>
                                            ) : (
                                                <>
                                                    <Dices className="mr-2 h-5 w-5" />
                                                    {formatMessage(t("pages.liuyao.actions.shake"), { value: currentYao + 1 })}
                                                </>
                                            )}
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {t("pages.liuyao.hints.shake")}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* 时间起卦 */}
                    {castMethod === "time" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    {t("pages.liuyao.methods.time")}
                                </CardTitle>
                                <CardDescription>
                                    {t("pages.liuyao.time.description")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div className="text-4xl font-mono">
                                    {new Date().toLocaleTimeString()}
                                </div>
                                <Button
                                    size="lg"
                                    onClick={castByTime}
                                    className="cursor-pointer"
                                >
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    {t("pages.liuyao.actions.castNow")}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* 结果阶段 */}
            {step === "result" && result && (
                <div className="space-y-6">
                    {/* 卦象展示 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* 本卦 */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("pages.liuyao.result.base")}</CardTitle>
                                <CardDescription className="font-serif text-2xl text-foreground">
                                    {result.benGua.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col-reverse gap-3">
                                    {result.lines.map((line, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4"
                                        >
                                            <span className="text-xs text-muted-foreground w-8">
                                                {line.position === result.shiYao
                                                    ? t("pages.liuyao.labels.shi")
                                                    : line.position === result.yingYao
                                                        ? t("pages.liuyao.labels.ying")
                                                        : formatMessage(t("pages.liuyao.cast.lineIndexShort"), { value: line.position })}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {line.type === "yang" ? (
                                                    <div className="w-24 h-3 bg-foreground rounded" />
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-3 bg-foreground rounded" />
                                                        <div className="w-2" />
                                                        <div className="w-10 h-3 bg-foreground rounded" />
                                                    </>
                                                )}
                                            </div>
                                            <span className="text-sm">{line.diZhi}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {line.liuQin}
                                            </Badge>
                                            {line.changing && (
                                                <Badge variant="destructive" className="text-xs">{t("pages.liuyao.labels.changingSymbol")}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 变卦 */}
                        {result.bianGua && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("pages.liuyao.result.changed")}</CardTitle>
                                    <CardDescription className="font-serif text-2xl text-foreground">
                                        {result.bianGua.name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col-reverse gap-3">
                                        {result.lines.map((line, index) => {
                                            const changedType = line.changing
                                                ? (line.type === "yang" ? "yin" : "yang")
                                                : line.type

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4"
                                                >
                                                    <span className="text-xs text-muted-foreground w-8">
                                                        {formatMessage(t("pages.liuyao.cast.lineIndexShort"), { value: line.position })}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {changedType === "yang" ? (
                                                            <div className="w-24 h-3 bg-foreground rounded" />
                                                        ) : (
                                                            <>
                                                                <div className="w-10 h-3 bg-foreground rounded" />
                                                                <div className="w-2" />
                                                                <div className="w-10 h-3 bg-foreground rounded" />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="liuyao" title={t("pages.liuyao.aiTitle")} />

                    {/* 重新起卦 */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={reset}
                            className="cursor-pointer"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("pages.liuyao.actions.reset")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
