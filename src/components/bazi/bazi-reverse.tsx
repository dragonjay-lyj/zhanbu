"use client"

import { useState } from "react"
import {
    RotateCcw,
    Calendar,
    Search,
    ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn, TIAN_GAN, DI_ZHI } from "@/lib/utils"

// 天干五行
const GAN_WUXING: Record<string, string> = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
}

interface BaziReverseProps {
    className?: string
}

/**
 * 八字反推组件
 * 根据八字反推可能的出生日期
 */
export function BaziReverse({ className }: BaziReverseProps) {
    const [yearGan, setYearGan] = useState<string | undefined>(undefined)
    const [yearZhi, setYearZhi] = useState<string | undefined>(undefined)
    const [monthGan, setMonthGan] = useState<string | undefined>(undefined)
    const [monthZhi, setMonthZhi] = useState<string | undefined>(undefined)
    const [dayGan, setDayGan] = useState<string | undefined>(undefined)
    const [dayZhi, setDayZhi] = useState<string | undefined>(undefined)
    const [hourGan, setHourGan] = useState<string | undefined>(undefined)
    const [hourZhi, setHourZhi] = useState<string | undefined>(undefined)
    const [results, setResults] = useState<Array<{
        year: number
        month: number
        day: number
        hour: string
    }> | null>(null)

    // 根据年柱反推可能的年份
    const calculatePossibleYears = () => {
        if (!yearGan || !yearZhi) return []

        const ganIndex = (TIAN_GAN as readonly string[]).indexOf(yearGan)
        const zhiIndex = (DI_ZHI as readonly string[]).indexOf(yearZhi)

        // 找到符合条件的年份
        const years: number[] = []
        for (let year = 1900; year <= 2100; year++) {
            const yGanIndex = (year - 4) % 10
            const yZhiIndex = (year - 4) % 12
            if (yGanIndex === ganIndex && yZhiIndex === zhiIndex) {
                years.push(year)
            }
        }
        return years
    }

    // 时辰对应的小时范围
    const hourRanges: Record<string, string> = {
        子: "23:00-01:00",
        丑: "01:00-03:00",
        寅: "03:00-05:00",
        卯: "05:00-07:00",
        辰: "07:00-09:00",
        巳: "09:00-11:00",
        午: "11:00-13:00",
        未: "13:00-15:00",
        申: "15:00-17:00",
        酉: "17:00-19:00",
        戌: "19:00-21:00",
        亥: "21:00-23:00",
    }

    // 执行反推
    const doReverse = () => {
        const possibleYears = calculatePossibleYears()

        if (possibleYears.length === 0) {
            setResults([])
            return
        }

        const resultList: Array<{
            year: number
            month: number
            day: number
            hour: string
        }> = []

        // 简化版反推：只返回可能的年份和时辰范围
        possibleYears.forEach((year) => {
            // 简化处理：假设月份 1-12
            const monthRange = monthZhi ? [(DI_ZHI as readonly string[]).indexOf(monthZhi)] : Array.from({ length: 12 }, (_, i) => i)

            monthRange.forEach((m) => {
                resultList.push({
                    year,
                    month: ((m - 1 + 12) % 12) + 1, // 转换为 1-12
                    day: 0, // 需要更复杂的算法
                    hour: hourZhi ? hourRanges[hourZhi] : "不确定",
                })
            })
        })

        setResults(resultList.slice(0, 10)) // 限制结果数量
    }

    // 重置
    const reset = () => {
        setYearGan("")
        setYearZhi("")
        setMonthGan("")
        setMonthZhi("")
        setDayGan("")
        setDayZhi("")
        setHourGan("")
        setHourZhi("")
        setResults(null)
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    八字反推
                </CardTitle>
                <CardDescription>
                    根据八字反推可能的出生日期
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 四柱输入 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 年柱 */}
                    <div className="space-y-2">
                        <Label className="text-center block">年柱</Label>
                        <div className="grid grid-cols-2 gap-1">
                            <Select value={yearGan} onValueChange={setYearGan}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="干" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIAN_GAN.map((gan) => (
                                        <SelectItem key={gan} value={gan} className="cursor-pointer">
                                            {gan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={yearZhi} onValueChange={setYearZhi}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="支" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DI_ZHI.map((zhi) => (
                                        <SelectItem key={zhi} value={zhi} className="cursor-pointer">
                                            {zhi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {yearGan && yearZhi && (
                            <div className="text-center">
                                <Badge variant="outline" className="text-xs">
                                    {yearGan}{yearZhi}年
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* 月柱 */}
                    <div className="space-y-2">
                        <Label className="text-center block">月柱</Label>
                        <div className="grid grid-cols-2 gap-1">
                            <Select value={monthGan} onValueChange={setMonthGan}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="干" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIAN_GAN.map((gan) => (
                                        <SelectItem key={gan} value={gan} className="cursor-pointer">
                                            {gan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={monthZhi} onValueChange={setMonthZhi}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="支" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DI_ZHI.map((zhi) => (
                                        <SelectItem key={zhi} value={zhi} className="cursor-pointer">
                                            {zhi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 日柱 */}
                    <div className="space-y-2">
                        <Label className="text-center block">日柱</Label>
                        <div className="grid grid-cols-2 gap-1">
                            <Select value={dayGan} onValueChange={setDayGan}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="干" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIAN_GAN.map((gan) => (
                                        <SelectItem key={gan} value={gan} className="cursor-pointer">
                                            {gan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={dayZhi} onValueChange={setDayZhi}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="支" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DI_ZHI.map((zhi) => (
                                        <SelectItem key={zhi} value={zhi} className="cursor-pointer">
                                            {zhi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 时柱 */}
                    <div className="space-y-2">
                        <Label className="text-center block">时柱</Label>
                        <div className="grid grid-cols-2 gap-1">
                            <Select value={hourGan} onValueChange={setHourGan}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="干" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIAN_GAN.map((gan) => (
                                        <SelectItem key={gan} value={gan} className="cursor-pointer">
                                            {gan}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={hourZhi} onValueChange={setHourZhi}>
                                <SelectTrigger className="cursor-pointer">
                                    <SelectValue placeholder="支" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DI_ZHI.map((zhi) => (
                                        <SelectItem key={zhi} value={zhi} className="cursor-pointer">
                                            {zhi}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {hourZhi && (
                            <div className="text-center">
                                <Badge variant="outline" className="text-xs">
                                    {hourRanges[hourZhi]}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={reset}
                        className="cursor-pointer"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        重置
                    </Button>
                    <Button
                        onClick={doReverse}
                        disabled={!yearGan || !yearZhi}
                        className="flex-1 cursor-pointer"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        开始反推
                    </Button>
                </div>

                {/* 结果展示 */}
                {results !== null && (
                    <div className="space-y-3">
                        <h4 className="font-semibold">反推结果</h4>
                        {results.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                未找到匹配的日期，请检查输入的八字是否正确
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    找到 {results.length} 个可能的时间范围：
                                </p>
                                <div className="grid gap-2">
                                    {results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                                        >
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{result.year} 年</span>
                                            {result.month > 0 && <span>{result.month} 月</span>}
                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {result.hour}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    * 反推结果仅供参考，具体日期需要结合万年历进行详细计算
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
