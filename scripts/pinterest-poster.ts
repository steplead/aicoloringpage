
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Load environment variables
dotenv.config({ path: '.env.local' });

const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_BOARD_ID || !GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing required environment variables. Please check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'seo-pages.json');

// Gemini Generation Function (Mirrors src/app/actions/gen-img.ts)
async function generateImage(prompt: string) {
    // Use the EXACT model name from the working web app
    const model = 'gemini-2.5-flash-image';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;

    // Randomly select one of the 6 styles
    const styles = ['kawaii', 'intricate', 'realistic', 'stained-glass', 'abstract', 'fantasy'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    console.log(`  - Style: ${randomStyle.toUpperCase()}`);

    let styleInstructions = "";
    let simplifyInstruction = "";

    switch (randomStyle) {
        case 'intricate':
            styleInstructions = "Style: Adult Coloring Book, Mandala/Zentangle style. Content: Fill the interior with complex patterns. Line Weight: Fine, delicate.";
            simplifyInstruction = "3. DO NOT SIMPLIFY. Keep all details and add MORE patterns.";
            break;
        case 'stained-glass':
            styleInstructions = "Style: Stained Glass / Mosaic. Content: Fragment subject into large, bold geometric segments. Line Weight: EXTRA THICK, BOLD black outlines.";
            simplifyInstruction = "3. SIMPLIFY into geometric segments. No tiny details.";
            break;
        case 'abstract':
            styleInstructions = "Style: 3D Geometric Abstract. Content: Merge subject with 3D floating shapes and interlocking geometry. Line Weight: Clean, precise.";
            simplifyInstruction = "3. Focus on GEOMETRY and PATTERNS over realism.";
            break;
        case 'fantasy':
            styleInstructions = "Style: Cozy Fantasy / RPG Concept Art. Content: Magical atmosphere, soft organic shapes, whimsical details. Line Weight: Flowing, organic.";
            simplifyInstruction = "3. Simplify realism into illustrative storybook style.";
            break;
        case 'realistic':
            styleInstructions = "Style: Scientific Illustration. Content: Realistic proportions, accurate anatomy. Line Weight: Varied with hatching/stippling texture.";
            simplifyInstruction = "3. SIMPLIFY ONLY NOISE. Keep texture and structural details.";
            break;
        case 'kawaii':
        default:
            styleInstructions = "Style: Kawaii / Chibi for Kids. Content: Big eyes, rounded shapes, simple. Line Weight: THICK, BOLD, UNIFORM.";
            simplifyInstruction = "3. SIMPLIFY AGGRESSIVELY. Remove all textures and shading.";
            break;
    }

    // Use the optimized prompt structure
    const fullPrompt = `Generate a black and white coloring page of ${prompt}.
        
    CRITICAL INSTRUCTIONS:
    1. OUTPUT MUST BE PURE LINE ART ONLY.
    2. NO SHADING, NO GREYSCALE, NO GRADIENTS.
    3. Do not include any text.
    ${simplifyInstruction}
    
    SPECIFIC STYLE INSTRUCTIONS:
    - ${styleInstructions}
    
    Ensure the image is a high-quality, printable coloring page.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // DEBUG: Log if no candidates
    if (!data.candidates || data.candidates.length === 0) {
        console.log('DEBUG: No candidates in response:', JSON.stringify(data, null, 2));
    }

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const imagePart = parts.find((part: any) => part.inlineData);

    if (!imagePart) {
        // Check if it returned text instead
        const textPart = parts.find((part: any) => part.text);
        if (textPart) {
            console.log(`DEBUG: Model returned text: "${textPart.text}"`);
        }
        throw new Error('No image generated by Gemini (returned text or empty)');
    }

    return imagePart.inlineData.data; // Base64 string
}

// Pinterest Post Function
async function postToPinterest(imageUrl: string, title: string, description: string, link: string) {
    const url = `https://api.pinterest.com/v5/pins`;
    console.log(`  - Posting to Pinterest...`);
    const body = {
        board_id: PINTEREST_BOARD_ID,
        title: title,
        description: description,
        link: link,
        media_source: {
            source_type: 'image_url',
            url: imageUrl
        }
    };
    console.log(`  - Debug: Posting to Board ID: ${PINTEREST_BOARD_ID}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Pinterest API Error: ${err}`);
    }

    const responseJson = await response.json();
    console.log('  - Pinterest Response:', JSON.stringify(responseJson, null, 2));
    return responseJson;
}

// Encapsulated Daily Batch Logic
async function runDailyBatch() {
    console.log('----------------------------------------');
    console.log(`Starting Daily Batch: ${new Date().toLocaleString()}`);

    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    const pages = JSON.parse(fileContent);

    let postedCount = 0;

    // Dynamic limits based on "Project Age" (as requested)
    const LAUNCH_DATE = new Date('2025-12-05');
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - LAUNCH_DATE.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isWarmupPeriod = diffDays <= 60;

    let minPins = 20;
    let maxPins = 40;

    if (isWarmupPeriod) {
        console.log(`🌱 WARMUP PHASE (Day ${diffDays}/60)`);
        minPins = 10;
        maxPins = 20;
    } else {
        console.log(`🚀 GROWTH PHASE (Day ${diffDays})`);
        minPins = 20;
        maxPins = 40;
    }

    const dailyLimit = Math.floor(Math.random() * (maxPins - minPins + 1)) + minPins;
    console.log(`🎯 Daily Target: ${dailyLimit} Pins (Randomized between ${minPins}-${maxPins})`);

    // 0. FETCH POSTED STATUS FROM SUPABASE (Source of Truth)
    console.log('🔄 Syncing with Database...');
    const { data: postedData, error: fetchError } = await supabase
        .from('seo_pages')
        .select('slug')
        .eq('pinterest_posted', true);

    if (fetchError) {
        console.error('❌ Failed to fetch posted status from DB:', fetchError);
        return; // Don't crash the loop, just skip this batch
    }

    const postedSlugs = new Set(postedData?.map(item => item.slug));
    console.log(`✅ Found ${postedSlugs.size} already posted items in DB.`);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // CHECK DB AND LOCAL STATE
        if (postedSlugs.has(page.slug)) {
            // Update local file if it's out of sync
            if (!page.pinterest_posted) {
                page.pinterest_posted = true;
            }
            continue;
        }

        if (page.pinterest_posted) {
            continue;
        }

        // Safety Cap check at start of loop
        if (postedCount >= dailyLimit) {
            console.log(`\n🛑 DAILY SAFETY LIMIT REACHED (${dailyLimit} Pins)`);
            break;
        }

        console.log(`Processing [${i + 1}/${pages.length}]: ${page.title}`);

        try {
            // 1. Generate Image
            console.log('  - Generating image...');
            const base64Image = await generateImage(page.prompt);
            const buffer = Buffer.from(base64Image, 'base64');

            // Optimize with Sharp
            const optimizedBuffer = await sharp(buffer)
                .resize(1024, 1024, { fit: 'inside' })
                .webp({ quality: 80, effort: 6 })
                .toBuffer();

            // 2. Upload to Supabase
            console.log('  - Uploading to Supabase...');
            const fileName = `${page.slug}-${Date.now()}.webp`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('seo-images')
                .upload(fileName, optimizedBuffer, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            const { data: { publicUrl } } = supabase
                .storage
                .from('seo-images')
                .getPublicUrl(fileName);

            // 3. Post to Pinterest
            console.log('  - Posting to Pinterest...');
            const link = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ai-coloringpage.com'}/printable/${page.slug}`;
            await postToPinterest(publicUrl, page.title, page.description, link);

            // 4. Update Supabase Database
            console.log('  - Updating Supabase DB...');
            const { error: dbError } = await supabase
                .from('seo_pages')
                .upsert({
                    slug: page.slug,
                    title: page.title,
                    description: page.description,
                    prompt: page.prompt,
                    image_url: publicUrl,
                    pinterest_posted: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'slug' });

            if (dbError) console.error(`  - DB Update Failed: ${dbError.message}`);

            // 5. Update Local Data
            page.image_url = publicUrl;
            page.pinterest_posted = true;
            fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2));

            console.log('  - Success! ✅');
            postedCount++;

            // Rate Limit Delay
            const jitter = Math.floor(Math.random() * 30000);
            const delay = 45000 + jitter;
            console.log(`  - Waiting ${Math.round(delay / 1000)}s (Safety Jitter)...`);
            await new Promise(resolve => setTimeout(resolve, delay));

        } catch (error: any) {
            const errorMessage = error.toString();
            console.error(`  - Failed: ${errorMessage}`);

            if (errorMessage.includes('"code":9') || errorMessage.includes('spam')) {
                console.log('\n⚠️  PINTEREST SPAM BLOCK DETECTED! ⚠️');
                console.log('   The script is posting too fast. Cooling down for 10 minutes...');
                console.log('   (Go grab a coffee ☕️)\n');
                await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
                console.log('   Resuming...\n');
            } else {
                console.log('  - Waiting 20s after error...');
                await new Promise(resolve => setTimeout(resolve, 20000));
            }
        }
    }

    console.log(`Batch Done! Posted ${postedCount} new pins.`);
    fs.writeFileSync(DATA_FILE, JSON.stringify(pages, null, 2));
}

// Loop Wrapper
async function main() {
    console.log('🚀 Starting Pinterest Automation in Loop Mode');
    console.log('   (Press Ctrl+C to stop)');

    while (true) {
        try {
            await runDailyBatch();
        } catch (err) {
            console.error('❌ Critical Error in Batch:', err);
        }

        // Calculate time until "Tomorrow"
        // For simplicity, we just sleep 24 hours from now
        // A more advanced version could wait until 9:00 AM specifically, but 24h is fine for this use case.
        const sleepHours = 24;
        const sleepMs = sleepHours * 60 * 60 * 1000;

        console.log(`\n💤 Sleeping for ${sleepHours} hours...`);
        console.log(`   Next run: ${new Date(Date.now() + sleepMs).toLocaleString()}`);

        await new Promise(resolve => setTimeout(resolve, sleepMs));
    }
}

main();
