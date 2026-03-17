"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * 占卜结果骨架屏
 */
export function DivinationSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* 标题区域 */}
            <div className="text-center space-y-2">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
            </div>

            {/* 主要结果卡片 */}
            <div className="rounded-lg border p-6 space-y-4">
                <div className="flex justify-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <Skeleton className="h-20 w-20 rounded-lg" />
                    <Skeleton className="h-20 w-20 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>

            {/* 详细分析 */}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="rounded-lg border p-4 space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    )
}

/**
 * 卡片列表骨架屏
 */
export function CardListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    )
}

/**
 * 塔罗牌骨架屏
 */
export function TarotSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex justify-center gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-40 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                </div>
            ))}
        </div>
    )
}

/**
 * 紫微命盘骨架屏
 */
export function ZiweiSkeleton() {
    return (
        <div className="grid grid-cols-4 grid-rows-4 gap-1">
            {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-24 rounded",
                        // 中间4格空出
                        i >= 4 && i <= 7 ? "hidden" : ""
                    )}
                />
            ))}
        </div>
    )
}

/**
 * 占卜加载动画
 */
export function DivinationLoader({ message = "正在占卜中..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* 旋转的八卦图 */}
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cta animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-secondary animate-spin" style={{ animationDuration: "2s" }} />
                {/* 中心 */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-lg font-serif font-semibold text-primary animate-pulse">占</div>
                </div>
            </div>

            {/* 加载文字 */}
            <div className="text-center space-y-2">
                <p className="text-lg font-medium text-primary">{message}</p>
                <div className="flex justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    )
}

/**
 * 摇卦加载动画
 */
export function YaoguaLoader({ message = "掷币中..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* 铜钱动画 */}
            <div className="flex gap-4">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg flex items-center justify-center animate-bounce"
                        style={{ animationDelay: `${i * 200}ms` }}
                    >
                        <div className="w-4 h-4 rounded border-2 border-yellow-800" />
                    </div>
                ))}
            </div>
            <p className="text-lg font-medium text-amber-600">{message}</p>
        </div>
    )
}

/**
 * 塔罗洗牌动画
 */
export function TarotShuffleLoader({ message = "洗牌中..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            {/* 卡牌堆叠动画 */}
            <div className="relative w-24 h-36">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg"
                        style={{
                            transform: `rotate(${(i - 2) * 8}deg) translateX(${(i - 2) * 4}px)`,
                            animation: `shuffle 1.5s ease-in-out infinite`,
                            animationDelay: `${i * 100}ms`,
                        }}
                    >
                        <div className="absolute inset-2 border border-white/30 rounded flex items-center justify-center">
                            <span className="text-2xl text-white/50">✨</span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{message}</p>

            <style jsx>{`
                @keyframes shuffle {
                    0%, 100% { transform: rotate(var(--rotation)) translateX(var(--translate)); }
                    50% { transform: rotate(0deg) translateX(0) translateY(-10px); }
                }
            `}</style>
        </div>
    )
}
