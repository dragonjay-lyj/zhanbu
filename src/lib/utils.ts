import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并 Tailwind CSS 类名
 * 使用 clsx 处理条件类名，使用 tailwind-merge 处理冲突
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 格式化日期为中文格式
 */
export function formatDateCN(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

/**
 * 格式化农历日期
 */
export function formatLunarDate(date: Date): string {
    return new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

/**
 * 获取中国时辰
 */
export function getChineseHour(hour: number): string {
    const hours = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    // 每个时辰对应两个小时，从23点开始是子时
    const index = Math.floor(((hour + 1) % 24) / 2)
    return hours[index] + '时'
}

/**
 * 天干
 */
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

/**
 * 地支
 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

/**
 * 五行
 */
export const WU_XING = ['金', '木', '水', '火', '土'] as const

/**
 * 十神
 */
export const SHI_SHEN = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'] as const

/**
 * 紫微十四主星
 */
export const ZIWEI_STARS = [
    '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府',
    '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
] as const

/**
 * 紫微十二宫
 */
export const ZIWEI_PALACES = [
    '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
    '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫'
] as const

/**
 * 八卦
 */
export const BA_GUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'] as const

/**
 * 六十四卦名称
 */
export const GUA_NAMES = [
    '乾为天', '坤为地', '水雷屯', '山水蒙', '水天需', '天水讼', '地水师', '水地比',
    // ... 其余卦名待补充
] as const

/**
 * 生成唯一 ID
 */
export function generateId(): string {
    return crypto.randomUUID()
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 安全 JSON 解析
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T
    } catch {
        return fallback
    }
}
