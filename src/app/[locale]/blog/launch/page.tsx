import { Link } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Camera, BookOpen, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'LaunchPage' })

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
    }
}

export default async function LaunchPost() {
    const t = await getTranslations('LaunchPage')

    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <article className="prose lg:prose-xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
                            {t('newUpdate')}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6 leading-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-12 shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            {/* Placeholder for a hero image if we had one */}
                            <Sparkles className="w-20 h-20 opacity-20" />
                        </div>
                    </div>

                    <h2>{t('magicCameraTitle')}</h2>
                    <p>
                        {t.rich('magicCameraText', {
                            strong: (chunks) => <strong>{chunks}</strong>
                        })}
                    </p>
                    <div className="not-prose my-8 p-6 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center text-center">
                        <Camera className="w-12 h-12 text-purple-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">{t('tryMagicCamera')}</h3>
                        <p className="text-gray-600 mb-6">{t('uploadPhotoText')}</p>
                        <Link href="/create/photo">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                                {t('convertBtn')}
                            </Button>
                        </Link>
                    </div>

                    <h2>{t('storyModeTitle')}</h2>
                    <p>
                        {t.rich('storyModeText', {
                            strong: (chunks) => <strong>{chunks}</strong>
                        })}
                    </p>
                    <div className="not-prose my-8 p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                        <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">{t('createStorybook')}</h3>
                        <p className="text-gray-600 mb-6">{t('generateCharText')}</p>
                        <Link href="/create/story">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                {t('startStoryBtn')}
                            </Button>
                        </Link>
                    </div>

                    <h2>{t('remixEngineTitle')}</h2>
                    <p>
                        {t('remixEngineText')}
                    </p>

                    <hr className="my-12" />

                    <div className="bg-gray-50 p-8 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold mb-4">{t('readyToStart')}</h3>
                        <p className="text-gray-600 mb-8">
                            {t('exploreText')}
                        </p>
                        <Link href="/">
                            <Button size="lg">
                                {t('homeBtn')}
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>
        </div>
    )
}
