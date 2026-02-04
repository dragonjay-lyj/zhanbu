import Link from "next/link"
import { WifiOff, Home, RefreshCw } from "lucide-react"

/**
 * 离线页面
 */
export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <div className="text-center max-w-lg text-white">
                {/* 离线图标 */}
                <div className="relative mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-700/50 backdrop-blur">
                        <WifiOff className="w-12 h-12 text-slate-400" />
                    </div>
                    {/* 信号波动画 */}
                    <div className="absolute inset-0 rounded-full border-2 border-slate-500/30 animate-ping" />
                </div>

                <h1 className="text-3xl font-bold mb-3">
                    您当前处于离线状态
                </h1>
                <p className="text-slate-400 mb-8 text-lg">
                    请检查您的网络连接，或者尝试以下操作：
                </p>

                {/* 提示列表 */}
                <div className="bg-slate-800/50 rounded-lg p-6 mb-8 text-left">
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">1</span>
                            <span>检查 Wi-Fi 或移动数据是否已开启</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
                            <span>尝试切换网络或重启路由器</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">3</span>
                            <span>等待网络恢复后刷新页面</span>
                        </li>
                    </ul>
                </div>

                {/* 动作按钮 */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                    >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        刷新页面
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 border border-slate-600 hover:bg-slate-700 rounded-lg transition"
                    >
                        <Home className="w-5 h-5 mr-2" />
                        返回首页
                    </Link>
                </div>

                {/* 离线可用功能提示 */}
                <div className="mt-12 pt-8 border-t border-slate-700">
                    <p className="text-sm text-slate-500">
                        部分已缓存的内容在离线状态下仍可访问
                    </p>
                </div>
            </div>
        </div>
    )
}
