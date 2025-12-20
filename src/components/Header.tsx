'use client'

import { useState } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Camera, BookOpen, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

import { useTranslations } from 'next-intl'

export function Header() {
    const t = useTranslations('Header')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)

    const categories = {
        "Animals": ["Cat", "Dog", "Lion", "Tiger", "Bear", "Wolf", "Fox", "Owl", "Butterfly"],
        "Fantasy": ["Dragon", "Unicorn", "Mermaid", "Fairy", "Robot", "Alien", "Monster"],
        "Styles": ["Stained Glass", "Mandala", "Kawaii", "Realistic", "3D Abstract", "Steampunk"],
        "Themes": ["Christmas", "Halloween", "Easter", "Spring", "Space", "Underwater"]
    }

    return (
        <header className="flex flex-col border-b bg-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl" prefetch={false}>
                    <img
                        src="/logo.png"
                        alt="AI Coloring Page Logo"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-md"
                    />
                    <span className="hidden sm:inline">AI Coloring Page</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {/* Mega Menu Dropdown */}
                    <div
                        className="relative group"
                        onMouseEnter={() => setIsMegaMenuOpen(true)}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                    >
                        <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black py-2">
                            {t('explore')} <BookOpen className="w-3 h-3 ml-0.5 opacity-50" />
                        </button>

                        {/* Dropdown Panel */}
                        {isMegaMenuOpen && (
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white shadow-xl border border-gray-100 rounded-xl p-6 grid grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                {Object.entries(categories).map(([category, items]) => (
                                    <div key={category}>
                                        <h4 className="font-bold text-gray-900 mb-3 text-sm border-b pb-1">{category}</h4>
                                        <ul className="space-y-2">
                                            {items.slice(0, 6).map(item => (
                                                <li key={item}>
                                                    <Link
                                                        href={`/printable/${item.toLowerCase().replace(/ /g, '-')}-coloring-page-for-kids`}
                                                        className="text-xs text-gray-600 hover:text-purple-600 block truncate"
                                                        prefetch={false}
                                                    >
                                                        {item}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                <div className="col-span-4 pt-4 border-t text-center">
                                    <Link href="/directory" className="text-sm font-bold text-blue-600 hover:underline" prefetch={false}>
                                        {t('viewAll')} →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-black" prefetch={false}>
                        {t('blog')}
                    </Link>
                    <Link href="/create/photo" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1" prefetch={false}>
                        <Camera className="w-4 h-4" />
                        {t('magicCamera')}
                    </Link>
                    <Link href="/create/story" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1" prefetch={false}>
                        <BookOpen className="w-4 h-4" />
                        {t('storyMode')}
                    </Link>
                    <LanguageSwitcher />
                    <Button size="sm" variant="outline">{t('signIn')}</Button>
                    <Button size="sm">{t('getStarted')}</Button>
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <Button size="sm" variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 bg-gray-50 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <div className="space-y-2">
                        <p className="font-bold text-gray-900 text-sm pl-2">{t('explore')}</p>
                        <div className="grid grid-cols-2 gap-2 pl-2">
                            {["Animals", "Fantasy", "Styles", "Themes"].map(cat => (
                                <Link key={cat} href="/directory" className="text-sm text-gray-600 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
                                    {cat}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link href="/blog" className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                        {t('blog')}
                    </Link>
                    <Link href="/create/photo" className="text-sm font-medium text-purple-600 p-2 hover:bg-purple-50 rounded-md flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <Camera className="w-4 h-4" />
                        Magic Camera
                    </Link>
                    <Link href="/create/story" className="text-sm font-medium text-blue-600 p-2 hover:bg-blue-50 rounded-md flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <BookOpen className="w-4 h-4" />
                        {t('storyMode')}
                    </Link>
                    <div className="flex items-center justify-between p-2">
                        <span className="text-sm font-medium text-gray-600">Language</span>
                        <LanguageSwitcher />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="w-full">{t('signIn')}</Button>
                        <Button size="sm" className="w-full">{t('getStarted')}</Button>
                    </div>
                </div>
            )}
        </header>
    )
}
