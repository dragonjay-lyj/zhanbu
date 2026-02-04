/**
 * 新功能页面翻译扩展
 * 包含第十一、十二阶段新增功能的多语言翻译
 */

export interface ExtendedTranslations {
    // 新功能导航
    newFeatures: {
        name: string
        zodiac: string
        shengxiao: string
        liunian: string
        qianwen: string
        jiemeng: string
        zeji: string
        aiChat: string
        marriage: string
        community: string
    }
    // 功能页面内容
    pages: {
        name: {
            title: string
            description: string
            inputLabel: string
            inputPlaceholder: string
            analyze: string
            result: string
        }
        zodiac: {
            title: string
            description: string
            daily: string
            weekly: string
            monthly: string
            love: string
            career: string
            health: string
        }
        marriage: {
            title: string
            description: string
            maleInfo: string
            femaleInfo: string
            analyze: string
            compatibility: string
            advice: string
        }
        community: {
            title: string
            description: string
            newPost: string
            categories: string
            searchPlaceholder: string
        }
        liunian: {
            title: string
            description: string
            inputYear: string
            monthlyTrend: string
            categories: string
        }
    }
    // 通用占卜术语
    divTerms: {
        wuxing: string
        bazi: string
        ganZhi: string
        shengXiao: string
        jieQi: string
        yiJi: string
        score: string
        level: string
        advice: string
    }
}

// 中文简体
export const zhCNExtended: ExtendedTranslations = {
    newFeatures: {
        name: "姓名测算",
        zodiac: "星座运势",
        shengxiao: "生肖运程",
        liunian: "流年运势",
        qianwen: "抽签占卜",
        jiemeng: "周公解梦",
        zeji: "择吉选日",
        aiChat: "AI 对话",
        marriage: "八字合婚",
        community: "占卜社区",
    },
    pages: {
        name: {
            title: "姓名测算",
            description: "基于五格剖象法，分析姓名的数理吉凶",
            inputLabel: "请输入姓名",
            inputPlaceholder: "输入姓名进行分析",
            analyze: "开始测算",
            result: "测算结果",
        },
        zodiac: {
            title: "星座运势",
            description: "十二星座每日、每周、每月运势预测",
            daily: "今日运势",
            weekly: "本周运势",
            monthly: "本月运势",
            love: "爱情",
            career: "事业",
            health: "健康",
        },
        marriage: {
            title: "八字合婚",
            description: "分析双方八字，判断婚姻契合度",
            maleInfo: "男方信息",
            femaleInfo: "女方信息",
            analyze: "开始配对",
            compatibility: "契合度",
            advice: "婚姻建议",
        },
        community: {
            title: "占卜社区",
            description: "分享占卜心得，交流命理知识",
            newPost: "发布帖子",
            categories: "分类",
            searchPlaceholder: "搜索帖子...",
        },
        liunian: {
            title: "流年运势",
            description: "查看年度运势走向，把握人生节奏",
            inputYear: "请输入出生年份",
            monthlyTrend: "月度运势曲线",
            categories: "分类运势",
        },
    },
    divTerms: {
        wuxing: "五行",
        bazi: "八字",
        ganZhi: "干支",
        shengXiao: "生肖",
        jieQi: "节气",
        yiJi: "宜忌",
        score: "分数",
        level: "等级",
        advice: "建议",
    },
}

// 英文
export const enExtended: ExtendedTranslations = {
    newFeatures: {
        name: "Name Analysis",
        zodiac: "Horoscope",
        shengxiao: "Chinese Zodiac",
        liunian: "Annual Fortune",
        qianwen: "Fortune Sticks",
        jiemeng: "Dream Interpret",
        zeji: "Auspicious Dates",
        aiChat: "AI Chat",
        marriage: "Marriage Match",
        community: "Community",
    },
    pages: {
        name: {
            title: "Name Analysis",
            description: "Analyze name numerology based on Five-Grid theory",
            inputLabel: "Enter your name",
            inputPlaceholder: "Type name for analysis",
            analyze: "Analyze",
            result: "Analysis Result",
        },
        zodiac: {
            title: "Horoscope",
            description: "Daily, weekly, and monthly horoscope for all zodiac signs",
            daily: "Daily",
            weekly: "Weekly",
            monthly: "Monthly",
            love: "Love",
            career: "Career",
            health: "Health",
        },
        marriage: {
            title: "Marriage Compatibility",
            description: "Analyze birth charts to determine marriage compatibility",
            maleInfo: "Male Information",
            femaleInfo: "Female Information",
            analyze: "Match",
            compatibility: "Compatibility",
            advice: "Advice",
        },
        community: {
            title: "Community",
            description: "Share insights and discuss divination topics",
            newPost: "New Post",
            categories: "Categories",
            searchPlaceholder: "Search posts...",
        },
        liunian: {
            title: "Annual Fortune",
            description: "View yearly fortune trends",
            inputYear: "Enter birth year",
            monthlyTrend: "Monthly Trend",
            categories: "Category Fortune",
        },
    },
    divTerms: {
        wuxing: "Five Elements",
        bazi: "Four Pillars",
        ganZhi: "Stems & Branches",
        shengXiao: "Zodiac Animal",
        jieQi: "Solar Terms",
        yiJi: "Dos & Don'ts",
        score: "Score",
        level: "Level",
        advice: "Advice",
    },
}

// 日语
export const jaExtended: ExtendedTranslations = {
    newFeatures: {
        name: "姓名判断",
        zodiac: "星座占い",
        shengxiao: "干支運勢",
        liunian: "年運",
        qianwen: "おみくじ",
        jiemeng: "夢占い",
        zeji: "吉日選び",
        aiChat: "AI相談",
        marriage: "相性占い",
        community: "コミュニティ",
    },
    pages: {
        name: {
            title: "姓名判断",
            description: "五格画数で名前の運勢を分析",
            inputLabel: "お名前を入力",
            inputPlaceholder: "名前を入力してください",
            analyze: "鑑定する",
            result: "鑑定結果",
        },
        zodiac: {
            title: "星座占い",
            description: "12星座の毎日・毎週・毎月の運勢",
            daily: "今日の運勢",
            weekly: "今週の運勢",
            monthly: "今月の運勢",
            love: "恋愛運",
            career: "仕事運",
            health: "健康運",
        },
        marriage: {
            title: "相性占い",
            description: "二人の生年月日から相性を診断",
            maleInfo: "男性情報",
            femaleInfo: "女性情報",
            analyze: "診断する",
            compatibility: "相性度",
            advice: "アドバイス",
        },
        community: {
            title: "コミュニティ",
            description: "占いの話題を共有・交流",
            newPost: "投稿する",
            categories: "カテゴリー",
            searchPlaceholder: "投稿を検索...",
        },
        liunian: {
            title: "年運",
            description: "年間運勢の流れを確認",
            inputYear: "生まれ年を入力",
            monthlyTrend: "月別運勢推移",
            categories: "分野別運勢",
        },
    },
    divTerms: {
        wuxing: "五行",
        bazi: "四柱",
        ganZhi: "干支",
        shengXiao: "生肖",
        jieQi: "節気",
        yiJi: "宜忌",
        score: "スコア",
        level: "レベル",
        advice: "アドバイス",
    },
}

// 繁体中文
export const zhTWExtended: ExtendedTranslations = {
    newFeatures: {
        name: "姓名測算",
        zodiac: "星座運勢",
        shengxiao: "生肖運程",
        liunian: "流年運勢",
        qianwen: "抽籤占卜",
        jiemeng: "周公解夢",
        zeji: "擇吉選日",
        aiChat: "AI 對話",
        marriage: "八字合婚",
        community: "占卜社區",
    },
    pages: {
        name: {
            title: "姓名測算",
            description: "基於五格剖象法，分析姓名的數理吉凶",
            inputLabel: "請輸入姓名",
            inputPlaceholder: "輸入姓名進行分析",
            analyze: "開始測算",
            result: "測算結果",
        },
        zodiac: {
            title: "星座運勢",
            description: "十二星座每日、每週、每月運勢預測",
            daily: "今日運勢",
            weekly: "本週運勢",
            monthly: "本月運勢",
            love: "愛情",
            career: "事業",
            health: "健康",
        },
        marriage: {
            title: "八字合婚",
            description: "分析雙方八字，判斷婚姻契合度",
            maleInfo: "男方資訊",
            femaleInfo: "女方資訊",
            analyze: "開始配對",
            compatibility: "契合度",
            advice: "婚姻建議",
        },
        community: {
            title: "占卜社區",
            description: "分享占卜心得，交流命理知識",
            newPost: "發布帖子",
            categories: "分類",
            searchPlaceholder: "搜尋帖子...",
        },
        liunian: {
            title: "流年運勢",
            description: "查看年度運勢走向，把握人生節奏",
            inputYear: "請輸入出生年份",
            monthlyTrend: "月度運勢曲線",
            categories: "分類運勢",
        },
    },
    divTerms: {
        wuxing: "五行",
        bazi: "八字",
        ganZhi: "干支",
        shengXiao: "生肖",
        jieQi: "節氣",
        yiJi: "宜忌",
        score: "分數",
        level: "等級",
        advice: "建議",
    },
}

// 导出所有扩展翻译
export const extendedTranslations = {
    "zh-CN": zhCNExtended,
    "zh-TW": zhTWExtended,
    en: enExtended,
    ja: jaExtended,
}
