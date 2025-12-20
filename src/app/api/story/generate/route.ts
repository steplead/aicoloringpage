import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini-client';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'API Key missing on server' }, { status: 500 });
        }

        const body = await req.json();
        const { character, theme } = body;

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

        return NextResponse.json({ success: true, scenes });

    } catch (error) {
        console.error('Story API Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
