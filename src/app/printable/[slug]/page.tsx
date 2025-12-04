import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { DownloadButtons } from '@/components/DownloadButtons'
import { RemixClient } from '@/components/RemixClient'
import fs from 'fs'
import path from 'path'

// Initialize Supabase Client (if keys exist)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null

// Helper to get data
async function getPageData(slug: string) {
    // 1. Try DB
    if (supabase) {
        const { data } = await supabase
            .from('seo_pages')
            .select('*')
            .eq('slug', slug)
            .single()

        if (data) return data
    }

    // 2. Fallback to Local JSON (for dev/demo)
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'seo-pages.json')
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            const pages = JSON.parse(fileContent)
            return pages.find((p: any) => p.slug === slug)
        }
    } catch (e) {
        console.error('Error reading local data:', e)
    }

    return null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const page = await getPageData(slug)
    if (!page) return { title: 'Page Not Found' }

    return {
        title: `${page.title} - Free Printable Coloring Page`,
        description: page.description,
        openGraph: {
            images: [page.image_url] // Note: Data URIs might not work in OG tags, but good for structure
        }
    }
}

export default async function PrintablePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const page = await getPageData(slug)

    if (!page) {
        notFound()
    }

    // Dynamic Related Pages (Mock logic: In real app, query DB for same subject)
    // For now, we'll just pick random ones from a hardcoded list to simulate discovery
    const allTags = ['Cute Cat', 'Space Dog', 'Unicorn', 'Dinosaur', 'Mandala', 'Flower', 'Car', 'Robot'];
    const relatedTags = allTags.sort(() => 0.5 - Math.random()).slice(0, 4);

    // Schema Markup
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: page.title,
        description: page.description,
        contentUrl: page.image_url,
        license: 'https://creativecommons.org/licenses/by-nc/4.0/',
        acquireLicensePage: 'https://aicoloringpage.com/pricing',
        creator: {
            '@type': 'Organization',
            name: 'AI Coloring Page Generator'
        }
    }

    // Breadcrumb Schema
    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://ai-coloringpage.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Directory',
                item: 'https://ai-coloringpage.com/directory'
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: page.title,
                item: `https://ai-coloringpage.com/printable/${slug}`
            }
        ]
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="text-sm text-gray-500 mb-6">
                    <ol className="list-none p-0 inline-flex">
                        <li className="flex items-center">
                            <Link href="/" className="hover:text-blue-600">Home</Link>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="flex items-center">
                            <Link href="/directory" className="hover:text-blue-600">Directory</Link>
                            <span className="mx-2">/</span>
                        </li>
                        <li className="text-gray-800 font-medium truncate max-w-[200px]">
                            {page.title}
                        </li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Image */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                            <div className="aspect-[1/1.414] relative bg-white rounded-lg overflow-hidden border border-gray-100">
                                <Image
                                    src={page.image_url}
                                    alt={page.title}
                                    fill
                                    className="object-contain p-4"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                        </div>

                        <DownloadButtons imageUrl={page.image_url} title={page.title} />

                        <RemixClient prompt={page.prompt} />
                    </div>

                    {/* Right: Content */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                                {page.title}
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                {page.description}
                            </p>
                        </div>

                        {page.content?.fun_facts && (
                            <Card className="p-6 bg-yellow-50 border-yellow-100">
                                <h3 className="text-lg font-bold text-yellow-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">💡</span> Fun Facts
                                </h3>
                                <ul className="space-y-3">
                                    {page.content.fun_facts.map((fact: string, i: number) => (
                                        <li key={i} className="flex items-start text-yellow-900">
                                            <span className="mr-2">•</span>
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {page.content?.tips && (
                            <Card className="p-6 bg-purple-50 border-purple-100">
                                <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">🎨</span> Coloring Tips
                                </h3>
                                <ul className="space-y-3">
                                    {page.content.tips.map((tip: string, i: number) => (
                                        <li key={i} className="flex items-start text-purple-900">
                                            <span className="mr-2">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                You Might Also Like
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {relatedTags.map(tag => (
                                    <Link
                                        key={tag}
                                        href={`/printable/${tag.toLowerCase().replace(' ', '-')}`}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main >

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
            />
        </div >
    )
}
