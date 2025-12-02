'use server'

import { generateContent } from '@/lib/gemini-client'

export async function generateImage(prompt: string, style: string = 'kawaii') {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
    }

    const modelName = "gemini-2.0-flash-exp";

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

    const fullPrompt = `You are an expert SVG artist. Create a high-quality black and white coloring page of: ${prompt}.
  Rules:
  1. Output ONLY the raw SVG code. No markdown backticks, no explanations.
  ${stylePrompt}
  6. Pure white background.
  7. High contrast black lines. No gray areas.
  8. Use <svg> tag with viewBox="0 0 512 724" (A4 aspect ratio).`;

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
                    throw new Error('AI did not return valid SVG code');
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
