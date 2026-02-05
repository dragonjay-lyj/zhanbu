"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Plus, Loader2, Heart, Eye, MessageCircle, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useI18n, useTranslation, formatMessage } from "@/lib/i18n"

// 帖子类型
interface Post {
    id: string
    title: string
    content: string
    category: string
    user: { id: string; name: string; avatar_url: string | null }
    likes: number
    views: number
    comment_count: number
    created_at: string
}

// 分类类型
interface Category {
    id: string
    name: string
    icon: string
}

// 分类颜色
const categoryColors: Record<string, string> = {
    "general": "bg-gray-100 text-gray-800",
    "bazi": "bg-purple-100 text-purple-800",
    "tarot": "bg-pink-100 text-pink-800",
    "ziwei": "bg-blue-100 text-blue-800",
    "fengshui": "bg-green-100 text-green-800",
    "dream": "bg-indigo-100 text-indigo-800",
    "help": "bg-orange-100 text-orange-800",
}

export default function CommunityPage() {
    const { locale } = useI18n()
    const { t } = useTranslation()
    const [posts, setPosts] = useState<Post[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newPost, setNewPost] = useState({ title: "", content: "", category: "general" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 加载帖子
    useEffect(() => {
        fetchPosts()
    }, [activeCategory])

    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const url = activeCategory === "all"
                ? "/api/community"
                : `/api/community?category=${activeCategory}`
            const res = await fetch(url)
            const data = await res.json()
            if (data.success) {
                setPosts(data.data.posts)
                setCategories(data.data.categories)
            }
        } catch (error) {
            console.error("加载失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 发布帖子
    const handleSubmit = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            })
            const data = await res.json()
            if (data.success) {
                setIsDialogOpen(false)
                setNewPost({ title: "", content: "", category: "general" })
                fetchPosts()
            }
        } catch (error) {
            console.error("发布失败:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 过滤帖子
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 60000) return t("pages.community.time.justNow")
        if (diff < 3600000) {
            return formatMessage(t("pages.community.time.minutesAgo"), {
                value: Math.floor(diff / 60000),
            })
        }
        if (diff < 86400000) {
            return formatMessage(t("pages.community.time.hoursAgo"), {
                value: Math.floor(diff / 3600000),
            })
        }
        if (diff < 604800000) {
            return formatMessage(t("pages.community.time.daysAgo"), {
                value: Math.floor(diff / 86400000),
            })
        }
        return date.toLocaleDateString(locale)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-primary" />
                        {t("pages.community.title")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t("pages.community.description")}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                            <Plus className="w-4 h-4 mr-2" />
                            {t("pages.community.postButton")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t("pages.community.dialogTitle")}</DialogTitle>
                            <DialogDescription>
                                {t("pages.community.dialogDescription")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <Label>{t("pages.community.titleLabel")}</Label>
                                <Input
                                    placeholder={t("pages.community.titlePlaceholder")}
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>{t("pages.community.categoryLabel")}</Label>
                                <Select
                                    value={newPost.category}
                                    onValueChange={(v) => setNewPost({ ...newPost, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>{t("pages.community.contentLabel")}</Label>
                                <Textarea
                                    placeholder={t("pages.community.contentPlaceholder")}
                                    rows={6}
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                />
                            </div>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newPost.title.trim()}
                                className="w-full"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {t("pages.community.submit")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
                {/* 左侧分类 */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("pages.community.categories")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant={activeCategory === "all" ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setActiveCategory("all")}
                            >
                                📋 {t("pages.community.allPosts")}
                            </Button>
                            {categories.map((cat) => (
                                <Button
                                    key={cat.id}
                                    variant={activeCategory === cat.id ? "default" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    {cat.icon} {cat.name}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧帖子列表 */}
                <div className="lg:col-span-3 space-y-4">
                    {/* 搜索栏 */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t("pages.community.searchPlaceholder")}
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* 帖子列表 */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                {t("pages.community.empty")}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredPosts.map((post) => (
                                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={post.user.avatar_url || undefined} />
                                                <AvatarFallback>
                                                    <User className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{post.user.name}</span>
                                                    <Badge className={categoryColors[post.category] || "bg-gray-100"}>
                                                        {categories.find(c => c.id === post.category)?.name || post.category}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(post.created_at)}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                                    {post.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-2">
                                                    {post.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-4 h-4" />
                                                        {post.likes}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" />
                                                        {post.comment_count}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        {post.views}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
