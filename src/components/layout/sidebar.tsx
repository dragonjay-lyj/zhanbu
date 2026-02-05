"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Sparkles,
    LayoutGrid,
    Sun,
    Moon as MoonIcon,
    Hexagon,
    Flower2,
    Layers,
    Heart,
    Users,
    Calendar,
    Building2,
    UserCheck,
    Baby,
    Briefcase,
    Compass,
    Settings,
    ChevronDown,
    User,
    History,
    Crown,
    Star,
    Bot,
    BookOpen,
    User2,
    CalendarCheck,
    MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from "@/lib/i18n"

// 导航配置
const navigation = [
    {
        titleKey: "sidebar.sections.home",
        href: "/",
        icon: Sparkles,
    },
    {
        titleKey: "sidebar.sections.bazi",
        icon: LayoutGrid,
        items: [
            { titleKey: "sidebar.items.bazi", href: "/bazi", descriptionKey: "sidebar.descriptions.bazi" },
            { titleKey: "sidebar.items.daily", href: "/daily", descriptionKey: "sidebar.descriptions.daily" },
            { titleKey: "sidebar.items.marriage", href: "/marriage", descriptionKey: "sidebar.descriptions.marriage" },
        ],
    },
    {
        titleKey: "sidebar.sections.ziwei",
        icon: Hexagon,
        items: [
            { titleKey: "sidebar.items.ziwei", href: "/ziwei", descriptionKey: "sidebar.descriptions.ziwei" },
        ],
    },
    {
        titleKey: "sidebar.sections.liuyao",
        icon: Layers,
        items: [
            { titleKey: "sidebar.items.liuyao", href: "/liuyao", descriptionKey: "sidebar.descriptions.liuyao" },
            { titleKey: "sidebar.items.meihua", href: "/meihua", descriptionKey: "sidebar.descriptions.meihua" },
        ],
    },
    {
        titleKey: "sidebar.sections.tarot",
        icon: Flower2,
        items: [
            { titleKey: "sidebar.items.tarot", href: "/tarot", descriptionKey: "sidebar.descriptions.tarot" },
        ],
    },
    {
        titleKey: "sidebar.sections.relationship",
        icon: Heart,
        items: [
            { titleKey: "sidebar.items.relationshipBusiness", href: "/relationship/business", descriptionKey: "sidebar.descriptions.relationshipBusiness", icon: Briefcase },
            { titleKey: "sidebar.items.relationshipFriendship", href: "/relationship/friendship", descriptionKey: "sidebar.descriptions.relationshipFriendship", icon: Users },
            { titleKey: "sidebar.items.relationshipInLaw", href: "/relationship/in-law", descriptionKey: "sidebar.descriptions.relationshipInLaw", icon: UserCheck },
            { titleKey: "sidebar.items.relationshipParentChild", href: "/relationship/parent-child", descriptionKey: "sidebar.descriptions.relationshipParentChild", icon: Baby },
            { titleKey: "sidebar.items.relationshipWorkplace", href: "/relationship/workplace", descriptionKey: "sidebar.descriptions.relationshipWorkplace", icon: Building2 },
        ],
    },
    {
        titleKey: "sidebar.sections.huangli",
        href: "/huangli",
        icon: Calendar,
    },
    {
        titleKey: "sidebar.sections.fortune",
        icon: Star,
        items: [
            { titleKey: "sidebar.items.zodiac", href: "/zodiac", descriptionKey: "sidebar.descriptions.zodiac" },
            { titleKey: "sidebar.items.shengxiao", href: "/shengxiao", descriptionKey: "sidebar.descriptions.shengxiao" },
            { titleKey: "sidebar.items.liunian", href: "/liunian", descriptionKey: "sidebar.descriptions.liunian" },
            { titleKey: "sidebar.items.daily", href: "/daily", descriptionKey: "sidebar.descriptions.dailyFortune" },
        ],
    },
    {
        titleKey: "sidebar.sections.traditional",
        icon: BookOpen,
        items: [
            { titleKey: "sidebar.items.qianwen", href: "/qianwen", descriptionKey: "sidebar.descriptions.qianwen" },
            { titleKey: "sidebar.items.jiemeng", href: "/jiemeng", descriptionKey: "sidebar.descriptions.jiemeng" },
            { titleKey: "sidebar.items.zeji", href: "/zeji", descriptionKey: "sidebar.descriptions.zeji" },
        ],
    },
    {
        titleKey: "sidebar.sections.smart",
        icon: Bot,
        items: [
            { titleKey: "sidebar.items.name", href: "/name", descriptionKey: "sidebar.descriptions.name" },
            { titleKey: "sidebar.items.aiChat", href: "/ai-chat", descriptionKey: "sidebar.descriptions.aiChat" },
        ],
    },
    {
        titleKey: "sidebar.sections.community",
        href: "/community",
        icon: MessageCircle,
    },
]

// 高级功能（需要更多开发）
const advancedNavigation = [
    { titleKey: "sidebar.advancedItems.qimen", href: "/qimen", icon: Compass },
    { titleKey: "sidebar.advancedItems.liuren", href: "/liuren", icon: Hexagon },
    { titleKey: "sidebar.advancedItems.jinkouque", href: "/jinkouque", icon: MoonIcon },
    { titleKey: "sidebar.advancedItems.fengshui", href: "/fengshui", icon: Building2 },
]

/**
 * 侧边栏组件
 * 包含所有功能模块的导航
 */
export function Sidebar() {
    const pathname = usePathname()
    const { t } = useTranslation()

    return (
        <div className="flex h-full flex-col bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                <Sparkles className="h-6 w-6 text-sidebar-primary" />
                <span className="font-serif text-lg font-bold">{t("sidebar.logo")}</span>
            </div>

            {/* 导航区域 */}
            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-1">
                    {navigation.map((item) => {
                        // 单独链接
                        if (item.href) {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        "cursor-pointer"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {t(item.titleKey)}
                                </Link>
                            )
                        }

                        // 折叠菜单
                        return (
                            <Accordion
                                key={item.titleKey}
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem value={item.titleKey} className="border-none">
                                    <AccordionTrigger
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:no-underline",
                                            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                            "[&[data-state=open]]:bg-sidebar-accent",
                                            "cursor-pointer"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            {t(item.titleKey)}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-1 pt-1">
                                        <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3">
                                            {item.items?.map((subItem) => {
                                                const isActive = pathname === subItem.href
                                                const SubIcon = (subItem as { icon?: typeof Sparkles }).icon
                                                return (
                                                    <Link
                                                        key={subItem.href}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                                            isActive
                                                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                            "cursor-pointer"
                                                        )}
                                                    >
                                                        {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                                                        {t(subItem.titleKey)}
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )
                    })}
                </div>

                <Separator className="my-4" />

                {/* 高级功能 */}
                <div className="px-3 py-2">
                    <h4 className="mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                        {t("sidebar.advanced")}
                    </h4>
                    <div className="space-y-1">
                        {advancedNavigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        "cursor-pointer"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {t(item.titleKey)}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </ScrollArea>

            {/* 底部用户区域 */}
            <div className="border-t border-sidebar-border p-3 space-y-1">
                <Link
                    href="/profile"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === "/profile"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "cursor-pointer"
                    )}
                >
                    <User className="h-4 w-4" />
                    {t("sidebar.footer.profile")}
                </Link>
                <Link
                    href="/history"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === "/history"
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "cursor-pointer"
                    )}
                >
                    <History className="h-4 w-4" />
                    {t("sidebar.footer.history")}
                </Link>
                <Link
                    href="/pricing"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === "/pricing"
                            ? "bg-amber-500/20 text-amber-500"
                            : "text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-500",
                        "cursor-pointer"
                    )}
                >
                    <Crown className="h-4 w-4" />
                    {t("sidebar.footer.pricing")}
                </Link>
                <Link
                    href="/admin"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        "cursor-pointer"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    {t("sidebar.footer.admin")}
                </Link>
            </div>
        </div>
    )
}
