"use client"

import { useState, useEffect } from "react"
import {
    Settings,
    Save,
    Loader2,
    Crown,
    Link as LinkIcon,
    RefreshCw,
    Check,
    Bot,
    Zap,
    AlertCircle,
    CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Plan {
    id: string
    name: string
    description: string
    price: number
    original_price: number | null
    period: string
    duration_days: number
    daily_quota: number
    features: string[]
    is_active: boolean
    sort_order: number
}

interface SettingsData {
    settings: Record<string, unknown>
    plans: Plan[]
}

/**
 * Admin 系统设置页面
 */
export default function AdminSettingsPage() {
    const [data, setData] = useState<SettingsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    const [paymentUrl, setPaymentUrl] = useState("")
    const [siteName, setSiteName] = useState("")
    const [siteDescription, setSiteDescription] = useState("")
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [registrationEnabled, setRegistrationEnabled] = useState(true)

    const [aiApiKey, setAiApiKey] = useState("")
    const [aiApiBaseUrl, setAiApiBaseUrl] = useState("")
    const [aiModel, setAiModel] = useState("")
    const [enableAiAnalysis, setEnableAiAnalysis] = useState(true)

    // AI 连接测试
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
    const [availableModels, setAvailableModels] = useState<string[]>([])

    // 套餐编辑
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [planForm, setPlanForm] = useState({
        name: "",
        description: "",
        price: 0,
        original_price: 0,
        daily_quota: 0,
        is_active: true,
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/admin/settings")
            const result = await response.json()

            if (result.success) {
                setData(result.data)
                // 初始化表单值
                const s = result.data.settings
                setPaymentUrl(String(s.payment_url || "").replace(/"/g, ""))
                setSiteName(String(s.site_name || "").replace(/"/g, ""))
                setSiteDescription(String(s.site_description || "").replace(/"/g, ""))
                setMaintenanceMode(s.maintenance_mode === true || s.maintenance_mode === "true")
                setRegistrationEnabled(s.registration_enabled !== false && s.registration_enabled !== "false")
                // AI 配置
                setAiApiKey(String(s.ai_api_key || "").replace(/"/g, ""))
                setAiApiBaseUrl(String(s.ai_api_base_url || "https://api.deepseek.com/v1").replace(/"/g, ""))
                setAiModel(String(s.ai_model || "deepseek-chat").replace(/"/g, ""))
                setEnableAiAnalysis(s.enable_ai_analysis !== false && s.enable_ai_analysis !== "false")
            }
        } catch (err) {
            console.error("获取设置失败:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const updateSetting = async (key: string, value: unknown) => {
        try {
            setIsSaving(true)
            await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key, value }),
            })
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
        } catch (err) {
            console.error("更新设置失败:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const saveGeneralSettings = async () => {
        await updateSetting("site_name", siteName)
        await updateSetting("site_description", siteDescription)
        await updateSetting("maintenance_mode", maintenanceMode)
        await updateSetting("registration_enabled", registrationEnabled)
    }

    const savePaymentSettings = async () => {
        await updateSetting("payment_url", paymentUrl)
    }

    const saveAiSettings = async () => {
        await updateSetting("ai_api_key", aiApiKey)
        await updateSetting("ai_api_base_url", aiApiBaseUrl)
        await updateSetting("ai_model", aiModel)
        await updateSetting("enable_ai_analysis", enableAiAnalysis)
    }

    // 测试 AI 连接
    const testAiConnection = async () => {
        if (!aiApiKey || !aiApiBaseUrl) {
            setTestResult({ success: false, message: "请先填写 API Key 和 Base URL" })
            return
        }

        setIsTesting(true)
        setTestResult(null)

        try {
            const response = await fetch("/api/admin/ai-test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey: aiApiKey, baseUrl: aiApiBaseUrl }),
            })
            const data = await response.json()

            if (data.success) {
                setTestResult({ success: true, message: data.message })
                if (data.models && data.models.length > 0) {
                    setAvailableModels(data.models)
                    // 如果当前没有选择模型，自动选择第一个
                    if (!aiModel) {
                        setAiModel(data.models[0])
                    }
                }
            } else {
                setTestResult({ success: false, message: data.error || "连接失败" })
            }
        } catch {
            setTestResult({ success: false, message: "网络请求失败" })
        } finally {
            setIsTesting(false)
        }
    }

    const savePlan = async () => {
        if (!editingPlan) return

        try {
            setIsSaving(true)
            await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingPlan.id,
                    ...planForm,
                }),
            })
            setEditingPlan(null)
            fetchSettings()
        } catch (err) {
            console.error("更新套餐失败:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const openPlanEditor = (plan: Plan) => {
        setEditingPlan(plan)
        setPlanForm({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            original_price: plan.original_price || 0,
            daily_quota: plan.daily_quota,
            is_active: plan.is_active,
        })
    }

    const formatPrice = (cents: number) => (cents / 100).toFixed(2)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">系统设置</h1>
                    <p className="text-muted-foreground">管理网站配置和会员套餐</p>
                </div>
                <Button onClick={fetchSettings} variant="outline" className="cursor-pointer">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新
                </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="general" className="cursor-pointer">基础设置</TabsTrigger>
                    <TabsTrigger value="ai" className="cursor-pointer">AI 配置</TabsTrigger>
                    <TabsTrigger value="payment" className="cursor-pointer">支付设置</TabsTrigger>
                    <TabsTrigger value="plans" className="cursor-pointer">会员套餐</TabsTrigger>
                </TabsList>

                {/* 基础设置 */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>基础设置</CardTitle>
                            <CardDescription>配置网站基本信息</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="siteName">网站名称</Label>
                                <Input
                                    id="siteName"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    placeholder="占卜网"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="siteDescription">网站描述</Label>
                                <Input
                                    id="siteDescription"
                                    value={siteDescription}
                                    onChange={(e) => setSiteDescription(e.target.value)}
                                    placeholder="专业在线占卜平台"
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>维护模式</Label>
                                    <p className="text-sm text-muted-foreground">开启后普通用户无法访问</p>
                                </div>
                                <Switch
                                    checked={maintenanceMode}
                                    onCheckedChange={setMaintenanceMode}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>开放注册</Label>
                                    <p className="text-sm text-muted-foreground">允许新用户注册</p>
                                </div>
                                <Switch
                                    checked={registrationEnabled}
                                    onCheckedChange={setRegistrationEnabled}
                                />
                            </div>

                            <Button onClick={saveGeneralSettings} disabled={isSaving} className="cursor-pointer">
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <Check className="mr-2 h-4 w-4" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                保存设置
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI 配置 */}
                <TabsContent value="ai">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                AI 配置
                            </CardTitle>
                            <CardDescription>配置 AI 解读功能的 API 参数</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>启用 AI 分析</Label>
                                    <p className="text-sm text-muted-foreground">开启后用户可以获取 AI 深度解读</p>
                                </div>
                                <Switch
                                    checked={enableAiAnalysis}
                                    onCheckedChange={setEnableAiAnalysis}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="aiApiKey">API Key</Label>
                                <Input
                                    id="aiApiKey"
                                    type="password"
                                    value={aiApiKey}
                                    onChange={(e) => setAiApiKey(e.target.value)}
                                    placeholder="sk-xxxx..."
                                />
                                <p className="text-sm text-muted-foreground">
                                    支持 OpenAI、DeepSeek、OpenRouter 等 API
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="aiApiBaseUrl">API Base URL</Label>
                                <Input
                                    id="aiApiBaseUrl"
                                    value={aiApiBaseUrl}
                                    onChange={(e) => setAiApiBaseUrl(e.target.value)}
                                    placeholder="https://api.deepseek.com/v1"
                                />
                                <p className="text-sm text-muted-foreground">
                                    DeepSeek: https://api.deepseek.com/v1 | OpenAI: https://api.openai.com/v1
                                </p>
                            </div>

                            {/* 测试连接按钮 */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={testAiConnection}
                                    disabled={isTesting || !aiApiKey || !aiApiBaseUrl}
                                    className="cursor-pointer"
                                >
                                    {isTesting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Zap className="mr-2 h-4 w-4" />
                                    )}
                                    测试连接并获取模型
                                </Button>
                                {testResult && (
                                    <div className={`flex items-center gap-2 text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                                        {testResult.success ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        {testResult.message}
                                    </div>
                                )}
                            </div>

                            {/* 模型选择 */}
                            <div className="space-y-2">
                                <Label htmlFor="aiModel">模型名称</Label>
                                {availableModels.length > 0 ? (
                                    <Select value={aiModel} onValueChange={setAiModel}>
                                        <SelectTrigger className="cursor-pointer">
                                            <SelectValue placeholder="选择模型" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableModels.map((model) => (
                                                <SelectItem key={model} value={model} className="cursor-pointer">
                                                    {model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="aiModel"
                                        value={aiModel}
                                        onChange={(e) => setAiModel(e.target.value)}
                                        placeholder="deepseek-chat"
                                    />
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {availableModels.length > 0 ? (
                                        <span className="text-green-600">✓ 已获取 {availableModels.length} 个可用模型</span>
                                    ) : (
                                        '点击"测试连接"自动获取可用模型，或手动输入'
                                    )}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={saveAiSettings} disabled={isSaving} className="cursor-pointer">
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : saveSuccess ? (
                                        <Check className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    保存设置
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 支付设置 */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LinkIcon className="h-5 w-5" />
                                支付设置
                            </CardTitle>
                            <CardDescription>配置闲鱼支付链接</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="paymentUrl">闲鱼支付链接</Label>
                                <Input
                                    id="paymentUrl"
                                    value={paymentUrl}
                                    onChange={(e) => setPaymentUrl(e.target.value)}
                                    placeholder="https://goofish.com/item/xxx"
                                />
                                <p className="text-sm text-muted-foreground">
                                    用户点击"立即开通"后会跳转到此链接
                                </p>
                            </div>

                            <Button onClick={savePaymentSettings} disabled={isSaving} className="cursor-pointer">
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                保存设置
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 会员套餐 */}
                <TabsContent value="plans">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5" />
                                会员套餐管理
                            </CardTitle>
                            <CardDescription>编辑会员套餐信息和价格</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.plans?.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">{plan.name}</h4>
                                                {!plan.is_active && (
                                                    <Badge variant="secondary">已禁用</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                                            <p className="text-lg font-bold">
                                                ¥{formatPrice(plan.price)}
                                                {plan.original_price && plan.original_price > plan.price && (
                                                    <span className="ml-2 text-sm text-muted-foreground line-through">
                                                        ¥{formatPrice(plan.original_price)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => openPlanEditor(plan)}
                                            className="cursor-pointer"
                                        >
                                            编辑
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 编辑套餐弹窗 */}
                    {editingPlan && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>编辑套餐：{editingPlan.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>套餐名称</Label>
                                        <Input
                                            value={planForm.name}
                                            onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>套餐描述</Label>
                                        <Input
                                            value={planForm.description}
                                            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>价格（分）</Label>
                                        <Input
                                            type="number"
                                            value={planForm.price}
                                            onChange={(e) => setPlanForm({ ...planForm, price: parseInt(e.target.value) || 0 })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            当前：¥{formatPrice(planForm.price)}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>原价（分）</Label>
                                        <Input
                                            type="number"
                                            value={planForm.original_price}
                                            onChange={(e) => setPlanForm({ ...planForm, original_price: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>每日配额（-1 为无限）</Label>
                                        <Input
                                            type="number"
                                            value={planForm.daily_quota}
                                            onChange={(e) => setPlanForm({ ...planForm, daily_quota: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={planForm.is_active}
                                            onCheckedChange={(v) => setPlanForm({ ...planForm, is_active: v })}
                                        />
                                        <Label>启用套餐</Label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingPlan(null)} className="cursor-pointer">
                                        取消
                                    </Button>
                                    <Button onClick={savePlan} disabled={isSaving} className="cursor-pointer">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        保存
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
