import { SignIn } from "@clerk/nextjs"

/**
 * 登录页面
 */
export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            {/* 背景装饰 */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md p-4">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl font-bold text-gradient mb-2">
                        ZhanBu 占卜
                    </h1>
                    <p className="text-muted-foreground">
                        登录以保存您的占卜记录
                    </p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-card/80 backdrop-blur-lg border border-border/50 shadow-xl",
                            headerTitle: "font-serif",
                            headerSubtitle: "text-muted-foreground",
                            formButtonPrimary: "bg-primary hover:bg-primary/90",
                            footerActionLink: "text-primary hover:text-primary/80",
                        },
                    }}
                />
            </div>
        </div>
    )
}
