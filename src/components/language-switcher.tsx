"use client"

import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n, useTranslation, locales, localeConfig, type Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
    variant?: "icon" | "full"
}

export function LanguageSwitcher({ variant = "icon" }: LanguageSwitcherProps) {
    const { locale, setLocale } = useI18n()
    const { t } = useTranslation()
    const labels: Record<Locale, { short: string; name: string }> = {
        "zh-CN": { short: "简", name: "简体中文" },
        "zh-TW": { short: "繁", name: "繁體中文" },
        en: { short: "EN", name: "English" },
        ja: { short: "JP", name: "日本語" },
    }

    if (variant === "full") {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("language.label")}</span>
                <div className="flex items-center gap-1">
                    {locales.map((loc) => (
                        <Button
                            key={loc}
                            variant={locale === loc ? "secondary" : "ghost"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setLocale(loc)}
                        >
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-primary/15 bg-background/80 px-2 text-[11px] font-semibold text-primary">
                                {labels[loc].short}
                            </span>
                            {labels[loc].name}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">{t("language.switcherLabel")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => setLocale(loc)}
                    >
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-primary/15 bg-background/80 px-2 text-[11px] font-semibold text-primary">
                            {labels[loc].short}
                        </span>
                        <span>{labels[loc].name}</span>
                        {locale === loc && <Check className="ml-auto h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
