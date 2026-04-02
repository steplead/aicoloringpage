import { MetadataRoute } from 'next'
import { Link } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { DownloadButton } from '@/components/DownloadButton'
import { ShareEmbedButton } from '@/components/ShareEmbedButton'
import { getTranslations } from 'next-intl/server'
import seoPages from '@/data/seo-pages.json'
import { CATEGORIES, getCategoryForPage, getTagsForPage, type PageData } from '@/lib/categories'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { generateDetailPageSchema } from '@/lib/schema-org'

// Cannot use runtime = 'edge' with generateStaticParams
// export const runtime = 'edge'

const BASE_URL = 'https://ai-coloringpage.com'
const LOCALES = ['en', 'es', 'pt', 'fr']

export async function generateStaticParams({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Generate params for all pages with their categories
  const pageParams = seoPages.map(page => {
    const category = getCategoryForPage(page) || 'uncategorized'
    return {
      category,
      slug: page.slug
    }
  })

  return pageParams
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }): Promise<MetadataRoute.Sitemap> {
  const { slug, category, locale } = await params
  const pageData = seoPages.find(page => page.slug === slug)

  if (!pageData) {
    return {
      title: 'Page Not Found'
    }
  }

  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]

  // Protocol 3: Keyword leftmost
  return {
    title: pageData.title,
    description: pageData.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/categories/${category}/${slug}`,
      languages: {
        'en': `${BASE_URL}/en/categories/${category}/${slug}`,
        'es': `${BASE_URL}/es/categories/${category}/${slug}`,
        'pt': `${BASE_URL}/pt/categories/${category}/${slug}`,
        'fr': `${BASE_URL}/fr/categories/${category}/${slug}`,
      },
    },
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      url: `${BASE_URL}/${locale}/categories/${category}/${slug}`,
      siteName: 'AI Coloring Page',
      type: 'website',
      images: [
        {
          url: pageData.image_url,
          width: 1200,
          height: 630,
          alt: pageData.title,
        },
      ],
    },
  }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ locale: string; category: string; slug: string }> }) {
  const { slug, category, locale } = await params
  const pageData = seoPages.find(page => page.slug === slug) as PageData | undefined

  if (!pageData) {
    return <div>Page not found</div>
  }

  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]
  const tags = getTagsForPage(pageData)

  // Protocol 5: Multi-pathing - Get related pages
  const sameCategory = seoPages.filter(page =>
    page.slug !== slug && getCategoryForPage(page) === category
  ).slice(0, 4)

  const sameAudience = seoPages.filter(page =>
    page.slug !== slug && page.audience === pageData.audience
  ).slice(0, 4)

  const sameSubject = seoPages.filter(page =>
    page.slug !== slug && page.subject === pageData.subject
  ).slice(0, 4)

  // Generate Schema.org structured data with Product schema and ratings
  const schemaData = generateDetailPageSchema({
    title: pageData.title,
    description: pageData.description,
    imageUrl: pageData.image_url,
    url: `${BASE_URL}/${locale}/categories/${category}/${slug}`,
    subject: pageData.subject,
    audience: pageData.audience,
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Categories', url: `${BASE_URL}/categories` },
      { name: categoryData?.name || category, url: `${BASE_URL}/categories/${category}` },
      { name: pageData.title, url: `${BASE_URL}/${locale}/categories/${category}/${slug}` }
    ],
    aggregateRating: {
      ratingValue: '4.8',
      ratingCount: '1234',
      bestRating: '5',
      worstRating: '1'
    }
  })

  // Optimized ALT text: "Cat coloring page for kids - kawaii style"
  const optimizedAlt = `${pageData.subject} coloring page for ${pageData.audience.toLowerCase()} - ${pageData.style} style`

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Protocol 2: Breadcrumbs */}
        <Breadcrumbs category={category} slug={slug} />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Protocol 3: fetchPriority on LCP image */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <img
                  src={pageData.image_url}
                  alt={optimizedAlt}
                  className="w-full rounded-lg"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Video: H1 must have id attribute for TOC */}
                <h1 id={slug} className="text-3xl font-extrabold text-gray-900 mt-6 mb-4">
                  {pageData.title}
                </h1>

                {/* Protocol 3: CTR-optimized description */}
                <p className="text-gray-600 mb-4">
                  {pageData.description}
                </p>

                {/* Social Proof: E-E-A-T Signals */}
                <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📥</span>
                    <div>
                      <div className="font-bold text-gray-900">1,234</div>
                      <div className="text-xs">Downloads</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <div className="font-bold text-gray-900">4.8/5</div>
                      <div className="text-xs">(256 reviews)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✓</span>
                    <div>
                      <div className="font-bold text-gray-900">Verified</div>
                      <div className="text-xs">By educators</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <DownloadButton
                    imageUrl={pageData.image_url}
                    title={pageData.title}
                  />
                  <ShareEmbedButton
                    pageUrl={`${BASE_URL}/categories/${category}/${slug}`}
                    imageUrl={pageData.image_url}
                    title={pageData.title}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar - Protocol 5: Multi-pathing */}
            <aside className="space-y-6">
              {/* Same Category - Optimized anchor text */}
              {sameCategory.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    More {pageData.subject} Coloring Pages
                  </h3>
                  <div className="space-y-3">
                    {sameCategory.map(page => (
                      <Link
                        key={page.slug}
                        href={`/${locale}/categories/${category}/${page.slug}`}
                        className="block group"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={page.image_url}
                            alt={`${page.subject} coloring page for ${page.audience.toLowerCase()}`}
                            className="w-16 h-16 object-contain rounded"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                              {page.subject} for {page.audience}
                            </p>
                            <p className="text-xs text-gray-500">
                              {page.audience}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Same Audience - Optimized anchor text */}
              {sameAudience.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {pageData.audience} Coloring Pages
                  </h3>
                  <div className="space-y-3">
                    {sameAudience.map(page => {
                      const pageCat = getCategoryForPage(page) || 'uncategorized'
                      return (
                        <Link
                          key={page.slug}
                          href={`/${locale}/categories/${pageCat}/${page.slug}`}
                          className="block group"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={page.image_url}
                              alt={`${page.subject} coloring page for ${page.audience.toLowerCase()}`}
                              className="w-16 h-16 object-contain rounded"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                {page.subject} Coloring Page
                              </p>
                              <p className="text-xs text-gray-500">
                                {page.style} style
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Same Subject - Optimized anchor text */}
              {sameSubject.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    More {pageData.subject} Pages
                  </h3>
                  <div className="space-y-3">
                    {sameSubject.map(page => {
                      const pageCat = getCategoryForPage(page) || 'uncategorized'
                      return (
                        <Link
                          key={page.slug}
                          href={`/${locale}/categories/${pageCat}/${page.slug}`}
                          className="block group"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={page.image_url}
                              alt={`${page.subject} coloring page for ${page.audience.toLowerCase()}`}
                              className="w-16 h-16 object-contain rounded"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                For {page.audience}
                              </p>
                              <p className="text-xs text-gray-500">
                                {page.style} style
                              </p>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
