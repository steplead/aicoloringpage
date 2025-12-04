import Link from 'next/link'
import Image from 'next/image'
import { Camera, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
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
            {/* Mobile Menu Placeholder (Simple button for now) */}
            <div className="md:hidden">
                <Button size="sm">Menu</Button>
            </div>
        </header>
    )
}
