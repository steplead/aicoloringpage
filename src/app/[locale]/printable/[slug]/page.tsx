import { Link } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShareEmbedButton } from '@/components/ShareEmbedButton'
import { Check, Download, Printer, Sparkles, Star } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { styleName } from '@/lib/styles'
import { pageAlternates } from '@/lib/alternates'
import { getPublishedPage, getPublishedPages, getRelatedPages } from '@/lib/seo-catalog'
import { isIndexablePrintable } from '@/lib/index-policy'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
    return getPublishedPages('en').map((page) => ({ slug: page.slug }))
}

const subjectKey = (subject: string) => subject === "St. Patrick's Day" ? 'St Patricks Day' : subject

const BASE_URL = 'https://ai-coloringpage.com'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    setRequestLocale(locale)
    const pageData = getPublishedPage(locale, slug)

    if (!pageData) {
        return {
            title: 'Page Not Found',
        }
    }

    const t = await getTranslations({ locale, namespace: 'PrintablePage' })

    const tData = await getTranslations({ locale, namespace: 'Data' })
    const subject = tData.has(subjectKey(pageData.subject)) ? tData(subjectKey(pageData.subject)) : pageData.subject
    const audience = pageData.audience === 'Everyone' ? t('allAges') : tData.has(pageData.audience) ? tData(pageData.audience) : pageData.audience
    const styled = pageData.style.toLowerCase() !== 'standard'
    const title = styled ? t('styleTitle', { style: styleName(pageData.style), subject }) : tData('titlePattern', { subject, audience })
    const description = styled ? t('styleBody', { style: styleName(pageData.style), subject }) : t('plainDescription', { subject })
    const path = `/printable/${slug}`
    const alternates = pageAlternates(locale, path)
    const indexable = isIndexablePrintable(slug)

    return {
        title,
        description,
        // Thin audience variants: noindex,follow, self canonical, no hreflang cluster.
        alternates: indexable ? alternates : { canonical: alternates.canonical },
        ...(indexable ? {} : { robots: { index: false, follow: true } }),
        openGraph: {
            title,
            description,
            images: [pageData.image_url || '/og-image.jpg'],
        },
    }
}

export default async function PrintablePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    setRequestLocale(locale)
    const pageData = getPublishedPage(locale, slug)
    const t = await getTranslations('PrintablePage')
    const tData = await getTranslations('Data')

    if (!pageData) {
        notFound()
    }

    // Dynamic translations helper
    const translatedSubject = tData.has(subjectKey(pageData.subject)) ? tData(subjectKey(pageData.subject)) : pageData.subject
    const translatedAudience = pageData.audience === 'Everyone' ? t('allAges') : tData.has(pageData.audience) ? tData(pageData.audience) : pageData.audience
    const styleLabel = styleName(pageData.style)
    const styled = pageData.style.toLowerCase() !== 'standard'
    const translatedTitle = styled ? t('styleTitle', { style: styleLabel, subject: translatedSubject }) : tData('titlePattern', { subject: translatedSubject, audience: translatedAudience })

    const copyKey = ['anime', 'kawaii', 'realistic', 'cartoon', 'chibi', 'steampunk', 'mandala'].includes(pageData.style.toLowerCase())
        ? pageData.style.toLowerCase() : pageData.subject.toLowerCase() === 'mandala' ? 'mandala' : 'generic'
    const relatedPages = getRelatedPages(locale, slug, 4)

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
            { '@type': 'Question', name: t('faqFreeQuestion', { title: translatedTitle }),
              acceptedAnswer: { '@type': 'Answer', text: t('faqFreeAnswer') } },
            { '@type': 'Question', name: t('faqColorQuestion'),
              acceptedAnswer: { '@type': 'Answer', text: t('faqColorAnswer') } }
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
                                    alt={t('imageAlt', { title: translatedTitle })}
                                    className="object-contain max-h-full max-w-full p-4 hover:scale-105 transition-transform duration-500"
                                    fetchPriority="high"
                                    decoding="async"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 flex items-center">
                                    <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                                    {t('aiGenerated')}
                                </div>
                            </div>
                        </Card>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <Button className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all hover:-translate-y-1">
                                <Printer className="mr-2 w-5 h-5" />
                                {t('printPage')}
                            </Button>
                            <Button className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1">
                                <Download className="mr-2 w-5 h-5" />
                                {t('downloadPdf')}
                            </Button>
                        </div>

                        <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                                <Star className="w-5 h-5 mr-2 text-blue-600" />
                                {t('shareTitle')}
                            </h3>
                            <div className="flex gap-2">
                                <ShareEmbedButton
                                    imageUrl={pageData.image_url}
                                    title={translatedTitle}
                                    pageUrl={`${BASE_URL}/${locale}/printable/${slug}`}
                                />
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
                                    {styled ? t('styleBody', { style: styleLabel, subject: translatedSubject }) : t('plainDescription', { subject: translatedSubject })}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {[translatedSubject, ...(styled ? [styleLabel] : [])].map((kw: string) => (
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
                                    <span data-style-fact={copyKey}>{t(`styleCopy.${copyKey}.fact`, { subject: translatedSubject })}</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-700">
                                    <span className="mr-2 mt-1 min-w-[16px]">👉</span>
                                    <span>{t('focusFact')}</span>
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
                                    <span data-style-tip={copyKey}>{t(`styleCopy.${copyKey}.tip1`, { subject: translatedSubject })}</span>
                                </li>
                                <li className="flex items-start text-sm text-gray-700">
                                    <Check className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                                    <span data-style-tip={copyKey}>{t(`styleCopy.${copyKey}.tip2`, { subject: translatedSubject })}</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Related Pages Section */}
                <div className="mt-16 border-t pt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('relatedTitle')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedPages.map((page) => {
                            const pSubject = tData.has(subjectKey(page.subject)) ? tData(subjectKey(page.subject)) : page.subject
                            const pAudience = page.audience === 'Everyone' ? t('allAges') : tData.has(page.audience) ? tData(page.audience) : page.audience
                            const pTitle = page.style.toLowerCase() !== 'standard' ? t('styleTitle', { style: styleName(page.style), subject: pSubject }) : tData('titlePattern', { subject: pSubject, audience: pAudience })
                            return (
                                <Link key={page.slug} href={`/printable/${page.slug}`} className="group block" prefetch={false}>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-[3/4] bg-gray-50 p-4 flex items-center justify-center">
                                            <img
                                                src={page.image_url}
                                                alt={pTitle}
                                                className="max-h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                                loading="lazy"
                                                decoding="async"
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
