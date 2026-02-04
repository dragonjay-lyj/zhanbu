import { NextRequest, NextResponse } from "next/server"
import { Webhook } from "svix"
import { WebhookEvent } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * Clerk Webhook 处理
 * 用于同步 Clerk 用户到 Supabase
 */
export async function POST(req: NextRequest) {
    // 获取 Webhook 密钥
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        console.error("Missing CLERK_WEBHOOK_SECRET")
        return new NextResponse("Missing webhook secret", { status: 500 })
    }

    // 获取请求头
    const svix_id = req.headers.get("svix-id")
    const svix_timestamp = req.headers.get("svix-timestamp")
    const svix_signature = req.headers.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new NextResponse("Missing svix headers", { status: 400 })
    }

    // 获取请求体
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // 验证 Webhook
    const wh = new Webhook(WEBHOOK_SECRET)
    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error("Webhook verification failed:", err)
        return new NextResponse("Webhook verification failed", { status: 400 })
    }

    // 处理事件
    const eventType = evt.type
    const supabase = await createAdminClient()

    try {
        switch (eventType) {
            case "user.created":
            case "user.updated": {
                const { id, email_addresses, first_name, last_name, image_url } = evt.data

                const email = email_addresses?.[0]?.email_address
                const name = [first_name, last_name].filter(Boolean).join(" ") || null

                const { error } = await supabase
                    .from("users")
                    .upsert(
                        {
                            clerk_id: id,
                            email,
                            name,
                            avatar_url: image_url,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: "clerk_id" }
                    )

                if (error) {
                    console.error("Error upserting user:", error)
                    return new NextResponse("Database error", { status: 500 })
                }

                // 新用户注册时赠送初始积分
                if (eventType === "user.created") {
                    const INITIAL_CREDITS = 100

                    // 检查是否已有积分记录
                    const { data: existingCredits } = await supabase
                        .from("user_credits")
                        .select("id")
                        .eq("user_id", id)
                        .single()

                    if (!existingCredits) {
                        // 创建积分记录
                        await supabase.from("user_credits").insert({
                            user_id: id,
                            balance: INITIAL_CREDITS,
                            total_earned: INITIAL_CREDITS,
                            total_spent: 0,
                        })

                        // 记录交易
                        await supabase.from("credit_transactions").insert({
                            user_id: id,
                            amount: INITIAL_CREDITS,
                            balance_after: INITIAL_CREDITS,
                            type: "reward",
                            description: "新用户注册奖励",
                        })

                        console.log(`Initial credits granted to new user: ${id}`)
                    }
                }

                console.log(`User ${eventType === "user.created" ? "created" : "updated"}: ${id}`)
                break
            }

            case "user.deleted": {
                const { id } = evt.data

                if (id) {
                    const { error } = await supabase
                        .from("users")
                        .delete()
                        .eq("clerk_id", id)

                    if (error) {
                        console.error("Error deleting user:", error)
                        return new NextResponse("Database error", { status: 500 })
                    }

                    console.log(`User deleted: ${id}`)
                }
                break
            }

            default:
                console.log(`Unhandled event type: ${eventType}`)
        }

        return new NextResponse("Webhook processed", { status: 200 })
    } catch (error) {
        console.error("Webhook processing error:", error)
        return new NextResponse("Internal server error", { status: 500 })
    }
}
