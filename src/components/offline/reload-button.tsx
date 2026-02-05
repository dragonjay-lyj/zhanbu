"use client"

import { RefreshCw } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export function ReloadButton() {
    const { t } = useTranslation()
    return (
        <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
        >
            <RefreshCw className="w-5 h-5 mr-2" />
            {t("common.refresh")}
        </button>
    )
}
