import dotenv from 'dotenv';
import { generateContent } from '../src/lib/gemini-client';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.error('No API Key found');
    process.exit(1);
}

async function testModel(modelName: string, imageBase64?: string) {
    console.log(`\nTesting ${modelName}...`);
    const start = Date.now();

    try {
        const prompt = "Generate a black and white coloring page. RETURN IMAGE ONLY.";
        const images = imageBase64 ? [imageBase64] : [];

        const data = await generateContent(apiKey!, prompt, modelName, images);

        const duration = (Date.now() - start) / 1000;

        if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            console.log(`✅ Success! Generated Image in ${duration.toFixed(2)}s`);
        } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log(`❌ Failed: Returned Text in ${duration.toFixed(2)}s`);
            console.log(`   Text Length: ${data.candidates[0].content.parts[0].text.length}`);
            console.log(`   Text Start: "${data.candidates[0].content.parts[0].text.substring(0, 200)}..."`);
        } else {
            console.log(`❌ Failed: No content in ${duration.toFixed(2)}s`);
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e: any) {
        const duration = (Date.now() - start) / 1000;
        console.log(`❌ Error in ${duration.toFixed(2)}s: ${e.message}`);
    }
}

async function main() {
    console.log('🏎️  Starting Speed Test...');

    // Test: The "Stable" Model with Image Input
    const model = 'gemini-2.5-flash-image';
    const prompt = "Generate a black and white coloring page based on this image. RETURN IMAGE ONLY.";

    // Tiny 1x1 white pixel base64
    const dummyImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQ42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    await testModel(model, dummyImage);
}

main();
