"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Users,
    FileText,
    CreditCard,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Crown,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface StatsData {
    totalUsers: number
    todayUsers: number
    monthlyDivinations: number
    todayDivinations: number
    premiumUsers: number
    monthlyOrders: number
    monthlyRevenue: number
    recentActivities: Array<{
        id: string
        type: string
        created_at: string
        user: { email: string; full_name: string } | null
    }>
}

/**
 * Admin 仪表盘页面
 */
export default function AdminPage() {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/admin/stats")
            const data = await response.json()

            if (data.success) {
                setStats(data.data)
            } else {
                setError(data.error)
            }
        } catch (err) {
            console.error("获取统计数据失败:", err)
            setError("获取数据失败")
        } finally {
            setIsLoading(false)
        }
    }

    const formatPrice = (cents: number) => {
        return (cents / 100).toFixed(2)
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)

        if (minutes < 60) return `${minutes} 分钟前`
        if (hours < 24) return `${hours} 小时前`
        return date.toLocaleDateString("zh-CN")
    }

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            bazi: "八字",
            ziwei: "紫微",
            liuyao: "六爻",
            meihua: "梅花",
            tarot: "塔罗",
            daily: "每日运势",
        }
        return labels[type] || type
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={fetchStats} className="cursor-pointer">
                    重试
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div>
                <h1 className="text-3xl font-bold">仪表盘</h1>
                <p className="text-muted-foreground">查看网站运营数据概览</p>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">总用户数</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+{stats?.todayUsers || 0}</span> 今日新增
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">本月占卜</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.monthlyDivinations?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-500">+{stats?.todayDivinations || 0}</span> 今日
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">付费会员</CardTitle>
                        <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.premiumUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            本月 {stats?.monthlyOrders || 0} 笔订单
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">本月收入</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥{formatPrice(stats?.monthlyRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.monthlyOrders || 0} 笔成功交易
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {/* 最近活动 */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            最近活动
                        </CardTitle>
                        <CardDescription>用户最近的占卜记录</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentActivities?.length ? (
                                stats.recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {activity.user?.full_name || activity.user?.email || "匿名用户"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {getTypeLabel(activity.type)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(activity.created_at)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">暂无活动记录</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 快捷操作 */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>快捷操作</CardTitle>
                        <CardDescription>常用管理功能</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/users" className="block">
                            <Button variant="outline" className="w-full justify-between cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    用户管理
                                </span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin/records" className="block">
                            <Button variant="outline" className="w-full justify-between cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    占卜记录
                                </span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin/credits" className="block">
                            <Button variant="outline" className="w-full justify-between cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-amber-500" />
                                    积分管理
                                </span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/admin/settings" className="block">
                            <Button variant="outline" className="w-full justify-between cursor-pointer">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    系统设置
                                </span>
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
