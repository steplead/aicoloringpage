import { Link } from '@/i18n/routing'
import path from 'path'
import fs from 'fs'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'

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

export const metadata = {
    title: 'Coloring Page Directory - Browse All Categories',
    description: 'Browse our extensive collection of free printable coloring pages. Find pages for kids, adults, and every subject imaginable.',
    openGraph: {
        title: 'Coloring Page Directory - Browse All Categories',
        description: 'Browse extensive collection of free printable coloring pages.',
        url: 'https://ai-coloringpage.com/directory',
        type: 'website',
    }
}

export default function DirectoryPage() {
    const pages = getPages()

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
                        Coloring Page Directory
                    </h1>
                    <p className="text-lg text-gray-600">
                        Explore thousands of printable coloring page ideas.
                        Click any link to generate that exact page instantly!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {subjects.map(subject => (
                        <Card key={subject} className="p-6 hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
                                {subject} Pages
                            </h2>
                            <ul className="space-y-2">
                                {pagesBySubject[subject].map((page: any) => (
                                    <li key={page.slug}>
                                        <Link
                                            href={`/printable/${page.slug}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm block truncate"
                                            title={page.title}
                                        >
                                            {page.title}
                                        </Link>
                                    </li>
                                ))}
                                <li className="text-xs text-gray-400 italic pt-1">
                                    + many more variations
                                </li>
                            </ul>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
