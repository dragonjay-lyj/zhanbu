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
import { useTranslation } from "@/lib/i18n"

/**
 * 主导航栏组件
 * 包含 Logo、主题切换、语言切换、用户认证
 */
export function Navbar() {
    const { isSignedIn, isLoaded, user } = useUser()
    const { signOut } = useClerk()
    const creditsContext = useCreditsOptional()
    const { t } = useTranslation()

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
                            aria-label={t("nav.menuOpen")}
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
                        {t("nav.bazi")}
                    </Link>
                    <Link
                        href="/ziwei"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {t("nav.ziwei")}
                    </Link>
                    <Link
                        href="/tarot"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {t("nav.tarot")}
                    </Link>
                    <Link
                        href="/daily"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {t("nav.daily")}
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
                                                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || t("nav.userFallback")} />
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
                                                    <span>{user?.fullName || t("nav.userFallback")}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        {user?.primaryEmailAddress?.emailAddress}
                                                    </span>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/profile" className="cursor-pointer">
                                                    <User className="mr-2 h-4 w-4" />
                                                    {t("nav.profile")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/history" className="cursor-pointer">
                                                    <History className="mr-2 h-4 w-4" />
                                                    {t("nav.history")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/pricing" className="cursor-pointer">
                                                    <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                                    {t("nav.pricing")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="cursor-pointer">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    {t("nav.admin")}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => signOut({ redirectUrl: "/" })}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                {t("nav.signOut")}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <SignInButton mode="modal">
                                        <Button variant="ghost" size="sm" className="cursor-pointer hidden sm:inline-flex">
                                            {t("nav.signIn")}
                                        </Button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <Button size="sm" className="cursor-pointer">
                                            {t("nav.signUp")}
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
