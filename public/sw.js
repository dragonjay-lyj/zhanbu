// 占卜大师 Service Worker
// 提供离线支持和缓存策略

const CACHE_NAME = "zhanbu-v1"
const STATIC_CACHE = "zhanbu-static-v1"
const DYNAMIC_CACHE = "zhanbu-dynamic-v1"

// 静态资源缓存列表
const STATIC_ASSETS = [
    "/",
    "/offline",
    "/manifest.json",
    // 添加其他静态资源
]

// 安装事件 - 缓存静态资源
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log("Service Worker: 缓存静态资源")
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// 激活事件 - 清理旧缓存
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            )
        })
    )
    self.clients.claim()
})

// 请求拦截 - 缓存优先策略
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    // 只处理同源请求
    if (url.origin !== location.origin) return

    // API 请求使用网络优先
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(networkFirst(request))
        return
    }

    // 静态资源使用缓存优先
    event.respondWith(cacheFirst(request))
})

// 缓存优先策略
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        // 离线时返回离线页面
        const offlinePage = await caches.match("/offline")
        if (offlinePage) return offlinePage
        throw error
    }
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        // 网络失败时尝试缓存
        const cached = await caches.match(request)
        if (cached) return cached

        // 返回错误响应
        return new Response(
            JSON.stringify({ error: "离线状态，无法连接服务器" }),
            {
                status: 503,
                headers: { "Content-Type": "application/json" },
            }
        )
    }
}

// 推送通知
self.addEventListener("push", (event) => {
    if (!event.data) return

    const data = event.data.json()
    const options = {
        body: data.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge.png",
        vibrate: [100, 50, 100],
        data: {
            url: data.url || "/",
        },
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

// 点击通知
self.addEventListener("notificationclick", (event) => {
    event.notification.close()
    const url = event.notification.data?.url || "/"
    event.waitUntil(
        clients.openWindow(url)
    )
})
