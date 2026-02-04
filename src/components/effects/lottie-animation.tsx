"use client"

import { Player, Controls } from "@lottiefiles/react-lottie-player"

interface LottieAnimationProps {
    src: string
    loop?: boolean
    autoplay?: boolean
    className?: string
    style?: React.CSSProperties
}

/**
 * Lottie 动画组件封装
 */
export function LottieAnimation({
    src,
    loop = true,
    autoplay = true,
    className = "",
    style,
}: LottieAnimationProps) {
    return (
        <Player
            src={src}
            loop={loop}
            autoplay={autoplay}
            className={className}
            style={style}
        />
    )
}

// 预设的占卜相关 Lottie 动画 URL
export const LottieAnimations = {
    // 星星闪烁
    stars: "https://lottie.host/embed/ee63cefc-4a1a-43e0-9e45-c05f2eb39e8e/Jp5mYTrxHa.json",
    // 水晶球
    crystalBall: "https://lottie.host/embed/5f93aa42-e47d-4b7d-9f94-a6e16d5d05f2/q1TqPwqcKU.json",
    // 塔罗牌
    tarot: "https://lottie.host/embed/f93acd5b-7a3f-4b3a-b0b4-5f5c3c3b3b3b/tarot.json",
    // 加载中
    loading: "https://lottie.host/embed/6fa2b8b2-3c36-4e21-ad7a-19b8e285b2a2/g1VcjdInrk.json",
    // 成功
    success: "https://lottie.host/embed/fbe60cc7-f3d1-4e3a-9c2d-e57d4c2dbaa9/nrWKdlILEf.json",
    // 魔法圈
    magicCircle: "https://lottie.host/embed/4b5a5a5a-5a5a-5a5a-5a5a-5a5a5a5a5a5a/magic.json",
}
