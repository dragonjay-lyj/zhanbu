"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
    History,
    Search,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Record {
    id: string
    type: string
    title: string
    question: string
    result: unknown
    ai_interpretation: string
    created_at: string
}

interface HistoryData {
    records: Record[]
    total: number
    page: number
    limit: number
    totalPages: number
}

const typeOptions = [
    { value: "all", label: "全部类型" },
    { value: "bazi", label: "八字排盘" },
    { value: "ziwei", label: "紫微斗数" },
    { value: "liuyao", label: "六爻排盘" },
    { value: "meihua", label: "梅花易数" },
    { value: "tarot", label: "塔罗占卜" },
    { value: "daily", label: "每日运势" },
]

/**
 * 占卜历史记录页面
 */
export default function HistoryPage() {
    const { user, isLoaded } = useUser()
    const [data, setData] = useState<HistoryData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [page, setPage] = useState(1)
    const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
    const [deleteRecord, setDeleteRecord] = useState<Record | null>(null)

    const fetchHistory = useCallback(async () => {
        if (!user) return

        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            })
            if (search) params.append("search", search)
            if (typeFilter && typeFilter !== "all") params.append("type", typeFilter)

            const response = await fetch(`/api/user/history?${params}`)
            const result = await response.json()

            if (result.success) {
                setData(result.data)
            }
        } catch (err) {
            console.error("获取历史记录失败:", err)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, typeFilter, user])

    useEffect(() => {
        if (isLoaded && user) {
            fetchHistory()
        } else if (isLoaded && !user) {
            setIsLoading(false)
        }
    }, [isLoaded, fetchHistory, user])

    const handleSearch = () => {
        setPage(1)
        fetchHistory()
    }

    const handleDelete = async () => {
        if (!deleteRecord) return

        try {
            await fetch(`/api/user/history?id=${deleteRecord.id}`, { method: "DELETE" })
            setDeleteRecord(null)
            fetchHistory()
        } catch (err) {
            console.error("删除记录失败:", err)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getTypeLabel = (type: string) => {
        const option = typeOptions.find((o) => o.value === type)
        return option?.label || type
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <History className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-xl font-semibold">登录后查看历史记录</h2>
                <p className="text-muted-foreground">您需要登录才能查看占卜历史</p>
                <Link href="/sign-in">
                    <Button className="cursor-pointer">前往登录</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">占卜历史</h1>
                    <p className="text-muted-foreground">
                        共 {data?.total || 0} 条记录
                    </p>
                </div>
                <Button onClick={fetchHistory} variant="outline" className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            {/* 筛选器 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="搜索问题或标题..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button onClick={handleSearch} className="cursor-pointer">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[180px] cursor-pointer">
                                <SelectValue placeholder="类型筛选" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 历史记录列表 */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : data?.records?.length ? (
                <div className="space-y-4">
                    {data.records.map((record) => (
                        <Card key={record.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{getTypeLabel(record.type)}</Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(record.created_at)}
                                            </span>
                                        </div>
                                        <h3 className="font-medium">
                                            {record.title || record.question?.slice(0, 50) || "占卜记录"}
                                        </h3>
                                        {record.question && record.question !== record.title && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {record.question}
                                            </p>
                                        )}
                                        {record.ai_interpretation && (
                                            <Badge className="bg-primary/10 text-primary">
                                                <Sparkles className="mr-1 h-3 w-3" />
                                                已获取 AI 解读
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedRecord(record)}
                                            className="cursor-pointer"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeleteRecord(record)}
                                            className="cursor-pointer text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* 分页 */}
                    {data.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                第 {data.page} / {data.totalPages} 页
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    上一页
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page >= data.totalPages}
                                    className="cursor-pointer"
                                >
                                    下一页
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <History className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">暂无占卜记录</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            开始您的第一次占卜之旅吧
                        </p>
                        <Link href="/bazi">
                            <Button className="cursor-pointer">开始占卜</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* 详情弹窗 */}
            <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedRecord?.title || "占卜详情"}</DialogTitle>
                        <DialogDescription>
                            {selectedRecord && formatDate(selectedRecord.created_at)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="space-y-4">
                            <Badge>{getTypeLabel(selectedRecord.type)}</Badge>

                            {selectedRecord.question && (
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <h4 className="font-medium mb-2">问题</h4>
                                    <p className="text-sm">{selectedRecord.question}</p>
                                </div>
                            )}

                            {!!selectedRecord.result && (
                                <div className="p-4 rounded-lg bg-muted/50">
                                    <h4 className="font-medium mb-2">结果</h4>
                                    <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[200px]">
                                        {String(typeof selectedRecord.result === "string"
                                            ? selectedRecord.result
                                            : JSON.stringify(selectedRecord.result, null, 2))}
                                    </pre>
                                </div>
                            )}

                            {selectedRecord.ai_interpretation && (
                                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        AI 解读
                                    </h4>
                                    <p className="text-sm whitespace-pre-wrap">{selectedRecord.ai_interpretation}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* 删除确认 */}
            <AlertDialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            确定要删除这条占卜记录吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="cursor-pointer bg-destructive">
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
