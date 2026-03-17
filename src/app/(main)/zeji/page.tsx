"use client"

import { useState, useEffect } from "react"
import { Calendar, CalendarCheck, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation, formatMessage } from "@/lib/i18n"

// 事项类型
interface EventType {
    id: string
    name: string
    icon: string
    description: string
}

// 日期信息
interface DateInfo {
    date: string
    weekday: string
    lunar: string
    ganzhi: string
    score: number
    level: string
    yi: string[]
    ji: string[]
}

// 吉凶等级颜色
const levelColors: Record<string, string> = {
    "大吉": "bg-green-500 text-white",
    "吉": "bg-emerald-500 text-white",
    "平": "bg-blue-500 text-white",
    "凶": "bg-red-500 text-white",
}

export default function ZejiPage() {
    const { t } = useTranslation()
    const [eventTypes, setEventTypes] = useState<EventType[]>([])
    const [selectedType, setSelectedType] = useState<EventType | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [auspiciousDates, setAuspiciousDates] = useState<DateInfo[]>([])
    const [allDates, setAllDates] = useState<DateInfo[]>([])
    const [selectedDate, setSelectedDate] = useState<DateInfo | null>(null)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // 加载事项类型
    useEffect(() => {
        fetch("/api/zeji")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEventTypes(data.data.eventTypes)
                }
            })
    }, [])

    // 选择事项类型
    const selectEventType = async (type: EventType) => {
        setSelectedType(type)
        setIsLoading(true)

        const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        try {
            const res = await fetch(
                `/api/zeji?type=${type.id}&start=${start.toISOString().split("T")[0]}&end=${end.toISOString().split("T")[0]}`
            )
            const data = await res.json()
            if (data.success) {
                setAuspiciousDates(data.data.auspiciousDates)
                setAllDates(data.data.allDates)
            }
        } catch (error) {
            console.error("获取吉日失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 切换月份
    const changeMonth = (delta: number) => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + delta)
        setCurrentMonth(newMonth)
        if (selectedType) {
            selectEventType(selectedType)
        }
    }

    // 格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return formatMessage(t("pages.zeji.dateLabel"), {
            month: date.getMonth() + 1,
            day: date.getDate(),
        })
    }
    const getEventMark = (type: EventType) => type.name.slice(0, 1)

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 mb-4">
                    <CalendarCheck className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {t("pages.zeji.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t("pages.zeji.subtitle")}
                </p>
            </div>

            {/* 事项类型选择 */}
            {!selectedType && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {eventTypes.map((type) => (
                        <Card key={type.id} className="p-0 overflow-hidden border-2 border-transparent hover:border-primary/50">
                            <button
                                type="button"
                                className={cn(
                                    "w-full cursor-pointer text-left transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-px hover:shadow-lg",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                )}
                                onClick={() => selectEventType(type)}
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-serif font-semibold text-primary">
                                        {getEventMark(type)}
                                    </div>
                                    <h3 className="font-bold text-lg">{type.name}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {type.description}
                                    </p>
                                </CardContent>
                            </button>
                        </Card>
                    ))}
                </div>
            )}

            {/* 日期选择 */}
            {selectedType && (
                <div className="space-y-6">
                    {/* 返回和月份切换 */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => setSelectedType(null)}>
                            {t("pages.zeji.actions.back")}
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label="上个月">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="font-medium min-w-[120px] text-center">
                                {formatMessage(t("pages.zeji.monthHeader"), {
                                    year: currentMonth.getFullYear(),
                                    month: currentMonth.getMonth() + 1,
                                })}
                            </span>
                            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label="下个月">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* 当前事项 */}
                    <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        <CardContent className="p-4 flex items-center gap-4">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/16 text-2xl font-serif font-semibold">
                                {getEventMark(selectedType)}
                            </span>
                            <div>
                                <h2 className="text-xl font-bold">
                                    {formatMessage(t("pages.zeji.current.title"), { name: selectedType.name })}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    {formatMessage(t("pages.zeji.current.count"), { count: auspiciousDates.length })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* 吉日列表 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">{t("pages.zeji.sections.recommended")}</h3>
                                {auspiciousDates.length > 0 ? (
                                    auspiciousDates.map((date) => (
                                        <Card
                                            key={date.date}
                                            className={cn(
                                                "transition-[box-shadow,border-color] duration-200 hover:shadow-md",
                                                selectedDate?.date === date.date && "ring-2 ring-primary"
                                            )}
                                        >
                                            <button
                                                type="button"
                                                className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
                                                onClick={() => setSelectedDate(date)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-lg">
                                                                    {formatDate(date.date)}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {date.weekday}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {date.lunar} · {date.ganzhi}日
                                                            </div>
                                                        </div>
                                                        <Badge className={levelColors[date.level]}>
                                                            {date.level}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </button>
                                        </Card>
                                    ))
                                ) : (
                                    <Card>
                                        <CardContent className="p-6 text-center text-muted-foreground">
                                            {t("pages.zeji.empty")}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* 日期详情 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">{t("pages.zeji.sections.details")}</h3>
                                {selectedDate ? (
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>{formatDate(selectedDate.date)}</CardTitle>
                                                    <CardDescription>
                                                        {selectedDate.lunar} · {selectedDate.ganzhi}日 · {selectedDate.weekday}
                                                    </CardDescription>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-primary">{selectedDate.score}</div>
                                                    <Badge className={levelColors[selectedDate.level]}>
                                                        {selectedDate.level}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                                                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">
                                                    {t("pages.zeji.labels.yi")}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDate.yi.map((item) => (
                                                        <Badge key={item} variant="secondary" className="bg-green-100 dark:bg-green-900/30">
                                                            {item}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                                                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">
                                                    {t("pages.zeji.labels.ji")}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedDate.ji.map((item) => (
                                                        <Badge key={item} variant="secondary" className="bg-red-100 dark:bg-red-900/30">
                                                            {item}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card>
                                        <CardContent className="p-6 text-center text-muted-foreground">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            {t("pages.zeji.emptyDetail")}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
