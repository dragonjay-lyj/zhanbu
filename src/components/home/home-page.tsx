"use client"

import Link from "next/link"
import {
    ArrowRight,
    Brain,
    Calendar,
    Flower2,
    Heart,
    Hexagon,
    LayoutGrid,
    Layers,
    Shield,
    Sparkles,
    Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"

const moduleTones = [
    { wrapper: "bg-primary/10", icon: "text-primary" },
    { wrapper: "bg-secondary/18", icon: "text-primary" },
    { wrapper: "bg-cta/12", icon: "text-cta" },
    { wrapper: "bg-primary/8", icon: "text-primary" },
    { wrapper: "bg-secondary/14", icon: "text-primary" },
    { wrapper: "bg-cta/10", icon: "text-cta" },
] as const

const aiFeatureTones = [
    "bg-primary/10 text-primary",
    "bg-cta/10 text-cta",
    "bg-secondary/16 text-primary",
] as const

export function HomePage() {
    const { t, translations } = useTranslation()
    const featureTexts = (translations.home as { modules?: { title: string; description: string }[] })?.modules || []
    const aiFeatureTexts = (translations.home as { aiFeatures?: { title: string; description: string }[] })?.aiFeatures || []
    const modules = [
        { ...featureTexts[0], href: "/bazi", icon: LayoutGrid },
        { ...featureTexts[1], href: "/ziwei", icon: Hexagon },
        { ...featureTexts[2], href: "/liuyao", icon: Layers },
        { ...featureTexts[3], href: "/tarot", icon: Flower2 },
        { ...featureTexts[4], href: "/relationship/business", icon: Heart },
        { ...featureTexts[5], href: "/huangli", icon: Calendar },
    ].filter((item) => item.title && item.description)
    const aiFeatures = [
        { ...aiFeatureTexts[0], icon: Brain },
        { ...aiFeatureTexts[1], icon: Zap },
        { ...aiFeatureTexts[2], icon: Shield },
    ].filter((item) => item.title && item.description)
    const highlights = [
        t("nav.bazi"),
        t("nav.ziwei"),
        t("nav.tarot"),
    ]

    return (
        <div className="space-y-[var(--space-3xl)] pb-[var(--space-3xl)]">
            <section className="glass relative overflow-hidden rounded-[2rem] px-6 py-10 md:px-10 md:py-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary)/0.3),transparent_35%),radial-gradient(circle_at_85%_15%,hsl(var(--cta)/0.18),transparent_24%)]" />
                <div className="absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full border border-primary/10 bg-white/25 blur-2xl" />
                <div className="absolute bottom-[-5rem] left-[-3rem] h-40 w-40 rounded-full border border-cta/10 bg-cta/8 blur-2xl" />

                <div className="relative z-10 max-w-3xl space-y-6">
                    <Badge variant="outline" className="rounded-full border-primary/20 bg-white/70 px-4 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-primary shadow-[var(--shadow-sm)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t("home.heroExtra.tagline")}
                    </Badge>

                    <div className="space-y-4">
                        <h1 className="font-serif text-4xl font-semibold leading-tight text-balance md:text-6xl">
                            <span className="text-gradient">{t("home.heroExtra.brand")}</span>
                            <br />
                            {t("home.heroExtra.headline")}
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                            {t("home.heroExtra.description")}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href="/bazi">
                                {t("home.heroExtra.primaryCta")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/ziwei">{t("home.heroExtra.secondaryCta")}</Link>
                        </Button>
                    </div>

                    <div className="grid gap-3 pt-4 sm:grid-cols-3">
                        {highlights.map((item, index) => (
                            <div
                                key={item}
                                className="rounded-2xl border border-primary/10 bg-white/70 px-4 py-3 shadow-[var(--shadow-sm)] backdrop-blur-xl"
                            >
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                                    0{index + 1}
                                </div>
                                <div className="mt-2 font-medium text-foreground">{item}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <Badge variant="secondary" className="rounded-full bg-primary/8 px-3 py-1 text-primary">
                            {t("home.sections.modulesTitle")}
                        </Badge>
                        <h2 className="text-3xl font-semibold text-balance">{t("home.sections.journeyTitle")}</h2>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                        {t("home.sections.modulesSubtitle")}
                    </p>
                </div>

                <div className="grid gap-5 md:hidden">
                    {modules.map((module, index) => (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                            <Card className="h-full">
                                <CardHeader>
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${moduleTones[index]?.wrapper ?? "bg-primary/10"}`}>
                                        <module.icon className={`h-6 w-6 ${moduleTones[index]?.icon ?? "text-primary"}`} />
                                    </div>
                                    <CardTitle className="flex items-center gap-2">
                                        {module.title}
                                        <ArrowRight className="h-4 w-4 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                                    </CardTitle>
                                    <CardDescription>{module.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="hidden gap-5 overflow-x-auto pb-3 md:flex md:snap-x md:snap-mandatory">
                    {modules.map((module, index) => (
                        <Link
                            key={module.href}
                            href={module.href}
                            className="group min-w-[320px] max-w-[360px] shrink-0 snap-start rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                            <Card className="h-full">
                                <CardHeader className="space-y-6">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-[1.25rem] ${moduleTones[index]?.wrapper ?? "bg-primary/10"}`}>
                                        <module.icon className={`h-7 w-7 ${moduleTones[index]?.icon ?? "text-primary"}`} />
                                    </div>
                                    <div className="space-y-3">
                                        <CardTitle className="flex items-center gap-2">
                                            {module.title}
                                            <ArrowRight className="h-4 w-4 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                                        </CardTitle>
                                        <CardDescription className="leading-7">{module.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}

                    <Card className="min-w-[320px] max-w-[360px] shrink-0 snap-start border-cta/18 bg-[linear-gradient(180deg,hsl(var(--cta)/0.12),hsl(var(--card)/0.96))]">
                        <CardHeader className="space-y-4">
                            <Badge className="w-fit rounded-full bg-cta text-cta-foreground">{t("home.sections.aiBadge")}</Badge>
                            <CardTitle>{t("home.sections.aiTitle")}</CardTitle>
                            <CardDescription className="leading-7">{t("home.sections.aiSubtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/ai-chat">
                                    AI Chat
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <Card className="overflow-hidden">
                    <CardHeader className="space-y-3">
                        <Badge variant="secondary" className="w-fit rounded-full bg-primary/8 px-3 py-1 text-primary">
                            {t("home.sections.aiBadge")}
                        </Badge>
                        <CardTitle>{t("home.sections.aiTitle")}</CardTitle>
                        <CardDescription className="max-w-2xl leading-7">
                            {t("home.sections.aiSubtitle")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        {aiFeatures.map((feature, index) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-primary/10 bg-white/70 p-5 shadow-[var(--shadow-sm)] backdrop-blur-xl"
                            >
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${aiFeatureTones[index] ?? aiFeatureTones[0]}`}>
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 font-serif text-xl font-semibold">{feature.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-[linear-gradient(180deg,hsl(var(--secondary)/0.14),hsl(var(--card)/0.96))]">
                    <CardHeader className="space-y-3">
                        <Badge variant="outline" className="w-fit rounded-full border-cta/20 bg-white/70 px-3 py-1 text-cta">
                            Craft & Care
                        </Badge>
                        <CardTitle>{t("home.sections.journeyTitle")}</CardTitle>
                        <CardDescription className="leading-7">
                            {t("home.sections.journeySubtitle")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-2xl border border-primary/10 bg-white/76 p-4 shadow-[var(--shadow-sm)]">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">01</div>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("home.sections.modulesSubtitle")}</p>
                        </div>
                        <div className="rounded-2xl border border-primary/10 bg-white/76 p-4 shadow-[var(--shadow-sm)]">
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">02</div>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("home.sections.aiSubtitle")}</p>
                        </div>
                        <Button size="lg" asChild>
                            <Link href="/pricing">
                                {t("nav.pricing")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <section className="glass rounded-[2rem] px-6 py-8 md:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">{t("home.sections.journeyTitle")}</h2>
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                            {t("home.sections.disclaimer")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href="/bazi">
                                {t("nav.bazi")}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/tarot">{t("nav.tarot")}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
