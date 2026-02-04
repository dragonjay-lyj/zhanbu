import { createServerClient } from "@/lib/supabase/server"

export async function getDbUserIdByClerkId(clerkId: string): Promise<string | null> {
    try {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", clerkId)
            .single()

        if (error || !data?.id) {
            return null
        }

        return data.id
    } catch {
        return null
    }
}
