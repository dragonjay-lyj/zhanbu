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

// 功能模块数据
const features = [
    {
        title: "八字命理",
        description: "精准分析四柱八字，解读五行平衡与人生运势",
        href: "/bazi",
        icon: LayoutGrid,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
    },
    {
        title: "紫微斗数",
        description: "十二宫位深度解析，揭示命盘核心结构",
        href: "/ziwei",
        icon: Hexagon,
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
    },
    {
        title: "六爻占卜",
        description: "铜钱摇卦预测，解答具体问题的未来走向",
        href: "/liuyao",
        icon: Layers,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        title: "塔罗占卜",
        description: "多种牌阵解读，聆听潜意识的声音",
        href: "/tarot",
        icon: Flower2,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        title: "关系分析",
        description: "商业、友谊、亲子等多维度关系契合度分析",
        href: "/relationship/business",
        icon: Heart,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
    },
    {
        title: "黄历查询",
        description: "传统中国黄历，查询各类活动的吉日",
        href: "/huangli",
        icon: Calendar,
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
    },
]

// AI 特点
const aiFeatures = [
    {
        title: "智能解读",
        description: "结合传统与现代 AI 技术，提供深度命理分析",
        icon: Brain,
    },
    {
        title: "即时反馈",
        description: "无需等待，AI 系统即时生成专业解读",
        icon: Zap,
    },
    {
        title: "隐私保护",
        description: "严格保护用户数据，安全可靠",
        icon: Shield,
    },
]

/**
 * 首页
 */
export default function HomePage() {
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
                        AI 智能命理平台
                    </Badge>
                    <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        <span className="text-gradient">ZhanBu 占卜</span>
                        <br />
                        探索命运的奥秘
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                        融合紫微斗数、八字命理、六爻占卜、塔罗牌等多种传统智慧，
                        结合现代 AI 技术，为您提供全面、精准的命理分析与人生指引。
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button size="lg" className="cursor-pointer" asChild>
                            <Link href="/bazi">
                                开始探索
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                            <Link href="/ziwei">
                                紫微排盘
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 功能模块 */}
            <section>
                <div className="text-center mb-10">
                    <h2 className="font-serif text-3xl font-bold mb-4">功能模块</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        多种占卜系统，满足您不同的命理分析需求
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
                        AI 技术
                    </Badge>
                    <h2 className="font-serif text-3xl font-bold mb-4">AI 智能解读</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        融合传统命理智慧与现代人工智能技术，为您提供更精准、更深入的命理分析
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
                        开始您的命理探索之旅
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        无论是了解自己、探索人际关系，还是寻求决策指引，ZhanBu 都能为您提供帮助。
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="cursor-pointer" asChild>
                            <Link href="/bazi">
                                八字排盘
                                <LayoutGrid className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="secondary" className="cursor-pointer" asChild>
                            <Link href="/tarot">
                                塔罗占卜
                                <Flower2 className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 底部说明 */}
            <section className="text-center text-sm text-muted-foreground">
                <p>
                    占卜结果仅供参考娱乐，不构成任何决策建议。
                    命运掌握在自己手中，愿您活出精彩人生。
                </p>
            </section>
        </div>
    )
}
