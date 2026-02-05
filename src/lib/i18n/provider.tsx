"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import {
    Locale,
    defaultLocale,
    locales,
    getTranslations,
    Translations,
    t as translate,
    localeConfig,
} from "./config"

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
    translations: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_COOKIE_NAME = "locale"
const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readLocaleCookie(): Locale | null {
    if (typeof document === "undefined") return null
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]*)`))
    const value = match ? decodeURIComponent(match[1]) : null
    return value && locales.includes(value as Locale) ? (value as Locale) : null
}

function writeLocaleCookie(locale: Locale) {
    if (typeof document === "undefined") return
    document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}`
}

interface I18nProviderProps {
    children: ReactNode
    initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale)
    const [translations, setTranslations] = useState<Translations>(
        getTranslations(initialLocale || defaultLocale)
    )

    useEffect(() => {
        // 从 localStorage 读取语言设置
        const savedLocale = localStorage.getItem("locale") as Locale | null
        if (savedLocale && locales.includes(savedLocale)) {
            setLocaleState(savedLocale)
            setTranslations(getTranslations(savedLocale))
        } else {
            const cookieLocale = readLocaleCookie()
            if (cookieLocale) {
                setLocaleState(cookieLocale)
                setTranslations(getTranslations(cookieLocale))
            } else {
                // 检测浏览器语言
                const browserLang = navigator.language
                const matchedLocale = locales.find(
                    (l) => browserLang.startsWith(l) || browserLang.startsWith(l.split("-")[0])
                )
                if (matchedLocale) {
                    setLocaleState(matchedLocale)
                    setTranslations(getTranslations(matchedLocale))
                }
            }
        }
    }, [])

    useEffect(() => {
        document.documentElement.lang = locale
        document.documentElement.dir = localeConfig[locale]?.dir || "ltr"
    }, [locale])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        setTranslations(getTranslations(newLocale))
        localStorage.setItem("locale", newLocale)
        writeLocaleCookie(newLocale)
    }

    const t = (key: string) => translate(translations, key)

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, translations }}>
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = useContext(I18nContext)
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider")
    }
    return context
}

export function useTranslation() {
    const { t, translations } = useI18n()
    return { t, translations }
}
