"use client"

import { useRef, useState } from "react"
import { useDrag, useGesture } from "@use-gesture/react"
import { cn } from "@/lib/utils"

interface SwipeCardProps {
    children: React.ReactNode
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    className?: string
    threshold?: number
}

/**
 * 滑动卡片组件
 * 支持左右上下滑动手势
 */
export function SwipeCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    className,
    threshold = 100,
}: SwipeCardProps) {
    const [isPressed, setIsPressed] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    const bind = useDrag(
        ({ down, movement: [mx, my], direction: [dx, dy], cancel }) => {
            setIsPressed(down)

            if (down) {
                setOffset({ x: mx, y: my })
            } else {
                // 判断滑动方向
                if (Math.abs(mx) > Math.abs(my)) {
                    // 水平滑动
                    if (mx > threshold && onSwipeRight) {
                        onSwipeRight()
                    } else if (mx < -threshold && onSwipeLeft) {
                        onSwipeLeft()
                    }
                } else {
                    // 垂直滑动
                    if (my > threshold && onSwipeDown) {
                        onSwipeDown()
                    } else if (my < -threshold && onSwipeUp) {
                        onSwipeUp()
                    }
                }
                // 重置位置
                setOffset({ x: 0, y: 0 })
            }
        },
        { axis: "lock" }
    )

    return (
        <div
            {...bind()}
            className={cn(
                "touch-pan-y select-none cursor-grab transition-transform",
                isPressed && "cursor-grabbing",
                className
            )}
            style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${offset.x / 20}deg)`,
                transition: isPressed ? "none" : "transform 0.3s ease-out",
            }}
        >
            {children}
        </div>
    )
}

interface PinchZoomProps {
    children: React.ReactNode
    className?: string
    minScale?: number
    maxScale?: number
}

/**
 * 捏合缩放组件
 */
export function PinchZoom({
    children,
    className,
    minScale = 0.5,
    maxScale = 3,
}: PinchZoomProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const bind = useGesture(
        {
            onPinch: ({ offset: [s] }) => {
                const newScale = Math.min(Math.max(s, minScale), maxScale)
                setScale(newScale)
            },
            onDrag: ({ offset: [x, y] }) => {
                if (scale > 1) {
                    setPosition({ x, y })
                }
            },
        },
        {
            pinch: { scaleBounds: { min: minScale, max: maxScale } },
            drag: { enabled: scale > 1 },
        }
    )

    return (
        <div
            {...bind()}
            className={cn("touch-none select-none", className)}
            style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            }}
        >
            {children}
        </div>
    )
}

interface TarotFlipCardProps {
    frontContent: React.ReactNode
    backContent: React.ReactNode
    isFlipped?: boolean
    onClick?: () => void
    className?: string
}

/**
 * 塔罗牌翻转卡片
 * 支持点击和滑动翻转
 */
export function TarotFlipCard({
    frontContent,
    backContent,
    isFlipped = false,
    onClick,
    className,
}: TarotFlipCardProps) {
    const [flipped, setFlipped] = useState(isFlipped)

    const handleClick = () => {
        setFlipped(!flipped)
        onClick?.()
    }

    return (
        <div
            className={cn(
                "relative w-24 h-36 cursor-pointer perspective-1000",
                className
            )}
            onClick={handleClick}
            style={{ perspective: "1000px" }}
        >
            <div
                className="relative w-full h-full transition-transform duration-700"
                style={{
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >
                {/* 背面 */}
                <div
                    className="absolute inset-0 rounded-lg shadow-lg"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {backContent}
                </div>
                {/* 正面 */}
                <div
                    className="absolute inset-0 rounded-lg shadow-lg"
                    style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                    }}
                >
                    {frontContent}
                </div>
            </div>
        </div>
    )
}
