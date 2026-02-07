import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { logFortune } from "@/lib/history/log-fortune"

/**
 * 姓名测算 API - 基于五格剖象法
 */

// 康熙字典常用字笔画（简化版，实际应使用完整数据库）
const kangxiStrokes: Record<string, number> = {
    // 常用姓氏
    "王": 4, "李": 7, "张": 11, "刘": 15, "陈": 16, "杨": 13, "黄": 12, "赵": 14,
    "周": 8, "吴": 7, "徐": 10, "孙": 10, "马": 10, "朱": 6, "胡": 11, "郭": 15,
    "何": 7, "林": 8, "高": 10, "罗": 20, "郑": 19, "梁": 11, "谢": 17, "宋": 7,
    "唐": 10, "许": 11, "韩": 17, "冯": 12, "邓": 19, "曹": 11, "彭": 12, "曾": 12,
    "肖": 9, "田": 5, "董": 15, "袁": 10, "潘": 16, "于": 3, "蒋": 17, "蔡": 17,
    "余": 7, "杜": 7, "叶": 15, "程": 12, "苏": 22, "魏": 18, "吕": 6, "丁": 2,
    "任": 6, "沈": 8, "姚": 9, "卢": 16, "姜": 9, "崔": 11, "钟": 17, "谭": 19,
    // 常用名字字
    "明": 8, "华": 14, "国": 11, "建": 9, "文": 4, "平": 5, "东": 8, "海": 11,
    "伟": 11, "强": 11, "军": 9, "杰": 12, "勇": 9, "涛": 18, "斌": 11, "波": 9,
    "亮": 9, "辉": 15, "成": 7, "志": 7, "鹏": 19, "飞": 9, "龙": 16, "超": 12,
    "浩": 11, "敏": 11, "静": 16, "婷": 12, "雪": 11, "玲": 10, "丽": 19, "红": 9,
    "芳": 10, "娟": 10, "霞": 17, "燕": 16, "云": 12, "萍": 14, "秀": 7, "梅": 11,
    "美": 9, "英": 11, "慧": 15, "娜": 10, "艳": 24, "倩": 10, "洁": 16, "颖": 16,
    "春": 9, "秋": 9, "冬": 5, "夏": 10, "金": 8, "木": 4, "水": 4, "火": 4, "土": 3,
    "一": 1, "二": 2, "三": 3, "四": 5, "五": 4, "六": 4, "七": 2, "八": 2, "九": 2, "十": 2,
    "天": 4, "地": 6, "人": 2, "大": 3, "小": 3, "中": 4, "上": 3, "下": 3,
    "子": 3, "宇": 6, "轩": 10, "泽": 17, "博": 12, "俊": 9, "睿": 14, "翔": 12,
    "晨": 11, "阳": 17, "旭": 6, "昊": 8, "熙": 13, "诚": 14, "皓": 12, "宸": 10,
    "逸": 15, "航": 10, "瑞": 14, "嘉": 14, "凯": 12, "豪": 14, "峰": 10, "磊": 15,
}

// 获取字的笔画数
function getStrokes(char: string): number {
    return kangxiStrokes[char] || char.charCodeAt(0) % 20 + 5
}

// 数理吉凶
const numberMeanings: Record<number, { luck: string; meaning: string; element: string }> = {
    1: { luck: "吉", meaning: "太极之数，万物开泰，生发无穷，利禄亨通", element: "木" },
    2: { luck: "凶", meaning: "两仪之数，混沌未开，进退保守，志望难达", element: "木" },
    3: { luck: "吉", meaning: "三才之数，天地人和，大事大业，繁荣昌盛", element: "火" },
    4: { luck: "凶", meaning: "四象之数，待于生发，万事慎重，不具营谋", element: "火" },
    5: { luck: "吉", meaning: "五行之数，福禄长寿，阴阳和合，完璧之象", element: "土" },
    6: { luck: "吉", meaning: "六爻之数，发展变化，天赋美德，吉祥安泰", element: "土" },
    7: { luck: "吉", meaning: "七政之数，精悍严谨，天赋之力，吉星照耀", element: "金" },
    8: { luck: "吉", meaning: "八卦之数，乾坤有象，万物确立，调顺发达", element: "金" },
    9: { luck: "凶", meaning: "大成之数，蕴涵凶险，或成或败，难以把握", element: "水" },
    10: { luck: "凶", meaning: "终结之数，雪暗飘零，偶或有成，回顾茫然", element: "水" },
    11: { luck: "吉", meaning: "旱苗逢雨，万物更新，调顺发达，恢弘泽世", element: "木" },
    12: { luck: "凶", meaning: "掘井无泉，意志薄弱，家庭寂寞，企图不力", element: "木" },
    13: { luck: "吉", meaning: "春日牡丹，智略超群，富裕荣达，领导众人", element: "火" },
    14: { luck: "凶", meaning: "破兆之数，家庭缘薄，孤独遭难，谋事不达", element: "火" },
    15: { luck: "吉", meaning: "福寿之数，福寿圆满，富贵荣誉，涵养雅量", element: "土" },
    16: { luck: "吉", meaning: "厚重之数，厚重载德，安富尊荣，财官双美", element: "土" },
    17: { luck: "吉", meaning: "刚强之数，权威刚强，突破万难，如能容忍", element: "金" },
    18: { luck: "吉", meaning: "铁镜重磨，权威显达，博得名利，且养柔德", element: "金" },
    19: { luck: "凶", meaning: "多难之数，成功虽早，但有慧极必伤之兆", element: "水" },
    20: { luck: "凶", meaning: "屋下藏金，非业破运，灾难重重，进退维谷", element: "水" },
    21: { luck: "吉", meaning: "明月中天，独立权威，能导众人，势如破竹", element: "木" },
    22: { luck: "凶", meaning: "秋草逢霜，百事不如意，志向欠展，难望成功", element: "木" },
    23: { luck: "吉", meaning: "壮丽之数，旭日东升，壮丽壮观，权威旺盛", element: "火" },
    24: { luck: "吉", meaning: "掘藏得金，家门余庆，金钱丰盈，白手成家", element: "火" },
    25: { luck: "吉", meaning: "资性英敏，才略奇特，涵养性情，可成大业", element: "土" },
    26: { luck: "半吉", meaning: "变怪之谜，英雄豪杰，波澜重叠，而奏大功", element: "土" },
    27: { luck: "半吉", meaning: "增长之数，欲望无止，自我强烈，多受毁谤", element: "金" },
    28: { luck: "凶", meaning: "阔水浮萍，豪杰气概，四海漂泊，终世浮躁", element: "金" },
    29: { luck: "吉", meaning: "智略皆备，欲财丰盈，名闻海内，成就大业", element: "水" },
    30: { luck: "半吉", meaning: "非运之数，吉凶参半，若能坚持，必有所成", element: "水" },
    31: { luck: "吉", meaning: "春日花开，智勇得志，博得名利，统领众人", element: "木" },
    32: { luck: "吉", meaning: "宝马金鞍，侥幸多望，贵人得助，财帛如裕", element: "木" },
    33: { luck: "吉", meaning: "旭日升天，鸾凤相会，名闻天下，隆昌至极", element: "火" },
    34: { luck: "凶", meaning: "破家之身，见识短小，辛苦遭逢，灾祸至极", element: "火" },
    35: { luck: "吉", meaning: "高楼望月，优雅发展，此数最合女性", element: "土" },
    36: { luck: "半吉", meaning: "波澜重叠，变化无穷，凶险厄难，时而有功", element: "土" },
    37: { luck: "吉", meaning: "权威显达，热诚忠信，宜着雅量，终身荣富", element: "金" },
    38: { luck: "半吉", meaning: "薄弱意志，刻苦经营，方有所成，技艺有成", element: "金" },
    39: { luck: "吉", meaning: "富贵荣华，财帛丰盈，暗藏险象，德泽四方", element: "水" },
    40: { luck: "半吉", meaning: "退安之数，智谋胆力，冒险投机，沉浮不定", element: "水" },
    41: { luck: "吉", meaning: "天赋吉运，德望兼备，继续努力，前途无限", element: "木" },
    45: { luck: "吉", meaning: "顺风之数，新生泰和，顺风扬帆，万事如意", element: "土" },
    47: { luck: "吉", meaning: "祥瑞之数，进取力强，可得权势，吉祥之兆", element: "金" },
    48: { luck: "吉", meaning: "青松立鹤，智谋兼备，德量荣达，威望成师", element: "金" },
    52: { luck: "吉", meaning: "达眼之数，先见之明，理想实现，功德完满", element: "木" },
    57: { luck: "吉", meaning: "寒雪青松，学识丰富，志向远大，可成大业", element: "金" },
    63: { luck: "吉", meaning: "平步青云，隆昌发展，名利双收", element: "火" },
    65: { luck: "吉", meaning: "鸿运之数，财运亨通，荣华富贵", element: "土" },
    67: { luck: "吉", meaning: "通达之数，顺风扬帆，名利齐来", element: "金" },
    68: { luck: "吉", meaning: "发明之人，利通四海", element: "金" },
    81: { luck: "吉", meaning: "万物回春，还原复始，循环无穷", element: "木" },
}

// 获取数理含义
function getNumberMeaning(num: number) {
    // 超过81则取余
    const n = num > 81 ? (num % 80 || 80) : num
    return numberMeanings[n] || { luck: "半吉", meaning: "数理待查", element: "土" }
}

// 三才配置
function getSancai(tianGe: number, renGe: number, diGe: number) {
    const getElement = (n: number) => {
        const mod = n % 10
        if (mod === 1 || mod === 2) return "木"
        if (mod === 3 || mod === 4) return "火"
        if (mod === 5 || mod === 6) return "土"
        if (mod === 7 || mod === 8) return "金"
        return "水"
    }

    return {
        tian: getElement(tianGe),
        ren: getElement(renGe),
        di: getElement(diGe),
    }
}

// 五行相生相克判断
function getSancaiLuck(sancai: { tian: string; ren: string; di: string }) {
    const sheng: Record<string, string> = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" }
    const ke: Record<string, string> = { "木": "土", "土": "水", "水": "火", "火": "金", "金": "木" }

    let score = 60

    // 天生人
    if (sheng[sancai.tian] === sancai.ren) score += 15
    else if (ke[sancai.tian] === sancai.ren) score -= 10

    // 人生地
    if (sheng[sancai.ren] === sancai.di) score += 15
    else if (ke[sancai.ren] === sancai.di) score -= 10

    // 同五行
    if (sancai.tian === sancai.ren) score += 5
    if (sancai.ren === sancai.di) score += 5

    return {
        score: Math.max(0, Math.min(100, score)),
        luck: score >= 80 ? "大吉" : score >= 60 ? "吉" : score >= 40 ? "半吉" : "凶"
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { surname, givenName } = body

        if (!surname || !givenName) {
            return NextResponse.json({ error: "请输入姓名" }, { status: 400 })
        }

        // 计算笔画
        const surnameStrokes = (Array.from(surname) as string[]).reduce((sum: number, char: string) => sum + getStrokes(char), 0)
        const givenNameChars = Array.from(givenName) as string[]
        const givenNameStrokes = givenNameChars.map((char: string) => getStrokes(char))
        const firstNameStroke = givenNameStrokes[0] || 0
        const lastNameStroke = givenNameStrokes[givenNameStrokes.length - 1] || 0
        const totalGivenStrokes = givenNameStrokes.reduce((sum: number, s: number) => sum + s, 0)

        // 五格计算
        const tianGe = surnameStrokes + 1 // 天格 = 姓笔画 + 1
        const renGe = surnameStrokes + firstNameStroke // 人格 = 姓笔画 + 名第一字笔画
        const diGe = totalGivenStrokes + 1 // 地格 = 名笔画总和 + 1
        const waiGe = tianGe + diGe - renGe // 外格
        const zongGe = surnameStrokes + totalGivenStrokes // 总格

        // 获取各格含义
        const tianMeaning = getNumberMeaning(tianGe)
        const renMeaning = getNumberMeaning(renGe)
        const diMeaning = getNumberMeaning(diGe)
        const waiMeaning = getNumberMeaning(waiGe)
        const zongMeaning = getNumberMeaning(zongGe)

        // 三才配置
        const sancai = getSancai(tianGe, renGe, diGe)
        const sancaiLuck = getSancaiLuck(sancai)

        // 综合评分
        const luckScore: Record<string, number> = { "吉": 20, "大吉": 25, "半吉": 10, "凶": 0 }
        const totalScore = Math.round(
            (luckScore[tianMeaning.luck] || 10) +
            (luckScore[renMeaning.luck] || 10) * 1.5 +
            (luckScore[diMeaning.luck] || 10) +
            (luckScore[waiMeaning.luck] || 10) * 0.5 +
            (luckScore[zongMeaning.luck] || 10) * 1.2 +
            sancaiLuck.score * 0.3
        )

        const responseData = {
            success: true,
            data: {
                surname,
                givenName,
                strokes: {
                    surname: surnameStrokes,
                    givenName: givenNameStrokes,
                    total: surnameStrokes + totalGivenStrokes,
                },
                wuge: {
                    tianGe: { value: tianGe, ...tianMeaning },
                    renGe: { value: renGe, ...renMeaning },
                    diGe: { value: diGe, ...diMeaning },
                    waiGe: { value: waiGe, ...waiMeaning },
                    zongGe: { value: zongGe, ...zongMeaning },
                },
                sancai: {
                    ...sancai,
                    ...sancaiLuck,
                    description: `${sancai.tian}${sancai.ren}${sancai.di}配置`,
                },
                totalScore: Math.min(100, totalScore),
            },
        }

        const { userId } = await auth()
        if (userId) {
            const nameText = `${surname}${givenName}`
            const logResult = await logFortune({
                clerkUserId: userId,
                type: "name",
                title: `姓名测算 · ${nameText}`,
                summary: `总分 ${Math.min(100, totalScore)} 分`,
            })
            if (!logResult.ok) {
                console.error("姓名测算历史记录失败:", logResult.error)
            }
        }

        return NextResponse.json(responseData)
    } catch (error) {
        console.error("姓名测算 API 错误:", error)
        return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
    }
}
