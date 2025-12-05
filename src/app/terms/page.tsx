import { Header } from '@/components/Header'

export const metadata = {
    title: 'Terms of Service | AI Coloring Page',
    description: 'Terms of Service for AI Coloring Page.'
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="prose text-gray-700 space-y-4">
                    <p>Last Updated: {new Date().getFullYear()}</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">1. Terms</h3>
                    <p>
                        By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Use License</h3>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (generated coloring pages) on AI Coloring Page's website for personal, non-commercial transitory viewing.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Disclaimer</h3>
                    <p>
                        The materials on AI Coloring Page's website are provided "as is". AI Coloring Page makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6">4. Limitations</h3>
                    <p>
                        In no event shall AI Coloring Page or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the materials on AI Coloring Page's website.
                    </p>
                </div>
            </main>
        </div>
    )
}
