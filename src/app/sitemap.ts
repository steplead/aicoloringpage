import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { LOCALES, pageAlternates } from '@/lib/alternates'
import { getPublishedPages } from '@/lib/seo-catalog'

export const dynamic = 'force-static'

const BUILD_DATE = '2026-06-02T00:00:00.000Z'

// Same structural paths as sitemap.ts at 3c04652 (production).
const STATIC_ROUTES = [
    '',
    '/create/photo',
    '/create/story',
    '/directory',
    '/blog',
    '/statistics',
    '/about',
    '/privacy',
    '/terms',
]

const CATEGORY_ROUTES = ['animals', 'characters', 'holidays', 'nature', 'vehicles']
    .map((category) => `/categories/${category}`)

const TAG_ROUTES = [
    'easy', 'difficult', 'preschool', 'kindergarten', 'adult', 'teen',
    'free', 'printable', 'educational', 'fun', 'fantasy', 'realistic',
    'cartoon', 'anime', 'kawaii', 'seasonal', 'beginner', 'intermediate', 'advanced', 'detailed',
].map((tag) => `/tags/${tag}`)

const AZ_ROUTES = 'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => `/directory/a-z/${letter}`)

interface AllowlistFile {
    extraLimit?: number
    slugs?: string[]
}

function blogPaths(): string[] {
    const slugs = new Set<string>()
    for (const locale of LOCALES) {
        const filePath = path.join(process.cwd(), 'src', 'data', `blog-posts.${locale}.json`)
        const posts = JSON.parse(fs.readFileSync(filePath, 'utf8')) as { slug: string }[]
        for (const post of posts) {
            if (post.slug) slugs.add(post.slug)
        }
    }
    return Array.from(slugs).map((slug) => `/blog/${slug}`)
}

function loadAllowlist(): { slugs: string[]; extraLimit: number } {
    const filePath = path.join(process.cwd(), 'sitemap-allowlist.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as AllowlistFile
    const fromEnv = process.env.SITEMAP_EXTRA_LIMIT
    const extraLimit = fromEnv !== undefined && fromEnv !== ''
        ? Number(fromEnv)
        : Number(data.extraLimit ?? 0)
    return {
        slugs: Array.isArray(data.slugs) ? data.slugs : [],
        extraLimit: Number.isFinite(extraLimit) && extraLimit > 0 ? Math.floor(extraLimit) : 0,
    }
}

/** Allowlisted slugs, then the next `extraLimit` published slugs not already listed. */
function printablePaths(): string[] {
    const published = getPublishedPages('en').map((page) => page.slug)
    const publishedSet = new Set(published)
    const { slugs, extraLimit } = loadAllowlist()
    const base = slugs.filter((slug) => publishedSet.has(slug))
    const seen = new Set(base)
    const extras: string[] = []
    if (extraLimit > 0) {
        for (const slug of published) {
            if (seen.has(slug)) continue
            extras.push(slug)
            seen.add(slug)
            if (extras.length >= extraLimit) break
        }
    }
    return [...base, ...extras].map((slug) => `/printable/${slug}`)
}

export default function sitemap(): MetadataRoute.Sitemap {
    const paths = [
        ...STATIC_ROUTES,
        ...blogPaths(),
        ...CATEGORY_ROUTES,
        ...TAG_ROUTES,
        ...AZ_ROUTES,
        ...printablePaths(),
    ]

    const entries: MetadataRoute.Sitemap = []

    for (const routePath of paths) {
        for (const locale of LOCALES) {
            const alternates = pageAlternates(locale, routePath)
            entries.push({
                url: alternates.canonical,
                lastModified: BUILD_DATE,
                changeFrequency: routePath === '' ? 'daily' : 'weekly',
                priority: routePath === '' ? 1 : routePath.startsWith('/printable/') ? 0.8 : 0.7,
                alternates: {
                    languages: alternates.languages,
                },
            })
        }
    }

    return entries
}
