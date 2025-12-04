'use server'

import { generateContent } from '@/lib/gemini-client'
import { processImage } from '@/lib/image-processing'

export async function generateImage(prompt: string, style: string = 'kawaii', image: string | null = null) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
    }

    // User provided documentation showing this specific model name
    const modelName = "gemini-2.5-flash-image";

    let stylePrompt = "";
    switch (style) {
        case 'intricate':
            stylePrompt = `
      2. Style: Adult Coloring Book, Mandala style.
      3. Content: A highly detailed, intricate black and white outline of the subject.
      4. Fill the inside with complex floral or geometric patterns.
      5. Ensure lines are crisp and clear.`;
            break;
        case 'realistic':
            stylePrompt = `
      2. Style: Realistic scientific illustration, pen and ink sketch.
      3. Content: A realistic depiction with fine hatching and shading details.
      4. Proportions must be accurate.`;
            break;
        case 'kawaii':
        default:
            stylePrompt = `
      2. Style: Kawaii, Chibi, Cute for Kids.
      3. Content: Simple, bold outlines. Big eyes, rounded shapes.
      4. Minimal details, easy to color.`;
            break;
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

    try {
        const images = image ? [image] : [];
        const data = await generateContent(apiKey, fullPrompt, modelName, images);

        const candidate = data.candidates?.[0];

        // Check for prompt blocking (e.g. Safety)
        if (data.promptFeedback?.blockReason) {
            console.warn(`Prompt blocked: ${data.promptFeedback.blockReason}`);
            return { success: false, error: `Request blocked by safety filters: ${data.promptFeedback.blockReason}. Please try a different prompt.` };
        }

        if (!candidate) {
            console.error('No candidates returned:', JSON.stringify(data));
            return { success: false, error: `Debug Error: No results. Raw API Response: ${JSON.stringify(data)}` };
        }

        // Check for non-STOP finish reasons (e.g., SAFETY, RECITATION)
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn(`Gemini finished with reason: ${candidate.finishReason}`);
            return { success: false, error: `Generation failed: ${candidate.finishReason}. Raw: ${JSON.stringify(data)}` };
        }

        // Find the part with the image
        const parts = candidate.content?.parts || [];
        const imagePart = parts.find((part: any) => part.inlineData);

        if (imagePart) {
            const base64Image = imagePart.inlineData.data;

            // Post-process the image to ensure it's pure black and white
            const buffer = Buffer.from(base64Image, 'base64');
            const processedBuffer = await processImage(buffer);
            const processedBase64 = processedBuffer.toString('base64');

            return { success: true, data: [`data:image/png;base64,${processedBase64}`] };
        }

        // Handle Text-only response (Error case for Image Gen)
        const textPart = parts.find((part: any) => part.text);
        if (textPart) {
            console.warn("Gemini returned text instead of image:", textPart.text);
            return { success: false, error: `AI returned text: "${textPart.text}". Raw Response: ${JSON.stringify(data)}` };
        } else {
            console.error('Unexpected response format:', JSON.stringify(data));
            return { success: false, error: `Unexpected response. Raw: ${JSON.stringify(data)}` };
        }
    } catch (error) {
        console.error('Error generating image:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}
