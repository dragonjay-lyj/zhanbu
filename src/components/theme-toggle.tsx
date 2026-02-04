"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ThemeToggleProps {
    variant?: "icon" | "full"
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()

    if (variant === "full") {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">主题</span>
                <div className="flex items-center rounded-lg border p-1">
                    <Button
                        variant={theme === "light" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => setTheme("light")}
                        title="浅色模式"
                    >
                        <Sun className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={theme === "dark" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => setTheme("dark")}
                        title="深色模式"
                    >
                        <Moon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={theme === "system" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => setTheme("system")}
                        title="跟随系统"
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer relative">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">切换主题</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                    <Sun className="mr-2 h-4 w-4" />
                    浅色模式
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                    <Moon className="mr-2 h-4 w-4" />
                    深色模式
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                    <Monitor className="mr-2 h-4 w-4" />
                    跟随系统
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
