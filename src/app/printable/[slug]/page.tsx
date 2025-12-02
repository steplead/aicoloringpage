import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Printer, ArrowLeft } from 'lucide-react'
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
        const filePath = path.join(process.cwd(), 'data', 'seo-pages.json')
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Generator
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left: Image */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                            <div className="aspect-[1/1.414] relative bg-white rounded-lg overflow-hidden border border-gray-100">
                                <img
                                    src={page.image_url}
                                    alt={page.title}
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button className="flex-1 h-12 text-lg bg-blue-600 hover:bg-blue-700">
                                <Download className="w-5 h-5 mr-2" />
                                Download PDF
                            </Button>
                            <Button variant="outline" className="flex-1 h-12 text-lg">
                                <Printer className="w-5 h-5 mr-2" />
                                Print Now
                            </Button>
                        </div>
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
                                Related Pages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Cute Cat', 'Space Dog', 'Unicorn', 'Dinosaur'].map(tag => (
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
            </main>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </div>
    )
}
