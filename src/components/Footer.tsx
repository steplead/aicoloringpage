import Link from 'next/link';
import { Rainbow } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Column 1: Brand Authority & Trust */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Rainbow className="w-6 h-6 text-purple-600" />
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
                                <Link href="#" className="hover:text-purple-600 transition-colors block">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-purple-600 transition-colors block">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-purple-600 transition-colors block">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
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
