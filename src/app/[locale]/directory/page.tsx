import { Link } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'edge';

// Helper to get data
async function getPages() {
    try {
        const { data, error } = await supabase
            .from('seo_pages')
            .select('slug, subject, audience')
            .order('subject')

        if (error) throw error
        return data
    } catch (e) {
        console.error('Error reading DB data:', e)
    }
    return []
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'DirectoryPage' })
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            url: 'https://ai-coloringpage.com/directory',
            type: 'website',
        }
    }
}

export default async function DirectoryPage() {
    const pages = await getPages()
    const t = await getTranslations('DirectoryPage')
    const tData = await getTranslations('Data')

    // Group by Subject for better UX
    const pagesBySubject: Record<string, any[]> = {}
    pages.forEach((page: any) => {
        if (!pagesBySubject[page.subject]) {
            pagesBySubject[page.subject] = []
        }
        // Limit to 10 links per subject to keep page size manageable
        if (pagesBySubject[page.subject].length < 10) {
            pagesBySubject[page.subject].push(page)
        }
    })

    const subjects = Object.keys(pagesBySubject).sort()

    const baseUrl = 'https://ai-coloringpage.com'

    // Structured Data: Breadcrumbs
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: t('title'), // Home is usually the first, but here it's the directory itself in its own trail
                item: `${baseUrl}/${locale}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t('title'),
                item: `${baseUrl}/${locale}/directory`
            }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjects.map(subject => (
                        <Card key={subject} className="p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                {/* Try to translate subject, fallback to original if not found (or if tData returns key path) */}
                                {tData.has(subject) ? tData(subject) : subject} {t('suffix')}
                            </h2>
                            <ul className="space-y-2">
                                {pagesBySubject[subject].map((page: any) => {
                                    // Construct dynamic title
                                    // Check if we have translations for subject and audience
                                    const translatedSubject = tData.has(page.subject) ? tData(page.subject) : page.subject
                                    const translatedAudience = tData.has(page.audience) ? tData(page.audience) : page.audience
                                    const translatedTitle = tData('titlePattern', { subject: translatedSubject, audience: translatedAudience })

                                    return (
                                        <li key={page.slug}>
                                            <Link
                                                href={`/printable/${page.slug}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm block truncate"
                                                title={translatedTitle}
                                            >
                                                {translatedTitle}
                                            </Link>
                                        </li>
                                    )
                                })}
                                {pagesBySubject[subject].length >= 10 && (
                                    <li className="pt-2">
                                        <Link
                                            href={`/directory`}
                                            className="text-xs font-semibold text-gray-500 hover:text-purple-600"
                                        >
                                            + {t('viewMore')}
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
