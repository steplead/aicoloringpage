import { Metadata } from 'next'
import StoryModeClient from '@/components/StoryModeClient'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
    title: 'Story Mode - Create Custom Coloring Books',
    description: 'Create a consistent 5-page coloring book with your own characters and plot. The world\'s first AI coloring book generator.',
    openGraph: {
        title: 'Story Mode - Create Custom Coloring Books',
        description: 'Create a consistent 5-page coloring book with your own characters and plot.',
        url: 'https://ai-coloringpage.com/create/story',
        images: ['/og-story.png']
    }
}

export default function StoryPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <StoryModeClient />
        </div>
    )
}
