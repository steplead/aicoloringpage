'use client'

import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Share2 } from 'lucide-react'

interface SocialShareProps {
    url: string
    title: string
    image?: string
}

export function SocialShare({ url, title, image }: SocialShareProps) {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedImage = image ? encodeURIComponent(image) : ''

    const shareLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            color: 'bg-blue-600 hover:bg-blue-700'
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            color: 'bg-sky-500 hover:bg-sky-600'
        },
        {
            name: 'Pinterest',
            icon: Share2, // Using Share2 as generic share or Pinterest specific if available
            url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`,
            color: 'bg-red-600 hover:bg-red-700'
        },
        {
            name: 'WhatsApp',
            icon: Share2, // Placeholder icon
            url: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
            color: 'bg-green-500 hover:bg-green-600'
        }
    ]

    return (
        <div className="flex gap-2 flex-wrap">
            {shareLinks.map((link) => (
                <Button
                    key={link.name}
                    size="sm"
                    className={`${link.color} text-white border-none`}
                    onClick={() => window.open(link.url, '_blank', 'width=600,height=400')}
                >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                </Button>
            ))}
        </div>
    )
}
