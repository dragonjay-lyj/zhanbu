"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
    User,
    Mail,
    Calendar,
    Crown,
    ChevronRight,
    Sparkles,
    Shield,
    Bell,
    CreditCard,
    Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMembership } from "@/lib/membership"

interface StatsData {
    totalFortunes: number
    monthlyFortunes: number
    favoriteType: string | null
    recentFortunes: Array<{
        id: string
        type: string
        title: string
        question: string
        created_at: string
    }>
}

/**
 * 用户个人中心页面
 */
export default function ProfilePage() {
    const { user, isLoaded } = useUser()
    const { membership, isLoading: membershipLoading } = useMembership()
    const [stats, setStats] = useState<StatsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [emailUpdates, setEmailUpdates] = useState(false)

    useEffect(() => {
        if (isLoaded && user) {
            fetchStats()
        }
    }, [isLoaded, user])

    const fetchStats = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/user/stats")
            const data = await response.json()

            if (data.success) {
                setStats(data.data)
            }
        } catch (err) {
            console.error("获取统计数据失败:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("zh-CN")
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

    if (!isLoaded || isLoading || membershipLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">请先登录</p>
                <Link href="/sign-in">
                    <Button className="cursor-pointer">前往登录</Button>
                </Link>
            </div>
        )
    }

    const quotaUsed = typeof membership?.usedQuota === "number" ? membership.usedQuota : 0
    const quotaTotal = typeof membership?.dailyQuota === "number" ? membership.dailyQuota : 3
    const quotaPercentage = quotaTotal > 0 ? (quotaUsed / quotaTotal) * 100 : 0

    return (
        <div className="space-y-8">
            {/* 页面标题 */}
            <div>
                <h1 className="text-3xl font-bold">个人中心</h1>
                <p className="text-muted-foreground">管理您的账户信息和偏好设置</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview" className="cursor-pointer">概览</TabsTrigger>
                    <TabsTrigger value="preferences" className="cursor-pointer">偏好设置</TabsTrigger>
                    <TabsTrigger value="security" className="cursor-pointer">安全设置</TabsTrigger>
                </TabsList>

                {/* 概览 */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* 用户信息卡片 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    账户信息
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        {user.imageUrl ? (
                                            <img src={user.imageUrl} alt="" className="w-16 h-16 rounded-full" />
                                        ) : (
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {user.fullName || user.username || "用户"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {user.primaryEmailAddress?.emailAddress}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    注册于 {user.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN") : "-"}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 今日配额 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    今日配额
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>已使用</span>
                                        <span>
                                            {quotaUsed} / {membership?.dailyQuota === "无限" ? "∞" : quotaTotal}
                                        </span>
                                    </div>
                                    <Progress value={membership?.dailyQuota === "无限" ? 0 : quotaPercentage} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Crown className={membership?.isPremium ? "h-5 w-5 text-amber-500" : "h-5 w-5 text-muted-foreground"} />
                                        <span>{membership?.planName || "免费版"}</span>
                                    </div>
                                    {!membership?.isPremium && (
                                        <Link href="/pricing">
                                            <Button size="sm" variant="outline" className="cursor-pointer">
                                                升级
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 统计数据 */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold">{stats?.totalFortunes || 0}</div>
                                <p className="text-sm text-muted-foreground">总占卜次数</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold">{stats?.monthlyFortunes || 0}</div>
                                <p className="text-sm text-muted-foreground">本月占卜</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <div className="text-3xl font-bold">{stats?.favoriteType || "-"}</div>
                                <p className="text-sm text-muted-foreground">最爱占卜</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 最近占卜 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>最近占卜</CardTitle>
                            <Link href="/history">
                                <Button variant="ghost" size="sm" className="cursor-pointer">
                                    查看全部
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {stats?.recentFortunes?.length ? (
                                <div className="space-y-3">
                                    {stats.recentFortunes.map((fortune) => (
                                        <div
                                            key={fortune.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{getTypeLabel(fortune.type)}</Badge>
                                                    <span className="text-sm font-medium">
                                                        {fortune.title || fortune.question?.slice(0, 30) || "占卜记录"}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(fortune.created_at)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">暂无占卜记录</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 偏好设置 */}
                <TabsContent value="preferences">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                通知设置
                            </CardTitle>
                            <CardDescription>管理您的通知偏好</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>推送通知</Label>
                                    <p className="text-sm text-muted-foreground">接收占卜提醒和运势推送</p>
                                </div>
                                <Switch
                                    checked={notificationsEnabled}
                                    onCheckedChange={setNotificationsEnabled}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>邮件订阅</Label>
                                    <p className="text-sm text-muted-foreground">接收每周运势报告和优惠信息</p>
                                </div>
                                <Switch
                                    checked={emailUpdates}
                                    onCheckedChange={setEmailUpdates}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 安全设置 */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                安全设置
                            </CardTitle>
                            <CardDescription>管理您的账户安全</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <h4 className="font-medium">邮箱验证</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {user.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>
                                <Badge variant="secondary">已验证</Badge>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div>
                                    <h4 className="font-medium">会员状态</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {membership?.isPremium
                                            ? `${membership.planName}，${membership.expiresAt ? formatDate(membership.expiresAt) + " 到期" : "永久有效"}`
                                            : "免费用户"}
                                    </p>
                                </div>
                                <Link href="/pricing">
                                    <Button variant="outline" size="sm" className="cursor-pointer">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        {membership?.isPremium ? "续费" : "升级"}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
