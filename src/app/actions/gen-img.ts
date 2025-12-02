'use server'

import { generateContent } from '@/lib/gemini-client'

export async function generateImage(prompt: string, style: string = 'kawaii') {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
    }

    // Switch to Gemini 1.5 Pro for better SVG quality
    const modelName = "gemini-1.5-pro";

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

    const fullPrompt = `You are an expert SVG artist. Create a high-quality, detailed black and white coloring page of: ${prompt}.
  
  CRITICAL RULES:
  1. Output ONLY the raw SVG code. No markdown backticks, no explanations.
  2. The image MUST be a representational drawing, NOT abstract shapes.
  3. Use complex paths and detailed strokes to create a professional illustration.
  4. ${stylePrompt}
  5. Pure white background.
  6. High contrast black lines (stroke="black" stroke-width="2"). No gray areas.
  7. Use <svg> tag with viewBox="0 0 512 724" (A4 aspect ratio).
  8. Ensure the subject is centered and fills the page appropriately.`;

    try {
        const data = await generateContent(apiKey, fullPrompt, modelName);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let svgCode = data.candidates[0].content.parts[0].text;

            // Clean up markdown if present
            svgCode = svgCode.replace(/```svg/g, '').replace(/```/g, '').trim();

            if (!svgCode.startsWith('<svg')) {
                // Fallback search for svg tag
                const match = svgCode.match(/<svg[\s\S]*<\/svg>/);
                if (match) {
                    svgCode = match[0];
                } else {
                    console.error("Invalid SVG returned:", svgCode);
                    throw new Error('AI returned invalid SVG code. Please try again.');
                }
            }

            // Convert to base64 data URL
            const base64Svg = Buffer.from(svgCode).toString('base64');
            return [`data:image/svg+xml;base64,${base64Svg}`];

        } else {
            console.error('Unexpected response format:', JSON.stringify(data));
            throw new Error('Failed to generate image. The AI did not return a valid image.');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}
