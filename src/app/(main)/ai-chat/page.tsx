"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Send, Bot, User, Loader2, Sparkles, Trash2, MessageSquarePlus, Coins, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useI18n, useTranslation, formatMessage } from "@/lib/i18n"
import { useUser } from "@clerk/nextjs"

// 对话模式
interface ChatMode {
    id: string
    name: string
}

// 消息
interface Message {
    role: "user" | "assistant"
    content: string
}

export default function AiChatPage() {
    const { isSignedIn } = useUser()
    const { locale } = useI18n()
    const { t, translations } = useTranslation()
    const [modes, setModes] = useState<ChatMode[]>([])
    const [selectedMode, setSelectedMode] = useState<string>("general")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [costPerMessage, setCostPerMessage] = useState(5)
    const [insufficientCredits, setInsufficientCredits] = useState<{
        required: number
        current: number
    } | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 加载对话模式
    useEffect(() => {
        fetch("/api/ai/chat")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setModes(data.data.modes)
                    if (data.data.costPerMessage) {
                        setCostPerMessage(data.data.costPerMessage)
                    }
                }
            })
    }, [])

    // 滚动到底部
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // 发送消息
    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: "user", content: userMessage }])
        setIsLoading(true)

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    mode: selectedMode,
                    history: messages,
                    locale,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                // 处理积分不足
                if (response.status === 402) {
                    setInsufficientCredits({
                        required: error.required || costPerMessage,
                        current: error.current || 0,
                    })
                    // 移除刚添加的用户消息
                    setMessages(prev => prev.slice(0, -1))
                    return
                }
                throw new Error(error.error || "请求失败")
            }

            // 清除积分不足提示
            setInsufficientCredits(null)

            // 处理流式响应
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = ""

            // 添加空的助手消息
            setMessages(prev => [...prev, { role: "assistant", content: "" }])

            while (reader) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split("\n")

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6)
                        if (data === "[DONE]") continue

                        try {
                            const json = JSON.parse(data)
                            const content = json.choices?.[0]?.delta?.content || ""
                            assistantMessage += content

                            // 更新最后一条消息
                            setMessages(prev => {
                                const newMessages = [...prev]
                                newMessages[newMessages.length - 1] = {
                                    role: "assistant",
                                    content: assistantMessage,
                                }
                                return newMessages
                            })
                        } catch {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            console.error("发送消息失败:", error)
            setMessages(prev => [
                ...prev,
                { role: "assistant", content: `${t("common.error")}: ${(error as Error).message}` },
            ])
        } finally {
            setIsLoading(false)
            inputRef.current?.focus()
        }
    }

    // 清空对话
    const clearChat = () => {
        setMessages([])
    }

    // 新对话
    const newChat = () => {
        setMessages([])
        setInput("")
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-120px)] flex flex-col">
            {/* 页面标题 */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                    <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {t("ai.chat.title")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {t("ai.chat.subtitle")}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Coins className="h-3 w-3" />
                    <span>{formatMessage(t("ai.chat.costPerMessage"), { cost: costPerMessage })}</span>
                </div>
            </div>

            {/* 未登录提示 */}
            {!isSignedIn && (
                <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                    <CardContent className="pt-6 text-center">
                        <p className="text-yellow-700 dark:text-yellow-400">
                            {t("ai.chat.loginTip")}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* 积分不足提示 */}
            {insufficientCredits && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                            <span>
                                {formatMessage(t("ai.chat.insufficient"), {
                                    required: insufficientCredits.required,
                                    current: insufficientCredits.current,
                                })}
                            </span>
                            <Link href="/pricing">
                                <Button size="sm" variant="outline" className="ml-2">
                                    {t("ai.chat.recharge")}
                                </Button>
                            </Link>
                        </AlertDescription>
                </Alert>
            )}

            {/* 对话模式选择 */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                {modes.map((mode) => (
                    <Badge
                        key={mode.id}
                        variant={selectedMode === mode.id ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer whitespace-nowrap",
                            selectedMode === mode.id && "bg-gradient-to-r from-violet-500 to-purple-600"
                        )}
                        onClick={() => setSelectedMode(mode.id)}
                    >
                        {t(`ai.modes.${mode.id}`)}
                    </Badge>
                ))}
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={newChat} className="gap-1">
                    <MessageSquarePlus className="w-4 h-4" />
                    {t("ai.chat.newChat")}
                </Button>
                {messages.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        {t("ai.chat.clear")}
                    </Button>
                )}
            </div>

            {/* 对话区域 */}
            <Card className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4 overflow-auto" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="font-medium text-lg">{t("ai.chat.startTitle")}</h3>
                            <p className="text-muted-foreground text-sm mt-2 max-w-md">
                                {t("ai.chat.startSubtitle")}
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                {(translations.ai as { chat?: { promptSamples?: string[] } })?.chat?.promptSamples?.map((prompt) => (
                                    <Badge
                                        key={prompt}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                        onClick={() => {
                                            setInput(prompt)
                                            inputRef.current?.focus()
                                        }}
                                    >
                                        {prompt}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === "user" && "flex-row-reverse"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <User className="w-4 h-4" />
                                        ) : (
                                            <Bot className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-lg px-4 py-2",
                                            msg.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* 输入区域 */}
                <CardContent className="border-t p-4 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            ref={inputRef}
                            placeholder={isSignedIn ? t("ai.chat.inputPlaceholder") : t("ai.chat.inputLoginPlaceholder")}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            disabled={!isSignedIn || isLoading}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!isSignedIn || isLoading || !input.trim()}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
