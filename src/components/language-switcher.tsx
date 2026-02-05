"use client"

import { Globe } from "lucide-react"
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

    const currentLocale = localeConfig[locale]

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
                            className="cursor-pointer"
                            onClick={() => setLocale(loc)}
                        >
                            {localeConfig[loc].flag} {localeConfig[loc].nativeName}
                        </Button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Globe className="h-5 w-5" />
                    <span className="sr-only">{t("language.switcherLabel")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map((loc) => (
                    <DropdownMenuItem
                        key={loc}
                        onClick={() => setLocale(loc)}
                        className="cursor-pointer"
                    >
                        <span className="mr-2">{localeConfig[loc].flag}</span>
                        <span>{localeConfig[loc].nativeName}</span>
                        {locale === loc && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
