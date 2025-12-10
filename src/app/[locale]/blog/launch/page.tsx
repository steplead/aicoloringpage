import { Metadata } from 'next'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Camera, BookOpen, Sparkles } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Introducing Magic Camera & Story Mode - AI Coloring Page',
    description: 'Turn photos into coloring pages and create your own storybooks with our biggest update yet.',
}

export default function LaunchPost() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <article className="prose lg:prose-xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="bg-purple-100 text-purple-800 text-sm font-bold px-3 py-1 rounded-full">
                            New Update
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 mb-6 leading-tight">
                            Turn Photos into Coloring Pages & Create Your Own Stories
                        </h1>
                        <p className="text-xl text-gray-600">
                            The biggest update to AI Coloring Page is here. Discover Magic Camera, Story Mode, and more.
                        </p>
                    </div>

                    <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden mb-12 shadow-lg">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            {/* Placeholder for a hero image if we had one */}
                            <Sparkles className="w-20 h-20 opacity-20" />
                        </div>
                    </div>

                    <h2>📸 Magic Camera: Real Life to Line Art</h2>
                    <p>
                        Have you ever wanted to color a picture of your own pet, house, or favorite toy?
                        With the new <strong>Magic Camera</strong>, you can upload any photo, and our AI will instantly convert it into a clean, black-and-white coloring page.
                    </p>
                    <div className="not-prose my-8 p-6 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center text-center">
                        <Camera className="w-12 h-12 text-purple-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Try Magic Camera</h3>
                        <p className="text-gray-600 mb-6">Upload a photo and see the magic happen.</p>
                        <Link href="/create/photo">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                                Convert a Photo
                            </Button>
                        </Link>
                    </div>

                    <h2>📖 Story Mode: Be the Hero</h2>
                    <p>
                        Why color just one page when you can create a whole book?
                        <strong>Story Mode</strong> lets you design a character (like a "Space Cat" or "Detective Dinosaur") and generates a 5-page coloring book featuring them in different scenes.
                    </p>
                    <div className="not-prose my-8 p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center text-center">
                        <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Create a Storybook</h3>
                        <p className="text-gray-600 mb-6">Generate a consistent character across 5 pages.</p>
                        <Link href="/create/story">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                Start Your Story
                            </Button>
                        </Link>
                    </div>

                    <h2>✨ Remix Engine</h2>
                    <p>
                        Found a page you like but want to change the style? Click the "Remix This" button on any printable page to add your own twist. Turn a realistic lion into a cute cartoon, or add a party hat to a dinosaur.
                    </p>

                    <hr className="my-12" />

                    <div className="bg-gray-50 p-8 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold mb-4">Ready to start coloring?</h3>
                        <p className="text-gray-600 mb-8">
                            Explore thousands of free pages or create your own today.
                        </p>
                        <Link href="/">
                            <Button size="lg">
                                Go to Homepage
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>
        </div>
    )
}
