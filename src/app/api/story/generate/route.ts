import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini-client';
import { getClientIp, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

// Rate limiting: 20 requests per minute per IP (story is cheaper)
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60000; // 1 minute

export async function POST(req: NextRequest) {
    try {
        // 1. Rate limiting check
        const ip = getClientIp(req);
        const rateLimitResult = checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS);

        if (!rateLimitResult.allowed) {
            return NextResponse.json({
                success: false,
                error: 'Rate limit exceeded',
                message: `Too many requests. Please try again later.`,
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            }, {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': RATE_LIMIT.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                }
            });
        }

        // 2. API Key check
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key missing on server' }, { status: 500 });
        }

        // 3. Validate and sanitize input
        const body = await req.json();
        const { character, theme } = body;

        // Input validation
        if (!character || !theme) {
            return NextResponse.json({ success: false, error: 'Character and theme are required' }, { status: 400 });
        }

        if (typeof character !== 'string' || typeof theme !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid input format' }, { status: 400 });
        }

        if (character.length > 100 || theme.length > 100) {
            return NextResponse.json({ success: false, error: 'Input too long (max 100 characters each)' }, { status: 400 });
        }

        const prompt = `Create a simple, engaging 5-scene story outline for a children's coloring book.

        Character: ${character}
        Theme/Setting: ${theme}

        Output format: JSON Array of strings. Each string is a description of a scene.
        Example: ["Scene 1: [Character] doing X", "Scene 2: [Character] goes to Y", ...]

        Requirements:
        - Exactly 5 scenes.
        - Simple, visual descriptions suitable for a coloring page.
        - Keep the character consistent.
        - Return ONLY the JSON array. No markdown, no code blocks.`;

        const data = await generateContent(apiKey, prompt);

        // Extract text from Gemini response structure
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Check for refusal/blocking
        if (!text || data.promptFeedback?.blockReason) {
            return NextResponse.json({ success: false, error: 'AI refused to generate story.' }, { status: 422 });
        }

        // Clean up response to ensure valid JSON
        let cleanResponse = text.trim();
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json/g, '').replace(/```/g, '');
        }

        // Sanitize: sometimes models wrap in ``` only
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```/g, '');
        }

        let scenes;
        try {
            scenes = JSON.parse(cleanResponse);
        } catch (e) {
            console.error("JSON Parse Error", cleanResponse);
            return NextResponse.json({ success: false, error: 'Failed to parse story format.' }, { status: 500 });
        }

        // Validate scenes format
        if (!Array.isArray(scenes) || scenes.length !== 5) {
            return NextResponse.json({ success: false, error: 'Invalid story format. Expected 5 scenes.' }, { status: 500 });
        }

        // Add rate limit headers to successful response
        const response = NextResponse.json({ success: true, scenes });
        response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

        return response;

    } catch (error) {
        console.error('Story API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
