"use client"

import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
} from "recharts"

// 五行颜色
const WUXING_COLORS: Record<string, string> = {
    "木": "#22c55e", // 绿色
    "火": "#ef4444", // 红色
    "土": "#f59e0b", // 黄色
    "金": "#a8a29e", // 灰色
    "水": "#3b82f6", // 蓝色
}

interface WuxingPieChartProps {
    data: Record<string, number>
    title?: string
}

/**
 * 五行分布饼图
 */
export function WuxingPieChart({ data, title = "五行分布" }: WuxingPieChartProps) {
    // 转换数据格式
    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value,
        color: WUXING_COLORS[name] || "#94a3b8",
    }))

    return (
        <div className="w-full">
            {title && <h4 className="text-sm font-medium text-center mb-2">{title}</h4>}
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}`}
                        labelLine={false}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value}个`, '']}
                        contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

interface FortuneLineChartProps {
    data: { month: number; score: number }[]
    title?: string
    color?: string
}

/**
 * 运势折线图
 */
export function FortuneLineChart({
    data,
    title = "运势走势",
    color = "#8b5cf6",
}: FortuneLineChartProps) {
    // 格式化数据
    const chartData = data.map((item) => ({
        name: `${item.month}月`,
        score: item.score,
    }))

    return (
        <div className="w-full">
            {title && <h4 className="text-sm font-medium text-center mb-2">{title}</h4>}
            <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                    />
                    <Tooltip
                        formatter={(value) => [`${value}分`, "运势"]}
                        contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke={color}
                        strokeWidth={2}
                        fill="url(#colorScore)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

interface MultiLineChartProps {
    data: {
        month: string
        career?: number
        wealth?: number
        love?: number
        health?: number
    }[]
    title?: string
}

/**
 * 多维度运势折线图
 */
export function MultiFortuneChart({ data, title = "多维运势" }: MultiLineChartProps) {
    const COLORS = {
        career: "#8b5cf6",
        wealth: "#f59e0b",
        love: "#ec4899",
        health: "#22c55e",
    }

    const LABELS = {
        career: "事业",
        wealth: "财运",
        love: "感情",
        health: "健康",
    }

    return (
        <div className="w-full">
            {title && <h4 className="text-sm font-medium text-center mb-2">{title}</h4>}
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        className="fill-muted-foreground"
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                        }}
                    />
                    <Legend />
                    {Object.entries(COLORS).map(([key, color]) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={LABELS[key as keyof typeof LABELS]}
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
