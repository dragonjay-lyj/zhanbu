import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MembershipProvider } from "@/lib/membership/provider"
import { CreditsProvider } from "@/lib/credits/provider"

/**
 * 主站点布局
 * 包含导航栏和侧边栏
 */
export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <MembershipProvider>
            <CreditsProvider>
                <div className="relative min-h-screen bg-background">
                    {/* 背景装饰 */}
                    <div className="fixed inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
                    </div>

                    {/* 导航栏 */}
                    <Navbar />

                    <div className="flex">
                        {/* 侧边栏（桌面端） */}
                        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
                            <Sidebar />
                        </aside>

                        {/* 主内容区 */}
                        <main id="main-content" className="flex-1 md:pl-64">
                            <div className="container mx-auto px-4 py-8">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </CreditsProvider>
        </MembershipProvider>
    )
}

