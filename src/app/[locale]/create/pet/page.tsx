import { getTranslations } from 'next-intl/server'
import MagicCameraClient from '@/components/MagicCameraClient'

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'PetPage' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            url: 'https://ai-coloringpage.com/create/pet',
            images: ['/og-camera.png'] // Ideally we should have a pet specific OG image later
        },
        alternates: {
            canonical: `https://ai-coloringpage.com/${locale}/create/pet`,
            languages: {
                'en': `https://ai-coloringpage.com/en/create/pet`,
                'es': `https://ai-coloringpage.com/es/create/pet`,
                'pt': `https://ai-coloringpage.com/pt/create/pet`,
                'fr': `https://ai-coloringpage.com/fr/create/pet`,
                'x-default': `https://ai-coloringpage.com/en/create/pet`,
            },
        }
    }
}

export default function PetPage() {
    return <MagicCameraClient translationNamespace="PetPage" />
}
