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
import { useTranslation, formatMessage } from "@/lib/i18n"

/**
 * 会员定价页面
 */
export default function PricingPage() {
    const { t } = useTranslation()
    const { user, isLoaded } = useUser()
    const { plans, paymentUrl, membership, isLoading } = useMembership()
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [orderInfo, setOrderInfo] = useState<{
        orderId: string
        planName: string
        amount: number
        paymentUrl: string
        paymentProvider?: "linuxdo_credit" | "manual" | "xianyu"
        message?: string
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
                alert(data.error || t("pages.pricing.errors.createOrderFailed"))
            }
        } catch (error) {
            console.error("支付错误:", error)
            alert(t("pages.pricing.errors.paymentFailed"))
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

    const periodLabel = (period: string) => {
        if (period === "monthly") return t("pages.pricing.period.monthly")
        if (period === "yearly") return t("pages.pricing.period.yearly")
        return t("pages.pricing.period.lifetime")
    }

    const faqs = [
        {
            question: t("pages.pricing.faqs.upgrade.question"),
            answer: t("pages.pricing.faqs.upgrade.answer"),
        },
        {
            question: t("pages.pricing.faqs.activation.question"),
            answer: t("pages.pricing.faqs.activation.answer"),
        },
        {
            question: t("pages.pricing.faqs.refund.question"),
            answer: t("pages.pricing.faqs.refund.answer"),
        },
        {
            question: t("pages.pricing.faqs.expire.question"),
            answer: t("pages.pricing.faqs.expire.answer"),
        },
    ]

    const benefits = [
        {
            icon: Zap,
            title: t("pages.pricing.benefits.unlimited.title"),
            description: t("pages.pricing.benefits.unlimited.desc"),
        },
        {
            icon: Star,
            title: t("pages.pricing.benefits.ai.title"),
            description: t("pages.pricing.benefits.ai.desc"),
        },
        {
            icon: Clock,
            title: t("pages.pricing.benefits.history.title"),
            description: t("pages.pricing.benefits.history.desc"),
        },
        {
            icon: MessageCircle,
            title: t("pages.pricing.benefits.support.title"),
            description: t("pages.pricing.benefits.support.desc"),
        },
    ]

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
                    <span className="font-medium">{t("pages.pricing.badge")}</span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold">
                    {t("pages.pricing.title")}
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {t("pages.pricing.subtitle")}
                </p>
                {membership?.isPremium && (
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                        <Crown className="mr-2 h-4 w-4" />
                        {formatMessage(t("pages.pricing.currentPlan"), { plan: membership.planName })}
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
                                    {t("pages.pricing.recommended")}
                                </div>
                            )}
                            {plan.original_price && plan.original_price > plan.price && (
                                <div className="absolute top-0 left-0 px-3 py-1 bg-red-500 text-white text-xs font-medium">
                                    {formatMessage(t("pages.pricing.discount"), {
                                        amount: formatPrice(plan.original_price - plan.price),
                                    })}
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
                                        {plan.price === 0
                                            ? t("pages.pricing.free")
                                            : formatMessage(t("pages.pricing.price"), { amount: formatPrice(plan.price) })}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className="text-muted-foreground">
                                            /{periodLabel(plan.period)}
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
                                            {t("pages.pricing.actions.currentPlan")}
                                        </>
                                    ) : selectedPlan === plan.id && isProcessing ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            {t("pages.pricing.actions.processing")}
                                        </>
                                    ) : plan.id === "free" ? (
                                        t("pages.pricing.actions.inUse")
                                    ) : (
                                        t("pages.pricing.actions.subscribe")
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
                        {t("pages.pricing.benefitsTitle")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-6">
                        {benefits.map((benefit) => (
                            <div key={benefit.title} className="text-center space-y-2">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <benefit.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 常见问题 */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("pages.pricing.faqTitle")}</CardTitle>
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
                    <span>{t("pages.pricing.security.title")}</span>
                </div>
                <p>{t("pages.pricing.security.subtitle")}</p>
            </div>

            {/* 支付弹窗 */}
            <Dialog open={!!orderInfo} onOpenChange={() => setOrderInfo(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-amber-500" />
                            {t("pages.pricing.dialog.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("pages.pricing.dialog.description")}
                        </DialogDescription>
                    </DialogHeader>

                    {orderInfo && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("pages.pricing.dialog.planLabel")}</span>
                                    <span className="font-medium">{orderInfo.planName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t("pages.pricing.dialog.amountLabel")}</span>
                                    <span className="font-bold text-lg">
                                        {formatMessage(t("pages.pricing.price"), { amount: formatPrice(orderInfo.amount) })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{t("pages.pricing.dialog.orderLabel")}</span>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-2 py-1 rounded text-sm">
                                            {orderInfo.orderId}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer"
                                            onClick={copyOrderId}
                                            aria-label="复制订单号"
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
                                    <strong>{t("pages.pricing.dialog.noticeTitle")}</strong>
                                    {orderInfo.message || t("pages.pricing.dialog.noticeBody")}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setOrderInfo(null)} className="cursor-pointer">
                            {t("pages.pricing.dialog.actions.later")}
                        </Button>
                        <Button onClick={goToPayment} className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            {t("pages.pricing.dialog.actions.pay")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
