export const runtime = 'edge';

export async function GET() {
    return new Response(JSON.stringify({
        status: 'online',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    }), {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}
