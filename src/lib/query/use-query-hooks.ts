import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * 占卜结果缓存 Hook
 */
export function useDivinationQuery<T>(
    key: string[],
    fetcher: () => Promise<T>,
    options?: {
        enabled?: boolean
        staleTime?: number
    }
) {
    return useQuery({
        queryKey: key,
        queryFn: fetcher,
        staleTime: options?.staleTime ?? 10 * 60 * 1000, // 占卜结果缓存 10 分钟
        enabled: options?.enabled ?? true,
    })
}

/**
 * 用户历史记录查询 Hook
 */
export function useHistoryQuery(userId?: string) {
    return useQuery({
        queryKey: ["history", userId],
        queryFn: async () => {
            const res = await fetch(`/api/user/history`)
            if (!res.ok) throw new Error("获取历史记录失败")
            return res.json()
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    })
}

/**
 * 每日运势查询 Hook（按日期缓存）
 */
export function useDailyFortuneQuery(date?: string) {
    const today = date || new Date().toISOString().split("T")[0]

    return useQuery({
        queryKey: ["daily-fortune", today],
        queryFn: async () => {
            const res = await fetch(`/api/fortune?date=${today}`)
            if (!res.ok) throw new Error("获取运势失败")
            return res.json()
        },
        // 每日运势一天内不过期
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    })
}

/**
 * 社区帖子查询 Hook
 */
export function useCommunityPostsQuery(category?: string, page = 1) {
    return useQuery({
        queryKey: ["community-posts", category, page],
        queryFn: async () => {
            const params = new URLSearchParams({ page: String(page) })
            if (category) params.set("category", category)
            const res = await fetch(`/api/community?${params}`)
            if (!res.ok) throw new Error("获取帖子失败")
            return res.json()
        },
        staleTime: 2 * 60 * 1000, // 社区内容 2 分钟过期
    })
}

/**
 * 发布帖子 Mutation Hook
 */
export function useCreatePostMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { title: string; content: string; category: string }) => {
            const res = await fetch("/api/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("发布失败")
            return res.json()
        },
        onSuccess: () => {
            // 刷新帖子列表缓存
            queryClient.invalidateQueries({ queryKey: ["community-posts"] })
        },
    })
}

/**
 * 预取占卜结果
 */
export function usePrefetchDivination() {
    const queryClient = useQueryClient()

    return async (type: string, params: Record<string, any>) => {
        const key = [type, JSON.stringify(params)]
        await queryClient.prefetchQuery({
            queryKey: key,
            queryFn: async () => {
                const searchParams = new URLSearchParams(params)
                const res = await fetch(`/api/${type}?${searchParams}`)
                return res.json()
            },
        })
    }
}
