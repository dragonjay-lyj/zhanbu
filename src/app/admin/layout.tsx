import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 检查用户登录状态
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    // 检查用户是否为管理员
    const supabase = await createServerClient()
    const { data: user, error } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", userId)
        .single()

    if (error || !user || user.role !== "admin") {
        // 非管理员用户，重定向到首页
        redirect("/?error=unauthorized")
    }

    return <>{children}</>
}
