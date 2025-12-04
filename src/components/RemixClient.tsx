'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'
import { RemixModal } from './RemixModal'

export function RemixClient({ prompt }: { prompt: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg transform hover:scale-[1.02] transition-all"
            >
                <Wand2 className="w-6 h-6 mr-2 animate-pulse" />
                Remix This Page
            </Button>

            <RemixModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                originalPrompt={prompt}
            />
        </>
    )
}
