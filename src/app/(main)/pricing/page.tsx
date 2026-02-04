"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import {
    Crown,
    Check,
    Sparkles,
    Zap,
    Star,
    Shield,
    Clock,
    MessageCircle,
    ExternalLink,
    Copy,
    CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useMembership } from "@/lib/membership"
import Link from "next/link"

// FAQ
const faqs = [
    {
        question: "如何升级会员？",
        answer: "选择适合您的套餐，点击「立即开通」按钮，前往闲鱼完成支付并备注订单号。",
    },
    {
        question: "支付后多久生效？",
        answer: "我们会在 1-24 小时内核实您的订单并开通会员。",
    },
    {
        question: "会员可以退款吗？",
        answer: "开通后 7 天内如未使用会员权益，可联系客服申请全额退款。",
    },
    {
        question: "会员到期后会怎样？",
        answer: "会员到期后将恢复为免费用户，但您的历史记录会保留。",
    },
]

/**
 * 会员定价页面
 */
export default function PricingPage() {
    const { user, isLoaded } = useUser()
    const { plans, paymentUrl, membership, isLoading } = useMembership()
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [orderInfo, setOrderInfo] = useState<{
        orderId: string
        planName: string
        amount: number
        paymentUrl: string
    } | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [copied, setCopied] = useState(false)

    const handlePurchase = async (planId: string) => {
        if (!user) {
            window.location.href = "/sign-in"
            return
        }

        if (planId === "free") return

        setSelectedPlan(planId)
        setIsProcessing(true)

        try {
            const response = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            })

            const data = await response.json()

            if (data.success) {
                setOrderInfo(data.data)
            } else {
                alert(data.error || "创建订单失败")
            }
        } catch (error) {
            console.error("支付错误:", error)
            alert("支付过程出错，请稍后重试")
        } finally {
            setIsProcessing(false)
        }
    }

    const copyOrderId = () => {
        if (orderInfo?.orderId) {
            navigator.clipboard.writeText(orderInfo.orderId)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const goToPayment = () => {
        if (orderInfo?.paymentUrl) {
            window.open(orderInfo.paymentUrl, "_blank")
        }
    }

    const formatPrice = (price: number) => {
        return (price / 100).toFixed(2)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* 页面标题 */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Crown className="h-5 w-5" />
                    <span className="font-medium">会员特权</span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold">
                    解锁全部占卜功能
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    升级会员，享受无限次占卜、AI 智能解读等专属特权
                </p>
                {membership?.isPremium && (
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                        <Crown className="mr-2 h-4 w-4" />
                        当前套餐：{membership.planName}
                    </Badge>
                )}
            </div>

            {/* 套餐选择 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, index) => {
                    const isCurrentPlan = membership?.planId === plan.id
                    const isRecommended = plan.id === "monthly"
                    const features = typeof plan.features === "string"
                        ? JSON.parse(plan.features)
                        : plan.features || []

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative overflow-hidden transition-all hover:shadow-lg",
                                isRecommended && "border-primary shadow-primary/20",
                                isCurrentPlan && "border-green-500"
                            )}
                        >
                            {isRecommended && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium">
                                    推荐
                                </div>
                            )}
                            {plan.original_price && plan.original_price > plan.price && (
                                <div className="absolute top-0 left-0 px-3 py-1 bg-red-500 text-white text-xs font-medium">
                                    省 ¥{formatPrice(plan.original_price - plan.price)}
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-1">
                                    {plan.original_price && plan.original_price > plan.price && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            ¥{formatPrice(plan.original_price)}
                                        </span>
                                    )}
                                    <span className="text-4xl font-bold">
                                        {plan.price === 0 ? "免费" : `¥${formatPrice(plan.price)}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-muted-foreground">
                                            /{plan.period === "monthly" ? "月" : plan.period === "yearly" ? "年" : "永久"}
                                        </span>
                                    )}
                                </div>

                                <ul className="space-y-2">
                                    {features.map((feature: string) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    variant={isCurrentPlan ? "outline" : "default"}
                                    className="w-full cursor-pointer"
                                    disabled={plan.id === "free" || isCurrentPlan || (selectedPlan === plan.id && isProcessing)}
                                    onClick={() => handlePurchase(plan.id)}
                                >
                                    {isCurrentPlan ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            当前套餐
                                        </>
                                    ) : selectedPlan === plan.id && isProcessing ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            处理中...
                                        </>
                                    ) : plan.id === "free" ? (
                                        "当前使用"
                                    ) : (
                                        "立即开通"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* 会员特权对比 */}
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        会员专属特权
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">无限占卜</h3>
                            <p className="text-sm text-muted-foreground">
                                不限次数使用所有占卜功能
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Star className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">AI 解读</h3>
                            <p className="text-sm text-muted-foreground">
                                获得专业 AI 智能解读分析
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">永久保存</h3>
                            <p className="text-sm text-muted-foreground">
                                历史记录永久保存随时查看
                            </p>
                        </div>
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <MessageCircle className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">专属客服</h3>
                            <p className="text-sm text-muted-foreground">
                                一对一专属客服支持
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 常见问题 */}
            <Card>
                <CardHeader>
                    <CardTitle>常见问题</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="space-y-2">
                                <h4 className="font-medium">{faq.question}</h4>
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 安全保障 */}
            <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span>安全支付保障</span>
                </div>
                <p>支付完成后请保留订单号，我们将在核实支付后为您开通会员</p>
            </div>

            {/* 支付弹窗 */}
            <Dialog open={!!orderInfo} onOpenChange={() => setOrderInfo(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            订单已创建
                        </DialogTitle>
                        <DialogDescription>
                            请前往闲鱼完成支付并备注订单号
                        </DialogDescription>
                    </DialogHeader>

                    {orderInfo && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">套餐</span>
                                    <span className="font-medium">{orderInfo.planName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">金额</span>
                                    <span className="font-bold text-lg">¥{formatPrice(orderInfo.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">订单号</span>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-2 py-1 rounded text-sm">
                                            {orderInfo.orderId}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            onClick={copyOrderId}
                                        >
                                            {copied ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                                <p className="text-sm">
                                    <strong>重要提示：</strong>请在闲鱼支付时备注订单号，我们将在核实支付后 1-24 小时内为您开通会员。
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setOrderInfo(null)} className="cursor-pointer">
                            稍后支付
                        </Button>
                        <Button onClick={goToPayment} className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            前往闲鱼支付
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
