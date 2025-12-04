'use server'

import { generateContent } from '@/lib/gemini-client'
import { processImage } from '@/lib/image-processing'

export async function generateImage(prompt: string, style: string = 'kawaii', image: string | null = null) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
    }



    // Explicitly request an IMAGE generation
    let fullPrompt = `Generate a black and white coloring page of ${prompt}. Do not include any text in the image.`;

    // If image is provided, adjust prompt for Image-to-Image
    if (image) {
        fullPrompt = `Create a clean, black-and-white line art coloring page based on this image.
        Subject: ${prompt || "the main subject of the photo"}.
        
        CRITICAL INSTRUCTIONS:
        1. OUTPUT MUST BE PURE LINE ART ONLY.
        2. NO SHADING, NO GREYSCALE, NO GRADIENTS.
        3. SIMPLIFY COMPLEX DETAILS. Do not trace every tiny line.
        4. Thick, bold black outlines (Marker style).
        5. KEEP ALL MAIN SUBJECTS (People, Animals, Objects). Only remove distant background clutter.
        6. Style: ${style === 'realistic' ? 'Realistic proportions but SIMPLIFIED LINE ART' : style}.
        
        Convert the photo into a bold, simple coloring page suitable for children.`;
    }

    // Strategy: Try Fast Model (2.0-flash-exp) first for ~2s speed.
    // If it fails (returns text or error), fallback to Stable Model (2.5-flash-image).
    const models = ["gemini-2.0-flash-exp", "gemini-2.5-flash-image"];

    for (const modelName of models) {
        try {
            console.log(`Attempting generation with model: ${modelName}`);

            // For the fast model, we need to be extra strict to prevent "chatting"
            let currentPrompt = fullPrompt;
            if (modelName === "gemini-2.0-flash-exp") {
                currentPrompt = "STRICT INSTRUCTION: GENERATE AN IMAGE. DO NOT RETURN TEXT. " + fullPrompt;
            }

            const images = image ? [image] : [];
            const data = await generateContent(apiKey, currentPrompt, modelName, images);

            const candidate = data.candidates?.[0];

            // Check for prompt blocking
            if (data.promptFeedback?.blockReason) {
                console.warn(`[${modelName}] Prompt blocked: ${data.promptFeedback.blockReason}`);
                if (modelName === models[models.length - 1]) {
                    return { success: false, error: `Request blocked: ${data.promptFeedback.blockReason}` };
                }
                continue; // Try next model
            }

            if (!candidate) {
                console.warn(`[${modelName}] No candidates returned.`);
                if (modelName === models[models.length - 1]) {
                    return { success: false, error: 'No results generated.' };
                }
                continue;
            }

            // Find the part with the image
            const parts = candidate.content?.parts || [];
            const imagePart = parts.find((part: any) => part.inlineData);

            if (imagePart) {
                const base64Image = imagePart.inlineData.data;
                const processedBase64 = base64Image; // Skip processing for speed
                return { success: true, data: [`data:image/png;base64,${processedBase64}`] };
            }

            // If we got here, the model returned text instead of an image
            const textPart = parts.find((part: any) => part.text);
            console.warn(`[${modelName}] Returned text instead of image: "${textPart?.text?.substring(0, 100)}..."`);

            // If this was the last model, fail. Otherwise, continue to fallback.
            if (modelName === models[models.length - 1]) {
                return { success: false, error: `AI returned text instead of image. Try a different photo.` };
            }

        } catch (error) {
            console.error(`[${modelName}] Error:`, error);
            if (modelName === models[models.length - 1]) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        }
    }

    return { success: false, error: 'All models failed.' };
}
