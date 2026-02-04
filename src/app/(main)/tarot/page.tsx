"use client"

import { AIAnalysisSection } from "@/components/ai/ai-analysis-section"

import { useState } from "react"
import {
    Flower2,
    Sparkles,
    RefreshCw,
    RotateCcw,
    Shuffle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Image from "next/image"

// 拥有的图片 ID 列表（22 张大阿卡纳）
const availableImages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]

// 塔罗牌数据
const majorArcana = [
    { id: 0, name: "愚者", meaning: "新开始、冒险、无畏" },
    { id: 1, name: "魔术师", meaning: "创造力、技能、意志力" },
    { id: 2, name: "女祭司", meaning: "直觉、潜意识、神秘" },
    { id: 3, name: "女皇", meaning: "丰饶、母性、自然" },
    { id: 4, name: "皇帝", meaning: "权威、结构、稳定" },
    { id: 5, name: "教皇", meaning: "传统、信仰、指导" },
    { id: 6, name: "恋人", meaning: "爱情、选择、价值观" },
    { id: 7, name: "战车", meaning: "意志力、决心、胜利" },
    { id: 8, name: "力量", meaning: "勇气、耐心、内在力量" },
    { id: 9, name: "隐士", meaning: "内省、指导、寻找" },
    { id: 10, name: "命运之轮", meaning: "变化、周期、命运" },
    { id: 11, name: "正义", meaning: "公正、真理、因果" },
    { id: 12, name: "倒吊人", meaning: "牺牲、放手、新视角" },
    { id: 13, name: "死神", meaning: "结束、转变、新生" },
    { id: 14, name: "节制", meaning: "平衡、耐心、适度" },
    { id: 15, name: "恶魔", meaning: "束缚、诱惑、物质" },
    { id: 16, name: "塔", meaning: "突变、觉醒、释放" },
    { id: 17, name: "星星", meaning: "希望、灵感、宁静" },
    { id: 18, name: "月亮", meaning: "幻想、恐惧、潜意识" },
    { id: 19, name: "太阳", meaning: "快乐、成功、活力" },
    { id: 20, name: "审判", meaning: "重生、觉醒、评估" },
    { id: 21, name: "世界", meaning: "完成、整合、成就" },
]

// 牌阵类型
const spreads = [
    {
        id: "single",
        name: "单张牌",
        description: "快速获取指引",
        positions: ["当前情况"],
        count: 1,
    },
    {
        id: "three",
        name: "三张牌",
        description: "过去-现在-未来",
        positions: ["过去", "现在", "未来"],
        count: 3,
    },
    {
        id: "love",
        name: "爱情牌阵",
        description: "分析感情关系",
        positions: ["你的状态", "对方状态", "关系现状", "未来发展"],
        count: 4,
    },
    {
        id: "career",
        name: "事业牌阵",
        description: "工作与职业发展",
        positions: ["当前状态", "挑战", "建议", "结果"],
        count: 4,
    },
    {
        id: "celtic",
        name: "凯尔特十字",
        description: "深度全面分析",
        positions: [
            "现状", "挑战", "过去", "未来",
            "目标", "潜意识", "建议", "环境",
            "希望/恐惧", "最终结果"
        ],
        count: 10,
    },
    {
        id: "yesno",
        name: "是非牌阵",
        description: "是或否的回答",
        positions: ["答案", "原因", "建议"],
        count: 3,
    },
]


// 解读风格
const readingStyles = [
    { id: "standard", name: "标准", description: "专业客观的塔罗牌解读" },
    { id: "fire", name: "火神", description: "直白犀利的解读风格" },
    { id: "moon", name: "月光", description: "温柔优雅的解读风格" },
    { id: "wise", name: "维斯顿", description: "理性深度的哲学分析" },
]

// 抽到的牌
interface DrawnCard {
    card: typeof majorArcana[0]
    position: string
    reversed: boolean
}

/**
 * 塔罗占卜页面
 */
export default function TarotPage() {
    const [step, setStep] = useState<"question" | "spread" | "draw" | "result">("question")
    const [question, setQuestion] = useState("")
    const [selectedSpread, setSelectedSpread] = useState(spreads[0])
    const [selectedStyle, setSelectedStyle] = useState(readingStyles[0])
    const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([])
    const [isShuffling, setIsShuffling] = useState(false)
    const [deckCards, setDeckCards] = useState<number[]>([])

    // 初始化牌组
    const initDeck = () => {
        const deck = majorArcana.map((_, i) => i)
        // 洗牌
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[deck[i], deck[j]] = [deck[j], deck[i]]
        }
        setDeckCards(deck)
    }

    // 开始洗牌
    const shuffleDeck = async () => {
        setIsShuffling(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        initDeck()
        setIsShuffling(false)
    }

    // 抽牌
    const drawCard = (positionIndex: number) => {
        if (drawnCards.length >= selectedSpread.count) return
        if (deckCards.length === 0) return

        const cardIndex = deckCards[0]
        const newDeck = deckCards.slice(1)
        setDeckCards(newDeck)

        const newCard: DrawnCard = {
            card: majorArcana[cardIndex],
            position: selectedSpread.positions[positionIndex],
            reversed: Math.random() > 0.7, // 30% 概率逆位
        }

        setDrawnCards([...drawnCards, newCard])

        if (drawnCards.length + 1 >= selectedSpread.count) {
            setTimeout(() => setStep("result"), 500)
        }
    }

    // 重新开始
    const restart = () => {
        setStep("question")
        setQuestion("")
        setDrawnCards([])
        setDeckCards([])
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                    <Flower2 className="h-8 w-8 text-amber-500" />
                </div>
                <div>
                    <h1 className="font-serif text-3xl font-bold">塔罗占卜</h1>
                    <p className="text-muted-foreground">
                        聆听潜意识的声音，获取人生的指引与洞见
                    </p>
                </div>
            </div>

            {/* 步骤 1: 输入问题 */}
            {step === "question" && (
                <Card>
                    <CardHeader>
                        <CardTitle>静心冥想，提出您的问题</CardTitle>
                        <CardDescription>
                            请先静下心来，集中精神，在心中默念您想咨询的问题
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="question">您的问题（可选）</Label>
                            <Input
                                id="question"
                                placeholder="例如：我的感情发展如何？"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>选择解读风格</Label>
                            <div className="grid gap-3 md:grid-cols-2">
                                {readingStyles.map((style) => (
                                    <div
                                        key={style.id}
                                        className={cn(
                                            "p-4 rounded-lg border cursor-pointer transition-all",
                                            selectedStyle.id === style.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:bg-accent"
                                        )}
                                        onClick={() => setSelectedStyle(style)}
                                    >
                                        <div className="font-semibold">{style.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {style.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full cursor-pointer"
                            onClick={() => setStep("spread")}
                        >
                            继续选择牌阵
                            <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 步骤 2: 选择牌阵 */}
            {step === "spread" && (
                <Card>
                    <CardHeader>
                        <CardTitle>选择牌阵</CardTitle>
                        <CardDescription>
                            不同的牌阵适合不同类型的问题
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            {spreads.map((spread) => (
                                <div
                                    key={spread.id}
                                    className={cn(
                                        "p-6 rounded-xl border cursor-pointer transition-all text-center",
                                        selectedSpread.id === spread.id
                                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                            : "border-border hover:bg-accent"
                                    )}
                                    onClick={() => setSelectedSpread(spread)}
                                >
                                    <div className="text-3xl mb-2">
                                        {spread.count === 1 ? "🃏" : spread.count === 3 ? "🎴🎴🎴" : "🎴🎴🎴🎴"}
                                    </div>
                                    <div className="font-semibold text-lg">{spread.name}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {spread.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        {spread.positions.join(" · ")}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep("question")}
                                className="cursor-pointer"
                            >
                                返回
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                    initDeck()
                                    setStep("draw")
                                }}
                            >
                                开始抽牌
                                <Sparkles className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 步骤 3: 抽牌 */}
            {step === "draw" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                抽取您的塔罗牌
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={shuffleDeck}
                                    disabled={isShuffling}
                                    className="cursor-pointer"
                                >
                                    {isShuffling ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Shuffle className="h-4 w-4" />
                                    )}
                                    洗牌
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                点击卡牌抽取，共需抽取 {selectedSpread.count} 张
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* 牌位展示 */}
                            <div className="flex justify-center gap-4 mb-8">
                                {selectedSpread.positions.map((pos, i) => {
                                    const drawn = drawnCards[i]
                                    return (
                                        <div key={pos} className="text-center">
                                            <div className="text-sm text-muted-foreground mb-2">
                                                {pos}
                                            </div>
                                            {drawn ? (
                                                availableImages.includes(drawn.card.id) ? (
                                                    <div
                                                        className={cn(
                                                            "relative w-24 h-40 rounded-lg overflow-hidden shadow-md transition-transform duration-500",
                                                            drawn.reversed && "rotate-180"
                                                        )}
                                                    >
                                                        <Image
                                                            src={`/images/tarot/${drawn.card.id}.avif`}
                                                            alt={drawn.card.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        {drawn.reversed && (
                                                            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(
                                                            "tarot-card w-24 h-36 flex items-center justify-center",
                                                            "bg-gradient-to-br from-primary/20 to-secondary/20",
                                                            drawn.reversed && "rotate-180"
                                                        )}
                                                    >
                                                        <div className={cn("text-center", drawn.reversed && "rotate-180")}>
                                                            <div className="font-serif text-lg font-bold">
                                                                {drawn.card.name}
                                                            </div>
                                                            {drawn.reversed && (
                                                                <Badge variant="outline" className="text-xs mt-1">
                                                                    逆位
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            ) : (
                                                <div
                                                    className="tarot-card w-24 h-36 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                                                    onClick={() => drawCard(i)}
                                                >
                                                    <span className="text-2xl">?</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* 牌堆 */}
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-4">
                                    点击下方牌堆抽牌
                                </div>
                                <div
                                    className={cn(
                                        "inline-block cursor-pointer transition-transform hover:scale-105",
                                        isShuffling && "animate-pulse",
                                        drawnCards.length >= selectedSpread.count && "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={() => drawnCards.length < selectedSpread.count && drawCard(drawnCards.length)}
                                >
                                    <div className="relative">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="tarot-card w-20 h-28 bg-gradient-to-br from-violet-600 to-purple-900"
                                                style={{
                                                    position: i === 0 ? "relative" : "absolute",
                                                    top: i * -2,
                                                    left: i * 2,
                                                    zIndex: 3 - i,
                                                }}
                                            >
                                                <div className="absolute inset-2 border border-amber-500/30 rounded-lg flex items-center justify-center">
                                                    <Sparkles className="h-6 w-6 text-amber-500/50" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 步骤 4: 解读结果 */}
            {step === "result" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flower2 className="h-5 w-5" />
                                塔罗解读
                            </CardTitle>
                            <CardDescription>
                                {question || "您的塔罗占卜结果"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* 抽到的牌 */}
                            <div className="flex justify-center gap-6 mb-8">
                                {drawnCards.map((drawn, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-sm text-muted-foreground mb-2">
                                            {drawn.position}
                                        </div>
                                        {availableImages.includes(drawn.card.id) ? (
                                            <div
                                                className={cn(
                                                    "relative w-28 h-48 rounded-lg overflow-hidden shadow-lg transition-transform duration-500 mx-auto mb-2",
                                                    drawn.reversed && "rotate-180"
                                                )}
                                            >
                                                <Image
                                                    src={`/images/tarot/${drawn.card.id}.avif`}
                                                    alt={drawn.card.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={cn(
                                                    "tarot-card w-28 h-40 flex items-center justify-center mx-auto",
                                                    "bg-gradient-to-br from-primary/20 to-secondary/20",
                                                    drawn.reversed && "!transform rotate-180"
                                                )}
                                            >
                                                <div className={cn("text-center p-2", drawn.reversed && "rotate-180")}>
                                                    <div className="font-serif text-xl font-bold mb-1">
                                                        {drawn.card.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {drawn.card.meaning}
                                                    </div>
                                                    {drawn.reversed && (
                                                        <Badge variant="destructive" className="text-xs mt-2">
                                                            逆位
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-center font-serif text-lg font-bold">
                                            {drawn.card.name} {drawn.reversed && "(逆位)"}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 解读内容 */}
                            <div className="space-y-4">
                                {drawnCards.map((drawn, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">{drawn.position}</Badge>
                                            <span className="font-semibold">{drawn.card.name}</span>
                                            {drawn.reversed && (
                                                <Badge variant="secondary">逆位</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {drawn.reversed
                                                ? `${drawn.card.name}逆位代表能量受阻或内在挣扎。在${drawn.position}的位置上，这暗示着需要面对和处理某些障碍。`
                                                : `${drawn.card.name}代表${drawn.card.meaning}。在${drawn.position}的位置上，这为您带来积极的能量指引。`}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI 解读 */}
                    <AIAnalysisSection type="tarot" title="AI 塔罗解读" />

                    <div className="text-center">
                        <Button
                            variant="ghost"
                            onClick={restart}
                            className="cursor-pointer"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            重新开始
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
