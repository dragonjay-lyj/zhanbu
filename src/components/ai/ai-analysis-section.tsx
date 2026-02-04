"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Sparkles, RefreshCw, Brain, Coins, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface AIAnalysisSectionProps {
    /** 分析类型标题 */
    title?: string
    /** 分析上下文数据，用于生成解读 */
    context?: Record<string, unknown>
    /** 自定义未登录提示 */
    loginPrompt?: string
    /** 用户问题 */
    question?: string
    /** 分析类型 */
    type?: "bazi" | "ziwei" | "liuyao" | "meihua" | "tarot" | "qimen" | "fengshui" | "relationship" | "daily" | "general"
    /** 解读风格 */
    style?: "standard" | "fire" | "moon" | "wise" | "humorous"
}

// AI 解读消费积分数量（与后端保持一致）
const AI_INTERPRET_COST = 10

/**
 * AI 智能解读组件
 * 调用真实 AI API 生成解读
 */
export function AIAnalysisSection({
    title = "AI 深度解读",
    context = {},
    loginPrompt = "登录后获取 AI 智能分析，深入解读您的命盘特质",
    question,
    type = "bazi",
    style = "standard"
}: AIAnalysisSectionProps) {
    const { isSignedIn, user } = useUser()
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [insufficientCredits, setInsufficientCredits] = useState<{
        required: number
        current: number
    } | null>(null)
    const [creditsUsed, setCreditsUsed] = useState<number | null>(null)

    // 调用真实 AI API 生成分析
    const generateAnalysis = async () => {
        setIsAnalyzing(true)
        setError(null)
        setInsufficientCredits(null)

        try {
            const response = await fetch("/api/ai/interpret", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    data: context,
                    question,
                    style,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // 处理积分不足的情况
                if (response.status === 402) {
                    setInsufficientCredits({
                        required: result.required || AI_INTERPRET_COST,
                        current: result.current || 0,
                    })
                    return
                }
                throw new Error(result.error || "AI 解读请求失败")
            }

            if (result.success && result.interpretation) {
                const greeting = `您好，${user?.firstName || "用户"}！\n\n`
                setAiAnalysis(greeting + result.interpretation)
                setCreditsUsed(result.creditsUsed)
            } else {
                throw new Error("AI 未返回有效内容")
            }
        } catch (err) {
            console.error("AI 解读错误:", err)
            setError((err as Error).message)
            setAiAnalysis(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <Card className={cn(
            "border-2",
            isSignedIn ? "border-primary/50 bg-primary/5" : "border-dashed"
        )}>
            <CardContent className="pt-6">
                {isSignedIn ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold">{title}</h3>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Coins className="h-3 w-3" />
                                <span>消耗 {AI_INTERPRET_COST} 积分</span>
                            </div>
                        </div>

                        {/* 积分不足提示 */}
                        {insufficientCredits && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                    <span>
                                        积分不足！需要 {insufficientCredits.required} 积分，
                                        当前余额 {insufficientCredits.current} 积分
                                    </span>
                                    <Link href="/pricing">
                                        <Button size="sm" variant="outline" className="ml-2">
                                            充值积分
                                        </Button>
                                    </Link>
                                </AlertDescription>
                            </Alert>
                        )}

                        {aiAnalysis ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {aiAnalysis}
                                </p>
                                <div className="flex items-center justify-between mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={generateAnalysis}
                                        disabled={isAnalyzing}
                                        className="cursor-pointer"
                                    >
                                        <RefreshCw className={cn("mr-2 h-4 w-4", isAnalyzing && "animate-spin")} />
                                        重新解读
                                    </Button>
                                    {creditsUsed && (
                                        <span className="text-xs text-muted-foreground">
                                            本次消耗 {creditsUsed} 积分
                                        </span>
                                    )}
                                </div>
                            </div>
                        ) : error ? (
                            <div className="space-y-3">
                                <p className="text-sm text-destructive">{error}</p>
                                <Button
                                    variant="outline"
                                    onClick={generateAnalysis}
                                    disabled={isAnalyzing}
                                    className="cursor-pointer"
                                >
                                    <RefreshCw className={cn("mr-2 h-4 w-4", isAnalyzing && "animate-spin")} />
                                    重试
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={generateAnalysis}
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
                        <h3 className="font-semibold mb-2">{title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {loginPrompt}
                        </p>
                        <Button variant="outline" className="cursor-pointer" asChild>
                            <a href="/sign-in">登录获取解读</a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
