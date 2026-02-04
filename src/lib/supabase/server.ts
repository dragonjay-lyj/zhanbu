import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * 创建服务端 Supabase 客户端（使用 Service Role Key）
 * 绕过 RLS 限制，用于管理员操作
 */
export async function createServerClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
        },
    })
}

/**
 * 别名：createAdminClient = createServerClient
 * 用于需要管理员权限的操作
 */
export async function createAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
        },
    })
}

/**
 * 创建普通客户端（使用 anon key，受 RLS 限制）
 */
export async function createServerAnonClient() {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    return createClient(supabaseUrl, anonKey)
}
