import en from '@/data/style-guides.en.json'
import es from '@/data/style-guides.es.json'
import fr from '@/data/style-guides.fr.json'
import pt from '@/data/style-guides.pt.json'
import { type StyleTag, styleName } from './styles'
const guides = { en, es, fr, pt }
export function getStyleGuide(locale: string, tag: StyleTag) {
    const safe = locale in guides ? locale as keyof typeof guides : 'en'
    return guides[safe][tag]
}
export function styleTitle(locale: string, tag: string) {
    const name = styleName(tag)
    return ({ es: `Dibujos ${name} para colorear`, fr: `Coloriages ${name}`, pt: `Desenhos ${name} para colorir` } as Record<string, string>)[locale] ?? `${name} Coloring Pages`
}
export function styleCount(locale: string, count: number) {
    return ({ es: `${count} dibujos disponibles`, fr: `${count} dessins disponibles`, pt: `${count} desenhos disponíveis` } as Record<string, string>)[locale] ?? `${count} available coloring sheets`
}
