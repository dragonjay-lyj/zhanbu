"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useUser } from "@clerk/nextjs"

interface CreditInfo {
    balance: number
    totalEarned: number
    totalSpent: number
}

interface CreditPackage {
    id: string
    name: string
    credits: number
    price: number
    bonusCredits: number
    isPopular: boolean
}

interface CreditRule {
    action: string
    cost: number
    description: string
}

interface CreditsContextType {
    credits: CreditInfo | null
    packages: CreditPackage[]
    rules: CreditRule[]
    isLoading: boolean
    error: string | null
    refreshCredits: () => Promise<void>
    useCredits: (action: string, referenceId?: string) => Promise<{ success: boolean; balance: number; message?: string }>
    addCredits: (amount: number, type: string, description?: string) => Promise<{ success: boolean; balance: number }>
}

const defaultCredits: CreditInfo = {
    balance: 0,
    totalEarned: 0,
    totalSpent: 0,
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

interface CreditsProviderProps {
    children: ReactNode
}

export function CreditsProvider({ children }: CreditsProviderProps) {
    const { user, isLoaded } = useUser()
    const [credits, setCredits] = useState<CreditInfo | null>(null)
    const [packages, setPackages] = useState<CreditPackage[]>([])
    const [rules, setRules] = useState<CreditRule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // 获取积分信息
    const refreshCredits = useCallback(async () => {
        if (!user) {
            setCredits(defaultCredits)
            setIsLoading(false)
            return
        }

        try {
            setError(null)
            const response = await fetch("/api/credits")
            const data = await response.json()

            if (data.success) {
                setCredits(data.data.credits)
                setPackages(data.data.packages || [])
                setRules(data.data.rules || [])
            } else {
                setError(data.error)
                setCredits(defaultCredits)
            }
        } catch (err) {
            console.error("获取积分信息失败:", err)
            setError("获取积分信息失败")
            setCredits(defaultCredits)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // 消费积分
    const useCredits = async (action: string, referenceId?: string): Promise<{ success: boolean; balance: number; message?: string }> => {
        if (!user) {
            return { success: false, balance: 0, message: "请先登录" }
        }

        try {
            const response = await fetch("/api/credits/consume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, referenceId }),
            })
            const data = await response.json()

            if (data.success) {
                await refreshCredits()
                return { success: true, balance: data.balance }
            } else {
                return { success: false, balance: data.balance ?? 0, message: data.error }
            }
        } catch (err) {
            console.error("消费积分失败:", err)
            return { success: false, balance: 0, message: "网络错误" }
        }
    }

    // 添加积分（签到、邀请等）
    const addCredits = async (amount: number, type: string, description?: string): Promise<{ success: boolean; balance: number }> => {
        if (!user) {
            return { success: false, balance: 0 }
        }

        try {
            const response = await fetch("/api/credits/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, type, description }),
            })
            const data = await response.json()

            if (data.success) {
                await refreshCredits()
                return { success: true, balance: data.balance }
            } else {
                return { success: false, balance: data.balance ?? 0 }
            }
        } catch (err) {
            console.error("添加积分失败:", err)
            return { success: false, balance: 0 }
        }
    }

    useEffect(() => {
        if (isLoaded) {
            refreshCredits()
        }
    }, [isLoaded, refreshCredits])

    return (
        <CreditsContext.Provider
            value={{
                credits,
                packages,
                rules,
                isLoading,
                error,
                refreshCredits,
                useCredits,
                addCredits,
            }}
        >
            {children}
        </CreditsContext.Provider>
    )
}

export function useCredits() {
    const context = useContext(CreditsContext)
    if (!context) {
        throw new Error("useCredits must be used within a CreditsProvider")
    }
    return context
}

// 可选的 hook，不抛出错误（用于可选显示积分的地方）
export function useCreditsOptional() {
    return useContext(CreditsContext)
}
