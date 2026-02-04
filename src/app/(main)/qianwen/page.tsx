"use client"

import { useState, useEffect } from "react"
import { Sparkles, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// 签种类型
interface SignType {
    id: string
    name: string
    icon: string
    total: number
    description: string
}

// 签文
interface Sign {
    number: number
    level: string
    poem: string
    meaning: string
}

// 签等级颜色
const levelColors: Record<string, string> = {
    "上上签": "bg-gradient-to-r from-yellow-400 to-amber-500 text-white",
    "上签": "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
    "上中签": "bg-gradient-to-r from-teal-400 to-cyan-500 text-white",
    "中签": "bg-gradient-to-r from-blue-400 to-indigo-500 text-white",
    "中平签": "bg-gradient-to-r from-slate-400 to-gray-500 text-white",
    "中下签": "bg-gradient-to-r from-orange-400 to-amber-600 text-white",
    "下签": "bg-gradient-to-r from-rose-400 to-red-500 text-white",
    "下下签": "bg-gradient-to-r from-red-500 to-rose-700 text-white",
}

export default function QianwenPage() {
    const [signTypes, setSignTypes] = useState<SignType[]>([])
    const [selectedType, setSelectedType] = useState<SignType | null>(null)
    const [isShaking, setIsShaking] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sign, setSign] = useState<Sign | null>(null)

    // 加载签种列表
    useEffect(() => {
        fetch("/api/qianwen")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSignTypes(data.data.types)
                }
            })
    }, [])

    // 摇签动画
    const shakeAndDraw = async (type: SignType) => {
        setSelectedType(type)
        setSign(null)
        setIsShaking(true)

        // 摇签动画 2 秒
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsShaking(false)
        setIsLoading(true)

        try {
            const res = await fetch(`/api/qianwen?type=${type.id}`)
            const data = await res.json()
            if (data.success) {
                setSign(data.data.sign)
            }
        } catch (error) {
            console.error("抽签失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 重新抽签
    const redraw = () => {
        if (selectedType) {
            shakeAndDraw(selectedType)
        }
    }

    // 返回选择
    const goBack = () => {
        setSelectedType(null)
        setSign(null)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 mb-4">
                    <span className="text-3xl">🎋</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                    抽签占卜
                </h1>
                <p className="text-muted-foreground mt-2">
                    诚心祈愿，抽取神灵指引
                </p>
            </div>

            {/* 签种选择 */}
            {!selectedType && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {signTypes.map((type) => (
                        <Card
                            key={type.id}
                            className={cn(
                                "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
                                "border-2 border-transparent hover:border-primary/50"
                            )}
                            onClick={() => shakeAndDraw(type)}
                        >
                            <CardContent className="p-6 text-center">
                                <div className="text-5xl mb-3">{type.icon}</div>
                                <h3 className="font-bold text-lg">{type.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {type.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    共 {type.total} 签
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 摇签动画 */}
            {selectedType && isShaking && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="text-8xl animate-bounce">{selectedType.icon}</div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-xl font-medium mt-8 animate-pulse">诚心祈愿中...</p>
                    <p className="text-sm text-muted-foreground mt-2">请静心等待神灵指引</p>
                </div>
            )}

            {/* 加载中 */}
            {selectedType && isLoading && !isShaking && (
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-lg mt-4">正在解读签文...</p>
                </div>
            )}

            {/* 签文结果 */}
            {selectedType && sign && !isShaking && !isLoading && (
                <div className="space-y-6">
                    {/* 签号和等级 */}
                    <Card className="overflow-hidden">
                        <div className={cn(
                            "p-6 text-center",
                            levelColors[sign.level] || "bg-gradient-to-r from-gray-400 to-gray-500"
                        )}>
                            <div className="text-6xl mb-2">{selectedType.icon}</div>
                            <h2 className="text-2xl font-bold">{selectedType.name}</h2>
                            <div className="text-4xl font-bold mt-2">第 {sign.number} 签</div>
                            <Badge className="mt-3 text-lg px-4 py-1 bg-white/20 hover:bg-white/30">
                                {sign.level}
                            </Badge>
                        </div>
                    </Card>

                    {/* 签诗 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                📜 签诗
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
                                <p className="text-lg font-serif leading-loose text-center whitespace-pre-line">
                                    {sign.poem.split("。").filter(Boolean).join("。\n") + "。"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 解签 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                💡 解签
                            </CardTitle>
                            <CardDescription>此签寓意解读</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {sign.meaning}
                            </p>
                        </CardContent>
                    </Card>

                    {/* 操作按钮 */}
                    <div className="flex justify-center gap-4">
                        <Button
                            variant="outline"
                            onClick={goBack}
                        >
                            换一种签
                        </Button>
                        <Button
                            onClick={redraw}
                            className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            再抽一签
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
