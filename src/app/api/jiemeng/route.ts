import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logFortune } from "@/lib/history/log-fortune"

/**
 * 周公解梦 API
 */

// 梦境分类
const dreamCategories = [
    { id: "people", name: "人物", icon: "👤", keywords: ["父母", "朋友", "陌生人", "明星", "老人", "小孩", "恋人"] },
    { id: "animals", name: "动物", icon: "🐾", keywords: ["蛇", "狗", "猫", "老鼠", "鱼", "鸟", "龙", "老虎", "蜘蛛"] },
    { id: "nature", name: "自然", icon: "🌳", keywords: ["水", "火", "山", "河", "雨", "雪", "地震", "洪水", "日月"] },
    { id: "objects", name: "物品", icon: "📦", keywords: ["钱", "房子", "车", "手机", "衣服", "食物", "刀", "血"] },
    { id: "actions", name: "行为", icon: "🏃", keywords: ["飞", "跑", "掉牙", "结婚", "死亡", "怀孕", "考试", "迷路"] },
    { id: "scenarios", name: "场景", icon: "🏠", keywords: ["学校", "公司", "医院", "坟墓", "厕所", "电梯", "楼梯"] },
]

// 梦境解析数据库
const dreamInterpretations: Record<string, { meaning: string; fortune: string; advice: string }> = {
    // 人物类
    "父母": { meaning: "梦见父母通常象征着内心对家庭的思念和依赖，也可能反映对权威的态度。", fortune: "吉，家庭和睦，有贵人相助。", advice: "多关心家人，保持联系。" },
    "朋友": { meaning: "梦见朋友代表人际关系和社交需求，可能是对友情的渴望或担忧。", fortune: "平，社交运势平稳。", advice: "珍惜友情，主动联络朋友。" },
    "陌生人": { meaning: "梦见陌生人可能象征自己未知的一面，或即将遇到的新机遇。", fortune: "吉凶参半，有变化。", advice: "保持开放心态，接受新事物。" },
    "明星": { meaning: "梦见明星反映内心的崇拜和理想追求，也可能是对名利的向往。", fortune: "平，梦想需脚踏实地。", advice: "树立现实目标，努力追求。" },
    "老人": { meaning: "梦见老人象征智慧和经验，可能是潜意识在寻求指引。", fortune: "吉，有长辈相助。", advice: "多听取长辈建议。" },
    "小孩": { meaning: "梦见小孩代表纯真和新开始，也可能是内心童真的表现。", fortune: "吉，有新开始。", advice: "保持童心，勇于尝试。" },
    "恋人": { meaning: "梦见恋人反映感情状态，可能是思念或担忧的表现。", fortune: "吉，感情运势好。", advice: "多沟通，增进感情。" },

    // 动物类
    "蛇": { meaning: "蛇在梦中通常象征智慧、诱惑或隐藏的危险。也可能代表医疗和康复。", fortune: "吉凶参半，需谨慎。", advice: "注意身边潜在的问题。" },
    "狗": { meaning: "梦见狗象征忠诚和友谊，也可能代表保护和警觉。", fortune: "吉，有贵人相助。", advice: "珍惜身边忠诚的朋友。" },
    "猫": { meaning: "猫在梦中代表独立和神秘，也可能暗示女性特质或直觉。", fortune: "平，注意小人。", advice: "相信直觉，保持警惕。" },
    "老鼠": { meaning: "梦见老鼠可能暗示担忧或小问题的困扰。", fortune: "凶，有小人作祟。", advice: "处理好细节问题。" },
    "鱼": { meaning: "鱼在梦中象征财富和机遇，也代表潜意识和情感。", fortune: "大吉，财运亨通。", advice: "把握机会，积极理财。" },
    "鸟": { meaning: "梦见鸟代表自由和理想，也可能是好消息的预兆。", fortune: "吉，有好消息。", advice: "追求自由，放飞理想。" },
    "龙": { meaning: "龙是吉祥的象征，代表权力、成功和好运。", fortune: "大吉，事业顺利。", advice: "抓住机遇，大展宏图。" },
    "老虎": { meaning: "老虎象征力量和权威，也可能代表内心的恐惧。", fortune: "吉凶参半，需勇气。", advice: "勇敢面对挑战。" },
    "蜘蛛": { meaning: "蜘蛛代表创造力和耐心，也可能暗示被困的感觉。", fortune: "平，需耐心等待。", advice: "耐心织网，静待时机。" },

    // 自然类
    "水": { meaning: "水象征情感和潜意识。清水代表清晰，浑水代表困惑。", fortune: "视情况而定。", advice: "关注内心情感状态。" },
    "火": { meaning: "火代表热情和变革，也可能是愤怒或危险的警示。", fortune: "吉凶参半，有变化。", advice: "控制情绪，谨慎行事。" },
    "山": { meaning: "山象征目标和障碍，登山表示克服困难。", fortune: "吉，努力会有回报。", advice: "坚持目标，勇攀高峰。" },
    "河": { meaning: "河流代表人生旅程和时间流逝。", fortune: "平，顺其自然。", advice: "随遇而安，顺势而为。" },
    "雨": { meaning: "雨象征清洗和重生，也可能代表忧愁。", fortune: "吉，烦恼消散。", advice: "释放负面情绪。" },
    "雪": { meaning: "雪代表纯洁和新开始，也可能暗示冷淡。", fortune: "吉，有新起点。", advice: "保持纯净心态。" },
    "地震": { meaning: "地震象征剧烈的变化和不稳定。", fortune: "凶，有变动。", advice: "做好应对变化的准备。" },
    "洪水": { meaning: "洪水代表情感的汹涌和失控。", fortune: "凶，情绪需控制。", advice: "冷静处理，避免冲动。" },
    "日月": { meaning: "太阳代表光明和成功，月亮代表阴性和直觉。", fortune: "大吉，前途光明。", advice: "阴阳平衡，把握时机。" },

    // 物品类
    "钱": { meaning: "梦见钱财通常与价值感和自我价值有关。", fortune: "吉，财运上升。", advice: "合理理财，开源节流。" },
    "房子": { meaning: "房子象征自我和内心状态，不同房间代表不同方面。", fortune: "吉，生活稳定。", advice: "关注内心建设。" },
    "车": { meaning: "车代表人生方向和控制力。", fortune: "平，注意方向。", advice: "把握人生方向。" },
    "手机": { meaning: "手机代表沟通和联系，也可能反映社交焦虑。", fortune: "平，注意沟通。", advice: "改善沟通方式。" },
    "衣服": { meaning: "衣服象征外在形象和自我表达。", fortune: "吉，魅力提升。", advice: "注意形象管理。" },
    "食物": { meaning: "食物代表需求和满足，也与情感滋养有关。", fortune: "吉，物质丰富。", advice: "照顾好身体需求。" },
    "刀": { meaning: "刀象征决断力和潜在攻击性。", fortune: "凶，有冲突。", advice: "避免争执，和平处事。" },
    "血": { meaning: "血代表生命力和激情，也可能暗示损失。", fortune: "凶，注意健康。", advice: "关注身体健康。" },

    // 行为类
    "飞": { meaning: "梦见飞翔象征自由和超越，也可能是逃避现实。", fortune: "吉，有突破。", advice: "追求更高目标。" },
    "跑": { meaning: "跑步可能表示追求目标或逃避问题。", fortune: "平，需努力。", advice: "面对问题，积极行动。" },
    "掉牙": { meaning: "掉牙通常与失去控制感或对衰老的恐惧有关。", fortune: "凶，有损失。", advice: "关注健康和安全。" },
    "结婚": { meaning: "梦见结婚象征新的开始和承诺。", fortune: "大吉，有喜事。", advice: "迎接新阶段。" },
    "死亡": { meaning: "死亡在梦中通常象征结束和重生，而非真正的死亡。", fortune: "吉，旧事结束。", advice: "放下过去，迎接新生。" },
    "怀孕": { meaning: "怀孕象征新计划或创造力的孕育。", fortune: "大吉，有新开始。", advice: "培育新想法。" },
    "考试": { meaning: "考试梦反映对能力的自我评估和压力。", fortune: "平，需准备。", advice: "做好准备，自信应对。" },
    "迷路": { meaning: "迷路代表人生方向的迷茫和困惑。", fortune: "凶，需指引。", advice: "寻求帮助，明确方向。" },

    // 场景类
    "学校": { meaning: "学校象征学习和成长，也可能是对过去的回忆。", fortune: "吉，有进步。", advice: "保持学习心态。" },
    "公司": { meaning: "公司代表事业和职业发展。", fortune: "平，注意工作。", advice: "专注事业发展。" },
    "医院": { meaning: "医院象征治愈和恢复，也可能是健康警示。", fortune: "平，注意健康。", advice: "关注身心健康。" },
    "坟墓": { meaning: "坟墓代表结束和埋葬的过去。", fortune: "吉凶参半，有结束。", advice: "放下过去的事物。" },
    "厕所": { meaning: "厕所象征释放和清洁，也与私密需求有关。", fortune: "吉，释放压力。", advice: "排解负面情绪。" },
    "电梯": { meaning: "电梯代表人生的起伏和变化。", fortune: "平，有变动。", advice: "适应变化，平稳心态。" },
    "楼梯": { meaning: "楼梯象征进步和努力的过程。", fortune: "吉，有进展。", advice: "一步一个脚印。" },
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const keyword = searchParams.get("keyword")

        // 返回分类列表
        if (!keyword) {
            return NextResponse.json({
                success: true,
                data: { categories: dreamCategories },
            })
        }

        const { userId } = await auth()

        // 搜索解梦
        const interpretation = dreamInterpretations[keyword]

        if (interpretation) {
            if (userId) {
                const logResult = await logFortune({
                    clerkUserId: userId,
                    type: "jiemeng",
                    title: `周公解梦 · ${keyword}`,
                    summary: interpretation.fortune,
                })
                if (!logResult.ok) {
                    console.error("解梦历史记录失败:", logResult.error)
                }
            }
            return NextResponse.json({
                success: true,
                data: {
                    keyword,
                    interpretation,
                    related: Object.keys(dreamInterpretations)
                        .filter(k => k !== keyword)
                        .slice(0, 6),
                },
            })
        }

        // 模糊匹配
        const matches = Object.keys(dreamInterpretations).filter(k =>
            k.includes(keyword) || keyword.includes(k)
        )

        if (matches.length > 0) {
            if (userId) {
                const logResult = await logFortune({
                    clerkUserId: userId,
                    type: "jiemeng",
                    title: `周公解梦 · ${keyword}`,
                    summary: `命中建议词: ${matches.slice(0, 3).join("、")}`,
                })
                if (!logResult.ok) {
                    console.error("解梦历史记录失败:", logResult.error)
                }
            }
            return NextResponse.json({
                success: true,
                data: {
                    keyword,
                    suggestions: matches,
                    interpretation: null,
                },
            })
        }

        if (userId) {
            const logResult = await logFortune({
                clerkUserId: userId,
                type: "jiemeng",
                title: `周公解梦 · ${keyword}`,
                summary: "未命中解释词条",
            })
            if (!logResult.ok) {
                console.error("解梦历史记录失败:", logResult.error)
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                keyword,
                interpretation: null,
                message: "未找到相关解释，请尝试其他关键词",
            },
        })
    } catch (error) {
        console.error("周公解梦 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
