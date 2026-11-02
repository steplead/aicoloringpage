export const SITE_URL = 'https://ai-coloringpage.com'
export const LOCALES = ['en', 'es', 'pt', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

/**
 * Canonical + hreflang map.
 * Homepage matches production: `https://ai-coloringpage.com/en/` (trailing slash).
 * Every other path matches the 200 URLs, which have no trailing slash.
 */
export function pageAlternates(locale: string, path: string) {
    const href = (loc: string) =>
        path === '' ? `${SITE_URL}/${loc}/` : `${SITE_URL}/${loc}${path}`

    const languages: Record<string, string> = { 'x-default': href('en') }
    for (const loc of LOCALES) languages[loc] = href(loc)

    return {
        canonical: href(locale),
        languages,
    }
}
