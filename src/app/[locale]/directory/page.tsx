import { Link } from '@/i18n/routing'
import path from 'path'
import fs from 'fs'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'

// Helper to get data (same as in sitemap/page)
function getPages() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'seo-pages.json')
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            return JSON.parse(fileContent)
        }
    } catch (e) {
        console.error('Error reading local data:', e)
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
    const pages = getPages()
    const t = await getTranslations('DirectoryPage')
    const tData = await getTranslations('Data')

    // Group by Subject for better UX
    const pagesBySubject: Record<string, any[]> = {}
    pages.forEach((page: any) => {
        if (!pagesBySubject[page.subject]) {
            pagesBySubject[page.subject] = []
        }
        // Limit to 5 links per subject to keep page size manageable
        if (pagesBySubject[page.subject].length < 5) {
            pagesBySubject[page.subject].push(page)
        }
    })

    const subjects = Object.keys(pagesBySubject).sort()

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
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
                                <li className="text-xs text-gray-400 italic pt-1">
                                    {t('variations')}
                                </li>
                            </ul>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
