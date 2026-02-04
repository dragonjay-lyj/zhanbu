import Script from "next/script"

interface UmamiAnalyticsProps {
    websiteId: string
    src?: string
}

/**
 * Umami 数据统计组件
 * 轻量级、隐私友好的网站分析工具
 */
export function UmamiAnalytics({
    websiteId,
    src = "https://analytics.umami.is/script.js",
}: UmamiAnalyticsProps) {
    if (!websiteId) return null

    return (
        <Script
            async
            src={src}
            data-website-id={websiteId}
            strategy="afterInteractive"
        />
    )
}

/**
 * Google Analytics 组件
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
    if (!measurementId) return null

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${measurementId}');
                `}
            </Script>
        </>
    )
}

/**
 * 自定义事件追踪 Hook
 */
export function trackEvent(
    eventName: string,
    eventData?: Record<string, string | number | boolean>
) {
    // Umami 事件
    if (typeof window !== "undefined" && (window as any).umami) {
        (window as any).umami.track(eventName, eventData)
    }

    // Google Analytics 事件
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", eventName, eventData)
    }
}

/**
 * 占卜事件追踪
 */
export const divinationEvents = {
    // 开始占卜
    startDivination: (type: string) => {
        trackEvent("divination_start", { type })
    },

    // 完成占卜
    completeDivination: (type: string, score?: number) => {
        trackEvent("divination_complete", { type, score: score ?? 0 })
    },

    // 获取 AI 解读
    getAiInterpretation: (type: string) => {
        trackEvent("ai_interpretation", { type })
    },

    // 保存结果
    saveResult: (type: string) => {
        trackEvent("result_save", { type })
    },

    // 分享结果
    shareResult: (type: string, method: string) => {
        trackEvent("result_share", { type, method })
    },

    // 导出 PDF
    exportPdf: (type: string) => {
        trackEvent("pdf_export", { type })
    },

    // 签到
    checkIn: (streak: number) => {
        trackEvent("daily_checkin", { streak })
    },

    // 邀请好友
    inviteFriend: () => {
        trackEvent("invite_friend")
    },
}
