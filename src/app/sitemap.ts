import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { LOCALES, pageAlternates } from '@/lib/alternates'
import { CATEGORIES, TAGS } from '@/lib/categories'
import { getPublishedPages } from '@/lib/seo-catalog'

export const dynamic = 'force-static'

const BUILD_DATE = '2026-06-02T00:00:00.000Z'

function blogSlugs(): string[] {
    const slugs = new Set<string>()
    for (const locale of LOCALES) {
        const filePath = path.join(process.cwd(), 'src', 'data', `blog-posts.${locale}.json`)
        const posts = JSON.parse(fs.readFileSync(filePath, 'utf8')) as { slug: string }[]
        for (const post of posts) {
            if (post.slug && post.slug !== 'launch') slugs.add(post.slug)
        }
    }
    return Array.from(slugs)
}

export default function sitemap(): MetadataRoute.Sitemap {
    const pages = getPublishedPages('en')

    const paths = [
        '',
        '/create/photo',
        '/create/story',
        '/create/pet',
        '/directory',
        '/categories',
        '/tags',
        '/blog',
        '/blog/launch',
        '/statistics',
        '/pricing',
        '/about',
        '/privacy',
        '/terms',
        ...blogSlugs().map((slug) => `/blog/${slug}`),
        ...Object.keys(CATEGORIES).map((category) => `/categories/${category}`),
        ...Object.keys(TAGS).map((tag) => `/tags/${tag}`),
        ...'abcdefghijklmnopqrstuvwxyz'.split('').map((letter) => `/directory/a-z/${letter}`),
        ...pages.map((page) => `/printable/${page.slug}`),
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
