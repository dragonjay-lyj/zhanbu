"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Users,
    Search,
    Crown,
    Shield,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Loader2,
    RefreshCw,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface User {
    id: string
    clerk_id: string
    email: string
    name: string
    avatar_url: string
    role: string
    created_at: string
    membership: { plan_id: string; expires_at: string } | null
}

interface UsersData {
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Admin 用户管理页面
 */
export default function AdminUsersPage() {
    const [data, setData] = useState<UsersData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [page, setPage] = useState(1)

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
            })
            if (search) params.append("search", search)
            if (roleFilter && roleFilter !== "all") params.append("role", roleFilter)

            const response = await fetch(`/api/admin/users?${params}`)
            const result = await response.json()

            if (result.success) {
                setData(result.data)
            }
        } catch (err) {
            console.error("获取用户列表失败:", err)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, roleFilter])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const handleSearch = () => {
        setPage(1)
        fetchUsers()
    }

    const handleUpdateRole = async (userId: string, role: string) => {
        try {
            await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: userId, role }),
            })
            fetchUsers()
        } catch (err) {
            console.error("更新角色失败:", err)
        }
    }

    const handleToggleMembership = async (userId: string, isPremium: boolean) => {
        try {
            await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetUserId: userId,
                    isPremium,
                    planId: isPremium ? "monthly" : null,
                }),
            })
            fetchUsers()
        } catch (err) {
            console.error("更新会员状态失败:", err)
        }
    }

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
        }).format(new Date(dateStr))
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge className="bg-red-500">管理员</Badge>
            case "member":
                return <Badge className="bg-amber-500">会员</Badge>
            default:
                return <Badge variant="secondary">普通用户</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">用户管理</h1>
                    <p className="text-muted-foreground">
                        共 {data?.total || 0} 位用户
                    </p>
                </div>
                <Button onClick={fetchUsers} variant="outline" className="cursor-pointer">
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
                                placeholder="搜索邮箱或用户名..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                aria-label="搜索邮箱或用户名"
                            />
                            <Button onClick={handleSearch} className="cursor-pointer" aria-label="搜索用户">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                            <SelectTrigger className="w-[150px] cursor-pointer">
                                <SelectValue placeholder="角色筛选" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="cursor-pointer">全部</SelectItem>
                                <SelectItem value="user" className="cursor-pointer">普通用户</SelectItem>
                                <SelectItem value="member" className="cursor-pointer">会员</SelectItem>
                                <SelectItem value="admin" className="cursor-pointer">管理员</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* 用户列表 */}
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
                                        <TableHead>角色</TableHead>
                                        <TableHead>会员状态</TableHead>
                                        <TableHead>注册时间</TableHead>
                                        <TableHead className="text-right">操作</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.users?.length ? (
                                        data.users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt={`${user.name || "用户"}头像`} width={32} height={32} className="w-8 h-8 rounded-full" />
                                                            ) : (
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.name || "未设置"}</p>
                                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell>
                                                    {user.membership ? (
                                                        <div className="flex items-center gap-1">
                                                            <Crown className="h-4 w-4 text-amber-500" />
                                                            <span className="text-sm">
                                                                {formatDate(user.membership.expires_at)} 到期
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">免费用户</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="cursor-pointer" aria-label="更多操作">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleMembership(user.clerk_id, !user.membership)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Crown className="mr-2 h-4 w-4" />
                                                                {user.membership ? "取消会员" : "设为会员"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateRole(user.clerk_id, user.role === "admin" ? "user" : "admin")}
                                                                className="cursor-pointer"
                                                            >
                                                                <Shield className="mr-2 h-4 w-4" />
                                                                {user.role === "admin" ? "取消管理员" : "设为管理员"}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                                暂无用户数据
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
        </div>
    )
}
