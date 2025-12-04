'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Loader2, TrendingUp } from 'lucide-react'

// Initialize Supabase (Client Side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null

export function GallerySection() {
    const [images, setImages] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchImages() {
            console.log('Gallery: Fetching images...')
            if (!supabase) {
                console.error('Gallery: Supabase not initialized')
                setLoading(false)
                return
            }

            // Fetch latest 12 images that have been posted
            const { data, error } = await supabase
                .from('seo_pages')
                .select('slug, title, image_url, prompt')
                .not('image_url', 'is', null)
                .order('created_at', { ascending: false })
                .limit(12)

            if (error) {
                console.error('Gallery: Error fetching images', error)
            }

            if (data) {
                console.log(`Gallery: Found ${data.length} images`)
                setImages(data)
            }
            setLoading(false)
        }

        fetchImages()
    }, [])

    if (!supabase) return <div className="p-4 text-center text-red-500">Error: Database connection missing.</div>

    if (!loading && images.length === 0) {
        return (
            <section className="w-full max-w-6xl mx-auto py-12 text-center text-gray-500">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No community creations yet. Be the first!</p>
            </section>
        )
    }

    return (
        <section className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 delay-300">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Community Creations</h2>
                <span className="text-sm text-gray-500 ml-auto">Latest generated pages</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <Link key={img.slug} href={`/printable/${img.slug}`} className="group">
                            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 group-hover:-translate-y-1">
                                <div className="aspect-square relative bg-gray-100">
                                    <Image
                                        src={img.image_url}
                                        alt={img.title}
                                        fill
                                        className="object-cover p-4 group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                </div>
                                <div className="p-3 bg-white">
                                    <h3 className="font-medium text-gray-900 truncate text-sm">
                                        {img.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                        {img.prompt}
                                    </p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    )
}
