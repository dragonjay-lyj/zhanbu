"use client"

import { useState, useEffect } from "react"
import {
    Coins,
    Search,
    Plus,
    Minus,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Settings,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface Transaction {
    id: string
    userId: string
    userName: string
    amount: number
    balanceAfter: number
    type: string
    description: string
    createdAt: string
}

interface CreditPackage {
    id: string
    name: string
    credits: number
    price: number
    bonusCredits: number
    isPopular: boolean
    isActive: boolean
}

interface UserCredits {
    userId: string
    userName: string
    email: string
    balance: number
    totalEarned: number
    totalSpent: number
}

export default function AdminCreditsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [packages, setPackages] = useState<CreditPackage[]>([])
    const [users, setUsers] = useState<UserCredits[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null)
    const [adjustAmount, setAdjustAmount] = useState("")
    const [adjustReason, setAdjustReason] = useState("")

    // 获取数据
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [transRes, packRes, userRes] = await Promise.all([
                fetch("/api/admin/credits/transactions"),
                fetch("/api/admin/credits/packages"),
                fetch("/api/admin/credits/users"),
            ])

            const transData = await transRes.json()
            const packData = await packRes.json()
            const userData = await userRes.json()

            if (transData.success) setTransactions(transData.data)
            if (packData.success) setPackages(packData.data)
            if (userData.success) setUsers(userData.data)
        } catch (error) {
            console.error("获取数据失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // 调整用户积分
    const handleAdjustCredits = async () => {
        if (!selectedUser || !adjustAmount) return

        try {
            const response = await fetch("/api/admin/credits/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedUser.userId,
                    amount: parseInt(adjustAmount),
                    reason: adjustReason,
                }),
            })

            const data = await response.json()
            if (data.success) {
                setAdjustDialogOpen(false)
                setSelectedUser(null)
                setAdjustAmount("")
                setAdjustReason("")
                fetchData()
            }
        } catch (error) {
            console.error("调整积分失败:", error)
        }
    }

    // 格式化类型
    const formatType = (type: string) => {
        const types: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            recharge: { label: "充值", variant: "default" },
            consume: { label: "消费", variant: "destructive" },
            reward: { label: "奖励", variant: "secondary" },
            refund: { label: "退款", variant: "outline" },
            admin: { label: "管理员调整", variant: "outline" },
        }
        return types[type] || { label: type, variant: "outline" as const }
    }

    // 统计数据
    const totalCreditsInCirculation = users.reduce((sum, u) => sum + u.balance, 0)
    const totalTransactions = transactions.length
    const todayTransactions = transactions.filter((t) => {
        const today = new Date()
        const tDate = new Date(t.createdAt)
        return tDate.toDateString() === today.toDateString()
    }).length

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">积分管理</h1>
                    <p className="text-muted-foreground">管理用户积分、充值套餐和消费规则</p>
                </div>
                <Button onClick={fetchData} variant="outline" className="gap-2 cursor-pointer">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    刷新
                </Button>
            </div>

            {/* 统计卡片 */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">流通积分总量</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">
                            {totalCreditsInCirculation.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">积分用户数</CardTitle>
                        <Coins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">总交易记录</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">今日交易</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayTransactions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 标签页 */}
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users" className="cursor-pointer">用户积分</TabsTrigger>
                    <TabsTrigger value="transactions" className="cursor-pointer">交易记录</TabsTrigger>
                    <TabsTrigger value="packages" className="cursor-pointer">充值套餐</TabsTrigger>
                </TabsList>

                {/* 用户积分 */}
                <TabsContent value="users" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索用户..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>用户</TableHead>
                                    <TableHead>邮箱</TableHead>
                                    <TableHead className="text-right">当前余额</TableHead>
                                    <TableHead className="text-right">累计获得</TableHead>
                                    <TableHead className="text-right">累计消费</TableHead>
                                    <TableHead>操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users
                                    .filter((u) =>
                                        u.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        u.email.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((user) => (
                                        <TableRow key={user.userId}>
                                            <TableCell className="font-medium">{user.userName}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell className="text-right font-bold text-amber-500">
                                                {user.balance.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-green-500">
                                                +{user.totalEarned.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right text-red-500">
                                                -{user.totalSpent.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Dialog open={adjustDialogOpen && selectedUser?.userId === user.userId} onOpenChange={(open) => {
                                                    setAdjustDialogOpen(open)
                                                    if (!open) setSelectedUser(null)
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer"
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            调整积分
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>调整用户积分</DialogTitle>
                                                            <DialogDescription>
                                                                当前用户: {user.userName}，余额: {user.balance} 积分
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>调整数量（正数增加，负数减少）</Label>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="如: 100 或 -50"
                                                                    value={adjustAmount}
                                                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>调整原因</Label>
                                                                <Textarea
                                                                    placeholder="请输入调整原因..."
                                                                    value={adjustReason}
                                                                    onChange={(e) => setAdjustReason(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setAdjustDialogOpen(false)} className="cursor-pointer">
                                                                取消
                                                            </Button>
                                                            <Button onClick={handleAdjustCredits} className="cursor-pointer">
                                                                确认调整
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* 交易记录 */}
                <TabsContent value="transactions" className="space-y-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>时间</TableHead>
                                    <TableHead>用户</TableHead>
                                    <TableHead>类型</TableHead>
                                    <TableHead className="text-right">变动</TableHead>
                                    <TableHead className="text-right">余额</TableHead>
                                    <TableHead>描述</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.slice(0, 50).map((tx) => {
                                    const typeInfo = formatType(tx.type)
                                    return (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleString("zh-CN")}
                                            </TableCell>
                                            <TableCell className="font-medium">{tx.userName}</TableCell>
                                            <TableCell>
                                                <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                            </TableCell>
                                            <TableCell className="text-right">{tx.balanceAfter}</TableCell>
                                            <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* 充值套餐 */}
                <TabsContent value="packages" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {packages.map((pkg) => (
                            <Card key={pkg.id} className={pkg.isPopular ? "border-amber-500" : ""}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            {pkg.name}
                                        </CardTitle>
                                        {pkg.isPopular && (
                                            <Badge className="bg-amber-500">热门</Badge>
                                        )}
                                    </div>
                                    <CardDescription>
                                        {pkg.bonusCredits > 0 && (
                                            <span className="text-green-500">+{pkg.bonusCredits} 赠送积分</span>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-500">
                                        {pkg.credits + pkg.bonusCredits}
                                        <span className="text-sm font-normal text-muted-foreground ml-1">积分</span>
                                    </div>
                                    <div className="text-xl mt-2">
                                        ¥{pkg.price}
                                    </div>
                                    <Badge variant={pkg.isActive ? "default" : "secondary"} className="mt-2">
                                        {pkg.isActive ? "已启用" : "已禁用"}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
