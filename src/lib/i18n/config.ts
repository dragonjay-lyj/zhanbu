// 支持的语言
export const locales = ["zh-CN", "zh-TW", "en", "ja"] as const
export type Locale = (typeof locales)[number]

// 默认语言
export const defaultLocale: Locale = "zh-CN"

// 语言配置
export const localeConfig: Record<
    Locale,
    {
        name: string
        nativeName: string
        flag: string
        dir: "ltr" | "rtl"
    }
> = {
    "zh-CN": {
        name: "Simplified Chinese",
        nativeName: "简体中文",
        flag: "🇨🇳",
        dir: "ltr",
    },
    "zh-TW": {
        name: "Traditional Chinese",
        nativeName: "繁體中文",
        flag: "🇹🇼",
        dir: "ltr",
    },
    en: {
        name: "English",
        nativeName: "English",
        flag: "🇺🇸",
        dir: "ltr",
    },
    ja: {
        name: "Japanese",
        nativeName: "日本語",
        flag: "🇯🇵",
        dir: "ltr",
    },
}

// 翻译类型
export interface Translations {
    common: {
        loading: string
        error: string
        success: string
        cancel: string
        confirm: string
        save: string
        delete: string
        edit: string
        back: string
        next: string
        previous: string
        search: string
        noResults: string
        viewMore: string
        login: string
        logout: string
        register: string
    }
    nav: {
        home: string
        bazi: string
        ziwei: string
        liuyao: string
        meihua: string
        tarot: string
        daily: string
        huangli: string
        qimen: string
        fengshui: string
        relationship: string
        history: string
        profile: string
        settings: string
        admin: string
    }
    home: {
        hero: {
            title: string
            subtitle: string
            cta: string
        }
        features: {
            title: string
            items: {
                title: string
                description: string
            }[]
        }
    }
    divination: {
        question: string
        questionPlaceholder: string
        startDivination: string
        result: string
        interpretation: string
        aiInterpretation: string
        getAiInterpretation: string
        loginToGetAi: string
        restart: string
        saveResult: string
        shareResult: string
    }
    auth: {
        loginTitle: string
        registerTitle: string
        email: string
        password: string
        confirmPassword: string
        forgotPassword: string
        noAccount: string
        hasAccount: string
        loginWithGoogle: string
        loginWithGithub: string
    }
}

// 中文简体翻译
export const zhCN: Translations = {
    common: {
        loading: "加载中...",
        error: "发生错误",
        success: "操作成功",
        cancel: "取消",
        confirm: "确认",
        save: "保存",
        delete: "删除",
        edit: "编辑",
        back: "返回",
        next: "下一步",
        previous: "上一步",
        search: "搜索",
        noResults: "暂无结果",
        viewMore: "查看更多",
        login: "登录",
        logout: "退出登录",
        register: "注册",
    },
    nav: {
        home: "首页",
        bazi: "八字排盘",
        ziwei: "紫微斗数",
        liuyao: "六爻排盘",
        meihua: "梅花易数",
        tarot: "塔罗占卜",
        daily: "每日运势",
        huangli: "黄历查询",
        qimen: "高级排盘",
        fengshui: "玄空风水",
        relationship: "关系分析",
        history: "历史记录",
        profile: "个人中心",
        settings: "设置",
        admin: "后台管理",
    },
    home: {
        hero: {
            title: "探索命运的奥秘",
            subtitle: "融合东方智慧与现代技术，为您提供专业的占卜解读服务",
            cta: "开始占卜",
        },
        features: {
            title: "我们的服务",
            items: [
                { title: "八字命理", description: "根据出生时间，分析命格运势" },
                { title: "紫微斗数", description: "星曜布局，揭示人生轨迹" },
                { title: "塔罗占卜", description: "西方神秘学，洞察内心" },
                { title: "六爻预测", description: "古老易学，解答疑惑" },
            ],
        },
    },
    divination: {
        question: "您的问题",
        questionPlaceholder: "请输入您想要咨询的问题...",
        startDivination: "开始占卜",
        result: "占卜结果",
        interpretation: "解读",
        aiInterpretation: "AI 智能解读",
        getAiInterpretation: "获取 AI 解读",
        loginToGetAi: "登录后获取 AI 解读",
        restart: "重新开始",
        saveResult: "保存结果",
        shareResult: "分享结果",
    },
    auth: {
        loginTitle: "欢迎回来",
        registerTitle: "创建账户",
        email: "邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        forgotPassword: "忘记密码？",
        noAccount: "还没有账户？",
        hasAccount: "已有账户？",
        loginWithGoogle: "使用 Google 登录",
        loginWithGithub: "使用 GitHub 登录",
    },
}

// 英文翻译
export const en: Translations = {
    common: {
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        back: "Back",
        next: "Next",
        previous: "Previous",
        search: "Search",
        noResults: "No results",
        viewMore: "View more",
        login: "Log in",
        logout: "Log out",
        register: "Sign up",
    },
    nav: {
        home: "Home",
        bazi: "BaZi Chart",
        ziwei: "Zi Wei Dou Shu",
        liuyao: "Liu Yao",
        meihua: "Mei Hua",
        tarot: "Tarot Reading",
        daily: "Daily Fortune",
        huangli: "Chinese Almanac",
        qimen: "Advanced Divination",
        fengshui: "Feng Shui",
        relationship: "Relationship",
        history: "History",
        profile: "Profile",
        settings: "Settings",
        admin: "Admin",
    },
    home: {
        hero: {
            title: "Explore the Mysteries of Destiny",
            subtitle: "Combining Eastern wisdom with modern technology for professional divination readings",
            cta: "Start Reading",
        },
        features: {
            title: "Our Services",
            items: [
                { title: "BaZi Analysis", description: "Analyze destiny based on birth time" },
                { title: "Zi Wei Dou Shu", description: "Star layout reveals life trajectory" },
                { title: "Tarot Reading", description: "Western mysticism, insight into the heart" },
                { title: "Liu Yao Prediction", description: "Ancient I Ching for answering questions" },
            ],
        },
    },
    divination: {
        question: "Your Question",
        questionPlaceholder: "Enter your question...",
        startDivination: "Start Reading",
        result: "Reading Result",
        interpretation: "Interpretation",
        aiInterpretation: "AI Interpretation",
        getAiInterpretation: "Get AI Interpretation",
        loginToGetAi: "Log in for AI interpretation",
        restart: "Start Over",
        saveResult: "Save Result",
        shareResult: "Share Result",
    },
    auth: {
        loginTitle: "Welcome Back",
        registerTitle: "Create Account",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot password?",
        noAccount: "Don't have an account?",
        hasAccount: "Already have an account?",
        loginWithGoogle: "Sign in with Google",
        loginWithGithub: "Sign in with GitHub",
    },
}

import { zhTW } from "./zh-tw"
import { ja } from "./ja"

// 所有翻译
export const translations: Record<Locale, Translations> = {
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    en: en,
    ja: ja,
}

// 获取翻译
export function getTranslations(locale: Locale): Translations {
    return translations[locale] || translations[defaultLocale]
}

// 获取嵌套翻译值
export function t(
    translations: Translations,
    key: string
): string {
    const keys = key.split(".")
    let value: unknown = translations
    for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
            value = (value as Record<string, unknown>)[k]
        } else {
            return key
        }
    }
    return typeof value === "string" ? value : key
}
