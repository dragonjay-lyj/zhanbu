"use client"

import { useState, useMemo } from "react"
import {
    Flower2,
    Clock,
    Hash,
    Type,
    Sparkles,
    RefreshCw,
    ChevronRight,
    Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"
import { useI18n, useTranslation, formatMessage } from "@/lib/i18n"
import { logFortuneClient } from "@/lib/history/client-log"

// 八卦基本信息
const BA_GUA: Record<string, { binary: string; element: string; nature: string; number: number }> = {
    乾: { binary: "111", element: "金", nature: "天", number: 1 },
    兑: { binary: "011", element: "金", nature: "泽", number: 2 },
    离: { binary: "101", element: "火", nature: "火", number: 3 },
    震: { binary: "001", element: "木", nature: "雷", number: 4 },
    巽: { binary: "110", element: "木", nature: "风", number: 5 },
    坎: { binary: "010", element: "水", nature: "水", number: 6 },
    艮: { binary: "100", element: "土", nature: "山", number: 7 },
    坤: { binary: "000", element: "土", nature: "地", number: 8 },
}

// 根据数字获取卦
const getGuaByNumber = (num: number): string => {
    const normalized = ((num - 1) % 8) + 1
    const entry = Object.entries(BA_GUA).find(([, v]) => v.number === normalized)
    return entry ? entry[0] : "乾"
}

// 五行生克关系
const WUXING_RELATION: Record<string, Record<string, string>> = {
    金: { 金: "比和", 木: "我克", 水: "我生", 火: "克我", 土: "生我" },
    木: { 木: "比和", 土: "我克", 火: "我生", 金: "克我", 水: "生我" },
    水: { 水: "比和", 火: "我克", 木: "我生", 土: "克我", 金: "生我" },
    火: { 火: "比和", 金: "我克", 土: "我生", 水: "克我", 木: "生我" },
    土: { 土: "比和", 水: "我克", 金: "我生", 木: "克我", 火: "生我" },
}

interface MeihuaResult {
    upperGua: { name: string; element: string; nature: string }
    lowerGua: { name: string; element: string; nature: string }
    benGua: { name: string }
    huGua: { name: string; upper: string; lower: string }
    bianGua: { name: string }
    movingLine: number
    tiYong: { ti: string; yong: string; relation: string }
    method: string
    input: string
}

/**
 * 梅花易数页面
 */
export default function MeihuaPage() {
    const { locale } = useI18n()
    const { t } = useTranslation()
    const [method, setMethod] = useState<"time" | "number" | "word">("time")
    const [numberInput, setNumberInput] = useState("")
    const [wordInput, setWordInput] = useState("")
    const [question, setQuestion] = useState("")
    const [result, setResult] = useState<MeihuaResult | null>(null)
    const [isCalculating, setIsCalculating] = useState(false)

    const relationDescriptions: Record<string, string> = {
        "生我": t("pages.meihua.relationDesc.shengwo"),
        "我生": t("pages.meihua.relationDesc.wosheng"),
        "克我": t("pages.meihua.relationDesc.kewo"),
        "我克": t("pages.meihua.relationDesc.woke"),
        "比和": t("pages.meihua.relationDesc.bihe"),
    }

    // 时间起卦
    const castByTime = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const hour = now.getHours()

        // 上卦 = （年+月+日）÷ 8 取余
        const upperNum = (year + month + day) % 8 || 8
        // 下卦 = （年+月+日+时）÷ 8 取余
        const lowerNum = (year + month + day + hour) % 8 || 8
        // 动爻 = （年+月+日+时）÷ 6 取余
        const movingLine = ((year + month + day + hour) % 6) || 6

        calculateResult(upperNum, lowerNum, movingLine, "time", now.toLocaleString(locale))
    }

    // 数字起卦
    const castByNumber = () => {
        if (!numberInput || numberInput.length < 2) {
            window.alert(t("pages.meihua.errors.numberTooShort"))
            return
        }

        const nums = numberInput.split("").map(Number)
        let upperNum: number, lowerNum: number, movingLine: number

        if (nums.length === 2) {
            upperNum = nums[0] || 8
            lowerNum = nums[1] || 8
            movingLine = (nums[0] + nums[1]) % 6 || 6
        } else {
            // 多位数字时，前半部分为上卦，后半部分为下卦
            const mid = Math.floor(nums.length / 2)
            const upperSum = nums.slice(0, mid).reduce((a, b) => a + b, 0)
            const lowerSum = nums.slice(mid).reduce((a, b) => a + b, 0)
            upperNum = upperSum % 8 || 8
            lowerNum = lowerSum % 8 || 8
            movingLine = (upperSum + lowerSum) % 6 || 6
        }

        calculateResult(upperNum, lowerNum, movingLine, "number", numberInput)
    }

    // 文字起卦
    const castByWord = () => {
        if (!wordInput) {
            window.alert(t("pages.meihua.errors.wordRequired"))
            return
        }

        // 简化版：根据字数和笔画（这里用字符编码模拟）
        const chars = wordInput.split("")
        const totalStrokes = chars.reduce((sum, char) => sum + char.charCodeAt(0), 0)

        const upperNum = (chars.length % 8) || 8
        const lowerNum = (totalStrokes % 8) || 8
        const movingLine = ((chars.length + totalStrokes) % 6) || 6

        calculateResult(upperNum, lowerNum, movingLine, "word", wordInput)
    }

    // 计算结果
    const calculateResult = (
        upperNum: number,
        lowerNum: number,
        movingLine: number,
        methodType: string,
        inputValue: string
    ) => {
        setIsCalculating(true)

        setTimeout(() => {
            const upperGua = getGuaByNumber(upperNum)
            const lowerGua = getGuaByNumber(lowerNum)

            // 计算本卦名（简化版）
            const benGuaName = `${BA_GUA[upperGua].nature}${BA_GUA[lowerGua].nature}卦`

            // 计算互卦
            // 互卦上卦 = 本卦3、4、5爻，互卦下卦 = 本卦2、3、4爻
            const upperBinary = BA_GUA[upperGua].binary
            const lowerBinary = BA_GUA[lowerGua].binary
            const fullBinary = upperBinary + lowerBinary //爻从上到下

            // 互卦计算（简化）
            const huUpperGua = getGuaByNumber((parseInt(fullBinary.slice(1, 4), 2) % 8) || 8)
            const huLowerGua = getGuaByNumber((parseInt(fullBinary.slice(2, 5), 2) % 8) || 8)

            // 计算变卦（根据动爻）
            const binaryArr = fullBinary.split("")
            binaryArr[6 - movingLine] = binaryArr[6 - movingLine] === "1" ? "0" : "1"
            const bianBinary = binaryArr.join("")
            const bianUpperGua = getGuaByNumber((parseInt(bianBinary.slice(0, 3), 2) % 8) || 8)
            const bianLowerGua = getGuaByNumber((parseInt(bianBinary.slice(3, 6), 2) % 8) || 8)

            // 判断体用
            // 动爻在上卦则上卦为用，下卦为体；动爻在下卦则下卦为用，上卦为体
            const isMovingInUpper = movingLine > 3
            const tiGua = isMovingInUpper ? lowerGua : upperGua
            const yongGua = isMovingInUpper ? upperGua : lowerGua

            const tiElement = BA_GUA[tiGua].element
            const yongElement = BA_GUA[yongGua].element
            const relation = WUXING_RELATION[tiElement][yongElement]

            setResult({
                upperGua: { name: upperGua, element: BA_GUA[upperGua].element, nature: BA_GUA[upperGua].nature },
                lowerGua: { name: lowerGua, element: BA_GUA[lowerGua].element, nature: BA_GUA[lowerGua].nature },
                benGua: { name: benGuaName },
                huGua: { name: `${BA_GUA[huUpperGua].nature}${BA_GUA[huLowerGua].nature}互卦`, upper: huUpperGua, lower: huLowerGua },
                bianGua: { name: `${BA_GUA[bianUpperGua].nature}${BA_GUA[bianLowerGua].nature}变卦` },
                movingLine,
                tiYong: { ti: tiGua, yong: yongGua, relation },
                method: methodType,
                input: inputValue,
            })
            void logFortuneClient({
                type: "meihua",
                title: "梅花易数",
                summary: `${benGuaName} · 动爻 ${movingLine}`,
            })

            setIsCalculating(false)
        }, 800)
    }

    // 重置
    const reset = () => {
        setResult(null)
        setNumberInput("")
        setWordInput("")
        setQuestion("")
    }

    // 渲染八卦符号
    const renderGua = (guaName: string, size: "sm" | "lg" = "lg") => {
        const binary = BA_GUA[guaName]?.binary || "000"
        const lineHeight = size === "lg" ? "h-3" : "h-2"
        const lineWidth = size === "lg" ? "w-16" : "w-10"
        const gap = size === "lg" ? "gap-2" : "gap-1"

        return (
            <div className={cn("flex flex-col-reverse", gap)}>
                {binary.split("").reverse().map((bit, i) => (
                    <div key={i} className="flex items-center gap-1">
                        {bit === "1" ? (
                            <div className={cn(lineWidth, lineHeight, "bg-foreground rounded")} />
                        ) : (
                            <>
                                <div className={cn(size === "lg" ? "w-6" : "w-4", lineHeight, "bg-foreground rounded")} />
                                <div className={size === "lg" ? "w-2" : "w-1"} />
                                <div className={cn(size === "lg" ? "w-6" : "w-4", lineHeight, "bg-foreground rounded")} />
                            </>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Flower2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">{t("pages.meihua.title")}</h1>
                    <p className="text-muted-foreground">
                        {t("pages.meihua.subtitle")}
                    </p>
                </div>
            </div>

            {!result ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* 问题描述 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                {t("pages.meihua.question.title")}
                            </CardTitle>
                            <CardDescription>
                                {t("pages.meihua.question.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder={t("pages.meihua.question.placeholder")}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={4}
                            />
                        </CardContent>
                    </Card>

                    {/* 起卦方式 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.meihua.method.title")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="time" className="cursor-pointer">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {t("pages.meihua.method.time")}
                                    </TabsTrigger>
                                    <TabsTrigger value="number" className="cursor-pointer">
                                        <Hash className="mr-1 h-4 w-4" />
                                        {t("pages.meihua.method.number")}
                                    </TabsTrigger>
                                    <TabsTrigger value="word" className="cursor-pointer">
                                        <Type className="mr-1 h-4 w-4" />
                                        {t("pages.meihua.method.word")}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="time" className="mt-4 space-y-4">
                                    <div className="text-center">
                                        <div className="text-4xl font-mono mb-2">
                                            {new Date().toLocaleTimeString(locale)}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("pages.meihua.method.timeDesc")}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full cursor-pointer"
                                        onClick={castByTime}
                                        disabled={isCalculating}
                                    >
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        {t("pages.meihua.actions.castNow")}
                                    </Button>
                                </TabsContent>

                                <TabsContent value="number" className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("pages.meihua.labels.number")}</Label>
                                        <Input
                                            type="text"
                                            placeholder={t("pages.meihua.placeholders.number")}
                                            value={numberInput}
                                            onChange={(e) => setNumberInput(e.target.value.replace(/\D/g, ""))}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t("pages.meihua.hints.number")}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full cursor-pointer"
                                        onClick={castByNumber}
                                        disabled={isCalculating || !numberInput}
                                    >
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        {t("pages.meihua.actions.castNumber")}
                                    </Button>
                                </TabsContent>

                                <TabsContent value="word" className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label>{t("pages.meihua.labels.word")}</Label>
                                        <Input
                                            type="text"
                                            placeholder={t("pages.meihua.placeholders.word")}
                                            value={wordInput}
                                            onChange={(e) => setWordInput(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {t("pages.meihua.hints.word")}
                                        </p>
                                    </div>
                                    <Button
                                        size="lg"
                                        className="w-full cursor-pointer"
                                        onClick={castByWord}
                                        disabled={isCalculating || !wordInput}
                                    >
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        {t("pages.meihua.actions.castWord")}
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 起卦信息 */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    {formatMessage(t("pages.meihua.result.method"), {
                                        value: result.method === "time"
                                            ? t("pages.meihua.method.timeLabel")
                                            : result.method === "number"
                                                ? t("pages.meihua.method.numberLabel")
                                                : t("pages.meihua.method.wordLabel"),
                                    })}
                                </span>
                                <span>{formatMessage(t("pages.meihua.result.input"), { value: result.input })}</span>
                                <span>{formatMessage(t("pages.meihua.result.movingLine"), { value: result.movingLine })}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 卦象展示 */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* 本卦 */}
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>{t("pages.meihua.result.base")}</CardTitle>
                                <CardDescription className="font-serif text-xl text-foreground">
                                    {result.benGua.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="space-y-1 text-center">
                                    <div className="text-sm text-muted-foreground">{t("pages.meihua.labels.upper")}</div>
                                    <div className="font-serif text-lg font-bold">{result.upperGua.name}</div>
                                    {renderGua(result.upperGua.name)}
                                    <Badge variant="outline">{result.upperGua.element}</Badge>
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="space-y-1 text-center">
                                    <div className="font-serif text-lg font-bold">{result.lowerGua.name}</div>
                                    {renderGua(result.lowerGua.name)}
                                    <Badge variant="outline">{result.lowerGua.element}</Badge>
                                    <div className="text-sm text-muted-foreground">{t("pages.meihua.labels.lower")}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 互卦 */}
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>{t("pages.meihua.result.mutual")}</CardTitle>
                                <CardDescription className="font-serif text-xl text-foreground">
                                    {result.huGua.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="space-y-1 text-center">
                                    <div className="text-sm text-muted-foreground">{t("pages.meihua.labels.upper")}</div>
                                    <div className="font-serif text-lg font-bold">{result.huGua.upper}</div>
                                    {renderGua(result.huGua.upper)}
                                </div>
                                <div className="w-full h-px bg-border" />
                                <div className="space-y-1 text-center">
                                    <div className="font-serif text-lg font-bold">{result.huGua.lower}</div>
                                    {renderGua(result.huGua.lower)}
                                    <div className="text-sm text-muted-foreground">{t("pages.meihua.labels.lower")}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 变卦 */}
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>{t("pages.meihua.result.changed")}</CardTitle>
                                <CardDescription className="font-serif text-xl text-foreground">
                                    {result.bianGua.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    {formatMessage(t("pages.meihua.result.movingLineDesc"), { value: result.movingLine })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 体用分析 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("pages.meihua.result.tiYongTitle")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">{t("pages.meihua.labels.tiGua")}</div>
                                    <div className="font-serif text-2xl font-bold">{result.tiYong.ti}</div>
                                    <Badge className="mt-1">{BA_GUA[result.tiYong.ti].element}</Badge>
                                </div>
                                <div className="text-center">
                                    <Badge variant="outline" className="text-lg px-4 py-1">
                                        {t(`pages.meihua.relation.${result.tiYong.relation}`)}
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">{t("pages.meihua.labels.yongGua")}</div>
                                    <div className="font-serif text-2xl font-bold">{result.tiYong.yong}</div>
                                    <Badge className="mt-1">{BA_GUA[result.tiYong.yong].element}</Badge>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-4">
                                {relationDescriptions[result.tiYong.relation]}
                            </p>
                        </CardContent>
                    </Card>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="general" title={t("pages.meihua.aiTitle")} />

                    {/* 重新起卦 */}
                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={reset}
                            className="cursor-pointer"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("pages.meihua.actions.reset")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
