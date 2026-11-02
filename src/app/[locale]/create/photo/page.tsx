import { getTranslations, setRequestLocale } from 'next-intl/server'
import MagicCameraClient from '@/components/MagicCameraClient'
import { pageAlternates } from '@/lib/alternates'

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    setRequestLocale(locale)
    const t = await getTranslations({ locale, namespace: 'MagicCamera' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        alternates: pageAlternates(locale, '/create/photo'),
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            url: 'https://ai-coloringpage.com/create/photo',
            images: ['/og-camera.png']
        }
    }
}

export default function MagicCameraPage() {
    return <MagicCameraClient />
}
