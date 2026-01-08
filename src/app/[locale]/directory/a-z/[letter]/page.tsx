import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import seoPages from '@/data/seo-pages.json'
import { getCategoryForPage, type PageData } from '@/lib/categories'
import { generateCategoryPageSchema } from '@/lib/schema-org'

// Cannot use runtime = 'edge' with generateStaticParams
// export const runtime = 'edge'

export async function generateStaticParams() {
  // Video: A-Z Index for multi-pathing
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  return letters.map(letter => ({
    letter
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; letter: string }> }) {
  const { letter } = await params

  return {
    title: `Coloring Pages Starting with '${letter.toUpperCase()}'`,
    description: `Browse all coloring pages that start with the letter ${letter.toUpperCase()}`,
    openGraph: {
      title: `${letter.toUpperCase()} Coloring Pages`,
      description: `Free printable coloring pages starting with ${letter.toUpperCase()}`,
      type: 'website',
    }
  }
}

export default async function LetterIndexPage({ params }: { params: Promise<{ locale: string; letter: string }> }) {
  const { letter, locale } = await params

  // Get pages starting with this letter
  const pages: PageData[] = seoPages.filter(page => {
    const firstChar = page.slug.charAt(0).toLowerCase()
    return firstChar === letter.toLowerCase()
  })

  // Generate Schema.org structured data
  const schemaData = generateCategoryPageSchema({
    name: `Coloring Pages Starting with ${letter.toUpperCase()}`,
    description: `Browse ${pages.length} coloring pages that start with ${letter.toUpperCase()}`,
    count: pages.length,
    url: `https://ai-coloringpage.com/directory/a-z/${letter}`,
    breadcrumbs: [
      { name: 'Home', url: 'https://ai-coloringpage.com/' },
      { name: 'Directory', url: 'https://ai-coloringpage.com/directory' },
      { name: 'A-Z Index', url: 'https://ai-coloringpage.com/directory/a-z' },
      { name: letter.toUpperCase(), url: `https://ai-coloringpage.com/directory/a-z/${letter}` }
    ]
  })

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Video: A-Z Index Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Video: H1 must have id attribute */}
          <h1 id={`letter-${letter}`} className="text-4xl font-extrabold text-gray-900 mb-4">
            Coloring Pages Starting with '{letter.toUpperCase()}'
          </h1>
          <p className="text-lg text-gray-600">
            Browse {pages.length} coloring pages that start with {letter.toUpperCase()}
          </p>
        </div>

        {/* A-Z Navigation */}
        <div className="mb-8 flex justify-center flex-wrap gap-2">
          {'abcdefghijklmnopqrstuvwxyz'.split('').map(l => (
            <Link
              key={l}
              href={`/${locale}/directory/a-z/${l}`}
              className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-colors ${
                l === letter.toLowerCase()
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pages.map((page) => {
            const category = getCategoryForPage(page) || 'uncategorized'
            return (
              <Card key={page.slug} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/${locale}/categories/${category}/${page.slug}`} prefetch={false}>
                  <div className="aspect-square bg-white p-2">
                    <Image
                      src={page.image_url}
                      alt={`${page.subject} coloring page for ${page.audience.toLowerCase()} - ${page.style} style`}
                      width={200}
                      height={200}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {page.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {page.subject}
                    </p>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
