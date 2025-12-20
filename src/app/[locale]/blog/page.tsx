import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

// Import blog data directly for Edge compatibility
import blogPostsEn from '@/data/blog-posts.en.json'
import blogPostsEs from '@/data/blog-posts.es.json'
import blogPostsPt from '@/data/blog-posts.pt.json'
import blogPostsFr from '@/data/blog-posts.fr.json'

export const runtime = 'edge';

const BLOG_DATA: Record<string, any[]> = {
    en: blogPostsEn,
    es: blogPostsEs,
    pt: blogPostsPt,
    fr: blogPostsFr
};

// Helper to get data
function getPosts(locale: string = 'en') {
    return BLOG_DATA[locale] || BLOG_DATA['en'];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'BlogPage' })
    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        openGraph: {
            title: t('metaTitle'),
            description: t('metaDescription'),
            url: 'https://ai-coloringpage.com/blog',
            type: 'website',
        }
    }
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const posts = getPosts(locale)
    const t = await getTranslations('BlogPage')

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

                <div className="mb-12">
                    <Card className="overflow-hidden shadow-xl border-purple-100 bg-gradient-to-r from-purple-50 to-white">
                        <div className="md:flex">
                            <div className="md:w-1/3 bg-purple-200 min-h-[200px] flex items-center justify-center">
                                <span className="text-6xl">🚀</span>
                            </div>
                            <div className="p-8 md:w-2/3 flex flex-col justify-center">
                                <div className="text-sm font-bold text-purple-600 mb-2 uppercase tracking-wide">
                                    {t('newUpdate')}
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                                    <Link href="/blog/launch" className="hover:text-purple-700" prefetch={false}>
                                        {t('launchTitle')}
                                    </Link>
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    {t('launchSubtitle')}
                                </p>
                                <div>
                                    <Link href="/blog/launch" prefetch={false}>
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            {t('readAnnouncement')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => (
                        <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                            <div className="h-56 relative bg-gray-200">
                                <img
                                    src={post.image_url}
                                    alt={post.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {post.date}
                                    </div>
                                    <div className="flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        {post.author}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors" prefetch={false}>
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-600 text-sm mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    prefetch={false}
                                    className="text-blue-600 font-medium text-sm hover:underline mt-auto inline-block"
                                >
                                    {t('readArticle')} →
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
