import fs from 'fs'
import path from 'path'
import { LOCALES, type Locale } from './alternates'

export interface SeoPage {
    slug: string
    title: string
    description: string
    image_url: string
    prompt: string
    style: string
    subject: string
    audience: string
    created_at: string
    pinterest_posted?: boolean
    keywords?: string[]
}

const FILE_BY_LOCALE: Record<Locale, string> = {
    en: 'seo-pages.json',
    es: 'seo-pages-es.json',
    fr: 'seo-pages-fr.json',
    pt: 'seo-pages-pt.json',
}

const rawCache = new Map<Locale, SeoPage[]>()
let publishedSlugs: Set<string> | null = null

function readRaw(locale: Locale): SeoPage[] {
    const cached = rawCache.get(locale)
    if (cached) return cached
    const filePath = path.join(process.cwd(), 'src', 'data', FILE_BY_LOCALE[locale])
    const pages = JSON.parse(fs.readFileSync(filePath, 'utf8')) as SeoPage[]
    rawCache.set(locale, pages)
    return pages
}

/**
 * Placeholder doorway pages (image_url `/placeholder-image.png`) are the bulk of
 * the 15k catalog. Cloudflare Pages Free allows 20,000 files, and 15,488 slugs
 * × 4 locales cannot be deployed as HTML. Real hosted images are the pages we
 * prerender. Set SEO_INCLUDE_PLACEHOLDERS=1 to emit the full catalog (paid plan
 * / higher file limit only).
 */
export function includePlaceholderPages(): boolean {
    return process.env.SEO_INCLUDE_PLACEHOLDERS === '1'
}

export function getPublishedSlugSet(): Set<string> {
    if (publishedSlugs) return publishedSlugs
    const includePlaceholders = includePlaceholderPages()
    const slugs = new Set<string>()
    for (const page of readRaw('en')) {
        const hasRealImage = typeof page.image_url === 'string' && page.image_url.startsWith('http')
        if (includePlaceholders || hasRealImage) slugs.add(page.slug)
    }
    publishedSlugs = slugs
    return slugs
}

const publishedCache = new Map<Locale, SeoPage[]>()
const publishedBySlug = new Map<Locale, Map<string, SeoPage>>()

export function getPublishedPages(locale: string): SeoPage[] {
    const safe = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en'
    const cached = publishedCache.get(safe)
    if (cached) return cached
    const allowed = getPublishedSlugSet()
    const pages = readRaw(safe).filter((page) => allowed.has(page.slug))
    publishedCache.set(safe, pages)
    return pages
}

export function getPublishedPage(locale: string, slug: string): SeoPage | null {
    const safe = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : 'en'
    let index = publishedBySlug.get(safe)
    if (!index) {
        index = new Map(getPublishedPages(safe).map((page) => [page.slug, page]))
        publishedBySlug.set(safe, index)
    }
    return index.get(slug) ?? null
}

/** Stable neighbors so prerendered HTML does not depend on Math.random(). */
export function getRelatedPages(locale: string, slug: string, limit = 4): SeoPage[] {
    const pages = getPublishedPages(locale)
    const start = pages.findIndex((page) => page.slug === slug)
    if (start < 0 || pages.length <= 1) return []
    const related: SeoPage[] = []
    for (let step = 1; related.length < limit && step < pages.length; step++) {
        related.push(pages[(start + step) % pages.length])
    }
    return related
}
