"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react"

interface ErrorPageProps {
    error: Error & { digest?: string }
    reset: () => void
}

/**
 * 全局错误页面
 * 用于 app/error.tsx 和 app/global-error.tsx
 */
export function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        // 上报错误到监控服务
        console.error("Global error:", error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-8">
            <div className="text-center max-w-lg">
                {/* 动画图标 */}
                <div className="relative mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {/* 装饰圆环 */}
                    <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping" />
                </div>

                <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    出现了一些问题
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                    别担心，这不是您的问题。我们的服务器可能正在休息，请稍后再试。
                </p>

                {/* 动作按钮 */}
                <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <Button onClick={reset} size="lg" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        重新加载
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <a href="/">
                            <Home className="w-5 h-5 mr-2" />
                            返回首页
                        </a>
                    </Button>
                </div>

                {/* 错误信息（供调试） */}
                {error.digest && (
                    <p className="text-xs text-muted-foreground">
                        错误标识: {error.digest}
                    </p>
                )}

                {/* 帮助链接 */}
                <div className="mt-12 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                        如果问题持续存在，请联系我们
                    </p>
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/community">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            前往社区反馈
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}
