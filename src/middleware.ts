import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"

const supportedLocales = ["zh-CN", "zh-TW", "en", "ja"] as const
type SupportedLocale = (typeof supportedLocales)[number]
const LOCALE_COOKIE_NAME = "locale"
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function normalizeLocale(value: string | null): SupportedLocale | null {
    if (!value) return null
    return supportedLocales.includes(value as SupportedLocale)
        ? (value as SupportedLocale)
        : null
}

function matchAcceptLanguage(headerValue: string | null): SupportedLocale | null {
    if (!headerValue) return null
    const parts = headerValue.split(",").map((part) => part.trim().split(";")[0])
    for (const lang of parts) {
        const lower = lang.toLowerCase()
        if (lower.startsWith("zh")) {
            if (lower.includes("tw") || lower.includes("hk") || lower.includes("mo")) {
                return "zh-TW"
            }
            return "zh-CN"
        }
        if (lower.startsWith("ja")) return "ja"
        if (lower.startsWith("en")) return "en"
    }
    return null
}

function mapCountryToLocale(country: string | null | undefined): SupportedLocale | null {
    if (!country) return null
    const upper = country.toUpperCase()
    if (upper === "CN") return "zh-CN"
    if (upper === "TW" || upper === "HK" || upper === "MO") return "zh-TW"
    if (upper === "JP") return "ja"
    return "en"
}


// 定义公开路由（不需要登录）
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/api/payment/callback(.*)',
    // 占卜功能页面对外开放（但部分功能需要登录）
    '/bazi(.*)',
    '/ziwei(.*)',
    '/liuyao(.*)',
    '/meihua(.*)',
    '/tarot(.*)',
    '/daily(.*)',
    '/huangli(.*)',
])

// 定义管理员路由
const isAdminRoute = createRouteMatcher([
    '/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
    // 管理员路由需要特殊权限
    if (isAdminRoute(request)) {
        await auth.protect()
        // 注意：实际部署时需要检查用户是否为管理员
        // const { userId } = await auth()
        // 可以使用 Clerk 的 publicMetadata 或 Supabase 检查管理员角色
    }

    // 非公开路由需要登录
    if (!isPublicRoute(request)) {
        await auth.protect()
    }

    const response = NextResponse.next()
    const urlLocale = normalizeLocale(
        request.nextUrl.searchParams.get("lang") || request.nextUrl.searchParams.get("locale")
    )
    const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value || null)
    const headerLocale = matchAcceptLanguage(request.headers.get("accept-language"))
    const geoCountry = (request as { geo?: { country?: string } }).geo?.country
    const geoLocale =
        mapCountryToLocale(geoCountry) ||
        mapCountryToLocale(request.headers.get("x-vercel-ip-country")) ||
        mapCountryToLocale(request.headers.get("cf-ipcountry"))
    const resolvedLocale =
        urlLocale || cookieLocale || headerLocale || geoLocale || "zh-CN"

    if (resolvedLocale && resolvedLocale !== cookieLocale) {
        response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, {
            path: "/",
            maxAge: LOCALE_COOKIE_MAX_AGE,
        })
    }

    return response
})

export const config = {
    matcher: [
        // 跳过 Next.js 内部路由和所有静态文件
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // 始终对 API 路由运行中间件
        '/(api|trpc)(.*)',
    ],
}
