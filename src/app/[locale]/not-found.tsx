'use client'

import Link from 'next/link'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Home, Search, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NotFound() {
    const t = useTranslations('NotFound')

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-24 text-center">
                <div className="max-w-2xl mx-auto space-y-8">

                    {/* Fun Illustration/Icon */}
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                        <span className="relative text-9xl font-black text-gray-200 select-none">
                            404
                        </span>
                    </div>

                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        {t('title')}
                    </h1>

                    <p className="text-xl text-gray-600" dangerouslySetInnerHTML={{ __html: t.raw('description') }} />

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/" prefetch={false}>
                            <Button size="lg" className="w-full sm:w-auto h-12 text-lg">
                                <Home className="w-5 h-5 mr-2" />
                                {t('goHome')}
                            </Button>
                        </Link>

                        <Link href="/directory" prefetch={false}>
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-lg">
                                <Search className="w-5 h-5 mr-2" />
                                {t('browseDirectory')}
                            </Button>
                        </Link>
                    </div>

                    {/* "Random" CTA to keep them engaged */}
                    <div className="pt-12 border-t border-gray-200 mt-12">
                        <p className="text-gray-500 mb-4">{t('surpriseText')}</p>
                        <Link href="/printable/cute-cat" prefetch={false}>
                            {/* In a real app, this would be a dynamic random link, but a popular one works for now */}
                            <Button variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('surpriseBtn')}
                            </Button>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    )
}
