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
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// 中文衬线字体（标题）
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="占卜网" />
        </head>
        <body
          className={`${notoSansTC.variable} ${notoSerifTC.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
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
