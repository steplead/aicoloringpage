

export const dynamic = 'force-static'
export default function RuntimeTestPage() {
    return (
        <div style={{ padding: 50 }}>
            <h1>Edge Runtime Test</h1>
            <p>If you see this, Edge is working for dynamic routes outside of [locale].</p>
            <p>Static route check.</p>
        </div>
    );
}
