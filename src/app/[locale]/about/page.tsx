import { Header } from '@/components/Header'
import { getTranslations } from 'next-intl/server'

export const runtime = 'edge';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'AboutPage' })
    return {
        title: `${t('title')} | AI Coloring Page`,
        description: t('p1').replace(/<[^>]*>?/gm, "") // Strip HTML tags for description
    }
}

export default async function AboutPage() {
    const t = await getTranslations('AboutPage')

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
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
