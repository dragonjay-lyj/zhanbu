import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase/client"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * 八字排盘 API
 */

// POST: 创建八字记录
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId } = await auth()

        const {
            name,
            gender,
            birthYear,
            birthMonth,
            birthDay,
            birthHour,
            birthMinute = 0,
            isLunar = false,
            useTrueSolar = true,
            birthProvince,
            birthCity,
        } = body

        // 验证必填字段
        if (!birthYear || !birthMonth || !birthDay || birthHour === undefined) {
            return NextResponse.json(
                { error: "缺少必填的出生信息" },
                { status: 400 }
            )
        }

        // 计算八字（这里使用简化算法，实际需要专业库）
        const baziResult = calculateBazi({
            birthYear,
            birthMonth,
            birthDay,
            birthHour,
            birthMinute,
            isLunar,
            useTrueSolar,
        })

        // 获取用户 ID（如果已登录）
        let dbUserId = null
        if (userId) {
            const adminClient = await createAdminClient()
            const { data: user } = await adminClient
                .from("users")
                .select("id")
                .eq("clerk_id", userId)
                .single()

            if (user) {
                dbUserId = user.id
            }
        }

        // 保存记录
        const adminClient = await createAdminClient()
        const { data, error } = await adminClient
            .from("bazi_records")
            .insert({
                user_id: dbUserId,
                name,
                gender,
                birth_year: birthYear,
                birth_month: birthMonth,
                birth_day: birthDay,
                birth_hour: birthHour,
                birth_minute: birthMinute,
                is_lunar: isLunar,
                use_true_solar: useTrueSolar,
                birth_province: birthProvince,
                birth_city: birthCity,
                bazi_result: baziResult,
            })
            .select()
            .single()

        if (error) {
            console.error("Error saving bazi record:", error)
            return NextResponse.json(
                { error: "保存记录失败" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                id: data.id,
                baziResult,
            },
        })
    } catch (error) {
        console.error("Bazi API error:", error)
        return NextResponse.json(
            { error: "服务器错误" },
            { status: 500 }
        )
    }
}

// GET: 获取八字记录列表
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: "请先登录" },
                { status: 401 }
            )
        }

        const adminClient = await createAdminClient()

        // 获取用户 ID
        const { data: user } = await adminClient
            .from("users")
            .select("id")
            .eq("clerk_id", userId)
            .single()

        if (!user) {
            return NextResponse.json({ data: [] })
        }

        // 获取记录列表
        const { data, error } = await adminClient
            .from("bazi_records")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20)

        if (error) {
            console.error("Error fetching bazi records:", error)
            return NextResponse.json(
                { error: "获取记录失败" },
                { status: 500 }
            )
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error("Bazi API error:", error)
        return NextResponse.json(
            { error: "服务器错误" },
            { status: 500 }
        )
    }
}

// ========================
// 八字计算函数
// ========================

// 天干
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

// 地支
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

// 天干五行
const GAN_WUXING: Record<string, string> = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
}

// 地支五行
const ZHI_WUXING: Record<string, string> = {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
}

// 地支藏干
const ZHI_CANG_GAN: Record<string, string[]> = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "庚", "戊"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"],
}

interface BaziInput {
    birthYear: number
    birthMonth: number
    birthDay: number
    birthHour: number
    birthMinute: number
    isLunar: boolean
    useTrueSolar: boolean
}

function calculateBazi(input: BaziInput) {
    const { birthYear, birthMonth, birthDay, birthHour } = input

    // 计算年柱（简化算法）
    // 实际需要考虑立春节气
    const yearGanIndex = (birthYear - 4) % 10
    const yearZhiIndex = (birthYear - 4) % 12

    // 计算月柱（简化算法）
    // 月干 = 年干 * 2 + 月支 - 1 (mod 10)
    // 月支 = 农历月份对应的地支
    const monthZhiIndex = (birthMonth + 1) % 12
    const monthGanIndex = (yearGanIndex * 2 + birthMonth) % 10

    // 计算日柱（简化算法）
    // 实际需要使用万年历数据
    const dayGanIndex = (birthYear * 5 + Math.floor(birthYear / 4) + birthDay +
        Math.floor((birthMonth - 1) * 30.6 + 0.5)) % 10
    const dayZhiIndex = (birthYear * 5 + Math.floor(birthYear / 4) + birthDay +
        Math.floor((birthMonth - 1) * 30.6 + 0.5) + 10) % 12

    // 计算时柱
    const hourZhiIndex = Math.floor((birthHour + 1) / 2) % 12
    const hourGanIndex = (dayGanIndex * 2 + hourZhiIndex) % 10

    // 构建四柱
    const pillars = {
        year: { gan: TIAN_GAN[yearGanIndex], zhi: DI_ZHI[yearZhiIndex] },
        month: { gan: TIAN_GAN[monthGanIndex], zhi: DI_ZHI[monthZhiIndex] },
        day: { gan: TIAN_GAN[dayGanIndex], zhi: DI_ZHI[dayZhiIndex] },
        hour: { gan: TIAN_GAN[hourGanIndex], zhi: DI_ZHI[hourZhiIndex] },
    }

    // 计算五行分布
    const wuxingCount: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }

    // 统计天干五行
    Object.values(pillars).forEach((pillar) => {
        wuxingCount[GAN_WUXING[pillar.gan]]++
        wuxingCount[ZHI_WUXING[pillar.zhi]]++
    })

    // 统计地支藏干
    Object.values(pillars).forEach((pillar) => {
        ZHI_CANG_GAN[pillar.zhi].forEach((gan, index) => {
            // 本气权重高，中气和余气权重低
            const weight = index === 0 ? 0.6 : index === 1 ? 0.3 : 0.1
            wuxingCount[GAN_WUXING[gan]] += weight
        })
    })

    // 日主
    const dayMaster = pillars.day.gan
    const dayMasterElement = GAN_WUXING[dayMaster]

    // 判断日主强弱（简化版）
    const sameElement = wuxingCount[dayMasterElement]
    const supportingElement = getSupporting(dayMasterElement)
    const totalSupport = sameElement + (supportingElement ? wuxingCount[supportingElement] : 0)
    const dayMasterStrength = totalSupport > 4 ? "strong" : totalSupport < 2 ? "weak" : "balanced"

    return {
        pillars,
        wuxing: Object.fromEntries(
            Object.entries(wuxingCount).map(([k, v]) => [k, Math.round(v * 10) / 10])
        ),
        dayMaster,
        dayMasterElement,
        dayMasterStrength,
        hiddenStems: {
            year: ZHI_CANG_GAN[pillars.year.zhi],
            month: ZHI_CANG_GAN[pillars.month.zhi],
            day: ZHI_CANG_GAN[pillars.day.zhi],
            hour: ZHI_CANG_GAN[pillars.hour.zhi],
        },
    }
}

// 获取生扶的五行
function getSupporting(element: string): string | null {
    const supporting: Record<string, string> = {
        木: "水", 火: "木", 土: "火", 金: "土", 水: "金",
    }
    return supporting[element] || null
}
