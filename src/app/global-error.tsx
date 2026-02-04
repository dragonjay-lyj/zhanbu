"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
                    <div className="text-center max-w-lg">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                            应用发生严重错误
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            很抱歉，应用遇到了无法恢复的错误。请刷新页面重试。
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={reset}
                                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                重新加载
                            </button>
                            <a
                                href="/"
                                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                返回首页
                            </a>
                        </div>
                        {error.digest && (
                            <p className="mt-6 text-xs text-gray-400">
                                错误标识: {error.digest}
                            </p>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}
