import { getRequestContext } from '@cloudflare/next-on-pages'
import { NextResponse } from 'next/server'
import { getClientIp } from './rate-limit'

type KvBinding = {
    get(key: string): Promise<string | null>
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

export type GuardFailure = { ok: false; response: NextResponse }
export type GuardOk = { ok: true; refund: () => Promise<void> }
export type GuardOutcome = GuardOk | GuardFailure

const MINUTE_TTL = 120
const DAY_TTL = 60 * 60 * 48
const MONTH_TTL = 60 * 60 * 24 * 40
const GRANT_TTL = 60 * 15
const STORY_IMAGE_GRANT = 5

function envNumber(name: string, fallback: number): number {
    const raw = process.env[name]
    if (raw === undefined || raw.trim() === '') return fallback
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : fallback
}

/** Millionths of a dollar so a $0.0011 image is 1100 units, not 0 cents. */
function dollarsToMicros(amount: number): number {
    return Math.round(amount * 1_000_000)
}

function dayStamp(date = new Date()): string {
    return date.toISOString().slice(0, 10)
}

function minuteStamp(date = new Date()): string {
    return date.toISOString().slice(0, 16)
}

function monthStamp(date = new Date()): string {
    return date.toISOString().slice(0, 7)
}

function jsonError(status: number, message: string, code: string, headers?: Record<string, string>) {
    return NextResponse.json(
        { success: false, error: message, code },
        { status, headers }
    )
}

export function getRateKv(): KvBinding | null {
    try {
        const { env } = getRequestContext()
        const kv = (env as { RATE_KV?: KvBinding }).RATE_KV
        if (!kv || typeof kv.get !== 'function' || typeof kv.put !== 'function') return null
        return kv
    } catch {
        return null
    }
}

async function readCount(kv: KvBinding, key: string): Promise<number> {
    const raw = await kv.get(key)
    const value = raw ? Number(raw) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
}

async function writeCount(kv: KvBinding, key: string, value: number, ttl: number) {
    await kv.put(key, String(value), { expirationTtl: ttl })
}

function turnstileSecret(): string {
    return (process.env.TURNSTILE_SECRET_KEY || '').trim()
}

export async function verifyTurnstile(token: unknown, ip: string, action: string): Promise<GuardFailure | null> {
    const secret = turnstileSecret()
    if (!secret) return null

    if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
        return {
            ok: false,
            response: jsonError(403, 'Please complete the human check and try again.', 'turnstile'),
        }
    }

    const allowedHosts = (process.env.TURNSTILE_HOSTNAMES || '')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean)

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret,
                response: token,
                remoteip: ip,
            }),
        })
        if (!response.ok) {
            return { ok: false, response: jsonError(403, 'Human check could not be verified. Please try again.', 'turnstile') }
        }
        const result = await response.json() as { success?: boolean; action?: string; hostname?: string }
        const actionOk = !result.action || result.action === action
        const hostOk = allowedHosts.length === 0 || (!!result.hostname && allowedHosts.includes(result.hostname))
        if (result.success !== true || !actionOk || !hostOk) {
            return { ok: false, response: jsonError(403, 'Human check failed. Please try again.', 'turnstile') }
        }
        return null
    } catch {
        return { ok: false, response: jsonError(403, 'Human check could not be verified. Please try again.', 'turnstile') }
    }
}

async function consumeGrant(kv: KvBinding, grant: unknown): Promise<boolean> {
    if (typeof grant !== 'string' || !/^[0-9a-f-]{36}$/i.test(grant)) return false
    const key = `grant:${grant}`
    const remaining = await readCount(kv, key)
    if (remaining <= 0) return false
    await writeCount(kv, key, remaining - 1, GRANT_TTL)
    return true
}

export async function issueStoryGrant(kv: KvBinding): Promise<string | undefined> {
    if (!turnstileSecret()) return undefined
    const id = crypto.randomUUID()
    await writeCount(kv, `grant:${id}`, STORY_IMAGE_GRANT, GRANT_TTL)
    return id
}

async function enforceCounters(
    kv: KvBinding,
    ip: string,
    minuteLimit: number,
    reserveMicros: number,
): Promise<GuardOutcome> {
    const now = new Date()
    const minuteKey = `ip:${ip}:m:${minuteStamp(now)}`
    const dayKey = `ip:${ip}:d:${dayStamp(now)}`
    const globalKey = `global:d:${dayStamp(now)}`
    const spendDayKey = `spendu:d:${dayStamp(now)}`
    const spendMonthKey = `spendu:m:${monthStamp(now)}`

    const ipDailyLimit = envNumber('IP_DAILY_LIMIT', 30)
    const globalLimit = envNumber('DAILY_GLOBAL_LIMIT', 200)
    const dailyBudget = dollarsToMicros(envNumber('DAILY_BUDGET_USD', 3))
    const monthlyBudget = dollarsToMicros(envNumber('MONTHLY_BUDGET_USD', 30))

    const [minuteCount, dayCount, globalCount, spendDay, spendMonth] = await Promise.all([
        readCount(kv, minuteKey),
        readCount(kv, dayKey),
        readCount(kv, globalKey),
        readCount(kv, spendDayKey),
        readCount(kv, spendMonthKey),
    ])

    if (minuteCount >= minuteLimit) {
        return { ok: false, response: jsonError(429, 'Too many requests. Please wait a minute and try again.', 'ip_minute') }
    }
    if (dayCount >= ipDailyLimit) {
        return { ok: false, response: jsonError(429, "You've reached today's limit for this network. Please try again tomorrow.", 'ip_daily') }
    }
    if (globalCount >= globalLimit) {
        return { ok: false, response: jsonError(429, "We've reached today's generation limit. Please try again tomorrow.", 'global_daily') }
    }
    if (reserveMicros > 0 && spendDay + reserveMicros > dailyBudget) {
        return { ok: false, response: jsonError(429, 'Image generation is paused for today. Please try again tomorrow.', 'daily_budget') }
    }
    if (reserveMicros > 0 && spendMonth + reserveMicros > monthlyBudget) {
        return { ok: false, response: jsonError(429, 'Image generation is paused until next month.', 'monthly_budget') }
    }

    await Promise.all([
        writeCount(kv, minuteKey, minuteCount + 1, MINUTE_TTL),
        writeCount(kv, dayKey, dayCount + 1, DAY_TTL),
        writeCount(kv, globalKey, globalCount + 1, DAY_TTL),
        reserveMicros > 0 ? writeCount(kv, spendDayKey, spendDay + reserveMicros, DAY_TTL) : Promise.resolve(),
        reserveMicros > 0 ? writeCount(kv, spendMonthKey, spendMonth + reserveMicros, MONTH_TTL) : Promise.resolve(),
    ])

    return {
        ok: true,
        refund: async () => {
            if (reserveMicros <= 0) return
            const [latestDay, latestMonth] = await Promise.all([
                readCount(kv, spendDayKey),
                readCount(kv, spendMonthKey),
            ])
            await Promise.all([
                writeCount(kv, spendDayKey, Math.max(0, latestDay - reserveMicros), DAY_TTL),
                writeCount(kv, spendMonthKey, Math.max(0, latestMonth - reserveMicros), MONTH_TTL),
            ])
        },
    }
}

function missingKv(): GuardFailure {
    return {
        ok: false,
        response: jsonError(503, 'Image generation is temporarily unavailable.', 'kv_unavailable'),
    }
}

export async function authorizeImageGeneration(req: Request, body: { turnstileToken?: unknown; generationGrant?: unknown }): Promise<GuardOutcome> {
    const kv = getRateKv()
    if (!kv) return missingKv()

    const ip = getClientIp(req)
    if (turnstileSecret()) {
        const grantOk = await consumeGrant(kv, body.generationGrant)
        if (!grantOk) {
            const turnstileError = await verifyTurnstile(body.turnstileToken, ip, 'generate')
            if (turnstileError) return turnstileError
        }
    }

    const costMicros = dollarsToMicros(envNumber('COST_PER_IMAGE_USD', 0.0011))
    const minuteLimit = envNumber('IP_MINUTE_LIMIT', 10)
    return enforceCounters(kv, ip, minuteLimit, costMicros)
}

export async function authorizeStoryGeneration(req: Request, body: { turnstileToken?: unknown }): Promise<GuardOutcome> {
    const kv = getRateKv()
    if (!kv) return missingKv()

    const ip = getClientIp(req)
    if (turnstileSecret()) {
        const turnstileError = await verifyTurnstile(body.turnstileToken, ip, 'story')
        if (turnstileError) return turnstileError
    }

    const minuteLimit = envNumber('STORY_MINUTE_LIMIT', 20)
    return enforceCounters(kv, ip, minuteLimit, 0)
}
