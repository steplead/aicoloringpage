import { NextRequest, NextResponse } from 'next/server';
import { authorizeImageGeneration } from '@/lib/abuse-guard';
import { generateColoringImage } from '@/lib/workers-ai';

export const runtime = 'edge';

const PHOTO_UNAVAILABLE = 'Photo-to-coloring is temporarily unavailable. Describe what you want in words instead.'

export async function POST(req: NextRequest) {
    let delivered = false
    let refund: (() => Promise<void>) | null = null
    try {
        const body = await req.json();
        const { prompt, style = 'kawaii', image } = body;

        if (image) {
            return NextResponse.json({
                success: false,
                error: PHOTO_UNAVAILABLE,
                code: 'photo_unavailable',
            }, { status: 422 });
        }

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
        }
        if (prompt.length > 500) {
            return NextResponse.json({ success: false, error: 'Prompt too long (max 500 characters)' }, { status: 400 });
        }

        const allowedStyles = ['kawaii', 'intricate', 'stained-glass', 'abstract', 'fantasy', 'realistic'];
        if (style && !allowedStyles.includes(style)) {
            return NextResponse.json({ success: false, error: 'Invalid style' }, { status: 400 });
        }

        const guard = await authorizeImageGeneration(req, body)
        if (!guard.ok) return guard.response
        refund = guard.refund

        const subject = style && style !== 'kawaii' ? `${prompt}, ${style} style` : prompt
        const imageResult = await generateColoringImage(subject)
        if (!imageResult.ok) {
            const status = imageResult.code === 'nsfw' ? 422 : imageResult.code === 'ai_unavailable' ? 503 : 502
            return NextResponse.json({ success: false, error: imageResult.message, code: imageResult.code }, { status })
        }

        delivered = true
        return NextResponse.json({
            success: true,
            data: [imageResult.dataUrl],
        })
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    } finally {
        if (!delivered && refund) await refund()
    }
}
