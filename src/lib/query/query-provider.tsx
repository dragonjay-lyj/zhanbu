"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

/**
 * React Query 配置
 */
export function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // 数据过期时间（5分钟）
                staleTime: 5 * 60 * 1000,
                // 缓存时间（30分钟）
                gcTime: 30 * 60 * 1000,
                // 重试次数
                retry: 2,
                // 窗口聚焦时不自动刷新
                refetchOnWindowFocus: false,
                // 网络恢复时刷新
                refetchOnReconnect: true,
            },
            mutations: {
                // 重试次数
                retry: 1,
            },
        },
    })
}

interface QueryProviderProps {
    children: ReactNode
}

/**
 * React Query Provider
 */
export function QueryProvider({ children }: QueryProviderProps) {
    // 使用 useState 确保每个请求创建新的 QueryClient
    const [queryClient] = useState(() => createQueryClient())

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
