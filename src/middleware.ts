import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 定义公开路由（不需要登录）
const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
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
})

export const config = {
    matcher: [
        // 跳过 Next.js 内部路由和所有静态文件
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // 始终对 API 路由运行中间件
        '/(api|trpc)(.*)',
    ],
}
