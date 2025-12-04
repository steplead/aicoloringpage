'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, BookOpen, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="flex flex-col border-b bg-white sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Image
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
                    <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-black">
                        Directory
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-black">
                        Blog
                    </Link>
                    <Link href="/create/photo" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        <Camera className="w-4 h-4" />
                        Magic Camera
                    </Link>
                    <Link href="/create/story" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        Story Mode
                    </Link>
                    <Button size="sm" variant="outline">Sign In</Button>
                    <Button size="sm">Get Started</Button>
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
                    <Link href="/directory" className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                        Directory
                    </Link>
                    <Link href="/blog" className="text-sm font-medium p-2 hover:bg-gray-100 rounded-md" onClick={() => setIsMenuOpen(false)}>
                        Blog
                    </Link>
                    <Link href="/create/photo" className="text-sm font-medium text-purple-600 p-2 hover:bg-purple-50 rounded-md flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <Camera className="w-4 h-4" />
                        Magic Camera
                    </Link>
                    <Link href="/create/story" className="text-sm font-medium text-blue-600 p-2 hover:bg-blue-50 rounded-md flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <BookOpen className="w-4 h-4" />
                        Story Mode
                    </Link>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="w-full">Sign In</Button>
                        <Button size="sm" className="w-full">Get Started</Button>
                    </div>
                </div>
            )}
        </header>
    )
}
