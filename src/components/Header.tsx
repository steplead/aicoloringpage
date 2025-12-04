import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Image
                    src="/icon.png"
                    alt="AI Coloring Page Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-md"
                />
                <span>AI Coloring Page</span>
            </Link>
            <nav className="flex items-center gap-6">
                <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-black">
                    Directory
                </Link>
                <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-black">
                    Blog
                </Link>
                <Button size="sm" variant="outline">Sign In</Button>
                <Button size="sm">Get Started</Button>
            </nav>
        </header>
    )
}
