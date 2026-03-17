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
                <div className="relative min-h-screen overflow-x-hidden bg-background">
                    {/* 背景装饰 */}
                    <div className="fixed inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-[-6rem] left-[12%] h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
                        <div className="absolute right-[8%] top-[14rem] h-[24rem] w-[24rem] rounded-full bg-cta/10 blur-3xl" />
                        <div className="absolute bottom-[-5rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-secondary/12 blur-3xl" />
                    </div>

                    {/* 导航栏 */}
                    <Navbar />

                    <div className="flex">
                        {/* 侧边栏（桌面端） */}
                        <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:pt-[4.5rem]">
                            <Sidebar />
                        </aside>

                        {/* 主内容区 */}
                        <main id="main-content" className="flex-1 md:pl-72">
                            <div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </CreditsProvider>
        </MembershipProvider>
    )
}

