export const runtime = 'edge';

export async function GET() {
    return new Response(JSON.stringify({
        status: 'online',
        runtime: 'edge',
        env: {
            supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            gemini_key: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            base_url: process.env.NEXT_PUBLIC_BASE_URL || 'not set'
        },
        timestamp: new Date().toISOString()
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
        }
    });
}
