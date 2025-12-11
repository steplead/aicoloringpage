import { Link } from '@/i18n/routing'
import path from 'path'
import fs from 'fs'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

// Helper to get data
function getPosts(locale: string = 'en') {
    try {
        let filePath = path.join(process.cwd(), 'src', 'data', `blog-posts.${locale}.json`)
        // Fallback to English if file doesn't exist
        if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), 'src', 'data', 'blog-posts.en.json')
        }

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            return JSON.parse(fileContent)
        }
    } catch (e) {
        console.error('Error reading blog data:', e)
    }
    return []
}

// Metadata remains based on post content for now
export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
    const { slug, locale } = await params
    const posts = getPosts(locale)
    const post = posts.find((p: any) => p.slug === slug)

    if (!post) return { title: 'Post Not Found' }

    return {
        title: `${post.title} - AI Coloring Page Blog`,
        description: post.excerpt,
        openGraph: {
            images: [post.image_url]
        }
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params
    const posts = getPosts(locale)
    const t = await getTranslations('BlogPage')
    const post = posts.find((p: any) => p.slug === slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('backToBlog')}
                    </Link>

                    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="h-64 md:h-96 relative bg-gray-200">
                            <img
                                src={post.image_url}
                                alt={post.title}
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <div className="p-8 md:p-12">
                            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-6">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {post.date}
                                </div>
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2" />
                                    {post.author}
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">
                                {post.title}
                            </h1>

                            <div
                                className="prose prose-lg prose-blue max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </article>
                </div>
            </main>
        </div>
    )
}
