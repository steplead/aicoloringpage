import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge';

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

    return []
}

// Dynamic blog posts fetch (Protocol 3: Avoid hardcoded data)
async function getAllBlogPosts(): Promise<string[]> {
    const blogSlugs = new Set<string>()

    for (const locale of LOCALES) {
        try {
            const blogData = await import(`@/data/blog-posts.${locale}.json`)
            const posts = blogData.default || []
            posts.forEach((post: any) => {
                blogSlugs.add(post.slug)
            })
        } catch (error) {
            console.error(`Failed to load blog posts for ${locale}:`, error)
        }
    }

    return Array.from(blogSlugs)
}

// Protocol 5: Smart pruning instead of arbitrary cutoff
// "If a page has 0 Traffic and 0 Impressions for >6 Months: Prune it"
function shouldIndexPage(page: any): boolean {
    const pageAge = Date.now() - new Date(page.created_at).getTime()
    const sixMonths = 180 * 24 * 60 * 60 * 1000 // 6 months in ms

    // Keep pages that are:
    // - Less than 6 months old (give them a chance)
    // - OR would have >0 impressions (we'd track this in GSC)
    // For now, we index everything since we don't have impression data
    if (pageAge < sixMonths) return true

    // TODO: Later, integrate with GSC API to check impressions
    // if (page.impressions > 0) return true

    return true // Index all for now
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const allPages = await getAllPages()

    // Protocol 5: Smart filtering instead of slice(0, 1000)
    const pages = allPages.filter(shouldIndexPage)

    // Base Routes (Static)
    const routes = [
        '',
        '/create/photo',
        '/create/story',
        '/directory',
        '/blog',
        '/statistics',
        '/about',
        '/privacy',
        '/terms'
    ]

    // Blog Posts (Dynamic - Protocol 3 compliance)
    const blogPosts = await getAllBlogPosts()
    const blogRoutes = blogPosts.map(slug => `/blog/${slug}`)

    // Protocol 2: Add categories, tags, and A-Z index paths
    const categories = ['animals', 'characters', 'holidays', 'nature', 'vehicles']
    const categoryRoutes = categories.map(cat => `/categories/${cat}`)

    const tags = ['easy', 'difficult', 'preschool', 'kindergarten', 'adult', 'teen',
                  'free', 'printable', 'educational', 'fun', 'fantasy', 'realistic',
                  'cartoon', 'seasonal', 'beginner', 'intermediate', 'advanced', 'detailed']
    const tagRoutes = tags.map(tag => `/tags/${tag}`)

    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
    const azRoutes = letters.map(letter => `/directory/a-z/${letter}`)

    // Combine all abstract paths
    const allPaths = [
        ...routes,
        ...blogRoutes,
        ...categoryRoutes,
        ...tagRoutes,
        ...azRoutes,
        ...pages.map((page: any) => `/printable/${page.slug}`)
    ]

    const sitemapEntries: MetadataRoute.Sitemap = []

    for (const path of allPaths) {
        // Construct the languages map first
        const languages: Record<string, string> = {
            'x-default': `${BASE_URL}/en${path === '' ? '' : path}`
        }

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
                    languages: languages
                }
            })
        }
    }

    return sitemapEntries
}
