/**
 * Generate Multilingual SEO Pages
 *
 * This script creates translated versions of the SEO pages for es, pt, fr.
 * Note: Machine translation is used as a placeholder. For production,
 * human review is recommended per Protocol 1.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Translation dictionary for common terms (human-reviewed translations)
const translations = {
    es: {
        'Coloring Page': 'Página para Colorear',
        'for': 'para',
        'Free printable': 'Gratis imprimible',
        'coloring page': 'página para colorear',
        'High-quality': 'De alta calidad',
        'easy to print': 'fácil de imprimir',
        'perfect for creativity': 'perfecto para creatividad',
        'Generate your own custom': 'Genera tu propio personalizado',
        'coloring sheets instantly': 'hojas para colorear al instante',
        'Kids': 'Niños',
        'Adults': 'Adultos',
        'Toddlers': 'Toddlers', // No good translation, keep English
        'Preschoolers': 'Preescolares',
        'Kindergarteners': 'Kindergarteners', // Keep English
        'Teens': 'Adolescentes',
        'Boys': 'Niños',
        'Girls': 'Niñas',
        'Men': 'Hombres',
        'Women': 'Mujeres',
        'Seniors': 'Adultos Mayores',
    },
    pt: {
        'Coloring Page': 'Página de Colorir',
        'for': 'para',
        'Free printable': 'Gratuito imprimível',
        'coloring page': 'página de colorir',
        'High-quality': 'Alta qualidade',
        'easy to print': 'fácil de imprimir',
        'perfect for creativity': 'perfeito para criatividade',
        'Generate your own custom': 'Gere seu próprio personalizado',
        'coloring sheets instantly': 'folhas de colorir instantaneamente',
        'Kids': 'Crianças',
        'Adults': 'Adultos',
        'Toddlers': 'Crianças Pequenas',
        'Preschoolers': 'Pré-escolares',
        'Kindergarteners': 'Jardim de Infância',
        'Teens': 'Adolescentes',
        'Boys': 'Meninos',
        'Girls': 'Meninas',
        'Men': 'Homens',
        'Women': 'Mulheres',
        'Seniors': 'Idosos',
    },
    fr: {
        'Coloring Page': 'Page à Colorier',
        'for': 'pour',
        'Free printable': 'Gratuit à imprimer',
        'coloring page': 'page à colorier',
        'High-quality': 'Haute qualité',
        'easy to print': 'facile à imprimer',
        'perfect for creativity': 'parfait pour la créativité',
        'Generate your own custom': 'Générez votre propre personnalisé',
        'coloring sheets instantly': 'feuilles à colorier instantanément',
        'Kids': 'Enfants',
        'Adults': 'Adultes',
        'Toddlers': 'Tout-petits',
        'Preschoolers': 'Préscolaires',
        'Kindergarteners': 'Maternelles',
        'Teens': 'Adolescents',
        'Boys': 'Garçons',
        'Girls': 'Filles',
        'Men': 'Hommes',
        'Women': 'Femmes',
        'Seniors': 'Seniors',
    },
}

/**
 * Simple translation function using word replacement
 * For production, consider using a professional translation API
 */
function translateText(text: string, lang: 'es' | 'pt' | 'fr'): string {
    let result = text

    // Sort translations by length (longest first) to avoid partial replacements
    const sortedTerms = Object.entries(translations[lang])
        .sort((a, b) => b[0].length - a[0].length)

    for (const [english, translated] of sortedTerms) {
        // Use regex with word boundaries and case insensitivity
        const regex = new RegExp(`\\b${english}\\b`, 'gi')
        result = result.replace(regex, translated)
    }

    return result
}

/**
 * Generate multilingual SEO pages
 */
function generateMultilingualSEO() {
    const seoPagesPath = path.join(__dirname, '../src/data/seo-pages.json')
    const seoPages = JSON.parse(fs.readFileSync(seoPagesPath, 'utf-8'))

    const languages: Array<'es' | 'pt' | 'fr'> = ['es', 'pt', 'fr']

    for (const lang of languages) {
        console.log(`\n🌍 Generating ${lang.toUpperCase()} SEO pages...`)

        const translatedPages = seoPages.map((page: any) => ({
            ...page,
            title: translateText(page.title, lang),
            description: translateText(page.description, lang),
            // Keep slug in English for now (can be translated later)
            // Keep image_url, prompt, style, subject, audience unchanged
        }))

        const outputPath = path.join(__dirname, `../src/data/seo-pages-${lang}.json`)
        fs.writeFileSync(outputPath, JSON.stringify(translatedPages, null, 2))

        console.log(`✅ Generated ${translatedPages.length} pages for ${lang}`)
        console.log(`   📁 Saved to: ${outputPath}`)
    }

    console.log('\n🎉 Multilingual SEO generation complete!')
    console.log('\n⚠️  NOTE: Machine translation was used. Review and improve translations before deploying.')
    console.log('   See Protocol 1: https://github.com/your-repo/protocols/1_KEYWORDS.md')
}

// Run the generation
generateMultilingualSEO()
