import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'
import seoPages from '@/data/seo-pages.json'
import { CATEGORIES, getCategoryForPage, type PageData } from '@/lib/categories'
import { generateCategoryPageSchema } from '@/lib/schema-org'

// Cannot use runtime = 'edge' with generateStaticParams
// export const runtime = 'edge'

export async function generateStaticParams() {
  // Protocol 2: Generate static params for all categories
  return Object.keys(CATEGORIES).map(category => ({
    category
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { category, locale } = await params
  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]

  if (!categoryData) {
    return {
      title: 'Category Not Found'
    }
  }

  // Protocol 3: Keyword leftmost in title
  return {
    title: `${categoryData.name} Coloring Pages - Free Printable Pages`,
    description: categoryData.description,
    openGraph: {
      title: `${categoryData.name} Coloring Pages`,
      description: categoryData.description,
      url: `https://ai-coloringpage.com/categories/${category}`,
      type: 'website',
    }
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { category, locale } = await params
  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]
  const t = await getTranslations({ locale, namespace: 'CategoryPage' })

  if (!categoryData) {
    return <div>Category not found</div>
  }

  // Get pages for this category
  const pages: PageData[] = seoPages.filter(page => {
    const pageCategory = getCategoryForPage(page)
    return pageCategory === category
  })

  // Generate Schema.org structured data
  const schemaData = generateCategoryPageSchema({
    name: `${categoryData.name} Coloring Pages`,
    description: categoryData.description,
    count: pages.length,
    url: `https://ai-coloringpage.com/categories/${category}`,
    breadcrumbs: [
      { name: 'Home', url: 'https://ai-coloringpage.com/' },
      { name: 'Categories', url: 'https://ai-coloringpage.com/categories' },
      { name: categoryData.name, url: `https://ai-coloringpage.com/categories/${category}` }
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
        {/* Protocol 2: Category Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Video: H1 must have id attribute */}
          <h1 id={category} className="text-4xl font-extrabold text-gray-900 mb-4">
            {categoryData.name} Coloring Pages
          </h1>
          <p className="text-lg text-gray-600">
            {categoryData.description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Browse {pages.length} free {categoryData.name.toLowerCase()} coloring pages
          </p>
        </div>

        {/* Protocol 2: Classified Listing Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {pages.map((page) => (
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
          ))}
        </div>

        {/* Protocol 5: Internal Linking - Related Categories */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(CATEGORIES)
              .filter(([key]) => key !== category)
              .map(([key, data]) => (
                <Link
                  key={key}
                  href={`/${locale}/categories/${key}`}
                  className="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="font-semibold text-gray-900">{data.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Coloring Pages</p>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
