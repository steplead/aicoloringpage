export const runtime = 'edge';

export default function RuntimeTestPage() {
    return (
        <div style={{ padding: 50 }}>
            <h1>Edge Runtime Test</h1>
            <p>If you see this, Edge is working for dynamic routes outside of [locale].</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    );
}
