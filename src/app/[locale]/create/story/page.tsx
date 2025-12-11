import { getTranslations } from 'next-intl/server'
import StoryModeClient from '@/components/StoryModeClient'
import { Header } from '@/components/Header'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'StoryMode' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
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
