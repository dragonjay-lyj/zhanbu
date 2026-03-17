import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { enUS, zhCN, zhTW, jaJP } from "@clerk/localizations"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { I18nProvider, defaultLocale, locales, type Locale } from "@/lib/i18n"
import { defaultMetadata, viewport as defaultViewport, generateStructuredData } from "@/lib/seo"
import "./globals.css"

// 中文无衬线字体（正文）
const notoSansTC = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
})

// 中文衬线字体（标题）
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
})

// SEO 元数据
export const metadata: Metadata = defaultMetadata

// 视口配置
export const viewport: Viewport = defaultViewport

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 结构化数据
  const structuredData = generateStructuredData()
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value
  const initialLocale = locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale
  const clerkLocalization = {
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    en: enUS,
    ja: jaJP,
  }[initialLocale] ?? zhCN

  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang={initialLocale} suppressHydrationWarning>
        <head>
          {/* 结构化数据 */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
          {/* PWA 配置 */}
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#FDF2F8" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="占卜网" />
        </head>
        <body
          className={`${notoSansTC.variable} ${notoSerifTC.variable} font-sans antialiased`}
        >
          <a
            href="#main-content"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[200] focus-visible:rounded-md focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-foreground focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            跳转到主内容
          </a>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider initialLocale={initialLocale}>
              {children}
            </I18nProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
