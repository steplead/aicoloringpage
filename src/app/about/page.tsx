import { Header } from '@/components/Header'

export const metadata = {
    title: 'About Us | AI Coloring Page',
    description: 'Learn about the mission behind AI Coloring Page - combining art, mindfulness, and technology.'
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8">About Us</h1>
                <div className="prose lg:prose-xl text-gray-700 space-y-6">
                    <p>
                        Welcome to <strong>AI Coloring Page</strong>, where imagination meets technology.
                    </p>
                    <p>
                        Our mission is simple: <strong>To make creativity accessible to everyone.</strong>
                    </p>
                    <p>
                        Whether you are a parent looking for a unique activity for your child, a teacher needing specific educational resources, or an adult seeking a moment of mindfulness, our tool is built for you.
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900 pt-4">Why We Built This</h2>
                    <p>
                        We realized that finding high-quality, specific coloring pages is hard. Most sites are filled with generic, low-resolution clips.
                        We decided to use the power of <strong>Generative AI</strong> to let you create <em>exactly</em> what you want, when you want it.
                    </p>
                    <p>
                        From turning your pet photo into a coloring page to generating a "Cyberpunk Unicorn for Kids," our engine handles it all.
                    </p>
                    <p>
                        Thank you for using our tool. Happy coloring! 🎨
                    </p>
                    <p className="italic text-gray-500 pt-8">
                        - The AI Coloring Page Team
                    </p>
                </div>
            </main>
        </div>
    )
}
