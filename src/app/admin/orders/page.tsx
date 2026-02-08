"use client"

import { useCallback, useEffect, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
    RotateCcw,
    Search,
    Eye,
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

interface AdminOrder {
    id: string
    user_id: string
    plan_id: string
    amount: number
    payment_amount?: string | null
    payment_method?: string | null
    payment_url?: string | null
    status: string
    transaction_id?: string | null
    created_at: string
    paid_at?: string | null
    updated_at?: string | null
    user: { email: string; full_name: string } | null
    plan: { id: string; name: string; period: string } | null
}

interface OrdersData {
    orders: AdminOrder[]
    total: number
    page: number
    limit: number
    totalPages: number
}

const statusOptions = [
    { value: "all", label: "全部状态" },
    { value: "pending", label: "待支付" },
    { value: "paid", label: "已支付" },
    { value: "refunded", label: "已退款" },
    { value: "failed", label: "失败" },
    { value: "cancelled", label: "已取消" },
]

const methodOptions = [
    { value: "all", label: "全部方式" },
    { value: "linuxdo_credit", label: "Linux DO Credit" },
    { value: "xianyu", label: "闲鱼" },
]

export default function AdminOrdersPage() {
    const [data, setData] = useState<OrdersData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [methodFilter, setMethodFilter] = useState("all")
    const [page, setPage] = useState(1)
    const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
    const [refundOrder, setRefundOrder] = useState<AdminOrder | null>(null)
    const [isRefunding, setIsRefunding] = useState(false)

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            })
            if (search) params.append("search", search)
            if (statusFilter !== "all") params.append("status", statusFilter)
            if (methodFilter !== "all") params.append("method", methodFilter)

            const response = await fetch(`/api/admin/orders?${params}`)
            const result = await response.json()

            if (result.success) {
                setData(result.data)
            }
        } catch (err) {
            console.error("获取订单失败:", err)
        } finally {
            setIsLoading(false)
        }
    }, [methodFilter, page, search, statusFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handleSearch = () => {
        setPage(1)
        fetchOrders()
    }

    const handleRefund = async () => {
        if (!refundOrder) return
        try {
            setIsRefunding(true)
            const response = await fetch("/api/payment/refund", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: refundOrder.id }),
            })
            const result = await response.json()

            if (!result.success) {
                alert(result.error || "退款失败")
                return
            }

            setRefundOrder(null)
            fetchOrders()
        } catch (error) {
            console.error("退款失败:", error)
            alert("退款请求失败")
        } finally {
            setIsRefunding(false)
        }
    }

    const formatDate = (value: string | null | undefined) => {
        if (!value) return "-"
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value))
    }

    const formatCny = (cents: number) => `¥${(cents / 100).toFixed(2)}`

    const getMethodLabel = (method: string | null | undefined) => {
        if (method === "linuxdo_credit") return "Linux DO Credit"
        if (method === "xianyu") return "闲鱼"
        return method || "-"
    }

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        if (status === "paid") return "default"
        if (status === "refunded") return "secondary"
        if (status === "failed") return "destructive"
        return "outline"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">订单管理</h1>
                    <p className="text-muted-foreground">共 {data?.total || 0} 笔订单</p>
                </div>
                <Button onClick={fetchOrders} variant="outline" className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="搜索订单号 / 交易号 / 用户ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                aria-label="搜索订单"
                            />
                            <Button onClick={handleSearch} className="cursor-pointer" aria-label="搜索订单">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
                            <SelectTrigger className="w-[140px] cursor-pointer">
                                <SelectValue placeholder="状态筛选" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={methodFilter} onValueChange={(value) => { setMethodFilter(value); setPage(1) }}>
                            <SelectTrigger className="w-[170px] cursor-pointer">
                                <SelectValue placeholder="方式筛选" />
                            </SelectTrigger>
                            <SelectContent>
                                {methodOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

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
                                        <TableHead>订单号</TableHead>
                                        <TableHead>用户</TableHead>
                                        <TableHead>套餐</TableHead>
                                        <TableHead>金额</TableHead>
                                        <TableHead>方式</TableHead>
                                        <TableHead>状态</TableHead>
                                        <TableHead>创建时间</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.orders?.length ? (
                                        data.orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {order.user?.full_name || order.user?.email || order.user_id}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{order.plan?.name || order.plan_id}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{formatCny(order.amount)}</div>
                                                        {order.payment_method === "linuxdo_credit" && order.payment_amount && (
                                                            <div className="text-muted-foreground text-xs">
                                                                {order.payment_amount} Credit
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getMethodLabel(order.payment_method)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(order.created_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="cursor-pointer"
                                                            aria-label="查看订单详情"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setRefundOrder(order)}
                                                            disabled={!(order.status === "paid" && order.payment_method === "linuxdo_credit")}
                                                            className="cursor-pointer text-amber-600 disabled:text-muted-foreground"
                                                            aria-label="退款"
                                                        >
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                                暂无订单
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

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
                                            aria-label="上一页"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={page >= data.totalPages}
                                            className="cursor-pointer"
                                            aria-label="下一页"
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

            <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>订单详情</DialogTitle>
                        <DialogDescription>{selectedOrder?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">用户：</span>
                                {selectedOrder.user?.full_name || selectedOrder.user?.email || selectedOrder.user_id}
                            </div>
                            <div>
                                <span className="text-muted-foreground">套餐：</span>
                                {selectedOrder.plan?.name || selectedOrder.plan_id}
                            </div>
                            <div>
                                <span className="text-muted-foreground">订单金额：</span>
                                {formatCny(selectedOrder.amount)}
                            </div>
                            <div>
                                <span className="text-muted-foreground">网关金额：</span>
                                {selectedOrder.payment_amount || "-"}
                            </div>
                            <div>
                                <span className="text-muted-foreground">支付方式：</span>
                                {getMethodLabel(selectedOrder.payment_method)}
                            </div>
                            <div>
                                <span className="text-muted-foreground">状态：</span>
                                {selectedOrder.status}
                            </div>
                            <div className="col-span-2">
                                <span className="text-muted-foreground">交易号：</span>
                                {selectedOrder.transaction_id || "-"}
                            </div>
                            <div>
                                <span className="text-muted-foreground">创建时间：</span>
                                {formatDate(selectedOrder.created_at)}
                            </div>
                            <div>
                                <span className="text-muted-foreground">支付时间：</span>
                                {formatDate(selectedOrder.paid_at)}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!refundOrder} onOpenChange={() => setRefundOrder(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认退款</AlertDialogTitle>
                        <AlertDialogDescription>
                            将对订单 {refundOrder?.id} 发起全额退款。该操作会调用 Linux DO Credit 退款接口。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer" disabled={isRefunding}>
                            取消
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleRefund} className="cursor-pointer" disabled={isRefunding}>
                            {isRefunding ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    退款中...
                                </>
                            ) : (
                                "确认退款"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
