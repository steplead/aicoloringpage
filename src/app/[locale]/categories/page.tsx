import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/categories'
import { generateCategoryPageSchema } from '@/lib/schema-org'

export const runtime = 'edge'

export async function generateMetadata() {
  return {
    title: 'All Coloring Page Categories - Free Printable Pages',
    description: 'Browse our complete collection of coloring page categories including animals, characters, holidays, nature, and vehicles. Find the perfect coloring pages for kids and adults.',
    openGraph: {
      title: 'All Coloring Page Categories',
      description: 'Explore 5 main categories of free printable coloring pages',
      type: 'website',
    }
  }
}

export default async function CategoriesHubPage() {
  // Generate Schema.org structured data for Categories Hub
  const schemaData = generateCategoryPageSchema({
    name: 'All Coloring Page Categories',
    description: 'Browse 5 main categories of free printable coloring pages for kids and adults',
    count: Object.keys(CATEGORIES).length,
    url: 'https://ai-coloringpage.com/categories',
    breadcrumbs: [
      { name: 'Home', url: 'https://ai-coloringpage.com/' },
      { name: 'Categories', url: 'https://ai-coloringpage.com/categories' }
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
        {/* Protocol 2: Categories Hub Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Video: H1 must have id attribute */}
          <h1 id="categories-hub" className="text-4xl font-extrabold text-gray-900 mb-4">
            All Coloring Page Categories
          </h1>
          <p className="text-lg text-gray-600">
            Browse our complete collection of coloring page categories. Find the perfect printable pages for kids and adults.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {Object.keys(CATEGORIES).length} categories available
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(CATEGORIES).map(([key, category]) => {
            // Get a sample image from this category
            const sampleSubject = category.subjects[0]?.toLowerCase() || 'animal'
            const sampleImage = `https://pub-c1b5b4701d594026a4b8ca3179615791.r2.dev/${sampleSubject}-coloring-page-for-kids.png`

            return (
              <Card key={key} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/categories/${key}`} prefetch={false}>
                  <div className="aspect-video bg-white p-4">
                    <Image
                      src={sampleImage}
                      alt={`${category.name} coloring pages category - free printable ${category.name.toLowerCase()} coloring pages`}
                      width={400}
                      height={300}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {category.name} Coloring Pages
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Free printable {category.name.toLowerCase()} coloring pages for kids and adults
                    </p>
                    <div className="flex items-center text-purple-600 font-semibold">
                      <span>Browse Collection</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>

        {/* SEO Content Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 id="why-choose-our-coloring-pages" className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Our Coloring Pages?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">100% Free & Printable</h3>
                <p className="text-gray-600">All coloring pages are completely free to download and print. No signup required.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Designs</h3>
                <p className="text-gray-600">Unique, high-quality coloring pages generated by advanced AI technology.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">For All Ages</h3>
                <p className="text-gray-600">From simple preschool pages to intricate adult coloring designs.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Regular Updates</h3>
                <p className="text-gray-600">New coloring pages added weekly across all categories.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
