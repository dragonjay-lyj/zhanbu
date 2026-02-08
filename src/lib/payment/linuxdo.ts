import crypto from "crypto"

type SignValue = string | number | null | undefined
type SignParams = Record<string, SignValue>

function hasValue(value: SignValue) {
    return value !== undefined && value !== null && String(value).trim() !== ""
}

export function buildLinuxDoSignPayload(params: SignParams): string {
    return Object.keys(params)
        .filter((key) => key !== "sign" && key !== "sign_type" && hasValue(params[key]))
        .sort()
        .map((key) => `${key}=${String(params[key])}`)
        .join("&")
}

export function signLinuxDoParams(params: SignParams, secret: string): string {
    const payload = buildLinuxDoSignPayload(params)
    return crypto
        .createHash("md5")
        .update(`${payload}${secret}`)
        .digest("hex")
        .toLowerCase()
}

export function verifyLinuxDoSign(params: SignParams, sign: string | null | undefined, secret: string): boolean {
    if (!sign) return false

    const expected = signLinuxDoParams(params, secret)
    try {
        return crypto.timingSafeEqual(Buffer.from(String(sign).toLowerCase()), Buffer.from(expected))
    } catch {
        return false
    }
}

export function formatCentsToMoney(cents: number): string {
    if (!Number.isInteger(cents) || cents <= 0) {
        throw new Error("金额必须为大于 0 的整数（分）")
    }

    const integerPart = Math.floor(cents / 100)
    const decimalPart = String(cents % 100).padStart(2, "0")
    return `${integerPart}.${decimalPart}`
}

export function parseMoneyToCents(rawMoney: string | number | null | undefined): number | null {
    if (rawMoney === undefined || rawMoney === null) return null

    const money = String(rawMoney).trim()
    if (!/^\d+(\.\d{1,2})?$/.test(money)) {
        return null
    }

    const [intPart, decimalPart = ""] = money.split(".")
    const paddedDecimal = `${decimalPart}00`.slice(0, 2)
    const intValue = Number(intPart)
    const decimalValue = Number(paddedDecimal)

    if (!Number.isFinite(intValue) || !Number.isFinite(decimalValue)) {
        return null
    }

    return intValue * 100 + decimalValue
}
