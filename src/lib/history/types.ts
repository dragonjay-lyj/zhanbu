export const FORTUNE_TYPES = [
    "bazi",
    "ziwei",
    "liuyao",
    "meihua",
    "tarot",
    "marriage",
    "daily",
    "name",
    "zodiac",
    "shengxiao",
    "liunian",
    "qianwen",
    "jiemeng",
    "zeji",
    "huangli",
    "ai_chat",
    "community_post",
    "qimen",
    "liuren",
    "jinkouque",
    "fengshui",
] as const

export type FortuneType = (typeof FORTUNE_TYPES)[number]

const FORTUNE_TYPE_SET = new Set<string>(FORTUNE_TYPES)

const TYPE_ALIASES: Record<string, FortuneType> = {
    relationship: "marriage",
    mother_in_law: "marriage",
    "in_law": "marriage",
    "in-law": "marriage",
    parent_child: "marriage",
    business: "marriage",
    friendship: "marriage",
    workplace: "marriage",
}

export function isFortuneType(value: string): value is FortuneType {
    return FORTUNE_TYPE_SET.has(value)
}

export function normalizeFortuneType(rawType: string): FortuneType | null {
    const normalized = rawType.trim().toLowerCase().replace(/-/g, "_")
    if (!normalized) return null

    if (isFortuneType(normalized)) {
        return normalized
    }

    return TYPE_ALIASES[normalized] || null
}
