import { Link } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Download, Printer, Share2, Sparkles, Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge';

// Helper to get specific page data
async function getPageData(slug: string) {
    try {
        const { data, error } = await supabase
            .from('seo_pages')
            .select('*')
            .eq('slug', slug)
            .single()

        if (error) throw error
        return data
    } catch (e) {
        console.error('Error reading DB data:', e)
    }
    return null
}

const BASE_URL = 'https://ai-coloringpage.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    const pageData = await getPageData(slug)

    if (!pageData) {
        return {
            title: 'Page Not Found',
        }
    }

    const t = await getTranslations({ locale, namespace: 'PrintablePage' })

    const path = `/printable/${slug}`

    return {
        title: pageData.title,
        description: pageData.description || t('descriptionTemplate', { subject: pageData.subject, audience: pageData.audience }),
        alternates: {
            canonical: `${BASE_URL}/${locale}${path}`,
            languages: {
                'en': `${BASE_URL}/en${path}`,
                'es': `${BASE_URL}/es${path}`,
                'pt': `${BASE_URL}/pt${path}`,
                'fr': `${BASE_URL}/fr${path}`,
                'x-default': `${BASE_URL}/en${path}`,
            },
        },
        openGraph: {
            title: pageData.title,
            description: pageData.description,
            images: [pageData.image_url || '/og-image.jpg'],
        },
    }
}

export default async function PrintablePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    const pageData = await getPageData(slug)
    const t = await getTranslations('PrintablePage')
    const tData = await getTranslations('Data')

    if (!pageData) {
        notFound()
    }

    // Dynamic translations helper
    const translatedSubject = tData.has(pageData.subject) ? tData(pageData.subject) : pageData.subject
    const translatedAudience = tData.has(pageData.audience) ? tData(pageData.audience) : pageData.audience
    const translatedTitle = tData('titlePattern', { subject: translatedSubject, audience: translatedAudience })

    // Generate random "related" pages for internal linking via DB
    const { data: relatedPagesData } = await supabase
        .from('seo_pages')
        .select('*')
        .neq('slug', slug)
        .limit(4)

    const relatedPages = relatedPagesData || []

    // Structured Data: Breadcrumbs
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: t('breadcrumbs.home'),
                item: `${BASE_URL}/${locale}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t('breadcrumbs.directory'),
                item: `${BASE_URL}/${locale}/directory`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: translatedTitle,
                item: `${BASE_URL}/${locale}/printable/${slug}`
            }
        ]
    }

    // Structured Data: FAQ
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Is this ${pageData.subject} coloring page free?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes, all coloring pages on AI Coloring Page, including this ${pageData.subject} coloring sheet, are completely free to download and print for personal use.`
                }
            },
            {
                '@type': 'Question',
                name: `Is this coloring page suitable for ${pageData.audience}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Absolutely! This ${pageData.subject} coloring page has been specifically designed to be appropriate and engaging for ${pageData.audience}.`
                }
            },
            {
                '@type': 'Question',
                name: `How do I print this AI-generated coloring page?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Simply click the "Print Page" button above to send it directly to your printer, or download the high-quality PDF to save it for later.`
                }
            }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="text-sm mb-6 text-gray-500 overflow-x-auto whitespace-nowrap">
                    <ol className="list-none p-0 inline-flex">
                        <li className="flex items-center">
                            <Link href="/" className="hover:text-blue-600" prefetch={false}>
                                {t('breadcrumbs.home')}
                            </Link>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="flex items-center">
                            <Link href="/directory" className="hover:text-blue-600" prefetch={false}>
                                {t('breadcrumbs.directory')}
                            </Link>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="font-semibold text-gray-800">
                            {translatedTitle}
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Actions */}
                    <div className="lg:col-span-2">
                        <Card className="p-1 overflow-hidden bg-white shadow-xl border-2 border-dashed border-gray-200">
                            <div className="relative aspect-[3/4] w-full bg-white flex items-center justify-center">
                                {/* Simulated Coloring Page Image */}
                                <img
                                    src={pageData.image_url}
                                    alt={`Coloring page of ${translatedSubject} `}
                                    className="object-contain max-h-full max-w-full p-4 hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center">
                                    <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                                    AI Generated
                                </div>
                            </div>
                        </Card>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-1">
                                <Printer className="mr-2 w-5 h-5" />
                                Print Page
                            </Button>
                            <Button className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
                                <Download className="mr-2 w-5 h-5" />
                                Download PDF
                            </Button>
                        </div>

                        <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                <Star className="w-5 h-5 mr-2 text-blue-600" />
                                {t('shareTitle')}
                            </h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="bg-white hover:bg-white/80">
                                    Facebook
                                </Button>
                                <Button variant="outline" size="sm" className="bg-white hover:bg-white/80">
                                    Pinterest
                                </Button>
                                <Button variant="outline" size="sm" className="bg-white hover:bg-white/80">
                                    Twitter
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Copy Link
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & SEO Content */}
                    <div className="space-y-6">
                        <Card className="p-6 shadow-md border-t-4 border-t-purple-500">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {translatedTitle}
                            </h1>
                            <div className="prose text-gray-600 mb-6">
                                <p>
                                    {pageData.description || t('descriptionTemplate', { subject: translatedSubject, audience: translatedAudience })}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {pageData.keywords && pageData.keywords.map((kw: string) => (
                                    <span key={kw} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 bg-yellow-50 border-yellow-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                {t('funFacts')}
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start text-sm text-gray-700">
                                    <span className="mr-2 mt-1 min-w-[16px]">👉</span>
                                    <span>Did you know? {translatedSubject} is a favorite subject for {translatedAudience}.</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-700">
                                    <span className="mr-2 mt-1 min-w-[16px]">👉</span>
                                    <span>Coloring helps improve focus and hand-eye coordination.</span>
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-6 bg-green-50 border-green-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                {t('coloringTips')}
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start text-sm text-gray-700">
                                    <Check className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                                    <span>Try using soft pastels for background areas.</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-700">
                                    <Check className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                                    <span>Mix marker and colored pencil techniques for depth.</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Related Pages Section */}
                <div className="mt-16 border-t pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('relatedTitle')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedPages.map((page: any) => {
                            const pSubject = tData.has(page.subject) ? tData(page.subject) : page.subject
                            const pAudience = tData.has(page.audience) ? tData(page.audience) : page.audience
                            const pTitle = tData('titlePattern', { subject: pSubject, audience: pAudience })
                            return (
                                <Link key={page.slug} href={`/printable/${page.slug}`} className="group block" prefetch={false}>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-[3/4] bg-gray-50 p-4 flex items-center justify-center">
                                            <img
                                                src={page.image_url}
                                                alt={pTitle}
                                                className="max-h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600">
                                                {pTitle}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
