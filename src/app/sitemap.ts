import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aicoloringpage.com'

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null

async function getAllPages() {
    // 1. Try DB
    if (supabase) {
        const { data } = await supabase
            .from('seo_pages')
            .select('slug, created_at')

        if (data) return data
    }

    // 2. Fallback to Local JSON
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'seo-pages.json')
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            return JSON.parse(fileContent)
        }
    } catch (e) {
        console.error('Error reading local data for sitemap:', e)
    }

    return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const pages = await getAllPages()

    const dynamicRoutes = pages.map((page: any) => ({
        url: `${BASE_URL}/printable/${page.slug}`,
        lastModified: new Date(page.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        ...dynamicRoutes,
    ]
}
