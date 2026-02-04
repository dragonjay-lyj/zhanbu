"use client"

import { useState, useMemo } from "react"
import {
    Calendar,
    Clock,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

// 天干五行和阴阳
const GAN_INFO: Record<string, { wuxing: string; yinyang: string; color: string }> = {
    甲: { wuxing: "木", yinyang: "阳", color: "text-green-500" },
    乙: { wuxing: "木", yinyang: "阴", color: "text-green-400" },
    丙: { wuxing: "火", yinyang: "阳", color: "text-red-500" },
    丁: { wuxing: "火", yinyang: "阴", color: "text-red-400" },
    戊: { wuxing: "土", yinyang: "阳", color: "text-yellow-500" },
    己: { wuxing: "土", yinyang: "阴", color: "text-yellow-400" },
    庚: { wuxing: "金", yinyang: "阳", color: "text-gray-400" },
    辛: { wuxing: "金", yinyang: "阴", color: "text-gray-300" },
    壬: { wuxing: "水", yinyang: "阳", color: "text-blue-500" },
    癸: { wuxing: "水", yinyang: "阴", color: "text-blue-400" },
}

// 地支信息
const ZHI_INFO: Record<string, { wuxing: string; yinyang: string; color: string; shengxiao: string }> = {
    子: { wuxing: "水", yinyang: "阳", color: "text-blue-500", shengxiao: "鼠" },
    丑: { wuxing: "土", yinyang: "阴", color: "text-yellow-400", shengxiao: "牛" },
    寅: { wuxing: "木", yinyang: "阳", color: "text-green-500", shengxiao: "虎" },
    卯: { wuxing: "木", yinyang: "阴", color: "text-green-400", shengxiao: "兔" },
    辰: { wuxing: "土", yinyang: "阳", color: "text-yellow-500", shengxiao: "龙" },
    巳: { wuxing: "火", yinyang: "阴", color: "text-red-400", shengxiao: "蛇" },
    午: { wuxing: "火", yinyang: "阳", color: "text-red-500", shengxiao: "马" },
    未: { wuxing: "土", yinyang: "阴", color: "text-yellow-400", shengxiao: "羊" },
    申: { wuxing: "金", yinyang: "阳", color: "text-gray-400", shengxiao: "猴" },
    酉: { wuxing: "金", yinyang: "阴", color: "text-gray-300", shengxiao: "鸡" },
    戌: { wuxing: "土", yinyang: "阳", color: "text-yellow-500", shengxiao: "狗" },
    亥: { wuxing: "水", yinyang: "阴", color: "text-blue-400", shengxiao: "猪" },
}

// 六十甲子表
const JIA_ZI = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    gan: TIAN_GAN[i % 10],
    zhi: DI_ZHI[i % 12],
    label: `${TIAN_GAN[i % 10]}${DI_ZHI[i % 12]}`,
}))

interface BaziCalculatorProps {
    className?: string
}

/**
 * 八字计算器组件
 * 提供八字反推和查询功能
 */
export function BaziCalculator({ className }: BaziCalculatorProps) {
    const [mode, setMode] = useState<"forward" | "reverse">("forward")
    const [searchGan, setSearchGan] = useState("")
    const [searchZhi, setSearchZhi] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const itemsPerPage = 12

    // 筛选六十甲子
    const filteredJiaZi = useMemo(() => {
        return JIA_ZI.filter((item) => {
            if (searchGan && item.gan !== searchGan) return false
            if (searchZhi && item.zhi !== searchZhi) return false
            return true
        })
    }, [searchGan, searchZhi])

    // 分页
    const totalPages = Math.ceil(filteredJiaZi.length / itemsPerPage)
    const currentItems = filteredJiaZi.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    )

    // 重置搜索
    const resetSearch = () => {
        setSearchGan("")
        setSearchZhi("")
        setCurrentPage(0)
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    八字计算器
                </CardTitle>
                <CardDescription>
                    查询六十甲子、五行属性和纳音
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 搜索过滤 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>天干</Label>
                        <Select value={searchGan} onValueChange={setSearchGan}>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="全部" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="" className="cursor-pointer">全部</SelectItem>
                                {TIAN_GAN.map((gan) => (
                                    <SelectItem key={gan} value={gan} className="cursor-pointer">
                                        <span className={GAN_INFO[gan].color}>{gan}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {GAN_INFO[gan].wuxing} {GAN_INFO[gan].yinyang}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>地支</Label>
                        <Select value={searchZhi} onValueChange={setSearchZhi}>
                            <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="全部" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="" className="cursor-pointer">全部</SelectItem>
                                {DI_ZHI.map((zhi) => (
                                    <SelectItem key={zhi} value={zhi} className="cursor-pointer">
                                        <span className={ZHI_INFO[zhi].color}>{zhi}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {ZHI_INFO[zhi].shengxiao} {ZHI_INFO[zhi].wuxing}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {(searchGan || searchZhi) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetSearch}
                        className="cursor-pointer"
                    >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        重置筛选
                    </Button>
                )}

                {/* 六十甲子表格 */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {currentItems.map((item) => (
                        <div
                            key={item.index}
                            className="p-3 rounded-lg border border-border/50 bg-card text-center hover:bg-accent transition-colors cursor-pointer"
                        >
                            <div className="font-serif text-lg font-bold">
                                <span className={GAN_INFO[item.gan].color}>{item.gan}</span>
                                <span className={ZHI_INFO[item.zhi].color}>{item.zhi}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {GAN_INFO[item.gan].wuxing}{ZHI_INFO[item.zhi].wuxing}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {ZHI_INFO[item.zhi].shengxiao}年
                            </div>
                        </div>
                    ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {currentPage + 1} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* 天干五行表 */}
                <div className="mt-6">
                    <h4 className="font-semibold mb-3">天干五行对照</h4>
                    <div className="grid grid-cols-5 gap-2">
                        {TIAN_GAN.map((gan) => (
                            <div
                                key={gan}
                                className={cn(
                                    "p-2 rounded-lg text-center border",
                                    GAN_INFO[gan].wuxing === "木" && "bg-green-500/10 border-green-500/30",
                                    GAN_INFO[gan].wuxing === "火" && "bg-red-500/10 border-red-500/30",
                                    GAN_INFO[gan].wuxing === "土" && "bg-yellow-500/10 border-yellow-500/30",
                                    GAN_INFO[gan].wuxing === "金" && "bg-gray-500/10 border-gray-500/30",
                                    GAN_INFO[gan].wuxing === "水" && "bg-blue-500/10 border-blue-500/30"
                                )}
                            >
                                <div className={cn("font-serif text-lg font-bold", GAN_INFO[gan].color)}>
                                    {gan}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {GAN_INFO[gan].yinyang}{GAN_INFO[gan].wuxing}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 地支生肖表 */}
                <div className="mt-6">
                    <h4 className="font-semibold mb-3">地支生肖对照</h4>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {DI_ZHI.map((zhi) => (
                            <div
                                key={zhi}
                                className={cn(
                                    "p-2 rounded-lg text-center border",
                                    ZHI_INFO[zhi].wuxing === "木" && "bg-green-500/10 border-green-500/30",
                                    ZHI_INFO[zhi].wuxing === "火" && "bg-red-500/10 border-red-500/30",
                                    ZHI_INFO[zhi].wuxing === "土" && "bg-yellow-500/10 border-yellow-500/30",
                                    ZHI_INFO[zhi].wuxing === "金" && "bg-gray-500/10 border-gray-500/30",
                                    ZHI_INFO[zhi].wuxing === "水" && "bg-blue-500/10 border-blue-500/30"
                                )}
                            >
                                <div className={cn("font-serif text-lg font-bold", ZHI_INFO[zhi].color)}>
                                    {zhi}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {ZHI_INFO[zhi].shengxiao}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
