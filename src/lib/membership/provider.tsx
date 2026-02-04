"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useUser } from "@clerk/nextjs"

interface MembershipPlan {
    id: string
    name: string
    description: string
    price: number
    original_price: number | null
    period: string
    duration_days: number
    daily_quota: number
    features: string[]
}

interface MembershipInfo {
    isPremium: boolean
    planId: string
    planName: string
    expiresAt: string | null
    dailyQuota: number | string
    usedQuota: number
    remainingQuota: number | string
    features: string[]
}

interface MembershipContextType {
    membership: MembershipInfo | null
    plans: MembershipPlan[]
    paymentUrl: string | null
    isLoading: boolean
    error: string | null
    refreshMembership: () => Promise<void>
    useQuota: () => Promise<{ success: boolean; remaining: number | string }>
}

const defaultMembership: MembershipInfo = {
    isPremium: false,
    planId: "free",
    planName: "免费版",
    expiresAt: null,
    dailyQuota: 3,
    usedQuota: 0,
    remainingQuota: 3,
    features: [],
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined)

interface MembershipProviderProps {
    children: ReactNode
}

export function MembershipProvider({ children }: MembershipProviderProps) {
    const { user, isLoaded } = useUser()
    const [membership, setMembership] = useState<MembershipInfo | null>(null)
    const [plans, setPlans] = useState<MembershipPlan[]>([])
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 获取会员信息
    const refreshMembership = useCallback(async () => {
        if (!user) {
            setMembership(defaultMembership)
            setIsLoading(false)
            return
        }

        try {
            setError(null)
            const response = await fetch("/api/membership")
            const data = await response.json()

            if (data.success) {
                setMembership(data.data)
            } else {
                setError(data.error)
                setMembership(defaultMembership)
            }
        } catch (err) {
            console.error("获取会员信息失败:", err)
            setError("获取会员信息失败")
            setMembership(defaultMembership)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // 获取套餐列表
    const fetchPlans = useCallback(async () => {
        try {
            const response = await fetch("/api/membership/plans")
            const data = await response.json()

            if (data.success) {
                setPlans(data.data.plans || [])
                setPaymentUrl(data.data.paymentUrl)
            }
        } catch (err) {
            console.error("获取套餐列表失败:", err)
        }
    }, [])

    // 使用配额
    const useQuota = async (): Promise<{ success: boolean; remaining: number | string }> => {
        if (!user) {
            return { success: false, remaining: 0 }
        }

        try {
            const response = await fetch("/api/membership", { method: "POST" })
            const data = await response.json()

            if (data.success) {
                // 刷新会员信息
                await refreshMembership()
                return { success: true, remaining: data.remaining }
            } else {
                return { success: false, remaining: data.remaining ?? 0 }
            }
        } catch (err) {
            console.error("使用配额失败:", err)
            return { success: false, remaining: 0 }
        }
    }

    useEffect(() => {
        if (isLoaded) {
            refreshMembership()
            fetchPlans()
        }
    }, [isLoaded, refreshMembership, fetchPlans])

    return (
        <MembershipContext.Provider
            value={{
                membership,
                plans,
                paymentUrl,
                isLoading,
                error,
                refreshMembership,
                useQuota,
            }}
        >
            {children}
        </MembershipContext.Provider>
    )
}

export function useMembership() {
    const context = useContext(MembershipContext)
    if (!context) {
        throw new Error("useMembership must be used within a MembershipProvider")
    }
    return context
}
