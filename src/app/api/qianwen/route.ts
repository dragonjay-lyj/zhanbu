import { NextRequest, NextResponse } from "next/server"

/**
 * 抽签占卜 API
 */

// 签种类型
const signTypes = [
    { id: "guanyin", name: "观音灵签", icon: "🙏", total: 100, description: "求问吉凶祸福" },
    { id: "yuelao", name: "月老灵签", icon: "💕", total: 50, description: "求问姻缘桃花" },
    { id: "caishen", name: "财神签", icon: "💰", total: 28, description: "求问财运事业" },
    { id: "wenchang", name: "文昌签", icon: "📚", total: 32, description: "求问学业考试" },
]

// 签文等级
const signLevels = ["上上签", "上签", "上中签", "中签", "中平签", "中下签", "下签", "下下签"]

// 观音灵签示例（精选）
const guanyinSigns = [
    { number: 1, level: "上上签", poem: "日出便见风云散，光明清净照世间。一向前途通大道，万事喜悦福自来。", meaning: "运势大吉，诸事顺遂，贵人相助，前途光明。" },
    { number: 2, level: "上签", poem: "枯木逢春色更新，前途好运渐来临。放开心怀无烦恼，一切顺利得安宁。", meaning: "否极泰来，时来运转，保持信心，好事将至。" },
    { number: 3, level: "上中签", poem: "云开月出照无边，春色满园百花鲜。此时正是行运际，贵人相助福绵绵。", meaning: "运势渐佳，机遇将至，把握时机，积极进取。" },
    { number: 4, level: "中签", poem: "人生事业似棋盘，胜负输赢一念间。进退自如凭智慧，方能立足众人间。", meaning: "运势平稳，凡事三思，谨慎行事，方可无忧。" },
    { number: 5, level: "中平签", poem: "行船偏遇打头风，守旧经营暂且从。待到时来风浪静，前程万里自然通。", meaning: "暂时受阻，宜守不宜攻，耐心等待，时机自来。" },
    { number: 6, level: "中下签", poem: "事多纷扰难如愿，心中烦闷意难安。静待时机勿急躁，守得云开见月圆。", meaning: "运势欠佳，诸事不顺，宜静心修养，以待转机。" },
    { number: 7, level: "下签", poem: "乌云遮日暗无光，事事难成费周章。且把心思放宽处，明朝自有好风光。", meaning: "运势不佳，困难重重，需谨慎应对，以免损失。" },
    { number: 8, level: "上上签", poem: "紫气东来满庭芳，贵人相助喜洋洋。今朝得意逢吉日，事事如意福绵长。", meaning: "大吉大利，贵人运旺，事业顺遂，财源广进。" },
    { number: 9, level: "上签", poem: "春风得意马蹄轻，一路顺风万里程。但凭真心行正道，功名富贵自然成。", meaning: "运势上升，前途光明，坚持正道，必有所成。" },
    { number: 10, level: "中签", poem: "月移花影玉人迟，心中事业待时机。守得一分真意在，自然天地合心期。", meaning: "运势平平，需耐心等待，时机未到，不可强求。" },
]

// 月老灵签示例
const yuelaoSigns = [
    { number: 1, level: "上上签", poem: "鸳鸯戏水两情长，月老牵线配成双。佳偶天成终有日，百年好合永不忘。", meaning: "姻缘美满，真爱将至，有情人终成眷属。" },
    { number: 2, level: "上签", poem: "桃花朵朵开枝头，春风化雨润心头。良缘天定无须觅，自有佳人在前途。", meaning: "桃花旺盛，良缘将至，顺其自然。" },
    { number: 3, level: "中签", poem: "花开堪折直须折，莫待无花空折枝。缘分到时当珍惜，错过时机悔已迟。", meaning: "缘分已到，需主动争取，切勿错过。" },
    { number: 4, level: "中平签", poem: "落花有意随流水，流水无情恋落花。且把真心收拾起，等待缘分自天涯。", meaning: "暂无良缘，不必强求，耐心等待。" },
    { number: 5, level: "下签", poem: "镜花水月终成空，痴心妄想惹人愁。不如放下执念处，另寻良缘在心头。", meaning: "此缘不合，宜放手，另觅良缘。" },
]

// 财神签示例
const caishenSigns = [
    { number: 1, level: "上上签", poem: "金玉满堂富贵来，财源广进福门开。今朝得意逢时运，事业兴隆喜自来。", meaning: "财运亨通，事业顺利，大吉之兆。" },
    { number: 2, level: "上签", poem: "春风化雨润无声，财运亨通事事成。稳扎稳打勤致富，日后必定享荣华。", meaning: "财运上升，稳中有进，前景可期。" },
    { number: 3, level: "中签", poem: "财来财去如流水，守住本心最要紧。量入为出勤俭持，自然积蓄渐丰盈。", meaning: "财运平稳，宜守不宜攻，勤俭为上。" },
    { number: 4, level: "下签", poem: "纵有钱财亦成空，贪心不足祸无穷。且收贪念守本分，小富即安保安宁。", meaning: "财运不佳，需谨慎理财，避免贪心。" },
]

// 文昌签示例
const wenchangSigns = [
    { number: 1, level: "上上签", poem: "春风得意马蹄疾，一日看尽长安花。金榜题名在今朝，文章盖世美名扬。", meaning: "学业大吉，考试顺利，金榜题名。" },
    { number: 2, level: "上签", poem: "十年寒窗终有报，勤学苦读见成效。但凭一腔勤奋意，自有锦绣前程到。", meaning: "学业顺利，付出有回报，前途光明。" },
    { number: 3, level: "中签", poem: "学海无涯需苦渡，书山有路勤为径。持之以恒终有成，功夫不负有心人。", meaning: "需继续努力，持之以恒，方见成效。" },
    { number: 4, level: "下签", poem: "欲速则不达其功，心浮气躁难成名。静心修学勤用功，来年再试定成功。", meaning: "时机未到，需沉心静气，继续努力。" },
]

// 获取签文数据
function getSignData(type: string) {
    switch (type) {
        case "guanyin": return guanyinSigns
        case "yuelao": return yuelaoSigns
        case "caishen": return caishenSigns
        case "wenchang": return wenchangSigns
        default: return guanyinSigns
    }
}

// 随机抽签
function drawSign(type: string) {
    const signs = getSignData(type)
    const randomIndex = Math.floor(Math.random() * signs.length)
    return signs[randomIndex]
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get("type")

        // 返回签种列表
        if (!type) {
            return NextResponse.json({
                success: true,
                data: { types: signTypes },
            })
        }

        // 验证签种
        const signType = signTypes.find(t => t.id === type)
        if (!signType) {
            return NextResponse.json({ error: "无效的签种" }, { status: 400 })
        }

        // 抽签
        const sign = drawSign(type)

        return NextResponse.json({
            success: true,
            data: {
                type: signType,
                sign,
                drawnAt: new Date().toISOString(),
            },
        })
    } catch (error) {
        console.error("抽签占卜 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
