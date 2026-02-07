import { getDbUserIdByClerkId } from "@/lib/auth/user"
import { createServerClient } from "@/lib/supabase/server"
import { normalizeFortuneType, type FortuneType } from "./types"

const MAX_TITLE_LENGTH = 120
const MAX_SUMMARY_LENGTH = 800

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const DEFAULT_TITLES: Record<FortuneType, string> = {
    bazi: "八字排盘",
    ziwei: "紫微斗数",
    liuyao: "六爻排盘",
    meihua: "梅花易数",
    tarot: "塔罗占卜",
    marriage: "关系分析",
    daily: "每日运势",
    name: "姓名测算",
    zodiac: "星座运势",
    shengxiao: "生肖运程",
    liunian: "流年运势",
    qianwen: "抽签占卜",
    jiemeng: "周公解梦",
    zeji: "择吉选日",
    huangli: "黄历查询",
    ai_chat: "AI 解读",
    community_post: "社区发帖",
    qimen: "奇门遁甲",
    liuren: "大六壬",
    jinkouque: "金口诀",
    fengshui: "玄空风水",
}

export interface LogFortuneInput {
    type: FortuneType | string
    title?: string | null
    summary?: string | null
    recordId?: string | null
    meta?: Record<string, unknown> | null
    occurredAt?: string | Date | null
    clerkUserId?: string | null
    dbUserId?: string | null
    strict?: boolean
}

export interface LogFortuneResult {
    ok: boolean
    skipped: boolean
    reason?:
        | "anonymous"
        | "user_not_synced"
        | "invalid_type"
        | "duplicate"
        | "error"
    id?: string
    error?: string
}

function truncateText(value: string | null | undefined, maxLength: number): string {
    const text = (value || "").trim()
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength)
}

function normalizeRecordId(recordId: string | null | undefined): string | null {
    const candidate = (recordId || "").trim()
    if (!candidate) return null
    return UUID_PATTERN.test(candidate) ? candidate : null
}

function resolveOccurredAt(occurredAt: string | Date | null | undefined): string {
    if (!occurredAt) return new Date().toISOString()
    const date = occurredAt instanceof Date ? occurredAt : new Date(occurredAt)
    if (Number.isNaN(date.getTime())) return new Date().toISOString()
    return date.toISOString()
}

function buildSummary(
    summary: string | null | undefined,
    meta: Record<string, unknown> | null | undefined
): string {
    const summaryText = truncateText(summary, MAX_SUMMARY_LENGTH)
    if (!meta || Object.keys(meta).length === 0) {
        return summaryText
    }

    const metaText = JSON.stringify(meta)
    const merged = summaryText ? `${summaryText} | ${metaText}` : metaText
    return truncateText(merged, MAX_SUMMARY_LENGTH)
}

export async function logFortune(input: LogFortuneInput): Promise<LogFortuneResult> {
    const type = normalizeFortuneType(String(input.type || ""))
    if (!type) {
        return {
            ok: false,
            skipped: true,
            reason: "invalid_type",
            error: "Invalid fortune type",
        }
    }

    let dbUserId = input.dbUserId || null
    if (!dbUserId && input.clerkUserId) {
        dbUserId = await getDbUserIdByClerkId(input.clerkUserId)
    }

    if (!dbUserId) {
        if (input.strict && input.clerkUserId) {
            return {
                ok: false,
                skipped: true,
                reason: "user_not_synced",
                error: "User not synced to users table",
            }
        }
        return {
            ok: true,
            skipped: true,
            reason: input.clerkUserId ? "user_not_synced" : "anonymous",
        }
    }

    const supabase = await createServerClient()
    const recordId = normalizeRecordId(input.recordId)
    const title = truncateText(input.title, MAX_TITLE_LENGTH) || DEFAULT_TITLES[type]
    const summary = buildSummary(input.summary, input.meta)
    const createdAt = resolveOccurredAt(input.occurredAt)

    try {
        if (recordId) {
            const { data: existing, error: existingError } = await supabase
                .from("fortunes")
                .select("id")
                .eq("user_id", dbUserId)
                .eq("fortune_type", type)
                .eq("record_id", recordId)
                .limit(1)

            if (existingError) {
                if (input.strict) {
                    return {
                        ok: false,
                        skipped: true,
                        reason: "error",
                        error: existingError.message,
                    }
                }
                console.error("History dedupe query failed:", existingError)
            } else if (existing && existing.length > 0) {
                return {
                    ok: true,
                    skipped: true,
                    reason: "duplicate",
                    id: existing[0].id,
                }
            }
        }

        const { data, error } = await supabase
            .from("fortunes")
            .insert({
                user_id: dbUserId,
                fortune_type: type,
                record_id: recordId,
                title,
                summary: summary || null,
                created_at: createdAt,
                updated_at: new Date().toISOString(),
            })
            .select("id")
            .single()

        if (error) {
            return {
                ok: false,
                skipped: false,
                reason: "error",
                error: error.message,
            }
        }

        return {
            ok: true,
            skipped: false,
            id: data?.id,
        }
    } catch (error) {
        return {
            ok: false,
            skipped: false,
            reason: "error",
            error: error instanceof Error ? error.message : "Unknown history log error",
        }
    }
}
