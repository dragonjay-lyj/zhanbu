"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

/**
 * 全局错误边界组件
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo })
        // 可以在这里上报错误到监控服务
        console.error("Error caught by boundary:", error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">页面出现了问题</h2>
                        <p className="text-muted-foreground mb-6">
                            抱歉，页面加载时出现了错误。请尝试刷新页面或返回首页。
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={this.handleRetry} variant="default">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                重试
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    返回首页
                                </a>
                            </Button>
                        </div>

                        {/* 开发模式显示错误详情 */}
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-6 text-left p-4 bg-muted rounded-lg max-h-48 overflow-auto">
                                <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                                    <Bug className="w-4 h-4" />
                                    错误详情（仅开发环境可见）
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                                    {this.state.error.message}
                                    {"\n\n"}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * 用于函数组件的错误边界 Hook
 */
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null)

    const handleError = React.useCallback((err: Error) => {
        setError(err)
        console.error("Error handled:", err)
    }, [])

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    return { error, handleError, resetError }
}
