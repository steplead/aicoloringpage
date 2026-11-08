export const STYLE_TAGS = ['realistic', 'kawaii', 'anime', 'cartoon'] as const
export type StyleTag = typeof STYLE_TAGS[number]
export function isStyleTag(tag: string): tag is StyleTag {
    return (STYLE_TAGS as readonly string[]).includes(tag)
}
export function styleName(style: string): string {
    return style.split(/[- ]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}
export function isStylePage(slug: string): boolean {
    return /^(kawaii|anime|cartoon|realistic|steampunk|mandala|geometric|chibi|minimalist|stained-glass)-.+-coloring-page(?:-for-.+)?$/.test(slug)
}
