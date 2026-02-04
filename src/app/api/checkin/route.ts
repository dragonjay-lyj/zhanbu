import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

/**
 * 每日签到 API
 */

// 签到奖励配置
const REWARDS = {
    daily: 1,           // 每日签到获得1次
    streak3: 2,         // 连续3天额外奖励
    streak7: 5,         // 连续7天额外奖励
    streak30: 15,       // 连续30天额外奖励
}

// 获取签到状态
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const supabase = await createServerClient()
        const today = new Date().toISOString().split("T")[0]

        // 获取用户签到记录
        const { data: signInData, error } = await supabase
            .from("user_checkins")
            .select("*")
            .eq("user_id", userId)
            .single()

        if (error || !signInData) {
            // 新用户，返回初始状态
            return NextResponse.json({
                success: true,
                data: {
                    hasCheckedIn: false,
                    streak: 0,
                    totalCheckIns: 0,
                    todayReward: REWARDS.daily,
                    lastCheckIn: null,
                    calendar: [],
                },
            })
        }

        // 检查今日是否已签到
        const hasCheckedIn = signInData.last_checkin === today

        // 获取本月签到日历
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { data: monthlyRecords } = await supabase
            .from("checkin_records")
            .select("checkin_date")
            .eq("user_id", userId)
            .gte("checkin_date", startOfMonth.toISOString().split("T")[0])
            .order("checkin_date", { ascending: true })

        return NextResponse.json({
            success: true,
            data: {
                hasCheckedIn,
                streak: signInData.current_streak || 0,
                totalCheckIns: signInData.total_checkins || 0,
                todayReward: calculateTodayReward(signInData.current_streak || 0),
                lastCheckIn: signInData.last_checkin,
                calendar: monthlyRecords?.map(r => r.checkin_date) || [],
            },
        })
    } catch (error) {
        console.error("签到状态 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 执行签到
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const supabase = await createServerClient()
        const today = new Date().toISOString().split("T")[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

        // 获取用户签到记录
        let { data: signInData, error } = await supabase
            .from("user_checkins")
            .select("*")
            .eq("user_id", userId)
            .single()

        // 检查是否已签到
        if (signInData?.last_checkin === today) {
            return NextResponse.json({ error: "今日已签到" }, { status: 400 })
        }

        // 计算连续天数
        let newStreak = 1
        if (signInData?.last_checkin === yesterday) {
            newStreak = (signInData.current_streak || 0) + 1
        }

        // 计算奖励
        const reward = calculateTodayReward(newStreak - 1)
        const bonusReward = getStreakBonus(newStreak)
        const totalReward = reward + bonusReward

        if (!signInData) {
            // 创建新记录
            await supabase.from("user_checkins").insert({
                user_id: userId,
                last_checkin: today,
                current_streak: newStreak,
                total_checkins: 1,
                total_earned: totalReward,
            })
        } else {
            // 更新记录
            await supabase
                .from("user_checkins")
                .update({
                    last_checkin: today,
                    current_streak: newStreak,
                    total_checkins: (signInData.total_checkins || 0) + 1,
                    total_earned: (signInData.total_earned || 0) + totalReward,
                })
                .eq("user_id", userId)
        }

        // 记录签到日期
        await supabase.from("checkin_records").insert({
            user_id: userId,
            checkin_date: today,
            reward: totalReward,
        })

        // 增加用户占卜次数
        await supabase.rpc("add_divination_credits", {
            p_user_id: userId,
            p_amount: totalReward,
            p_reason: `每日签到${bonusReward > 0 ? ` + 连续${newStreak}天奖励` : ""}`,
        })

        return NextResponse.json({
            success: true,
            data: {
                reward: totalReward,
                baseReward: reward,
                bonusReward,
                streak: newStreak,
                message: bonusReward > 0
                    ? `签到成功！连续${newStreak}天，获得${totalReward}次占卜！`
                    : `签到成功！获得${reward}次占卜！`,
            },
        })
    } catch (error) {
        console.error("签到 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 计算今日基础奖励
function calculateTodayReward(currentStreak: number): number {
    return REWARDS.daily
}

// 获取连续签到额外奖励
function getStreakBonus(streak: number): number {
    if (streak >= 30 && streak % 30 === 0) return REWARDS.streak30
    if (streak >= 7 && streak % 7 === 0) return REWARDS.streak7
    if (streak >= 3 && streak % 3 === 0) return REWARDS.streak3
    return 0
}
