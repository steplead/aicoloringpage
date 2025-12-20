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
        const { prompt, style = 'kawaii', image } = body;

        let styleInstructions = "";
        let simplifyInstruction = "";

        switch (style) {
            case 'intricate':
                styleInstructions = `
                - Style: Adult Coloring Book, Mandala/Zentangle style.
                - Content: Keep the main subject realistic but FILL the interior and background with complex floral or geometric patterns.
                - Line Weight: Fine, delicate lines for detail.
                - Vibe: Meditative, complex, highly detailed.`;
                simplifyInstruction = "3. DO NOT SIMPLIFY. Keep all details and add MORE patterns.";
                break;
            case 'stained-glass':
                styleInstructions = `
                - Style: Stained Glass / Mosaic style.
                - Content: Fragment the subject into large, bold geometric segments. Like a stained glass window.
                - Line Weight: EXTRA THICK, BOLD black outlines to separate segments.
                - Vibe: Satisfying, "Bold and Easy", segmented.
                - Detail Level: Low detail, focus on shapes.`;
                simplifyInstruction = "3. SIMPLIFY into geometric segments. No tiny details.";
                break;
            case 'abstract':
                styleInstructions = `
                - Style: 3D Geometric Abstract / Optical Illusion.
                - Content: If a subject is provided, merge it with 3D floating shapes and interlocking geometry. If generic, create a pure 3D pattern.
                - Line Weight: Clean, precise lines.
                - Vibe: Trippy, mathematical, immersive.`;
                simplifyInstruction = "3. Focus on GEOMETRY and PATTERNS over realism.";
                break;
            case 'fantasy':
                styleInstructions = `
                - Style: Cozy Fantasy / RPG Concept Art.
                - Content: Magical atmosphere, soft organic shapes, whimsical details (mushrooms, sparkles, vines).
                - Line Weight: Flowing, organic lines.
                - Vibe: Magical, ethereal, storybook.`;
                simplifyInstruction = "3. Simplify realism into illustrative storybook style.";
                break;
            case 'realistic':
                styleInstructions = `
                - Style: Scientific Illustration / Pen and Ink Sketch.
                - Content: Realistic proportions, accurate anatomy/structure.
                - Line Weight: Varied line weight to show depth. Use hatching/stippling for shading (converted to black lines).
                - Vibe: Educational, serious, detailed.`;
                simplifyInstruction = "3. SIMPLIFY ONLY NOISE. Keep texture and structural details.";
                break;
            case 'kawaii':
            default:
                styleInstructions = `
                - Style: Kawaii / Chibi / Cute for Kids.
                - Content: Big eyes, rounded shapes, large heads (chibi proportions). Remove complex details.
                - Line Weight: THICK, BOLD, UNIFORM lines (like a marker).
                - Vibe: Playful, sweet, simple.`;
                simplifyInstruction = "3. SIMPLIFY AGGRESSIVELY. Remove all textures, shading, and small details. Make it look like a cartoon.";
                break;
        }

        let fullPrompt = "";

        if (image) {
            fullPrompt = `Create a clean, black-and-white line art coloring page based on this image.
            Subject: ${prompt || "the main subject of the photo"}.
            
            CRITICAL INSTRUCTIONS:
            1. OUTPUT MUST BE PURE LINE ART ONLY.
            2. NO SHADING, NO GREYSCALE, NO GRADIENTS.
            ${simplifyInstruction}
            4. KEEP ALL MAIN SUBJECTS (People, Animals, Objects). Only remove distant background clutter.
            
            SPECIFIC STYLE INSTRUCTIONS:
            ${styleInstructions}
            
            Convert the photo into a coloring page matching this style perfectly.`;
        } else {
            // Text-to-Image Prompt
            fullPrompt = `Generate a black and white coloring page of ${prompt}.
            
            CRITICAL INSTRUCTIONS:
            1. OUTPUT MUST BE PURE LINE ART ONLY.
            2. NO SHADING, NO GREYSCALE, NO GRADIENTS.
            3. Do not include any text in the image.
            ${simplifyInstruction}
            
            SPECIFIC STYLE INSTRUCTIONS:
            ${styleInstructions}
            
            Ensure the image is a high-quality, printable coloring page.`;
        }

        // Use the stable model that supports image generation
        const modelName = "gemini-2.5-flash-image";

        console.log(`Attempting generation with model: ${modelName}`);

        const imagesArray = image ? [image] : [];
        const data = await generateContent(apiKey, fullPrompt, modelName, imagesArray);

        const candidate = data.candidates?.[0];

        // Check for prompt blocking
        if (data.promptFeedback?.blockReason) {
            console.warn(`Prompt blocked: ${data.promptFeedback.blockReason}`);
            return NextResponse.json({ success: false, error: `Request blocked: ${data.promptFeedback.blockReason}` }, { status: 400 });
        }

        if (!candidate) {
            console.warn(`No candidates returned.`);
            return NextResponse.json({ success: false, error: 'No results generated.' }, { status: 500 });
        }

        // Find the part with the image
        const parts = candidate.content?.parts || [];
        const imagePart = parts.find((part: any) => part.inlineData);

        if (imagePart) {
            const base64Image = imagePart.inlineData.data;
            return NextResponse.json({ success: true, data: [`data:image/png;base64,${base64Image}`] });
        }

        // If we got here, the model returned text instead of an image
        if (textPart) {
            console.warn(`Returned text instead of image: "${textPart.text.substring(0, 100)}..."`);
            return NextResponse.json({ success: false, error: `AI could not generate an image for this prompt. Please try a different description.` }, { status: 422 });
        }

        return NextResponse.json({ success: false, error: 'Unexpected response format.' }, { status: 500 });

    } catch (error) {
        console.error(`Error:`, error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
