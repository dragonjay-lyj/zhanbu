"use client"

import { notFound } from "next/navigation"
import { use } from "react"
import RelationshipPage from "../page"

// 支持的关系类型
const VALID_TYPES = ["business", "friendship", "in-law", "parent-child", "workplace"]

interface Props {
    params: Promise<{ type: string }>
}

/**
 * 关系分析子页面 - 动态路由
 */
export default function RelationshipTypePage({ params }: Props) {
    const { type } = use(params)

    if (!VALID_TYPES.includes(type)) {
        notFound()
    }

    return <RelationshipPage defaultType={type} />
}
