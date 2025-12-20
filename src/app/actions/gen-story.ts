'use server'

export const runtime = 'edge';

import { generateContent } from '@/lib/gemini-client'

export async function generatePlot(character: string, theme: string) {
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

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

    try {
        const response = await generateContent(apiKey, prompt);

        // Extract text from Gemini response structure
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean up response to ensure valid JSON
        let cleanResponse = text.trim();
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json/g, '').replace(/```/g, '');
        }

        const scenes = JSON.parse(cleanResponse);
        return { success: true, scenes };
    } catch (error) {
        console.error('Failed to generate plot:', error);
        return { success: false, error: 'Failed to generate story plot.' };
    }
}
