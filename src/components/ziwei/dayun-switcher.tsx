"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// 天干
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

interface DayunPeriod {
    startAge: number
    endAge: number
    tianGan: string
    diZhi: string
    palace: string
    mainStars: string[]
}

interface FlowYearInfo {
    year: number
    tianGan: string
    diZhi: string
    age: number
    palace: string
}

interface DayunSwitcherProps {
    birthYear: number
    dayunList: DayunPeriod[]
    currentDayun: number
    onDayunChange: (index: number) => void
    flowYear: number
    onFlowYearChange: (year: number) => void
    className?: string
}

/**
 * 大运流年切换器组件
 */
export function DayunSwitcher({
    birthYear,
    dayunList,
    currentDayun,
    onDayunChange,
    flowYear,
    onFlowYearChange,
    className,
}: DayunSwitcherProps) {
    const currentYear = new Date().getFullYear()
    const currentAge = currentYear - birthYear + 1 // 虚岁

    // 生成流年选项（前后10年）
    const flowYearOptions = Array.from({ length: 21 }, (_, i) => {
        const year = currentYear - 10 + i
        const age = year - birthYear + 1
        const ganIndex = (year - 4) % 10
        const zhiIndex = (year - 4) % 12
        return {
            year,
            age,
            tianGan: TIAN_GAN[ganIndex],
            diZhi: DI_ZHI[zhiIndex],
        }
    })

    // 找到当前流年所在的大运
    const findCurrentDayunIndex = () => {
        return dayunList.findIndex(
            d => currentAge >= d.startAge && currentAge <= d.endAge
        )
    }

    const activeDayunIndex = findCurrentDayunIndex()

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" />
                    大运流年
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 大运轨道 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">大运</span>
                        <span className="text-xs text-muted-foreground">
                            当前虚岁: {currentAge}岁
                        </span>
                    </div>

                    <div className="relative">
                        {/* 大运列表 */}
                        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
                            {dayunList.map((dayun, index) => {
                                const isActive = index === activeDayunIndex
                                const isSelected = index === currentDayun

                                return (
                                    <button
                                        key={index}
                                        onClick={() => onDayunChange(index)}
                                        className={cn(
                                            "flex-shrink-0 px-3 py-2 rounded-lg border transition-all",
                                            "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                                            isSelected && "border-primary bg-primary/10",
                                            isActive && !isSelected && "border-secondary/50 bg-secondary/5",
                                            !isSelected && !isActive && "border-border/50"
                                        )}
                                    >
                                        <div className="text-center">
                                            <div className={cn(
                                                "font-serif text-lg font-bold",
                                                isActive && "text-secondary",
                                                isSelected && "text-primary"
                                            )}>
                                                {dayun.tianGan}{dayun.diZhi}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {dayun.startAge}-{dayun.endAge}岁
                                            </div>
                                            {isActive && (
                                                <Badge variant="secondary" className="mt-1 text-[10px]">
                                                    当前
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* 当前大运详情 */}
                    {dayunList[currentDayun] && (
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    {dayunList[currentDayun].tianGan}{dayunList[currentDayun].diZhi}大运
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {dayunList[currentDayun].palace}
                                </span>
                            </div>
                            {dayunList[currentDayun].mainStars.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {dayunList[currentDayun].mainStars.map((star, i) => (
                                        <Badge key={i} variant="outline" className="text-xs">
                                            {star}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 流年选择 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">流年</span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer"
                                onClick={() => onFlowYearChange(flowYear - 1)}
                                aria-label="上一年"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Select
                                value={flowYear.toString()}
                                onValueChange={(v) => onFlowYearChange(parseInt(v))}
                            >
                                <SelectTrigger className="w-[140px] cursor-pointer">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {flowYearOptions.map((opt) => (
                                        <SelectItem
                                            key={opt.year}
                                            value={opt.year.toString()}
                                            className="cursor-pointer"
                                        >
                                            {opt.year}年 ({opt.tianGan}{opt.diZhi}) {opt.age}岁
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 cursor-pointer"
                                onClick={() => onFlowYearChange(flowYear + 1)}
                                aria-label="下一年"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* 流年信息 */}
                    <div className="grid grid-cols-12 gap-1">
                        {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1
                            const isCurrentMonth = new Date().getMonth() + 1 === month && flowYear === currentYear

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "text-center p-1 rounded text-xs",
                                        isCurrentMonth && "bg-primary/20 text-primary font-medium",
                                        !isCurrentMonth && "bg-muted/30"
                                    )}
                                >
                                    {month}月
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 快速导航 */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                            onFlowYearChange(currentYear)
                            if (activeDayunIndex >= 0) {
                                onDayunChange(activeDayunIndex)
                            }
                        }}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        回到今年
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
