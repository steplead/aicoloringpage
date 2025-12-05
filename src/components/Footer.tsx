import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Brand Authority & Trust */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/logo.png"
                                alt="AI Coloring Page Logo"
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-md"
                            />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                AI Coloring Page
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            The world's most advanced AI coloring page generator.
                            Turn photos into coloring pages, create custom storybooks,
                            and explore thousands of free printable sheets.
                        </p>
                        <div className="pt-4">
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Trusted by</p>
                            <p className="text-sm text-gray-500 mt-1">Parents, Teachers & Artists Worldwide</p>
                        </div>
                    </div>

                    {/* Column 2: Core Tools (Action Keywords) */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Create</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link href="/create/photo" className="hover:text-purple-600 transition-colors block">
                                    Turn Photo to Coloring Page
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="hover:text-purple-600 transition-colors block">
                                    Text to Coloring Page
                                </Link>
                            </li>
                            <li>
                                <Link href="/create/story" className="hover:text-purple-600 transition-colors block">
                                    Create Coloring Book
                                </Link>
                            </li>
                            <li>
                                <Link href="/directory" className="hover:text-purple-600 transition-colors block">
                                    Browse All 15,000+ Pages
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Keyword Clusters (Semantic Silos) */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Popular Themes</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link href="/printable/cat-coloring-page-for-kids" className="hover:text-purple-600 transition-colors block">
                                    Cat Coloring Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/printable/dog-coloring-page-for-kids" className="hover:text-purple-600 transition-colors block">
                                    Dog Coloring Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/printable/dinosaur-coloring-page-for-kids" className="hover:text-purple-600 transition-colors block">
                                    Dinosaur Coloring Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/printable/unicorn-coloring-page-for-kids" className="hover:text-purple-600 transition-colors block">
                                    Unicorn Coloring Pages
                                </Link>
                            </li>
                            <li>
                                <Link href="/printable/mandala-coloring-page-for-adults" className="hover:text-purple-600 transition-colors block">
                                    Mandala (Adults)
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Resources & Legal (Trust Signals) */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>
                                <Link href="/blog" className="hover:text-purple-600 transition-colors block">
                                    Coloring Tips & Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-purple-600 transition-colors block">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-purple-600 transition-colors block">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-purple-600 transition-colors block">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* SEO Keyword Matrix (Internal Linking Silos) */}
                <div className="border-t border-gray-100 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">By Animal</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {["Cat", "Dog", "Lion", "Tiger", "Bear", "Wolf", "Fox", "Owl", "Butterfly", "Horse", "Rabbit", "Shark"].map(tag => (
                                    <Link key={tag} href={`/printable/${tag.toLowerCase()}-coloring-page-for-kids`} className="hover:text-purple-600">
                                        {tag} •
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">By Style</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {["Kawaii", "Realistic", "Stained Glass", "Mandala", "Geometric", "Minimalist", "Cartoon", "Anime", "Chibi"].map(tag => (
                                    <Link key={tag} href={`/printable/${tag.toLowerCase().replace(/ /g, '-')}-coloring-page`} className="hover:text-purple-600">
                                        {tag} •
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">By Theme</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {["Christmas", "Halloween", "Easter", "Summer", "Winter", "Space", "Underwater", "Forest", "Farm"].map(tag => (
                                    <Link key={tag} href={`/printable/${tag.toLowerCase()}-coloring-page`} className="hover:text-purple-600">
                                        {tag} •
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Popular</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {["Unicorn", "Dragon", "Mermaid", "Fairy", "Robot", "Dinosaur", "Princess", "Superhero", "Pokemon"].map(tag => (
                                    <Link key={tag} href={`/printable/${tag.toLowerCase()}-coloring-page-for-kids`} className="hover:text-purple-600">
                                        {tag} •
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Micro-text */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} AI Coloring Page. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Links could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
