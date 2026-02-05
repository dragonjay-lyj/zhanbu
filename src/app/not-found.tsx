"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, Search } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function NotFound() {
    const { t, translations } = useTranslation()
    const recommended = (translations.notFound as { recommended?: { name: string; href: string }[] })?.recommended || []
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-8">
            <div className="text-center max-w-lg">
                {/* 404 大数字 */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] font-black leading-none bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent opacity-20">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                            <FileQuestion className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-3">
                    {t("errors.notFoundTitle")}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    {t("errors.notFoundDesc")}
                    <br />
                    {t("errors.notFoundHint")}
                </p>

                {/* 动作按钮 */}
                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500" asChild>
                        <Link href="/">
                            <Home className="w-5 h-5 mr-2" />
                            {t("notFound.home")}
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/community">
                            <Search className="w-5 h-5 mr-2" />
                            {t("notFound.community")}
                        </Link>
                    </Button>
                </div>

                {/* 推荐功能 */}
                <div className="border-t border-border pt-8">
                    <p className="text-sm text-muted-foreground mb-4">
                        {t("errors.notFoundRecommendation")}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {recommended.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-muted/80 transition"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
