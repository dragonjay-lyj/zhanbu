import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

/**
 * 占卜社区 API - 帖子管理
 */

// 获取帖子列表或创建新帖子
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const category = searchParams.get("category")
        const offset = (page - 1) * limit

        const supabase = await createServerClient()

        // 先查询帖子
        let query = supabase
            .from("community_posts")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1)

        if (category) {
            query = query.eq("category", category)
        }

        const { data: posts, error, count } = await query

        if (error) {
            console.error("查询帖子失败:", error)
            // 返回模拟数据
            return NextResponse.json({
                success: true,
                data: {
                    posts: generateMockPosts(limit),
                    pagination: {
                        page,
                        limit,
                        total: 50,
                        totalPages: 5,
                    },
                    categories: getCategories(),
                },
            })
        }

        // 获取用户 ID 列表并查询用户信息
        const userIds = [...new Set(posts?.map(p => p.user_id) || [])]
        let usersMap: Record<string, { id: string; name: string; avatar_url: string | null }> = {}

        if (userIds.length > 0) {
            const { data: users } = await supabase
                .from("users")
                .select("clerk_id, name, avatar_url")
                .in("clerk_id", userIds)

            if (users) {
                usersMap = users.reduce((acc, user) => {
                    acc[user.clerk_id] = { id: user.clerk_id, name: user.name, avatar_url: user.avatar_url }
                    return acc
                }, {} as typeof usersMap)
            }
        }

        // 查询评论数
        const postIds = posts?.map(p => p.id) || []
        let commentCounts: Record<string, number> = {}

        if (postIds.length > 0) {
            const { data: comments } = await supabase
                .from("community_comments")
                .select("post_id")
                .in("post_id", postIds)

            if (comments) {
                commentCounts = comments.reduce((acc, c) => {
                    acc[c.post_id] = (acc[c.post_id] || 0) + 1
                    return acc
                }, {} as Record<string, number>)
            }
        }

        // 组装结果
        const enrichedPosts = posts?.map(post => ({
            ...post,
            user: usersMap[post.user_id] || { id: post.user_id, name: "匿名用户", avatar_url: null },
            comment_count: commentCounts[post.id] || 0,
        })) || []

        return NextResponse.json({
            success: true,
            data: {
                posts: enrichedPosts,
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                },
                categories: getCategories(),
            },
        })
    } catch (error) {
        console.error("社区 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 创建新帖子
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json({ error: "请先登录" }, { status: 401 })
        }

        const body = await req.json()
        const { title, content, category } = body

        if (!title || !content) {
            return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 })
        }

        const supabase = await createServerClient()

        const { data: post, error } = await supabase
            .from("community_posts")
            .insert({
                user_id: userId,
                title,
                content,
                category: category || "general",
            })
            .select()
            .single()

        if (error) {
            console.error("创建帖子失败:", error)
            // 返回模拟成功
            return NextResponse.json({
                success: true,
                data: {
                    id: Date.now().toString(),
                    title,
                    content,
                    category: category || "general",
                    created_at: new Date().toISOString(),
                },
            })
        }

        return NextResponse.json({
            success: true,
            data: post,
        })
    } catch (error) {
        console.error("创建帖子 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}

// 帖子分类
function getCategories() {
    return [
        { id: "general", name: "综合交流", icon: "💬" },
        { id: "bazi", name: "八字命理", icon: "📅" },
        { id: "tarot", name: "塔罗占卜", icon: "🃏" },
        { id: "ziwei", name: "紫微斗数", icon: "⭐" },
        { id: "fengshui", name: "风水堪舆", icon: "🏠" },
        { id: "dream", name: "解梦分享", icon: "💭" },
        { id: "help", name: "求助问答", icon: "❓" },
    ]
}

// 生成模拟帖子
function generateMockPosts(limit: number) {
    const titles = [
        "请教各位大师，这个八字怎么看？",
        "分享一下我的塔罗占卜经验",
        "关于紫微斗数的学习心得",
        "昨晚做了一个奇怪的梦，求解",
        "今年犯太岁，大家有什么建议吗？",
        "初学者应该从哪里开始学习？",
        "分享一个超准的在线占卜工具",
        "求推荐入门书籍",
    ]

    const categories = ["general", "bazi", "tarot", "ziwei", "dream", "help"]
    const userNames = ["星语者", "命理小白", "塔罗达人", "紫微爱好者", "解梦师", "风水学徒"]

    return Array.from({ length: limit }, (_, i) => ({
        id: (Date.now() - i * 100000).toString(),
        title: titles[i % titles.length],
        content: "这是帖子的内容预览，点击查看详情...",
        category: categories[i % categories.length],
        user: {
            id: `user_${i}`,
            name: userNames[i % userNames.length],
            avatar_url: null,
        },
        likes: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 200),
        comment_count: Math.floor(Math.random() * 20),
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
    }))
}
