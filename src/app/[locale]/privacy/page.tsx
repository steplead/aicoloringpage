import { Header } from '@/components/Header'

export const metadata = {
    title: 'Privacy Policy | AI Coloring Page',
    description: 'Privacy Policy for AI Coloring Page.'
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose text-gray-700 space-y-4">
                    <p>Last Updated: {new Date().getFullYear()}</p>
                    <p>
                        Your privacy is important to us. It is AI Coloring Page's policy to respect your privacy regarding any information we may collect from you across our website.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6">1. Information We Collect</h3>
                    <p>
                        We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6">2. Use of Images</h3>
                    <p>
                        Images uploaded to our "Magic Camera" feature are processed temporarily to generate your coloring page. We do not sell or trade your personal photos.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6">3. Analytics</h3>
                    <p>
                        We use Google Analytics to understand how visitors interact with our site. This data is anonymized and used solely to improve the user experience.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6">4. Contact Us</h3>
                    <p>
                        If you have any questions about our privacy policy, please contact us.
                    </p>
                </div>
            </main>
        </div>
    )
}
