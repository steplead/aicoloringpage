import { Link } from '@/i18n/routing'
import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { TAGS } from '@/lib/categories'
import { generateCategoryPageSchema } from '@/lib/schema-org'

export const runtime = 'edge'

export async function generateMetadata() {
  return {
    title: 'All Coloring Page Tags - Browse by Difficulty, Age & Style',
    description: 'Browse coloring pages by tags including easy, difficult, preschool, adult, holiday, seasonal and more. Find the perfect coloring pages for any skill level or occasion.',
    openGraph: {
      title: 'All Coloring Page Tags',
      description: 'Explore 20+ tags to find coloring pages by difficulty, age, and style',
      type: 'website',
    }
  }
}

export default async function TagsHubPage() {
  // Generate Schema.org structured data for Tags Hub
  const schemaData = generateCategoryPageSchema({
    name: 'All Coloring Page Tags',
    description: `Browse ${Object.keys(TAGS).length} tags to find coloring pages by difficulty, age, and style`,
    count: Object.keys(TAGS).length,
    url: 'https://ai-coloringpage.com/tags',
    breadcrumbs: [
      { name: 'Home', url: 'https://ai-coloringpage.com/' },
      { name: 'Tags', url: 'https://ai-coloringpage.com/tags' }
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
        {/* Protocol 2: Tags Hub Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Video: H1 must have id attribute */}
          <h1 id="tags-hub" className="text-4xl font-extrabold text-gray-900 mb-4">
            All Coloring Page Tags
          </h1>
          <p className="text-lg text-gray-600">
            Browse coloring pages by difficulty level, age group, style, and themes. Find the perfect pages for any skill level or occasion.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {Object.keys(TAGS).length} tags available
          </p>
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {Object.entries(TAGS).map(([key, tag]) => {
            // Determine icon based on tag
            const getIcon = (tagKey: string) => {
              const icons: Record<string, string> = {
                easy: '⭐',
                difficult: '🔥',
                preschool: '👶',
                adult: '🎨',
                teen: '🌟',
                toddler: '🍼',
                simple: '📝',
                intricate: '✨',
                beginner: '🌈',
                advanced: '🏆',
                holiday: '🎉',
                seasonal: '🍂',
                educational: '📚',
                printable: '🖨️',
                cartoon: '🎭',
                realistic: '📸',
                cute: '💝',
                cool: '😎',
                classic: '👑',
                modern: '🚀'
              }
              return icons[tagKey] || '🎨'
            }

            return (
              <Card key={key} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link href={`/tags/${key}`} prefetch={false}>
                  <div className="p-6 h-full flex flex-col">
                    <div className="text-4xl mb-3">{getIcon(key)}</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {tag.name} Coloring Pages
                    </h2>
                    <p className="text-gray-600 text-sm flex-grow">
                      {tag.description}
                    </p>
                    <div className="flex items-center text-purple-600 font-semibold text-sm mt-3">
                      <span>Explore</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>

        {/* Tag Categories Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 id="tag-categories" className="text-2xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Difficulty Level */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  Difficulty Level
                </h3>
                <div className="space-y-2">
                  <Link href="/tags/easy" className="block text-purple-600 hover:text-purple-800">Easy Coloring Pages</Link>
                  <Link href="/tags/difficult" className="block text-purple-600 hover:text-purple-800">Difficult Coloring Pages</Link>
                  <Link href="/tags/simple" className="block text-purple-600 hover:text-purple-800">Simple Coloring Pages</Link>
                  <Link href="/tags/intricate" className="block text-purple-600 hover:text-purple-800">Intricate Coloring Pages</Link>
                </div>
              </div>

              {/* Age Group */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">👥</span>
                  Age Group
                </h3>
                <div className="space-y-2">
                  <Link href="/tags/preschool" className="block text-purple-600 hover:text-purple-800">Preschool Coloring Pages</Link>
                  <Link href="/tags/toddler" className="block text-purple-600 hover:text-purple-800">Toddler Coloring Pages</Link>
                  <Link href="/tags/teen" className="block text-purple-600 hover:text-purple-800">Teen Coloring Pages</Link>
                  <Link href="/tags/adult" className="block text-purple-600 hover:text-purple-800">Adult Coloring Pages</Link>
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Skill Level
                </h3>
                <div className="space-y-2">
                  <Link href="/tags/beginner" className="block text-purple-600 hover:text-purple-800">Beginner Coloring Pages</Link>
                  <Link href="/tags/advanced" className="block text-purple-600 hover:text-purple-800">Advanced Coloring Pages</Link>
                </div>
              </div>

              {/* Style & Theme */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🎨</span>
                  Style & Theme
                </h3>
                <div className="space-y-2">
                  <Link href="/tags/holiday" className="block text-purple-600 hover:text-purple-800">Holiday Coloring Pages</Link>
                  <Link href="/tags/seasonal" className="block text-purple-600 hover:text-purple-800">Seasonal Coloring Pages</Link>
                  <Link href="/tags/cartoon" className="block text-purple-600 hover:text-purple-800">Cartoon Style</Link>
                  <Link href="/tags/realistic" className="block text-purple-600 hover:text-purple-800">Realistic Style</Link>
                  <Link href="/tags/cute" className="block text-purple-600 hover:text-purple-800">Cute Style</Link>
                  <Link href="/tags/cool" className="block text-purple-600 hover:text-purple-800">Cool Style</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 id="how-to-choose-coloring-pages" className="text-2xl font-bold text-gray-900 mb-4">
              How to Choose the Right Coloring Pages
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 mb-4">
                Finding the perfect coloring page depends on the skill level, age, and interests of the person who will be coloring. Our tag system makes it easy to filter through thousands of coloring pages to find exactly what you need.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">For Beginners and Young Children</h3>
              <p className="text-gray-600 mb-4">
                Start with <Link href="/tags/easy" className="text-purple-600 hover:text-purple-800 font-medium">easy</Link> and <Link href="/tags/simple" className="text-purple-600 hover:text-purple-800 font-medium">simple</Link> coloring pages. These feature larger areas to color and fewer details, making them perfect for <Link href="/tags/toddler" className="text-purple-600 hover:text-purple-800 font-medium">toddlers</Link> and <Link href="/tags/preschool" className="text-purple-600 hover:text-purple-800 font-medium">preschool</Link> children who are just developing their fine motor skills.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">For Advanced Colorists</h3>
              <p className="text-gray-600 mb-4">
                Experienced colorists and adults looking for a challenge should explore our <Link href="/tags/difficult" className="text-purple-600 hover:text-purple-800 font-medium">difficult</Link> and <Link href="/tags/intricate" className="text-purple-600 hover:text-purple-800 font-medium">intricate</Link> collections. These pages feature complex patterns, fine details, and require more patience and precision.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Seasonal and Holiday Pages</h3>
              <p className="text-gray-600">
                Our <Link href="/tags/holiday" className="text-purple-600 hover:text-purple-800 font-medium">holiday</Link> and <Link href="/tags/seasonal" className="text-purple-600 hover:text-purple-800 font-medium">seasonal</Link> collections are perfect for special occasions throughout the year. Whether it's Christmas, Halloween, Easter, or any other holiday, you'll find themed coloring pages to celebrate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
