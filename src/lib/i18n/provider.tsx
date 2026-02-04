"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import {
    Locale,
    defaultLocale,
    locales,
    getTranslations,
    Translations,
    t as translate,
} from "./config"

interface I18nContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
    translations: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

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
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        setTranslations(getTranslations(newLocale))
        localStorage.setItem("locale", newLocale)
        document.documentElement.lang = newLocale
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
