import { Link } from '@/i18n/routing'
import Image from 'next/image'
import path from 'path'
import fs from 'fs'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, User } from 'lucide-react'

// Helper to get data
function getPosts() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'blog-posts.json')
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            return JSON.parse(fileContent)
        }
    } catch (e) {
        console.error('Error reading blog data:', e)
    }
    return []
}

export const metadata = {
    title: 'Coloring Blog - Tips, Tricks & Inspiration',
    description: 'Learn about coloring techniques, best art supplies, and the benefits of coloring for mindfulness.',
    openGraph: {
        title: 'Coloring Blog - Tips, Tricks & Inspiration',
        description: 'Learn about coloring techniques, best art supplies, and the benefits of coloring for mindfulness.',
        url: 'https://ai-coloringpage.com/blog',
        type: 'website',
    }
}

export default function BlogPage() {
    const posts = getPosts()

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                        The Coloring Blog
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tips, tutorials, and inspiration for your coloring journey.
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
                                    New Update
                                </div>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                                    <Link href="/blog/launch" className="hover:text-purple-700">
                                        Introducing Magic Camera & Story Mode
                                    </Link>
                                </h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    Turn photos into coloring pages and create your own storybooks. Discover the biggest update yet.
                                </p>
                                <div>
                                    <Link href="/blog/launch">
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            Read Announcement
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
                                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-600 text-sm mb-4 flex-1">
                                    {post.excerpt}
                                </p>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="text-blue-600 font-medium text-sm hover:underline mt-auto inline-block"
                                >
                                    Read Article →
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}
