import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://ai-coloringpage.com'
const LOCALES = ['en', 'es', 'pt', 'fr']

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
    const allPages = await getAllPages()
    // SAFETY LIMIT: Only index the top 1000 pages initially
    const pages = allPages.slice(0, 1000)

    // Base Routes (Static)
    const routes = [
        '',
        '/create/photo',
        '/create/story',
        '/directory',
        '/blog',
        '/about',
        '/privacy',
        '/terms'
    ]

    // Blog Posts (Hardcoded for now, should likely fetch from DB/FS later)
    const blogPosts = [
        'benefits-of-coloring-for-adults',
        'how-to-print-coloring-pages',
        'best-markers-for-coloring'
    ]
    const blogRoutes = blogPosts.map(slug => `/blog/${slug}`)

    // Combine all abstract paths
    const allPaths = [
        ...routes,
        ...blogRoutes,
        ...pages.map((page: any) => `/printable/${page.slug}`)
    ]

    const sitemapEntries: MetadataRoute.Sitemap = []

    for (const path of allPaths) {
        // For each path, we generate valid URLs for all locales
        const languages: Record<string, string> = {}

        // Construct the languages map first
        for (const locale of LOCALES) {
            languages[locale] = `${BASE_URL}/${locale}${path === '' ? '' : path}`
        }

        // Generate an entry for each locale
        for (const locale of LOCALES) {
            sitemapEntries.push({
                url: languages[locale],
                lastModified: new Date(),
                changeFrequency: path === '' ? 'daily' : 'weekly',
                priority: path === '' ? 1 : 0.8,
                alternates: {
                    languages: languages // Self-reference + all others
                }
            })
        }
    }

    return sitemapEntries
}
