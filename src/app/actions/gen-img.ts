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

    // Use the stable model that supports image generation
    const modelName = "gemini-2.5-flash-image";

    try {
        console.log(`Attempting generation with model: ${modelName}`);

        const images = image ? [image] : [];
        const data = await generateContent(apiKey, fullPrompt, modelName, images);

        const candidate = data.candidates?.[0];

        // Check for prompt blocking
        if (data.promptFeedback?.blockReason) {
            console.warn(`Prompt blocked: ${data.promptFeedback.blockReason}`);
            return { success: false, error: `Request blocked: ${data.promptFeedback.blockReason}` };
        }

        if (!candidate) {
            console.warn(`No candidates returned.`);
            return { success: false, error: 'No results generated.' };
        }

        // Find the part with the image
        const parts = candidate.content?.parts || [];
        const imagePart = parts.find((part: any) => part.inlineData);

        if (imagePart) {
            const base64Image = imagePart.inlineData.data;
            // Optimization: Skip heavy post-processing (thresholding) for speed.
            return { success: true, data: [`data:image/png;base64,${base64Image}`] };
        }

        // If we got here, the model returned text instead of an image
        const textPart = parts.find((part: any) => part.text);
        if (textPart) {
            console.warn(`Returned text instead of image: "${textPart.text.substring(0, 100)}..."`);
            return { success: false, error: `AI returned text instead of image. Try a different photo.` };
        }

        return { success: false, error: 'Unexpected response format.' };

    } catch (error) {
        console.error(`Error:`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
