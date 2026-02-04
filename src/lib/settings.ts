import { createAdminClient } from "@/lib/supabase/server"

/**
 * 系统配置管理
 * 从数据库读取配置，支持缓存
 */

// 配置缓存
let settingsCache: Record<string, string> | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60 * 1000 // 1分钟缓存

/**
 * 获取系统配置
 * @param keys 要获取的配置键数组，不传则获取全部
 */
export async function getSettings(keys?: string[]): Promise<Record<string, string>> {
    const now = Date.now()

    // 使用缓存
    if (settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
        if (keys) {
            return keys.reduce((acc, key) => {
                if (settingsCache![key] !== undefined) {
                    acc[key] = settingsCache![key]
                }
                return acc
            }, {} as Record<string, string>)
        }
        return { ...settingsCache }
    }

    try {
        const supabase = await createAdminClient()

        let query = supabase
            .from("system_settings")
            .select("key, value")

        if (keys && keys.length > 0) {
            query = query.in("key", keys)
        }

        const { data, error } = await query

        if (error) {
            console.error("获取系统配置失败:", error)
            return {}
        }

        const settings = (data || []).reduce((acc, item) => {
            acc[item.key] = item.value || ""
            return acc
        }, {} as Record<string, string>)

        // 更新缓存（仅当获取全部时）
        if (!keys) {
            settingsCache = settings
            cacheTimestamp = now
        }

        return settings
    } catch (error) {
        console.error("获取系统配置错误:", error)
        return {}
    }
}

/**
 * 获取单个配置值
 */
export async function getSetting(key: string, defaultValue = ""): Promise<string> {
    const settings = await getSettings([key])
    return settings[key] || defaultValue
}

/**
 * 获取 AI 配置
 */
export async function getAiConfig(): Promise<{
    apiKey: string
    baseUrl: string
    model: string
    enabled: boolean
}> {
    const settings = await getSettings([
        "ai_api_key",
        "ai_api_base_url",
        "ai_model",
        "enable_ai_analysis"
    ])

    return {
        apiKey: settings.ai_api_key || process.env.AI_API_KEY || "",
        baseUrl: settings.ai_api_base_url || process.env.AI_API_BASE_URL || "https://api.deepseek.com/v1",
        model: settings.ai_model || process.env.AI_MODEL || "deepseek-chat",
        enabled: settings.enable_ai_analysis !== "false",
    }
}

/**
 * 获取网站配置
 */
export async function getSiteConfig(): Promise<{
    name: string
    description: string
    url: string
    keywords: string
}> {
    const settings = await getSettings([
        "app_name",
        "app_description",
        "app_url",
        "app_keywords"
    ])

    return {
        name: settings.app_name || process.env.NEXT_PUBLIC_APP_NAME || "ZhanBu 占卜",
        description: settings.app_description || "AI 智能占卜平台",
        url: settings.app_url || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        keywords: settings.app_keywords || "占卜,八字,塔罗,紫微斗数,AI",
    }
}

/**
 * 清除配置缓存
 */
export function clearSettingsCache(): void {
    settingsCache = null
    cacheTimestamp = 0
}
