"use client"

import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { ChevronDown, Coins, Crown, History, LogOut, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCreditsOptional } from "@/lib/credits/provider"
import { useTranslation } from "@/lib/i18n"

export function NavbarAuthControls() {
    const { isSignedIn, isLoaded, user } = useUser()
    const { signOut } = useClerk()
    const creditsContext = useCreditsOptional()
    const { t } = useTranslation()

    if (!isLoaded) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link href="/sign-in">{t("nav.signIn")}</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/sign-up">{t("nav.signUp")}</Link>
                </Button>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link href="/sign-in">{t("nav.signIn")}</Link>
                </Button>
                <Button size="sm" asChild>
                    <Link href="/sign-up">{t("nav.signUp")}</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {creditsContext?.credits && (
                <Link href="/pricing">
                    <Badge
                        variant="secondary"
                        className="gap-1 rounded-full border border-cta/20 bg-cta/10 px-3 py-1 text-cta transition-[background-color,color] duration-200 hover:bg-cta/16 hover:text-cta"
                    >
                        <Coins className="h-3 w-3" />
                        <span>{creditsContext.credits.balance}</span>
                    </Badge>
                </Link>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 rounded-full px-2" id="user-menu">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName || t("nav.userFallback")} />
                            <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="hidden h-4 w-4 sm:block" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col">
                            <span>{user?.fullName || t("nav.userFallback")}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {user?.primaryEmailAddress?.emailAddress}
                            </span>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            {t("nav.profile")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/history">
                            <History className="mr-2 h-4 w-4" />
                            {t("nav.history")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/pricing" id="membership-btn">
                            <Crown className="mr-2 h-4 w-4 text-cta" />
                            {t("nav.pricing")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/admin">
                            <Settings className="mr-2 h-4 w-4" />
                            {t("nav.admin")}
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nav.signOut")}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
