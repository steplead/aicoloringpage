import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import pagesData from '@/data/seo-pages.json';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Environment variables
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Types
interface PageData {
    slug: string;
    title: string;
    description: string;
    prompt: string;
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

async function generateImage(prompt: string) {
    const model = 'gemini-2.0-flash-exp'; // Using the latest fast model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;

    const styles = ['kawaii', 'intricate', 'realistic', 'stained-glass', 'abstract', 'fantasy'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];

    let styleInstructions = "";
    let simplifyInstruction = "";

    switch (randomStyle) {
        case 'intricate':
            styleInstructions = "Style: Adult Coloring Book. Content: Fill with complex patterns. Line Weight: Fine, delicate.";
            simplifyInstruction = "3. DO NOT SIMPLIFY. Keep all details.";
            break;
        case 'stained-glass':
            styleInstructions = "Style: Stained Glass. Content: Bold geometric segments. Line Weight: EXTRA THICK, BOLD outlines.";
            simplifyInstruction = "3. SIMPLIFY into geometric segments.";
            break;
        case 'abstract':
            styleInstructions = "Style: Geometric Abstract. Content: 3D floating shapes. Line Weight: Clean, precise.";
            simplifyInstruction = "3. Focus on GEOMETRY.";
            break;
        default:
            styleInstructions = "Style: Kawaii. Content: Big eyes, rounded shapes. Line Weight: THICK, BOLD.";
            simplifyInstruction = "3. SIMPLIFY AGGRESSIVELY.";
            break;
    }

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
}

async function postToPinterest(imageUrl: string, title: string, description: string, link: string) {
    const url = `https://api.pinterest.com/v5/pins`;
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
    return response.json();
}

// ----------------------------------------------------------------------------
// MAIN GET HANDLER (Cron Trigger)
// ----------------------------------------------------------------------------

export async function GET(req: NextRequest) {
    // 0. Environment Check
    if (!PINTEREST_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
        return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // 1. Check Daily Limit (Reset at midnight UTC)
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await supabase
            .from('seo_pages')
            .select('*', { count: 'exact', head: true })
            .gte('updated_at', `${today}T00:00:00.000Z`)
            .eq('pinterest_posted', true);

        if (countError) throw new Error(`DB Error: ${countError.message}`);

        const DAILY_LIMIT = 20; // Hard limit per day
        if ((count || 0) >= DAILY_LIMIT) {
            return NextResponse.json({ message: 'Daily limit reached', count });
        }

        // 2. Select a Random Unposted Page
        // We do this by picking a random index and checking if it's posted.
        // To avoid infinite loops, we try max 10 times.
        let selectedPage: PageData | null = null;
        const totalPages = pagesData.length;
        let attempts = 0;

        while (!selectedPage && attempts < 15) {
            const randomIndex = Math.floor(Math.random() * totalPages);
            const candidate = pagesData[randomIndex] as PageData;

            // Check DB
            const { data } = await supabase
                .from('seo_pages')
                .select('slug')
                .eq('slug', candidate.slug)
                .single();

            if (!data) {
                selectedPage = candidate; // It's not in the posted DB!
            }
            attempts++;
        }

        if (!selectedPage) {
            return NextResponse.json({ message: 'Could not find unposted page after attempts' }, { status: 404 });
        }

        // 3. Generate Image
        const base64Image = await generateImage(selectedPage.prompt);
        if (!base64Image) throw new Error('Failed to generate image');

        // Convert to Buffer/Blob for upload
        // In Edge, we can output base64 directly or convert to Blob. 
        // Supabase expects Blob or Uint8Array.
        const binaryString = atob(base64Image);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 4. Upload to Supabase
        const fileName = `${selectedPage.slug}-${Date.now()}.png`; // Use PNG as raw output
        const { error: uploadError } = await supabase
            .storage
            .from('seo-images')
            .upload(fileName, bytes, { contentType: 'image/png' });

        if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase
            .storage
            .from('seo-images')
            .getPublicUrl(fileName);

        // 5. Post to Pinterest
        const link = `https://ai-coloringpage.com/printable/${selectedPage.slug}`;
        await postToPinterest(publicUrl, selectedPage.title, selectedPage.description, link);

        // 6. Record in DB
        const { error: dbError } = await supabase
            .from('seo_pages')
            .upsert({
                slug: selectedPage.slug,
                title: selectedPage.title,
                description: selectedPage.description,
                prompt: selectedPage.prompt,
                image_url: publicUrl,
                pinterest_posted: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (dbError) throw new Error(`DB Upsert Failed: ${dbError.message}`);

        return NextResponse.json({
            success: true,
            posted: selectedPage.slug,
            dailyCount: (count || 0) + 1
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
