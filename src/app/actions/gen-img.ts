'use server'

import { generateContent } from '@/lib/gemini-client'

export async function generateImage(prompt: string, style: string = 'kawaii') {
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
    const fullPrompt = `Generate a high-quality black and white coloring page image of: ${prompt}.
  Rules:
  1. Output ONLY the image.
  ${stylePrompt}
  6. Pure white background.
  7. High contrast black lines. No gray areas.
  8. Do NOT output text, only the image.`;

    try {
        const data = await generateContent(apiKey, fullPrompt, modelName);

        const candidate = data.candidates?.[0];

        // Check for prompt blocking (e.g. Safety)
        if (data.promptFeedback?.blockReason) {
            console.warn(`Prompt blocked: ${data.promptFeedback.blockReason}`);
            return { success: false, error: `Request blocked by safety filters: ${data.promptFeedback.blockReason}. Please try a different prompt.` };
        }

        if (!candidate) {
            console.error('No candidates returned:', JSON.stringify(data));
            // Return the RAW response for debugging
            return { success: false, error: `Debug Error: No results. Raw API Response: ${JSON.stringify(data)}` };
        }

        // Check for non-STOP finish reasons (e.g., SAFETY, RECITATION)
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            console.warn(`Gemini finished with reason: ${candidate.finishReason}`);
            return { success: false, error: `Generation failed: ${candidate.finishReason}. Please try a different prompt.` };
        }

        // Check for Image (PNG) response
        if (candidate.content?.parts?.[0]?.inlineData) {
            const imagePart = candidate.content.parts[0].inlineData;
            const base64Image = imagePart.data;
            const mimeType = imagePart.mimeType || 'image/png';
            return { success: true, data: [`data:${mimeType};base64,${base64Image}`] };
        }
        // Handle Text response (Error case for Image Gen)
        else if (candidate.content?.parts?.[0]?.text) {
            console.warn("Gemini returned text instead of image:", candidate.content.parts[0].text);
            return { success: false, error: `AI returned text instead of image: ${candidate.content.parts[0].text.substring(0, 100)}...` };
        } else {
            console.error('Unexpected response format:', JSON.stringify(data));
            return { success: false, error: 'Failed to generate image. Unexpected response format.' };
        }
    } catch (error) {
        console.error('Error generating image:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}
