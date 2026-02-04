"use client"

import { useState, useEffect } from "react"

// 断点配置
const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
} as const

type Breakpoint = keyof typeof breakpoints

/**
 * 获取当前窗口宽度
 */
export function useWindowSize() {
    const [size, setSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
    })

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener("resize", handleResize)
        handleResize()

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return size
}

/**
 * 检查是否为移动设备
 */
export function useIsMobile(breakpoint: Breakpoint = "md") {
    const { width } = useWindowSize()
    return width < breakpoints[breakpoint]
}

/**
 * 媒体查询 hook
 */
export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)
        if (media.matches !== matches) {
            setMatches(media.matches)
        }

        const listener = () => setMatches(media.matches)
        media.addEventListener("change", listener)

        return () => media.removeEventListener("change", listener)
    }, [matches, query])

    return matches
}

/**
 * 断点 hook
 */
export function useBreakpoint() {
    const { width } = useWindowSize()

    return {
        isSm: width >= breakpoints.sm,
        isMd: width >= breakpoints.md,
        isLg: width >= breakpoints.lg,
        isXl: width >= breakpoints.xl,
        is2xl: width >= breakpoints["2xl"],
        current: getCurrentBreakpoint(width),
    }
}

function getCurrentBreakpoint(width: number): Breakpoint | "xs" {
    if (width >= breakpoints["2xl"]) return "2xl"
    if (width >= breakpoints.xl) return "xl"
    if (width >= breakpoints.lg) return "lg"
    if (width >= breakpoints.md) return "md"
    if (width >= breakpoints.sm) return "sm"
    return "xs"
}

/**
 * 检测触摸设备
 */
export function useIsTouchDevice() {
    const [isTouch, setIsTouch] = useState(false)

    useEffect(() => {
        setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0)
    }, [])

    return isTouch
}

/**
 * 检测暗色模式偏好
 */
export function usePrefersDarkMode() {
    return useMediaQuery("(prefers-color-scheme: dark)")
}

/**
 * 检测减少动画偏好
 */
export function usePrefersReducedMotion() {
    return useMediaQuery("(prefers-reduced-motion: reduce)")
}
