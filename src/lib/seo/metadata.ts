import { Metadata } from "next"
import { defaultLocale, getTranslations, t as translate, type Locale } from "@/lib/i18n"

/**
 * SEO 配置工具
 */

// 基础站点信息
const SITE_INFO = {
    name: "占卜大师",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://zhanbu.com",
    description: "专业的 AI 命理占卜平台，提供八字、塔罗、紫微斗数等多种占卜服务",
    keywords: ["占卜", "八字", "塔罗", "紫微斗数", "六爻", "AI 解读", "命理", "运势"],
    author: "占卜大师团队",
    locale: "zh-CN",
    twitterHandle: "@zhanbudashi",
}

function getSiteInfo(locale: Locale = defaultLocale) {
    const translations = getTranslations(locale)
    const name = translate(translations, "seo.appName")
    const description = translate(translations, "seo.siteDescription")
    return {
        ...SITE_INFO,
        name: name.startsWith("seo.") ? SITE_INFO.name : name,
        description: description.startsWith("seo.") ? SITE_INFO.description : description,
        locale,
    }
}

/**
 * 生成页面元数据
 */
export function generatePageMetadata(options: {
    title: string
    description?: string
    keywords?: string[]
    image?: string
    path?: string
    noIndex?: boolean
    locale?: Locale
}): Metadata {
    const {
        title,
        description,
        keywords,
        image = "/og-image.png",
        path = "",
        noIndex = false,
        locale = defaultLocale,
    } = options

    const siteInfo = getSiteInfo(locale)
    const fullTitle = `${title} | ${siteInfo.name}`
    const url = `${siteInfo.url}${path}`
    const imageUrl = image.startsWith("http") ? image : `${siteInfo.url}${image}`

    return {
        title: fullTitle,
        description: description || siteInfo.description,
        keywords: (keywords || siteInfo.keywords).join(", "),
        authors: [{ name: siteInfo.author }],
        creator: siteInfo.author,
        publisher: siteInfo.name,
        formatDetection: {
            email: false,
            telephone: false,
        },
        metadataBase: new URL(siteInfo.url),
        alternates: {
            canonical: url,
            languages: {
                "zh-CN": url,
                "zh-TW": `${siteInfo.url}/zh-TW${path}`,
                en: `${siteInfo.url}/en${path}`,
                ja: `${siteInfo.url}/ja${path}`,
            },
        },
        openGraph: {
            title: fullTitle,
            description: description || siteInfo.description,
            url,
            siteName: siteInfo.name,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: siteInfo.locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description: description || siteInfo.description,
            images: [imageUrl],
            creator: siteInfo.twitterHandle,
        },
        robots: noIndex
            ? { index: false, follow: false }
            : { index: true, follow: true },
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon-16x16.png",
            apple: "/apple-touch-icon.png",
        },
        manifest: "/manifest.json",
    }
}

/**
 * 生成占卜页面专用元数据
 */
export function generateDivinationMetadata(type: string): Metadata {
    const divinationMeta: Record<string, { title: string; description: string; keywords: string[] }> = {
        bazi: {
            title: "八字排盘",
            description: "专业八字命理分析，根据出生时间精确排盘，AI 智能解读命格运势",
            keywords: ["八字", "四柱", "八字排盘", "命理分析", "五行", "天干地支"],
        },
        ziwei: {
            title: "紫微斗数",
            description: "紫微斗数完整命盘，十四主星精准排布，深度解析人生轨迹",
            keywords: ["紫微斗数", "紫微命盘", "十四主星", "命宫", "星曜"],
        },
        tarot: {
            title: "塔罗占卜",
            description: "专业塔罗牌阵，AI 智能解读，洞察内心，指引方向",
            keywords: ["塔罗", "塔罗牌", "塔罗占卜", "大阿卡纳", "牌阵"],
        },
        liuyao: {
            title: "六爻排盘",
            description: "传统六爻起卦，六亲世应详解，预测吉凶祸福",
            keywords: ["六爻", "六爻排盘", "周易", "起卦", "卦象"],
        },
        meihua: {
            title: "梅花易数",
            description: "梅花易数起卦，象数结合，快速预测",
            keywords: ["梅花易数", "起卦", "象数", "易学"],
        },
        daily: {
            title: "每日运势",
            description: "每日运势播报，综合星座、生肖、黄历，为您的一天提供指引",
            keywords: ["每日运势", "今日运势", "星座运势", "生肖运势"],
        },
        marriage: {
            title: "八字合婚",
            description: "分析双方八字配对，评估婚姻契合度，提供专业婚配建议",
            keywords: ["八字合婚", "婚配", "姻缘", "配对"],
        },
        liunian: {
            title: "流年运势",
            description: "年度运势详解，月度运势曲线，把握人生节奏",
            keywords: ["流年运势", "年运", "运势预测"],
        },
    }

    const meta = divinationMeta[type] || {
        title: "占卜",
        description: SITE_INFO.description,
        keywords: SITE_INFO.keywords,
    }

    return generatePageMetadata({
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        path: `/${type}`,
    })
}

/**
 * 生成结构化数据 (JSON-LD)
 */
export function generateStructuredData(type: "website" | "article" | "faq" | "breadcrumb", data: any): string {
    let structuredData: object

    switch (type) {
        case "website":
            structuredData = {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_INFO.name,
                url: SITE_INFO.url,
                description: SITE_INFO.description,
                potentialAction: {
                    "@type": "SearchAction",
                    target: `${SITE_INFO.url}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                },
            }
            break

        case "article":
            structuredData = {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: data.title,
                description: data.description,
                author: {
                    "@type": "Organization",
                    name: SITE_INFO.name,
                },
                publisher: {
                    "@type": "Organization",
                    name: SITE_INFO.name,
                    logo: {
                        "@type": "ImageObject",
                        url: `${SITE_INFO.url}/logo.png`,
                    },
                },
                datePublished: data.publishedAt,
                dateModified: data.updatedAt || data.publishedAt,
                image: data.image,
            }
            break

        case "faq":
            structuredData = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: data.faqs.map((faq: { question: string; answer: string }) => ({
                    "@type": "Question",
                    name: faq.question,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: faq.answer,
                    },
                })),
            }
            break

        case "breadcrumb":
            structuredData = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: data.items.map((item: { name: string; url: string }, index: number) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: item.name,
                    item: item.url,
                })),
            }
            break

        default:
            structuredData = {}
    }

    return JSON.stringify(structuredData)
}
