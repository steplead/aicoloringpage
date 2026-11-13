import policy from '@/data/printable-index-policy.json'
import { getPublishedPage } from './seo-catalog'

const INDEXABLE_AUDIENCES = new Set<string>(policy.indexableAudiences)
const GSC_KEEP = new Set<string>(policy.gscKeepSlugs)

/**
 * batch-review-20261113: thin audience variants (same subject, same template,
 * only the audience word changes) are noindex,follow and left out of the
 * sitemap/hreflang. Decided per slug so all four locales stay symmetric.
 */
export function isIndexablePrintable(slug: string): boolean {
    const page = getPublishedPage('en', slug)
    if (!page) return false
    if (page.style.toLowerCase() !== 'standard') return true
    if (INDEXABLE_AUDIENCES.has(page.audience)) return true
    return GSC_KEEP.has(slug)
}
