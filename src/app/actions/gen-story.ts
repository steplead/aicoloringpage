'use server'

import { generateStoryOutline } from '@/lib/workers-ai'

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
    - Return ONLY the JSON array. No markdown, no code blocks.`

    const outline = await generateStoryOutline(prompt)
    if (!outline.ok) {
        return { success: false, error: outline.message }
    }

    let cleanResponse = outline.text.trim()
    if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json/g, '').replace(/```/g, '')
    }
    if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```/g, '')
    }

    try {
        const scenes = JSON.parse(cleanResponse)
        return { success: true, scenes }
    } catch (error) {
        console.error('Failed to generate plot:', error)
        return { success: false, error: 'Failed to generate story plot.' }
    }
}
