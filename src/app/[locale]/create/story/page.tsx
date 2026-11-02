import { getTranslations, setRequestLocale } from 'next-intl/server'
import StoryModeClient from '@/components/StoryModeClient'
import { pageAlternates } from '@/lib/alternates'

import { Header } from '@/components/Header'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations({ locale, namespace: 'StoryMode' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        alternates: pageAlternates(locale, '/create/story'),
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            url: 'https://ai-coloringpage.com/create/story',
            images: ['/og-story.png']
        }
    }
}

export default function StoryPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <StoryModeClient />
        </div>
    )
}
