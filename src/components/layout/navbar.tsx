"use client"

import Link from "next/link"
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { Menu, Sparkles, User, History, Crown, Settings, LogOut, Coins, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useCreditsOptional } from "@/lib/credits/provider"

/**
 * 主导航栏组件
 * 包含 Logo、主题切换、语言切换、用户认证
 */
export function Navbar() {
    const { isSignedIn, isLoaded, user } = useUser()
    const { signOut } = useClerk()
    const creditsContext = useCreditsOptional()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* 移动端菜单按钮 */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden cursor-pointer"
                            aria-label="打开菜单"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0">
                        <Sidebar />
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative">
                        <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
                    </div>
                    <span className="font-serif text-xl font-bold text-gradient hidden sm:inline-block">
                        ZhanBu 占卜
                    </span>
                </Link>

                {/* 桌面端导航链接 */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/bazi"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        八字排盘
                    </Link>
                    <Link
                        href="/ziwei"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        紫微斗数
                    </Link>
                    <Link
                        href="/tarot"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        塔罗占卜
                    </Link>
                    <Link
                        href="/daily"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        每日运势
                    </Link>
                </nav>

                {/* 右侧操作区 */}
                <div className="flex items-center gap-1 md:gap-2">
                    {/* 语言切换 */}
                    <LanguageSwitcher />

                    {/* 主题切换 */}
                    <ThemeToggle />

                    {/* 用户认证 */}
                    {isLoaded && (
                        <>
                            {isSignedIn ? (
                                <div className="flex items-center gap-2">
                                    {/* 积分显示 */}
                                    {creditsContext?.credits && (
                                        <Link href="/pricing">
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 cursor-pointer hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
                                            >
                                                <Coins className="h-3 w-3" />
                                                <span>{creditsContext.credits.balance}</span>
                                            </Badge>
                                        </Link>
                                    )}

                                    {/* 用户下拉菜单 */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="gap-2 px-2 cursor-pointer">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "用户"} />
                                                    <AvatarFallback>
                                                        {user?.firstName?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <ChevronDown className="h-4 w-4 hidden sm:block" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col">
                                                    <span>{user?.fullName || "用户"}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        {user?.primaryEmailAddress?.emailAddress}
                                                    </span>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    个人中心
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/history" className="cursor-pointer">
                                                    <History className="mr-2 h-4 w-4" />
                                                    历史记录
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/pricing" className="cursor-pointer">
                                                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                                    升级会员
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    管理后台
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => signOut({ redirectUrl: "/" })}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                退出登录
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <SignInButton mode="modal">
                                        <Button variant="ghost" size="sm" className="cursor-pointer hidden sm:inline-flex">
                                            登录
                                        </Button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <Button size="sm" className="cursor-pointer">
                                            注册
                                        </Button>
                                    </SignUpButton>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
