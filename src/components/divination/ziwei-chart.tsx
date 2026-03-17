"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

// 宫位数据类型
interface Palace {
    name: string      // 宫位名称
    branch: string    // 地支
    stars: string[]   // 主星
    minorStars?: string[]  // 辅星
    liuNian?: string  // 流年
}

// 星曜颜色
const starColors: Record<string, string> = {
    // 主星 - 紫色系
    "紫微": "text-purple-600 dark:text-purple-400",
    "天机": "text-blue-600 dark:text-blue-400",
    "太阳": "text-orange-600 dark:text-orange-400",
    "武曲": "text-amber-600 dark:text-amber-400",
    "天同": "text-cyan-600 dark:text-cyan-400",
    "廉贞": "text-rose-600 dark:text-rose-400",
    // 北斗主星 - 紫色渐变
    "天府": "text-violet-600 dark:text-violet-400",
    "太阴": "text-indigo-600 dark:text-indigo-400",
    "贪狼": "text-pink-600 dark:text-pink-400",
    "巨门": "text-slate-600 dark:text-slate-400",
    "天相": "text-teal-600 dark:text-teal-400",
    "天梁": "text-emerald-600 dark:text-emerald-400",
    "七杀": "text-red-600 dark:text-red-400",
    "破军": "text-fuchsia-600 dark:text-fuchsia-400",
    // 默认
    "default": "text-gray-600 dark:text-gray-400",
}

// 宫位背景色
const palaceColors: Record<string, string> = {
    "命宫": "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800",
    "财帛": "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40 border-amber-200 dark:border-amber-800",
    "官禄": "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800",
    "田宅": "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800",
    "default": "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-800/40 border-gray-200 dark:border-gray-700",
}

interface ZiweiPalaceProps {
    palace: Palace
    position: number  // 0-11 位置
    isActive?: boolean
}

/**
 * 单个宫位组件
 */
function ZiweiPalace({ palace, position, isActive }: ZiweiPalaceProps) {
    const bgColor = palaceColors[palace.name] || palaceColors.default

    return (
        <div
            className={cn(
                "relative cursor-pointer rounded-lg border-2 p-2 transition-[background-color,border-color,box-shadow,transform] duration-200",
                "hover:-translate-y-px hover:shadow-lg",
                bgColor,
                isActive && "ring-2 ring-primary ring-offset-2"
            )}
        >
            {/* 宫位名称 */}
            <div className="absolute top-1 left-1 text-xs font-bold text-foreground/70">
                {palace.name}
            </div>
            {/* 地支 */}
            <div className="absolute top-1 right-1 text-xs font-medium text-primary">
                {palace.branch}
            </div>

            {/* 主星区域 */}
            <div className="mt-5 min-h-[60px] flex flex-col gap-0.5">
                {palace.stars.map((star, i) => (
                    <div
                        key={i}
                        className={cn(
                            "text-sm font-bold text-center",
                            starColors[star] || starColors.default
                        )}
                    >
                        {star}
                    </div>
                ))}
            </div>

            {/* 辅星区域 */}
            {palace.minorStars && palace.minorStars.length > 0 && (
                <div className="mt-1 pt-1 border-t border-dashed border-gray-300 dark:border-gray-600">
                    <div className="flex flex-wrap gap-1 justify-center">
                        {palace.minorStars.map((star, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground">
                                {star}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 流年标记 */}
            {palace.liuNian && (
                <div className="absolute bottom-1 right-1 text-[10px] px-1 rounded bg-primary/10 text-primary">
                    {palace.liuNian}
                </div>
            )}
        </div>
    )
}

interface ZiweiChartProps {
    palaces: Palace[]
    title?: string
    className?: string
    activePalace?: number
    onPalaceClick?: (index: number) => void
}

/**
 * 紫微命盘组件
 * 专业的十二宫位布局
 */
export function ZiweiChart({
    palaces,
    title,
    className,
    activePalace,
    onPalaceClick,
}: ZiweiChartProps) {
    // 十二宫位按照传统布局排列
    // 布局：
    //   巳  午  未  申
    //   辰          酉
    //   卯          戌
    //   寅  丑  子  亥
    const gridPositions = [
        [3, 4, 5, 6],    // 顶行：巳午未申
        [2, -1, -1, 7],   // 第二行：辰 (空) (空) 酉
        [1, -1, -1, 8],   // 第三行：卯 (空) (空) 戌
        [0, 11, 10, 9],   // 底行：寅丑子亥
    ]

    return (
        <div className={cn("space-y-4", className)}>
            {title && (
                <h3 className="bg-gradient-to-r from-primary to-cta bg-clip-text text-center text-xl font-bold text-transparent">
                    {title}
                </h3>
            )}

            <div className="grid grid-cols-4 gap-2">
                {gridPositions.flat().map((pos, i) => {
                    if (pos === -1) {
                        // 中间空白区域（可放命主信息）
                        if (i === 5) {
                            return (
                                <div
                                    key={i}
                                    className="col-span-2 row-span-2 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/6 to-cta/8"
                                >
                                    <div className="text-center space-y-2">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm font-bold text-primary">
                                            紫微斗数命盘
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        return null
                    }

                    const palace = palaces[pos]
                    if (!palace) return <div key={i} className="aspect-square" />

                    return (
                        <button
                            type="button"
                            key={i}
                            onClick={() => onPalaceClick?.(pos)}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                            aria-label={`查看${palace.name}`}
                        >
                            <ZiweiPalace
                                palace={palace}
                                position={pos}
                                isActive={activePalace === pos}
                            />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// 导出星曜颜色供外部使用
export { starColors, palaceColors }
