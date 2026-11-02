import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateColoringImage } from '@/lib/workers-ai';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Environment variables
const PINTEREST_ACCESS_TOKEN = process.env.PINTEREST_ACCESS_TOKEN;
const PINTEREST_BOARD_ID = process.env.PINTEREST_BOARD_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// CRON SECRET for authentication
const CRON_SECRET = process.env.CRON_SECRET;

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
    const result = await generateColoringImage(prompt);
    if (!result.ok) throw new Error(result.message);
    const match = result.dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
    return match?.[1] || null;
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
    // 0. CRITICAL: Cron secret verification
    if (!CRON_SECRET) {
        return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }

    // Verify cron secret from header or query parameter
    const authHeader = req.headers.get('authorization');
    const querySecret = req.nextUrl.searchParams.get('secret');

    const providedSecret = authHeader?.replace('Bearer ', '') || querySecret;

    if (providedSecret !== CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Environment Check
    if (!PINTEREST_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
        // 2. Check Daily Limit (Reset at midnight UTC)
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

        // 3. Select an unposted page from Supabase.
        // The 8MB seo-pages JSON is not imported here: parsing it on the Worker
        // blows the free-plan CPU limit for every request that shares the bundle.
        const { data: candidates, error: pickError } = await supabase
            .from('seo_pages')
            .select('slug, title, description, prompt')
            .or('pinterest_posted.eq.false,pinterest_posted.is.null')
            .not('prompt', 'is', null)
            .limit(1);

        if (pickError) throw new Error(`DB Error: ${pickError.message}`);

        const selectedPage = (candidates?.[0] ?? null) as PageData | null;
        if (!selectedPage?.prompt) {
            return NextResponse.json({ message: 'No unposted page with a prompt' }, { status: 404 });
        }

        // 4. Generate Image
        const base64Image = await generateImage(selectedPage.prompt);
        if (!base64Image) throw new Error('Failed to generate image');

        // Convert to Buffer/Blob for upload
        const binaryString = atob(base64Image);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // 5. Upload to Supabase
        const fileName = `${selectedPage.slug}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase
            .storage
            .from('seo-images')
            .upload(fileName, bytes, { contentType: 'image/jpeg' });

        if (uploadError) throw new Error(`Upload Failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase
            .storage
            .from('seo-images')
            .getPublicUrl(fileName);

        // 6. Post to Pinterest
        const link = `https://ai-coloringpage.com/printable/${selectedPage.slug}`;
        await postToPinterest(publicUrl, selectedPage.title, selectedPage.description, link);

        // 7. Record in DB
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
