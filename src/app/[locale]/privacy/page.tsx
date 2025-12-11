import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'PrivacyPage' })
    return {
        title: `${t('title')} - AI Coloring Page`,
    }
}

export default async function PrivacyPage() {
    const t = await getTranslations('PrivacyPage')
    const year = new Date().getFullYear()

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <Card className="p-8 shadow-lg">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">
                            {t('title')}
                        </h1>
                        <p className="text-gray-500 mb-8 text-sm">
                            {t('lastUpdated', { year })}
                        </p>

                        <div className="space-y-6 text-gray-700 leading-relaxed">
                            <p>
                                {t('intro')}
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                                {t('section1Title')}
                            </h2>
                            <p>
                                {t('section1Text')}
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                                {t('section2Title')}
                            </h2>
                            <p>
                                {t('section2Text')}
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                                {t('section3Title')}
                            </h2>
                            <p>
                                {t('section3Text')}
                            </p>

                            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
                                {t('section4Title')}
                            </h2>
                            <p>
                                {t('section4Text')}
                            </p>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
