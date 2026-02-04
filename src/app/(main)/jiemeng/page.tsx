"use client"

import { useState, useEffect } from "react"
import { Search, Moon, Loader2, BookOpen, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// 梦境分类
interface DreamCategory {
    id: string
    name: string
    icon: string
    keywords: string[]
}

// 解梦结果
interface DreamInterpretation {
    meaning: string
    fortune: string
    advice: string
}

// 吉凶颜色
const fortuneColors: Record<string, string> = {
    "大吉": "bg-green-500 text-white",
    "吉": "bg-emerald-500 text-white",
    "平": "bg-blue-500 text-white",
    "凶": "bg-red-500 text-white",
    "吉凶参半": "bg-yellow-500 text-white",
}

export default function JiemengPage() {
    const [categories, setCategories] = useState<DreamCategory[]>([])
    const [searchKeyword, setSearchKeyword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{
        keyword: string
        interpretation?: DreamInterpretation
        suggestions?: string[]
        related?: string[]
        message?: string
    } | null>(null)

    // 加载分类
    useEffect(() => {
        fetch("/api/jiemeng")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCategories(data.data.categories)
                }
            })
    }, [])

    // 搜索解梦
    const searchDream = async (keyword: string) => {
        if (!keyword.trim()) return

        setIsLoading(true)
        setResult(null)

        try {
            const res = await fetch(`/api/jiemeng?keyword=${encodeURIComponent(keyword.trim())}`)
            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            }
        } catch (error) {
            console.error("搜索失败:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // 点击关键词搜索
    const handleKeywordClick = (keyword: string) => {
        setSearchKeyword(keyword)
        searchDream(keyword)
    }

    // 获取吉凶颜色
    const getFortuneColor = (fortune: string) => {
        for (const [key, value] of Object.entries(fortuneColors)) {
            if (fortune.includes(key)) return value
        }
        return "bg-gray-500 text-white"
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
                    <Moon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    周公解梦
                </h1>
                <p className="text-muted-foreground mt-2">
                    输入梦境关键词，解读梦的寓意
                </p>
            </div>

            {/* 搜索框 */}
            <Card className="mb-8">
                <CardContent className="pt-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="输入梦境关键词，如：蛇、飞、水..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && searchDream(searchKeyword)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            onClick={() => searchDream(searchKeyword)}
                            disabled={isLoading || !searchKeyword.trim()}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "解梦"
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 搜索结果 */}
            {result && (
                <div className="space-y-6 mb-8">
                    {result.interpretation ? (
                        <>
                            {/* 解梦结果 */}
                            <Card className="overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="w-8 h-8" />
                                            <div>
                                                <h2 className="text-2xl font-bold">梦见{result.keyword}</h2>
                                                <p className="text-white/80 text-sm">周公解梦典籍解读</p>
                                            </div>
                                        </div>
                                        <Badge className={getFortuneColor(result.interpretation.fortune)}>
                                            {result.interpretation.fortune.split("，")[0]}
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div>
                                        <h3 className="font-medium flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            梦境解读
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {result.interpretation.meaning}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-1">🔮 运势预示</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {result.interpretation.fortune}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/50">
                                            <h4 className="font-medium mb-1">💡 建议</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {result.interpretation.advice}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 相关梦境 */}
                            {result.related && result.related.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">相关梦境</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {result.related.map((keyword) => (
                                                <Badge
                                                    key={keyword}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                                    onClick={() => handleKeywordClick(keyword)}
                                                >
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : result.suggestions && result.suggestions.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>您可能想搜索</CardTitle>
                                <CardDescription>
                                    未找到「{result.keyword}」的精确解释，以下是相关结果
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {result.suggestions.map((keyword) => (
                                        <Button
                                            key={keyword}
                                            variant="outline"
                                            onClick={() => handleKeywordClick(keyword)}
                                            className="gap-1"
                                        >
                                            {keyword}
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <Moon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    {result.message || "未找到相关解释，请尝试其他关键词"}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* 梦境分类 */}
            {!result && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">热门梦境分类</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <span className="text-2xl">{category.icon}</span>
                                        {category.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-1">
                                        {category.keywords.map((keyword) => (
                                            <Badge
                                                key={keyword}
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                                onClick={() => handleKeywordClick(keyword)}
                                            >
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
