"use client"

import { useState, useEffect, useCallback } from "react"
import {
    FileText,
    Search,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
    user_id: string
    type: string
    title: string
    question: string
    result: unknown
    ai_interpretation: string
    created_at: string
    user: { email: string; full_name: string } | null
}

interface RecordsData {
    records: Record[]
    total: number
    page: number
    limit: number
    totalPages: number
}

const typeOptions = [
    { value: "all", label: "全部类型" },
    { value: "bazi", label: "八字" },
    { value: "ziwei", label: "紫微" },
    { value: "liuyao", label: "六爻" },
    { value: "meihua", label: "梅花" },
    { value: "tarot", label: "塔罗" },
    { value: "daily", label: "每日运势" },
]

/**
 * Admin 占卜记录管理页面
 */
export default function AdminRecordsPage() {
    const [data, setData] = useState<RecordsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [page, setPage] = useState(1)
    const [selectedRecord, setSelectedRecord] = useState<Record | null>(null)
    const [deleteRecord, setDeleteRecord] = useState<Record | null>(null)

    const fetchRecords = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            })
            if (search) params.append("search", search)
            if (typeFilter && typeFilter !== "all") params.append("type", typeFilter)

            const response = await fetch(`/api/admin/records?${params}`)
            const result = await response.json()

            if (result.success) {
                setData(result.data)
            }
        } catch (err) {
            console.error("获取记录失败:", err)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, typeFilter])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    const handleSearch = () => {
        setPage(1)
        fetchRecords()
    }

    const handleDelete = async () => {
        if (!deleteRecord) return

        try {
            await fetch(`/api/admin/records?id=${deleteRecord.id}`, { method: "DELETE" })
            setDeleteRecord(null)
            fetchRecords()
        } catch (err) {
            console.error("删除记录失败:", err)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("zh-CN")
    }

    const getTypeLabel = (type: string) => {
        const option = typeOptions.find((o) => o.value === type)
        return option?.label || type
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">占卜记录</h1>
                    <p className="text-muted-foreground">
                        共 {data?.total || 0} 条记录
                    </p>
                </div>
                <Button onClick={fetchRecords} variant="outline" className="cursor-pointer">
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
                            <SelectTrigger className="w-[150px] cursor-pointer">
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

            {/* 记录列表 */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>用户</TableHead>
                                        <TableHead>类型</TableHead>
                                        <TableHead>标题/问题</TableHead>
                                        <TableHead>时间</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.records?.length ? (
                                        data.records.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {record.user?.full_name || record.user?.email || "匿名"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{getTypeLabel(record.type)}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[300px]">
                                                    <p className="truncate">
                                                        {record.title || record.question || "-"}
                                                    </p>
                                                </TableCell>
                                                <TableCell>{formatDate(record.created_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
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
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                暂无记录
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* 分页 */}
                            {data && data.totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
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
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={page >= data.totalPages}
                                            className="cursor-pointer"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 详情弹窗 */}
            <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>记录详情</DialogTitle>
                        <DialogDescription>
                            {selectedRecord?.title || selectedRecord?.question}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRecord && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">类型：</span>
                                    <Badge className="ml-2">{getTypeLabel(selectedRecord.type)}</Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">时间：</span>
                                    {formatDate(selectedRecord.created_at)}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">用户：</span>
                                    {selectedRecord.user?.full_name || selectedRecord.user?.email || "匿名"}
                                </div>
                            </div>

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
                                    <h4 className="font-medium mb-2">AI 解读</h4>
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
