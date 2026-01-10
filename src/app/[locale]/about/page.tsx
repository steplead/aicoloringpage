import { Header } from '@/components/Header'
import { getTranslations } from 'next-intl/server'
import { generateAboutPageSchema } from '@/lib/schema-org'

export const runtime = 'edge';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'AboutPage' })
    return {
        title: `${t('title')} | AI Coloring Page`,
        description: t('p1').replace(/<[^>]*>?/gm, ""), // Strip HTML tags for description
        openGraph: {
            title: `${t('title')} | AI Coloring Page`,
            description: t('p1').replace(/<[^>]*>?/gm, ""),
            type: 'website',
        }
    }
}

export default async function AboutPage() {
    const t = await getTranslations('AboutPage')

    // Generate About Page Schema.org with Organization and WebPage
    const aboutSchema = generateAboutPageSchema({
        name: 'AI Coloring Page',
        description: t('p1').replace(/<[^>]*>?/gm, ""),
        url: 'https://ai-coloringpage.com/about',
        foundingDate: '2024',
        founders: ['AI Coloring Page Team'],
        sameAs: [
            'https://twitter.com/aicoloringpage',
            'https://pinterest.com/aicoloringpage'
        ],
        areaServed: 'Worldwide'
    })

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />

            {/* About Page Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
                <div className="prose lg:prose-xl text-gray-700 space-y-6">
                    <p dangerouslySetInnerHTML={{ __html: t.raw('p1') }} />
                    <p dangerouslySetInnerHTML={{ __html: t.raw('p2') }} />
                    <p>{t('p3')}</p>

                    <h2 className="text-2xl font-semibold text-gray-900 pt-4">{t('h2')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t.raw('p4') }} />
                    <p>{t('p5')}</p>
                    <p>{t('p6')}</p>

                    <p className="italic text-gray-500 pt-8">
                        {t('team')}
                    </p>
                </div>
            </main>
        </div>
    )
}
