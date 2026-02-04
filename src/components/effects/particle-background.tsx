"use client"

import { useEffect, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { ISourceOptions } from "@tsparticles/engine"

interface ParticleBackgroundProps {
    className?: string
    theme?: "light" | "dark" | "mystical"
}

/**
 * 粒子背景组件
 * 为首页添加星空/魔法粒子效果
 */
export function ParticleBackground({ className = "", theme = "mystical" }: ParticleBackgroundProps) {
    const [init, setInit] = useState(false)

    // 初始化粒子引擎
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine)
        }).then(() => {
            setInit(true)
        })
    }, [])

    // 粒子配置
    const getOptions = (): ISourceOptions => {
        const baseLinks = {
            enable: true,
            distance: 150,
            opacity: 0.2,
            width: 1,
        }
        const baseOptions: ISourceOptions = {
            fullScreen: { enable: false },
            fpsLimit: 60,
            particles: {
                number: {
                    value: 60,
                    density: {
                        enable: true,
                    },
                },
                opacity: {
                    value: { min: 0.3, max: 0.8 },
                    animation: {
                        enable: true,
                        speed: 0.5,
                        sync: false,
                    },
                },
                size: {
                    value: { min: 1, max: 3 },
                    animation: {
                        enable: true,
                        speed: 2,
                        sync: false,
                    },
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: "none",
                    random: true,
                    straight: false,
                    outModes: {
                        default: "bounce",
                    },
                },
                links: baseLinks,
            },
            detectRetina: true,
        }

        // 根据主题调整颜色
        switch (theme) {
            case "mystical":
                return {
                    ...baseOptions,
                    particles: {
                        ...baseOptions.particles,
                        color: {
                            value: ["#8B5CF6", "#EC4899", "#6366F1", "#F59E0B"],
                        },
                        links: {
                            ...baseLinks,
                            color: "#8B5CF6",
                        },
                    },
                    background: {
                        color: "transparent",
                    },
                }
            case "dark":
                return {
                    ...baseOptions,
                    particles: {
                        ...baseOptions.particles,
                        color: {
                            value: ["#FFFFFF", "#94A3B8", "#CBD5E1"],
                        },
                        links: {
                            ...baseLinks,
                            color: "#94A3B8",
                        },
                    },
                    background: {
                        color: "transparent",
                    },
                }
            default:
                return {
                    ...baseOptions,
                    particles: {
                        ...baseOptions.particles,
                        color: {
                            value: ["#6366F1", "#8B5CF6", "#A855F7"],
                        },
                        links: {
                            ...baseLinks,
                            color: "#6366F1",
                        },
                    },
                    background: {
                        color: "transparent",
                    },
                }
        }
    }

    return (
        init ? (
            <Particles
                id="tsparticles"
                className={`absolute inset-0 -z-10 ${className}`}
                options={getOptions()}
            />
        ) : null
    )
}
