'use server'

import { generateColoringImage } from '@/lib/workers-ai'

const PHOTO_UNAVAILABLE = 'Photo-to-coloring is temporarily unavailable. Describe what you want in words instead.'

export async function generateImage(prompt: string, style: string = 'kawaii', image: string | null = null) {
    if (image) {
        return { success: false, error: PHOTO_UNAVAILABLE, code: 'photo_unavailable' }
    }
    if (!prompt || typeof prompt !== 'string') {
        return { success: false, error: 'Prompt is required' }
    }

    const subject = style && style !== 'kawaii' ? `${prompt}, ${style} style` : prompt
    const result = await generateColoringImage(subject)
    if (!result.ok) {
        return { success: false, error: result.message, code: result.code }
    }
    return { success: true, data: [result.dataUrl] }
}
