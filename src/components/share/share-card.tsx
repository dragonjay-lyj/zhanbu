"use client"

import { cn } from "@/lib/utils"

interface ShareCardProps {
    id?: string
    type: "bazi" | "tarot" | "ziwei" | "liuyao" | "general"
    title: string
    subtitle?: string
    content: string
    score?: number
    date?: string
    className?: string
}

/**
 * 分享卡片组件
 * 用于生成可分享的占卜结果图片
 */
export function ShareCard({
    id = "share-card",
    type,
    title,
    subtitle,
    content,
    score,
    date = new Date().toLocaleDateString("zh-CN"),
    className,
}: ShareCardProps) {
    // 根据类型选择背景渐变
    const gradients = {
        bazi: "from-amber-900/90 via-orange-900/80 to-red-900/90",
        tarot: "from-purple-900/90 via-indigo-900/80 to-blue-900/90",
        ziwei: "from-violet-900/90 via-purple-900/80 to-fuchsia-900/90",
        liuyao: "from-emerald-900/90 via-teal-900/80 to-cyan-900/90",
        general: "from-slate-900/90 via-gray-900/80 to-zinc-900/90",
    }

    const icons = {
        bazi: "☰",
        tarot: "🔮",
        ziwei: "✨",
        liuyao: "☯",
        general: "🌟",
    }

    return (
        <div
            id={id}
            className={cn(
                "w-[400px] p-6 rounded-2xl text-white relative overflow-hidden",
                "bg-gradient-to-br",
                gradients[type],
                className
            )}
        >
            {/* 装饰背景 */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-8xl">{icons[type]}</div>
                <div className="absolute bottom-4 left-4 text-6xl rotate-45">{icons[type]}</div>
            </div>

            {/* 内容 */}
            <div className="relative z-10">
                {/* 头部 */}
                <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{icons[type]}</div>
                    <div className="text-xs text-white/60">{date}</div>
                </div>

                {/* 标题 */}
                <h2 className="text-2xl font-bold mb-1">{title}</h2>
                {subtitle && <p className="text-sm text-white/70 mb-4">{subtitle}</p>}

                {/* 分割线 */}
                <div className="h-px bg-white/20 my-4" />

                {/* 内容 */}
                <p className="text-sm leading-relaxed text-white/90 mb-4 line-clamp-6">
                    {content}
                </p>

                {/* 评分 */}
                {score !== undefined && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-white/70">综合评分</span>
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                style={{ width: `${score}%` }}
                            />
                        </div>
                        <span className="text-lg font-bold">{score}</span>
                    </div>
                )}

                {/* 底部品牌 */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                            占
                        </div>
                        <span className="text-xs text-white/70">占卜大师</span>
                    </div>
                    <div className="text-xs text-white/50">扫码获取完整解读</div>
                </div>
            </div>
        </div>
    )
}

/**
 * 八字命盘分享卡片
 */
export function BaziShareCard({
    id = "bazi-share-card",
    bazi,
    wuxing,
    analysis,
}: {
    id?: string
    bazi: string
    wuxing: Record<string, number>
    analysis: string
}) {
    return (
        <div
            id={id}
            className="w-[400px] p-6 rounded-2xl text-white relative overflow-hidden bg-gradient-to-br from-amber-900 via-orange-800 to-red-900"
        >
            {/* 八卦装饰 */}
            <div className="absolute -right-10 -top-10 text-[120px] opacity-10">☰</div>

            <div className="relative z-10">
                {/* 标题 */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">八字命盘</h2>
                    <p className="text-white/70 text-sm mt-1">{new Date().toLocaleDateString("zh-CN")}</p>
                </div>

                {/* 八字展示 */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {bazi.split(" ").map((pillar, i) => (
                        <div key={i} className="text-center">
                            <div className="text-xs text-white/60 mb-1">
                                {["年柱", "月柱", "日柱", "时柱"][i]}
                            </div>
                            <div className="bg-white/10 rounded-lg p-2">
                                <div className="text-lg font-bold">{pillar[0]}</div>
                                <div className="text-lg">{pillar[1]}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 五行 */}
                <div className="flex justify-center gap-3 mb-4">
                    {Object.entries(wuxing).map(([element, count]) => (
                        <div key={element} className="text-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg mb-1">
                                {element}
                            </div>
                            <div className="text-xs">{count}</div>
                        </div>
                    ))}
                </div>

                {/* 分析 */}
                <p className="text-sm text-white/80 text-center line-clamp-3">{analysis}</p>

                {/* 品牌 */}
                <div className="text-center mt-6 pt-4 border-t border-white/10">
                    <span className="text-xs text-white/50">占卜大师 · 专业 AI 命理平台</span>
                </div>
            </div>
        </div>
    )
}
