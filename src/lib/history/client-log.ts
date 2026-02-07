import type { FortuneType } from "./types"

export interface ClientFortuneLogPayload {
    type: FortuneType
    title?: string
    summary?: string
    recordId?: string
    meta?: Record<string, unknown>
    occurredAt?: string
}

/**
 * 客户端历史记录上报（静默失败，不影响主流程）
 */
export async function logFortuneClient(payload: ClientFortuneLogPayload): Promise<void> {
    try {
        await fetch("/api/fortune/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true,
        })
    } catch {
        // keep silent
    }
}
