import { NextRequest, NextResponse } from 'next/server';
import { authorizeStoryGeneration, getRateKv, issueStoryGrant } from '@/lib/abuse-guard';
import { generateStoryOutline } from '@/lib/workers-ai';

export const runtime = 'edge';

function parseSceneList(text: string): unknown {
    let clean = text.trim()
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    try {
        return JSON.parse(clean)
    } catch {
        const match = clean.match(/\[[\s\S]*\]/)
        if (!match) throw new Error('no json array')
        return JSON.parse(match[0])
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const guard = await authorizeStoryGeneration(req, body)
        if (!guard.ok) return guard.response

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

        const outline = await generateStoryOutline(prompt);
        if (!outline.ok) {
            return NextResponse.json({ success: false, error: outline.message }, { status: 503 });
        }
        const text = outline.text;

        let scenes;
        try {
            scenes = parseSceneList(text);
        } catch (e) {
            console.error("JSON Parse Error", text);
            return NextResponse.json({ success: false, error: 'Failed to parse story format.' }, { status: 500 });
        }

        // Validate scenes format
        if (!Array.isArray(scenes) || scenes.length !== 5) {
            return NextResponse.json({ success: false, error: 'Invalid story format. Expected 5 scenes.' }, { status: 500 });
        }

        // Add rate limit headers to successful response
        const kv = getRateKv()
        const generationGrant = kv ? await issueStoryGrant(kv) : undefined
        return NextResponse.json({ success: true, scenes, generationGrant });

    } catch (error) {
        console.error('Story API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
