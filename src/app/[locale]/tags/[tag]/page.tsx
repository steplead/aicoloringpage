import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import seoPages from '@/data/seo-pages.json'
import { TAGS, getTagsForPage, getCategoryForPage, type PageData } from '@/lib/categories'
import { generateCategoryPageSchema } from '@/lib/schema-org'

// Cannot use runtime = 'edge' with generateStaticParams
// export const runtime = 'edge'

export async function generateStaticParams() {
  // Protocol 2: Generate static params for all 20+ tags
  return Object.keys(TAGS).map(tag => ({
    tag
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { tag } = await params
  const tagData = TAGS[tag as keyof typeof TAGS]

  if (!tagData) {
    return {
      title: 'Tag Not Found'
    }
  }

  // Protocol 3: Keyword leftmost
  return {
    title: `${tagData.name} Coloring Pages - ${tagData.description}`,
    description: tagData.description,
    openGraph: {
      title: `${tagData.name} Coloring Pages`,
      description: tagData.description,
      type: 'website',
    }
  }
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { tag, locale } = await params
  const tagData = TAGS[tag as keyof typeof TAGS]

  if (!tagData) {
    return <div>Tag not found</div>
  }

  // Get pages for this tag
  const pages: PageData[] = seoPages.filter(page => {
    const tags = getTagsForPage(page)
    return tags.includes(tag)
  })

  // Generate Schema.org structured data
  const schemaData = generateCategoryPageSchema({
    name: `${tagData.name} Coloring Pages`,
    description: tagData.description,
    count: pages.length,
    url: `https://ai-coloringpage.com/tags/${tag}`,
    breadcrumbs: [
      { name: 'Home', url: 'https://ai-coloringpage.com/' },
      { name: 'Tags', url: 'https://ai-coloringpage.com/tags' },
      { name: tagData.name, url: `https://ai-coloringpage.com/tags/${tag}` }
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
        {/* Protocol 2: Tag Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Video: H1 must have id attribute */}
          <h1 id={tag} className="text-4xl font-extrabold text-gray-900 mb-4">
            {tagData.name} Coloring Pages
          </h1>
          <p className="text-lg text-gray-600">
            {tagData.description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Browse {pages.length} {tagData.name.toLowerCase()} coloring pages
          </p>
        </div>

        {/* Protocol 2: Classified Listing Grid */}
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
                      {page.audience}
                    </p>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>

        {/* Protocol 2: Related Tags */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Tags</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(TAGS)
              .filter(([key]) => key !== tag)
              .slice(0, 12)
              .map(([key, data]) => (
                <Link
                  key={key}
                  href={`/${locale}/tags/${key}`}
                  className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="font-semibold text-gray-900">{data.name}</h3>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
