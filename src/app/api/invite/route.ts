import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

/**
 * 邀请返利 API
 */

// 生成邀请码
function generateInviteCode(userId: string): string {
    const base = userId.slice(-6).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ZB${base}${random}`
}

// 获取邀请信息
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const supabase = await createServerClient()

        // 获取用户邀请码
        let { data: invite, error } = await supabase
            .from("user_invites")
            .select("*")
            .eq("user_id", userId)
            .single()

        // 如果没有邀请码，创建一个
        if (!invite) {
            const code = generateInviteCode(userId)
            const { data: newInvite, error: createError } = await supabase
                .from("user_invites")
                .insert({
                    user_id: userId,
                    invite_code: code,
                    total_invites: 0,
                    earned_credits: 0,
                })
                .select()
                .single()

            if (createError) {
                // 返回模拟数据
                invite = {
                    invite_code: generateInviteCode(userId),
                    total_invites: 0,
                    earned_credits: 0,
                }
            } else {
                invite = newInvite
            }
        }

        // 获取邀请记录
        const { data: inviteRecords } = await supabase
            .from("invite_records")
            .select("*")
            .eq("inviter_id", userId)
            .order("created_at", { ascending: false })
            .limit(10)

        return NextResponse.json({
            success: true,
            data: {
                inviteCode: invite.invite_code,
                inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${invite.invite_code}`,
                stats: {
                    totalInvites: invite.total_invites || 0,
                    earnedCredits: invite.earned_credits || 0,
                },
                rewards: {
                    perInvite: 5, // 每邀请一人获得5次占卜
                    maxReward: 100, // 最高奖励100次
                },
                records: inviteRecords || [],
            },
        })
    } catch (error) {
        console.error("邀请 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 验证邀请码并记录
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        const { inviteCode } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        if (!inviteCode) {
            return NextResponse.json({ error: "邀请码不能为空" }, { status: 400 })
        }

        const supabase = await createServerClient()

        // 查找邀请码对应的用户
        const { data: inviter, error } = await supabase
            .from("user_invites")
            .select("*")
            .eq("invite_code", inviteCode.toUpperCase())
            .single()

        if (error || !inviter) {
            return NextResponse.json({ error: "无效的邀请码" }, { status: 400 })
        }

        // 不能邀请自己
        if (inviter.user_id === userId) {
            return NextResponse.json({ error: "不能使用自己的邀请码" }, { status: 400 })
        }

        // 检查是否已被邀请过
        const { data: existing } = await supabase
            .from("invite_records")
            .select("id")
            .eq("invitee_id", userId)
            .single()

        if (existing) {
            return NextResponse.json({ error: "您已被邀请注册" }, { status: 400 })
        }

        // 记录邀请
        await supabase.from("invite_records").insert({
            inviter_id: inviter.user_id,
            invitee_id: userId,
            invite_code: inviteCode.toUpperCase(),
        })

        // 更新邀请者统计
        await supabase
            .from("user_invites")
            .update({
                total_invites: (inviter.total_invites || 0) + 1,
                earned_credits: (inviter.earned_credits || 0) + 5,
            })
            .eq("user_id", inviter.user_id)

        // 给邀请者增加占卜次数
        await supabase.rpc("add_divination_credits", {
            p_user_id: inviter.user_id,
            p_amount: 5,
            p_reason: `邀请新用户注册`,
        })

        return NextResponse.json({
            success: true,
            message: "邀请码验证成功！",
        })
    } catch (error) {
        console.error("验证邀请码错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
