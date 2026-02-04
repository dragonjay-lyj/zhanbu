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

// 导航配置
const navigation = [
    {
        title: "首页",
        href: "/",
        icon: Sparkles,
    },
    {
        title: "八字命理",
        icon: LayoutGrid,
        items: [
            { title: "八字排盘", href: "/bazi", description: "AI 智能八字分析" },
            { title: "每日运势", href: "/daily", description: "每日吉凶预测" },
            { title: "合婚分析", href: "/marriage", description: "八字配对分析" },
        ],
    },
    {
        title: "紫微斗数",
        icon: Hexagon,
        items: [
            { title: "紫微排盘", href: "/ziwei", description: "十二宫位深度解析" },
        ],
    },
    {
        title: "六爻占卜",
        icon: Layers,
        items: [
            { title: "六爻排盘", href: "/liuyao", description: "铜钱摇卦预测" },
            { title: "梅花易数", href: "/meihua", description: "心易决策分析" },
        ],
    },
    {
        title: "塔罗占卜",
        icon: Flower2,
        items: [
            { title: "塔罗解读", href: "/tarot", description: "多种牌阵解读" },
        ],
    },
    {
        title: "关系分析",
        icon: Heart,
        items: [
            { title: "商业合作", href: "/relationship/business", description: "合伙人匹配分析", icon: Briefcase },
            { title: "闺蜜分析", href: "/relationship/friendship", description: "友谊契合度分析", icon: Users },
            { title: "婆媳关系", href: "/relationship/in-law", description: "家庭关系分析", icon: UserCheck },
            { title: "亲子关系", href: "/relationship/parent-child", description: "教育指导分析", icon: Baby },
            { title: "职场关系", href: "/relationship/workplace", description: "上下级关系分析", icon: Building2 },
        ],
    },
    {
        title: "黄历查询",
        href: "/huangli",
        icon: Calendar,
    },
    {
        title: "运势预测",
        icon: Star,
        items: [
            { title: "星座运势", href: "/zodiac", description: "十二星座运势预测" },
            { title: "生肖运程", href: "/shengxiao", description: "十二生肖年运月运" },
            { title: "流年运势", href: "/liunian", description: "年度运势走向" },
            { title: "每日运势", href: "/daily", description: "今日运势指引" },
        ],
    },
    {
        title: "传统占卜",
        icon: BookOpen,
        items: [
            { title: "抽签占卜", href: "/qianwen", description: "观音灵签、月老灵签" },
            { title: "周公解梦", href: "/jiemeng", description: "梦境解析" },
            { title: "择吉选日", href: "/zeji", description: "婚嫁、开业吉日" },
        ],
    },
    {
        title: "智能服务",
        icon: Bot,
        items: [
            { title: "姓名测算", href: "/name", description: "五格剖象姓名分析" },
            { title: "AI 对话", href: "/ai-chat", description: "AI 占卜大师" },
        ],
    },
    {
        title: "占卜社区",
        href: "/community",
        icon: MessageCircle,
    },
]

// 高级功能（需要更多开发）
const advancedNavigation = [
    { title: "奇门遁甲", href: "/qimen", icon: Compass },
    { title: "大六壬", href: "/liuren", icon: Hexagon },
    { title: "金口诀", href: "/jinkouque", icon: MoonIcon },
    { title: "玄空风水", href: "/fengshui", icon: Building2 },
]

/**
 * 侧边栏组件
 * 包含所有功能模块的导航
 */
export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                <Sparkles className="h-6 w-6 text-sidebar-primary" />
                <span className="font-serif text-lg font-bold">ZhanBu 占卜</span>
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
                                    {item.title}
                                </Link>
                            )
                        }

                        // 折叠菜单
                        return (
                            <Accordion
                                key={item.title}
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AccordionItem value={item.title} className="border-none">
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
                                            {item.title}
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
                                                        {subItem.title}
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
                        高级功能
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
                                    {item.title}
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
                    个人中心
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
                    历史记录
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
                    升级会员
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
                    管理后台
                </Link>
            </div>
        </div>
    )
}
