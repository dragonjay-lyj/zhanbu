"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps {
    children: React.ReactNode
    attribute?: "class" | "data-theme"
    defaultTheme?: string
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
}

/**
 * 主题提供者
 * 支持深色/浅色模式切换
 */
export function ThemeProvider({
    children,
    ...props
}: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
