import { getRequestContext } from '@cloudflare/next-on-pages'

const FLUX_MODEL = '@cf/black-forest-labs/flux-1-schnell'
const STORY_MODEL = '@cf/meta/llama-3.1-8b-instruct'

const COLORING_TEMPLATE =
    'Black and white coloring page for kids: %s. Clean line art with thick bold black outlines on a pure white background, simple shapes, large open areas to color, no shading, no gray, no color, no gradients, no text, centered single subject, cute and friendly cartoon style, printable.'

type AiBinding = {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>
}

export function coloringPrompt(subject: string): string {
    return COLORING_TEMPLATE.replace('%s', subject.replace(/\s+/g, ' ').trim())
}

export function softenSubject(subject: string): string {
    const trimmed = subject.replace(/\s+/g, ' ').trim()
    if (/^a friendly\b/i.test(trimmed)) return trimmed
    return `a friendly ${trimmed}`
}

function errorText(error: unknown): string {
    if (error instanceof Error) return `${error.name} ${error.message}`
    try {
        return JSON.stringify(error)
    } catch {
        return String(error)
    }
}

function isErrorPayload(result: unknown): boolean {
    if (!result || typeof result !== 'object') return false
    if (result instanceof Uint8Array || result instanceof ArrayBuffer || result instanceof ReadableStream || result instanceof Response) {
        return false
    }
    if ('image' in result) return false
    return 'errors' in result || 'error' in result || 'code' in result
}

export function isNsfwError(error: unknown): boolean {
    const message = errorText(error)
    return message.includes('8007') || /nsfw/i.test(message)
}

export function getAiBinding(): AiBinding | null {
    try {
        const { env } = getRequestContext()
        const ai = (env as { AI?: AiBinding }).AI
        if (!ai || typeof ai.run !== 'function') return null
        return ai
    } catch {
        return null
    }
}

async function toDataUrl(result: unknown): Promise<string | null> {
    const fromBase64 = (value: string) => {
        const cleaned = value.replace(/^data:image\/\w+;base64,/, '').replace(/\s/g, '')
        if (!cleaned) return null
        return `data:image/jpeg;base64,${cleaned}`
    }

    if (typeof result === 'string') return fromBase64(result)
    if (result instanceof Uint8Array) return fromBase64(bytesToBase64(result))
    if (result instanceof ArrayBuffer) return fromBase64(bytesToBase64(new Uint8Array(result)))
    if (result instanceof ReadableStream) {
        const buffer = await new Response(result).arrayBuffer()
        return fromBase64(bytesToBase64(new Uint8Array(buffer)))
    }
    if (result instanceof Response) {
        const buffer = await result.arrayBuffer()
        return fromBase64(bytesToBase64(new Uint8Array(buffer)))
    }
    if (result && typeof result === 'object' && 'image' in result) {
        const image = (result as { image?: unknown }).image
        if (typeof image === 'string') return fromBase64(image)
        if (image instanceof Uint8Array) return fromBase64(bytesToBase64(image))
    }
    return null
}

function llamaText(result: unknown): string {
    if (typeof result === 'string') return result
    if (!result || typeof result !== 'object') return ''
    const record = result as { response?: unknown; result?: { response?: unknown } }
    if (typeof record.response === 'string') return record.response
    if (typeof record.result?.response === 'string') return record.result.response
    return ''
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = ''
    const chunk = 0x8000
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    }
    return btoa(binary)
}

async function runFlux(ai: AiBinding, subject: string): Promise<string> {
    const result = await ai.run(FLUX_MODEL, {
        prompt: coloringPrompt(subject),
        steps: 8,
        width: 1024,
        height: 1024,
    })
    if (isErrorPayload(result) && isNsfwError(result)) throw new Error(errorText(result))
    const dataUrl = await toDataUrl(result)
    if (!dataUrl) throw new Error(`Workers AI returned no image: ${errorText(result).slice(0, 300)}`)
    return dataUrl
}

export async function generateColoringImage(subject: string): Promise<
    | { ok: true; dataUrl: string }
    | { ok: false; code: 'ai_unavailable' | 'nsfw' | 'ai_error'; message: string }
> {
    const ai = getAiBinding()
    if (!ai) {
        return {
            ok: false,
            code: 'ai_unavailable',
            message: 'Image generation is temporarily unavailable.',
        }
    }

    try {
        return { ok: true, dataUrl: await runFlux(ai, subject) }
    } catch (error) {
        if (!isNsfwError(error)) {
            console.error('Workers AI image error', error)
            return {
                ok: false,
                code: 'ai_error',
                message: 'Image generation failed. Please try again in a moment.',
            }
        }
    }

    try {
        return { ok: true, dataUrl: await runFlux(ai, softenSubject(subject)) }
    } catch (error) {
        console.error('Workers AI image retry error', error)
        if (isNsfwError(error)) {
            return {
                ok: false,
                code: 'nsfw',
                message: "We couldn't make a coloring page from that description. Try a simpler, friendlier subject.",
            }
        }
        return {
            ok: false,
            code: 'ai_error',
            message: 'Image generation failed. Please try again in a moment.',
        }
    }
}

export async function generateStoryOutline(prompt: string): Promise<
    | { ok: true; text: string }
    | { ok: false; message: string }
> {
    const ai = getAiBinding()
    if (!ai) {
        return { ok: false, message: 'Story generation is temporarily unavailable.' }
    }
    try {
        const result = await ai.run(STORY_MODEL, {
            messages: [
                {
                    role: 'system',
                    content: 'You write coloring-book scene lists for children. Reply with only a JSON array of exactly 5 strings. No markdown.',
                },
                { role: 'user', content: prompt },
            ],
            max_tokens: 500,
        })
        const text = llamaText(result)
        if (!text.trim()) return { ok: false, message: 'Story generation returned an empty outline.' }
        return { ok: true, text }
    } catch (error) {
        console.error('Workers AI story error', error)
        return { ok: false, message: 'Story generation failed. Please try again in a moment.' }
    }
}
