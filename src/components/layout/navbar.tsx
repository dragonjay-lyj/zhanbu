"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/lib/i18n"

const NavbarAuthControls = dynamic(
    () => import("./navbar-auth-controls").then((mod) => mod.NavbarAuthControls),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                </Button>
            </div>
        ),
    }
)

/**
 * 主导航栏组件
 * 包含 Logo、主题切换、语言切换、用户认证
 */
export function Navbar() {
    const { t } = useTranslation()
    const navLinkClass = "rounded-full px-3 py-2 text-sm font-medium text-foreground/72 transition-[background-color,color,box-shadow] duration-200 hover:bg-primary/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/78 shadow-[var(--shadow-sm)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
            <div className="container flex h-[4.5rem] items-center justify-between px-4">
                {/* 移动端菜单按钮 */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
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
                <Link href="/" className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                    <div className="glass flex h-11 w-11 items-center justify-center rounded-2xl border-primary/12">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <span className="hidden font-serif text-xl font-semibold text-gradient sm:inline-block">
                        ZhanBu 占卜
                    </span>
                </Link>

                {/* 桌面端导航链接 */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/bazi"
                        className={navLinkClass}
                    >
                        {t("nav.bazi")}
                    </Link>
                    <Link
                        href="/ziwei"
                        className={navLinkClass}
                    >
                        {t("nav.ziwei")}
                    </Link>
                    <Link
                        href="/tarot"
                        className={navLinkClass}
                    >
                        {t("nav.tarot")}
                    </Link>
                    <Link
                        href="/daily"
                        className={navLinkClass}
                    >
                        {t("nav.daily")}
                    </Link>
                </nav>

                {/* 右侧操作区 */}
                <div className="flex items-center gap-1 md:gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <NavbarAuthControls />
                </div>
            </div>
        </header>
    )
}
