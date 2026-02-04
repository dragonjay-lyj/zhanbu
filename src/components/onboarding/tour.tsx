"use client"

import { useEffect, useState, useCallback } from "react"
import { driver, Driver, DriveStep } from "driver.js"
import "driver.js/dist/driver.css"

// 首页引导步骤
const homePageSteps: DriveStep[] = [
    {
        element: "#sidebar-nav",
        popover: {
            title: "📚 功能导航",
            description: "这里是所有占卜功能的入口，包括八字、塔罗、紫微等多种占卜方式。",
            side: "right",
            align: "start",
        },
    },
    {
        element: "#feature-cards",
        popover: {
            title: "✨ 快捷入口",
            description: "点击这些卡片可以快速进入对应的占卜功能，开始您的命理探索之旅。",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: "#user-menu",
        popover: {
            title: "👤 个人中心",
            description: "登录后可以保存您的占卜记录，随时查看历史分析结果。",
            side: "bottom",
            align: "end",
        },
    },
    {
        element: "#membership-btn",
        popover: {
            title: "👑 会员升级",
            description: "升级会员可以解锁更多高级功能，享受无限次占卜服务和AI深度解读。",
            side: "left",
            align: "center",
        },
    },
]

// 占卜页面引导步骤
const divinationSteps: DriveStep[] = [
    {
        element: "#input-form",
        popover: {
            title: "📝 输入信息",
            description: "请在这里填写您的生辰八字或相关信息，系统将为您进行分析。",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: "#submit-btn",
        popover: {
            title: "🔮 开始占卜",
            description: "填写完信息后，点击此按钮开始占卜分析。",
            side: "top",
            align: "center",
        },
    },
    {
        element: "#result-area",
        popover: {
            title: "📊 结果展示",
            description: "分析结果将在这里展示，包括命理解读、运势预测等内容。",
            side: "top",
            align: "center",
        },
    },
]

// 引导配置
const defaultConfig = {
    showProgress: true,
    showButtons: ["next", "previous", "close"] as const,
    nextBtnText: "下一步",
    prevBtnText: "上一步",
    doneBtnText: "完成",
    progressText: "{{current}} / {{total}}",
    popoverClass: "driverjs-theme",
}

interface OnboardingTourProps {
    tourType?: "home" | "divination" | "custom"
    customSteps?: DriveStep[]
    autoStart?: boolean
    forceShow?: boolean
}

/**
 * 新用户引导组件
 */
export function OnboardingTour({
    tourType = "home",
    customSteps,
    autoStart = false,
    forceShow = false,
}: OnboardingTourProps) {
    const [driverObj, setDriverObj] = useState<Driver | null>(null)

    // 获取步骤
    const getSteps = useCallback(() => {
        if (customSteps) return customSteps
        switch (tourType) {
            case "home":
                return homePageSteps
            case "divination":
                return divinationSteps
            default:
                return homePageSteps
        }
    }, [tourType, customSteps])

    // 检查是否已经完成引导
    const hasCompletedTour = useCallback(() => {
        if (forceShow) return false
        if (typeof window === "undefined") return true
        return localStorage.getItem(`tour_completed_${tourType}`) === "true"
    }, [tourType, forceShow])

    // 标记引导已完成
    const markTourCompleted = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(`tour_completed_${tourType}`, "true")
        }
    }, [tourType])

    // 初始化 driver
    useEffect(() => {
        const driverInstance = driver({
            ...defaultConfig,
            steps: getSteps(),
            onDestroyStarted: () => {
                markTourCompleted()
                driverInstance.destroy()
            },
        })

        setDriverObj(driverInstance)

        // 自动启动
        if (autoStart && !hasCompletedTour()) {
            // 延迟启动，等待页面渲染完成
            const timer = setTimeout(() => {
                driverInstance.drive()
            }, 1000)
            return () => clearTimeout(timer)
        }

        return () => {
            driverInstance.destroy()
        }
    }, [autoStart, getSteps, hasCompletedTour, markTourCompleted])

    // 手动开始引导
    const startTour = useCallback(() => {
        if (driverObj) {
            driverObj.drive()
        }
    }, [driverObj])

    // 提供给外部的 API
    return null
}

/**
 * 使用引导的 Hook
 */
export function useOnboardingTour(tourType: string = "home") {
    const [hasCompleted, setHasCompleted] = useState(true)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const completed = localStorage.getItem(`tour_completed_${tourType}`) === "true"
            setHasCompleted(completed)
        }
    }, [tourType])

    const startTour = useCallback((steps: DriveStep[]) => {
        const driverInstance = driver({
            ...defaultConfig,
            steps,
            onDestroyStarted: () => {
                localStorage.setItem(`tour_completed_${tourType}`, "true")
                setHasCompleted(true)
                driverInstance.destroy()
            },
        })
        driverInstance.drive()
    }, [tourType])

    const resetTour = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(`tour_completed_${tourType}`)
            setHasCompleted(false)
        }
    }, [tourType])

    return { hasCompleted, startTour, resetTour }
}

// 导出预设步骤供外部使用
export { homePageSteps, divinationSteps }
