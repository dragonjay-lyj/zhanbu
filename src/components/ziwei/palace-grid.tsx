"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// 宫位名称
const PALACE_NAMES = [
    "命宫", "兄弟宫", "夫妻宫", "子女宫",
    "财帛宫", "疾厄宫", "迁移宫", "仆役宫",
    "官禄宫", "田宅宫", "福德宫", "父母宫",
]

// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 主星颜色映射
const STAR_COLORS: Record<string, string> = {
    紫微: "text-purple-500",
    天机: "text-blue-400",
    太阳: "text-orange-500",
    武曲: "text-gray-400",
    天同: "text-cyan-400",
    廉贞: "text-red-500",
    天府: "text-yellow-500",
    太阴: "text-indigo-400",
    贪狼: "text-pink-500",
    巨门: "text-slate-500",
    天相: "text-teal-400",
    天梁: "text-green-500",
    七杀: "text-red-600",
    破军: "text-violet-500",
}

// 四化颜色
const SIHUA_COLORS: Record<string, string> = {
    化禄: "bg-green-500",
    化权: "bg-orange-500",
    化科: "bg-blue-500",
    化忌: "bg-red-500",
}

interface Palace {
    name: string
    position: number
    diZhi: string
    mainStars: string[]
    minorStars: string[]
    sihua: string[]
    tianGan: string
}

interface ZiweiPalaceGridProps {
    palaces: Palace[]
    mingGong: number
    shenGong: number
    selectedPalace: number | null
    onSelectPalace: (position: number) => void
    className?: string
}

/**
 * 紫微斗数十二宫位展示组件
 * 采用传统命盘方位布局
 */
export function ZiweiPalaceGrid({
    palaces,
    mingGong,
    shenGong,
    selectedPalace,
    onSelectPalace,
    className,
}: ZiweiPalaceGridProps) {
    // 传统命盘布局位置映射（从寅位开始顺时针）
    // 布局: 4x4 网格，中间 2x2 为空
    const layoutPositions = [
        // 顶行（从左到右）: 巳、午、未、申
        { row: 0, col: 0, position: 3 },
        { row: 0, col: 1, position: 4 },
        { row: 0, col: 2, position: 5 },
        { row: 0, col: 3, position: 6 },
        // 右列（从上到下）: 酉、戌
        { row: 1, col: 3, position: 7 },
        { row: 2, col: 3, position: 8 },
        // 底行（从右到左）: 亥、子、丑、寅
        { row: 3, col: 3, position: 9 },
        { row: 3, col: 2, position: 10 },
        { row: 3, col: 1, position: 11 },
        { row: 3, col: 0, position: 0 },
        // 左列（从下到上）: 卯、辰
        { row: 2, col: 0, position: 1 },
        { row: 1, col: 0, position: 2 },
    ]

    const getPalaceByPosition = (pos: number) => {
        return palaces.find(p => p.position === pos) || null
    }

    return (
        <TooltipProvider>
            <div className={cn("grid grid-cols-4 gap-1 md:gap-2", className)}>
                {Array.from({ length: 16 }, (_, idx) => {
                    const row = Math.floor(idx / 4)
                    const col = idx % 4

                    // 判断是否是中心区域
                    if ((row === 1 || row === 2) && (col === 1 || col === 2)) {
                        // 中心区域显示信息
                        if (row === 1 && col === 1) {
                            return (
                                <div
                                    key={idx}
                                    className="col-span-2 row-span-2 flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/50"
                                >
                                    <div className="font-serif text-2xl font-bold text-gradient mb-2">
                                        紫微命盘
                                    </div>
                                    <div className="text-sm text-muted-foreground text-center">
                                        <div>命宫: {PALACE_NAMES[mingGong]}({DI_ZHI[mingGong]})</div>
                                        <div>身宫: {PALACE_NAMES[shenGong]}({DI_ZHI[shenGong]})</div>
                                    </div>
                                </div>
                            )
                        }
                        return null // 其他中心格子被合并
                    }

                    // 找到对应的宫位
                    const layoutPos = layoutPositions.find(l => l.row === row && l.col === col)
                    if (!layoutPos) return <div key={idx} />

                    const palace = getPalaceByPosition(layoutPos.position)
                    if (!palace) return <div key={idx} />

                    const isSelected = selectedPalace === palace.position
                    const isMingGong = palace.position === mingGong
                    const isShenGong = palace.position === shenGong

                    return (
                        <Tooltip key={idx}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => onSelectPalace(palace.position)}
                                    aria-pressed={isSelected}
                                    aria-label={`选择${palace.name}`}
                                    className={cn(
                                        "relative p-2 rounded-lg border cursor-pointer transition-all duration-200",
                                        "hover:border-primary/50 hover:bg-primary/5",
                                        isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30",
                                        !isSelected && "border-border/50 bg-card/50",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                    )}
                                >
                                    {/* 宫位名称 */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "text-xs font-medium",
                                            isMingGong && "text-primary",
                                            isShenGong && "text-secondary"
                                        )}>
                                            {palace.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {palace.tianGan}{palace.diZhi}
                                        </span>
                                    </div>

                                    {/* 主星 */}
                                    <div className="space-y-0.5 min-h-[40px]">
                                        {palace.mainStars.map((star, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "text-xs font-semibold truncate",
                                                    STAR_COLORS[star] || "text-foreground"
                                                )}
                                            >
                                                {star}
                                                {palace.sihua.includes(`${star}化禄`) && (
                                                    <span className="ml-0.5 text-green-500">禄</span>
                                                )}
                                                {palace.sihua.includes(`${star}化权`) && (
                                                    <span className="ml-0.5 text-orange-500">权</span>
                                                )}
                                                {palace.sihua.includes(`${star}化科`) && (
                                                    <span className="ml-0.5 text-blue-500">科</span>
                                                )}
                                                {palace.sihua.includes(`${star}化忌`) && (
                                                    <span className="ml-0.5 text-red-500">忌</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 副星（简化显示） */}
                                    {palace.minorStars.length > 0 && (
                                        <div className="mt-1 text-[10px] text-muted-foreground truncate">
                                            {palace.minorStars.slice(0, 3).join(" ")}
                                            {palace.minorStars.length > 3 && "..."}
                                        </div>
                                    )}

                                    {/* 命宫/身宫标记 */}
                                    {(isMingGong || isShenGong) && (
                                        <div className="absolute top-1 right-1">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[8px] px-1 py-0",
                                                    isMingGong && "border-primary text-primary",
                                                    isShenGong && !isMingGong && "border-secondary text-secondary"
                                                )}
                                            >
                                                {isMingGong ? "命" : "身"}
                                            </Badge>
                                        </div>
                                    )}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                    <div className="font-semibold">{palace.name} ({palace.tianGan}{palace.diZhi})</div>
                                    {palace.mainStars.length > 0 && (
                                        <div>主星: {palace.mainStars.join("、")}</div>
                                    )}
                                    {palace.minorStars.length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            副星: {palace.minorStars.join("、")}
                                        </div>
                                    )}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
        </TooltipProvider>
    )
}
