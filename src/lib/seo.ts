import type { Metadata, Viewport } from "next"

// 基础网站信息
const siteName = "占卜网 - 专业在线占卜平台"
const siteDescription = "占卜网提供专业的八字排盘、紫微斗数、塔罗占卜、六爻排盘、梅花易数、奇门遁甲、玄空风水等在线占卜服务，AI智能解读，传承千年智慧。"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zhanbu.com"

// 默认元数据
export const defaultMetadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteName,
        template: `%s | 占卜网`,
    },
    description: siteDescription,
    keywords: [
        "占卜",
        "八字",
        "紫微斗数",
        "塔罗牌",
        "六爻",
        "梅花易数",
        "奇门遁甲",
        "风水",
        "算命",
        "命理",
        "运势",
        "在线占卜",
        "AI占卜",
        "免费算命",
    ],
    authors: [{ name: "占卜网", url: siteUrl }],
    creator: "占卜网",
    publisher: "占卜网",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "zh_CN",
        alternateLocale: ["en_US", "zh_TW", "ja_JP"],
        url: siteUrl,
        siteName: "占卜网",
        title: siteName,
        description: siteDescription,
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "占卜网 - 专业在线占卜平台",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
        images: ["/og-image.png"],
        creator: "@zhanbu",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    manifest: "/site.webmanifest",
    alternates: {
        canonical: siteUrl,
        languages: {
            "zh-CN": `${siteUrl}/zh-CN`,
            "en-US": `${siteUrl}/en`,
            "zh-TW": `${siteUrl}/zh-TW`,
            "ja-JP": `${siteUrl}/ja`,
        },
    },
    category: "lifestyle",
}

// 视口配置
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
}

// 页面元数据生成器
interface PageMetadataOptions {
    title: string
    description?: string
    keywords?: string[]
    image?: string
    noIndex?: boolean
    pathname?: string
}

export function generatePageMetadata(options: PageMetadataOptions): Metadata {
    const { title, description, keywords, image, noIndex, pathname } = options

    return {
        title,
        description: description || siteDescription,
        keywords: keywords ? [...keywords, "占卜", "命理"] : undefined,
        openGraph: {
            title,
            description: description || siteDescription,
            url: pathname ? `${siteUrl}${pathname}` : siteUrl,
            images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
        },
        twitter: {
            title,
            description: description || siteDescription,
            images: image ? [image] : undefined,
        },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true },
        alternates: pathname
            ? {
                canonical: `${siteUrl}${pathname}`,
            }
            : undefined,
    }
}

// 结构化数据生成器
export function generateStructuredData() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "占卜网",
        alternateName: ["ZhanBu", "在线占卜平台"],
        url: siteUrl,
        description: siteDescription,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
        publisher: {
            "@type": "Organization",
            name: "占卜网",
            url: siteUrl,
            logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.png`,
            },
        },
    }
}

// 服务结构化数据
export function generateServiceStructuredData(service: {
    name: string
    description: string
    url: string
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        description: service.description,
        url: service.url,
        provider: {
            "@type": "Organization",
            name: "占卜网",
            url: siteUrl,
        },
        areaServed: {
            "@type": "Country",
            name: "China",
        },
        availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: service.url,
            serviceType: "Online",
        },
    }
}

// FAQ 结构化数据
export function generateFAQStructuredData(
    faqs: { question: string; answer: string }[]
) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
    }
}
