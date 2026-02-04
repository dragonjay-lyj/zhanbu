"use client"

import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

/**
 * 占卜报告导出工具
 */

interface ReportData {
    title: string
    type: string
    date: string
    content: {
        section: string
        text: string
    }[]
    score?: number
    advice?: string
}

/**
 * 导出 PDF 报告
 */
export async function exportToPdf(
    elementId: string,
    filename: string = "divination-report"
): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
        throw new Error("导出元素不存在")
    }

    // 使用 html2canvas 将元素转换为图片
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)

    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 10

    pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)

    // 添加页脚
    pdf.setFontSize(8)
    pdf.setTextColor(150)
    pdf.text("占卜大师 - 专业 AI 命理平台", pdfWidth / 2, pdfHeight - 10, { align: "center" })

    pdf.save(`${filename}.pdf`)
}

/**
 * 生成结构化 PDF 报告
 */
export async function generateStructuredPdf(data: ReportData): Promise<void> {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    let currentY = 20

    // 标题
    pdf.setFontSize(20)
    pdf.setTextColor(88, 28, 135) // 紫色
    pdf.text(data.title, pageWidth / 2, currentY, { align: "center" })
    currentY += 15

    // 类型和日期
    pdf.setFontSize(10)
    pdf.setTextColor(100)
    pdf.text(`类型：${data.type} | 日期：${data.date}`, pageWidth / 2, currentY, { align: "center" })
    currentY += 15

    // 分割线
    pdf.setDrawColor(200)
    pdf.line(20, currentY, pageWidth - 20, currentY)
    currentY += 10

    // 内容区域
    pdf.setTextColor(50)
    for (const section of data.content) {
        // 章节标题
        pdf.setFontSize(14)
        pdf.setTextColor(88, 28, 135)
        pdf.text(section.section, 20, currentY)
        currentY += 8

        // 章节内容
        pdf.setFontSize(10)
        pdf.setTextColor(80)
        const lines = pdf.splitTextToSize(section.text, pageWidth - 40)
        pdf.text(lines, 20, currentY)
        currentY += lines.length * 5 + 10

        // 检查是否需要换页
        if (currentY > 270) {
            pdf.addPage()
            currentY = 20
        }
    }

    // 评分（如果有）
    if (data.score !== undefined) {
        currentY += 5
        pdf.setFontSize(16)
        pdf.setTextColor(34, 197, 94) // 绿色
        pdf.text(`综合评分：${data.score} 分`, pageWidth / 2, currentY, { align: "center" })
        currentY += 10
    }

    // 建议（如果有）
    if (data.advice) {
        pdf.setFontSize(12)
        pdf.setTextColor(245, 158, 11) // 橙色
        pdf.text("💡 建议", 20, currentY)
        currentY += 6
        pdf.setFontSize(10)
        pdf.setTextColor(80)
        const adviceLines = pdf.splitTextToSize(data.advice, pageWidth - 40)
        pdf.text(adviceLines, 20, currentY)
    }

    // 页脚
    const pageHeight = pdf.internal.pageSize.getHeight()
    pdf.setFontSize(8)
    pdf.setTextColor(150)
    pdf.text("占卜大师 - 专业 AI 命理平台 | zhanbu.com", pageWidth / 2, pageHeight - 10, { align: "center" })

    pdf.save(`${data.type}-report-${data.date}.pdf`)
}

/**
 * 生成分享图片
 */
export async function generateShareImage(elementId: string): Promise<string> {
    const element = document.getElementById(elementId)
    if (!element) {
        throw new Error("分享元素不存在")
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f0f23",
        logging: false,
    })

    return canvas.toDataURL("image/png")
}

/**
 * 下载分享图片
 */
export async function downloadShareImage(
    elementId: string,
    filename: string = "share-card"
): Promise<void> {
    const dataUrl = await generateShareImage(elementId)

    const link = document.createElement("a")
    link.download = `${filename}.png`
    link.href = dataUrl
    link.click()
}

/**
 * 复制图片到剪贴板
 */
export async function copyImageToClipboard(elementId: string): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
        throw new Error("分享元素不存在")
    }

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f0f23",
    })

    canvas.toBlob(async (blob) => {
        if (blob) {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                ])
            } catch (err) {
                console.error("复制到剪贴板失败:", err)
                throw err
            }
        }
    }, "image/png")
}
