import { getTranslations } from 'next-intl/server'
import MagicCameraClient from '@/components/MagicCameraClient'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'MagicCamera' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
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
