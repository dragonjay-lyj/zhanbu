"use client"

import Link from "next/link"
import {
    ArrowRight,
    LayoutGrid,
    Hexagon,
    Layers,
    Flower2,
    Heart,
    Calendar,
    Sparkles,
    Zap,
    Shield,
    Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n"

/**
 * 首页
 */
export default function HomePage() {
    const { t, translations } = useTranslation()
    const featureTexts = (translations.home as { modules?: { title: string; description: string }[] })?.modules || []
    const aiFeatureTexts = (translations.home as { aiFeatures?: { title: string; description: string }[] })?.aiFeatures || []
    const features = [
        {
            ...featureTexts[0],
            href: "/bazi",
            icon: LayoutGrid,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
        },
        {
            ...featureTexts[1],
            href: "/ziwei",
            icon: Hexagon,
            color: "text-violet-500",
            bgColor: "bg-violet-500/10",
        },
        {
            ...featureTexts[2],
            href: "/liuyao",
            icon: Layers,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            ...featureTexts[3],
            href: "/tarot",
            icon: Flower2,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
        },
        {
            ...featureTexts[4],
            href: "/relationship/business",
            icon: Heart,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
        },
        {
            ...featureTexts[5],
            href: "/huangli",
            icon: Calendar,
            color: "text-teal-500",
            bgColor: "bg-teal-500/10",
        },
    ].filter((item) => item.title && item.description)
    const aiFeatures = [
        { ...aiFeatureTexts[0], icon: Brain },
        { ...aiFeatureTexts[1], icon: Zap },
        { ...aiFeatureTexts[2], icon: Shield },
    ].filter((item) => item.title && item.description)
    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8 md:p-16">
                {/* 装饰元素 */}
                <div className="absolute top-4 right-4 opacity-20">
                    <Sparkles className="h-32 w-32 text-primary" />
                </div>
                <div className="absolute bottom-4 left-4 opacity-10">
                    <Hexagon className="h-48 w-48 text-secondary" />
                </div>

                <div className="relative z-10 max-w-3xl">
                    <Badge variant="outline" className="mb-4">
                        <Sparkles className="mr-1 h-3 w-3" />
                        {t("home.heroExtra.tagline")}
                    </Badge>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        <span className="text-gradient">{t("home.heroExtra.brand")}</span>
                        <br />
                        {t("home.heroExtra.headline")}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                        {t("home.heroExtra.description")}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="cursor-pointer" asChild>
                            <Link href="/bazi">
                                {t("home.heroExtra.primaryCta")}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                            <Link href="/ziwei">
                                {t("home.heroExtra.secondaryCta")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 功能模块 */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="font-serif text-3xl font-bold mb-4">{t("home.sections.modulesTitle")}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("home.sections.modulesSubtitle")}
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <Link key={feature.href} href={feature.href} className="group">
                            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="flex items-center gap-2">
                                        {feature.title}
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                    </CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* AI 特点 */}
            <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card to-muted/30 p-8 md:p-12">
                <div className="text-center mb-10">
                    <Badge variant="secondary" className="mb-4">
                        <Brain className="mr-1 h-3 w-3" />
                        {t("home.sections.aiBadge")}
                    </Badge>
                    <h2 className="font-serif text-3xl font-bold mb-4">{t("home.sections.aiTitle")}</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("home.sections.aiSubtitle")}
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    {aiFeatures.map((feature) => (
                        <div key={feature.title} className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
                <div className="glass rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                        {t("home.sections.journeyTitle")}
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {t("home.sections.journeySubtitle")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="cursor-pointer" asChild>
                            <Link href="/bazi">
                                {t("nav.bazi")}
                                <LayoutGrid className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="secondary" className="cursor-pointer" asChild>
                            <Link href="/tarot">
                                {t("nav.tarot")}
                                <Flower2 className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 底部说明 */}
            <section className="text-center text-sm text-muted-foreground">
                <p>
                    {t("home.sections.disclaimer")}
                </p>
            </section>
        </div>
    )
}
