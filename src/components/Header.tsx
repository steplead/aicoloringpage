import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-50">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <div className="bg-black text-white p-1 rounded-md">
                    <Pencil className="w-5 h-5" />
                </div>
                <span>AI Coloring Page</span>
            </Link>
            <nav className="flex items-center gap-6">
                <Link href="/directory" className="text-sm font-medium text-gray-600 hover:text-black">
                    Directory
                </Link>
                <Link href="#" className="text-sm font-medium text-gray-600 hover:text-black">
                    Pricing
                </Link>
                <Button size="sm" variant="outline">Sign In</Button>
                <Button size="sm">Get Started</Button>
            </nav>
        </header>
    )
}
