import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import {
  getPopularThisWeek,
  getTrendingPages,
  getNewPages
} from '@/lib/link-rotation'

/**
 * Protocol 5: "Popular This Week" section
 * Video: "Popular searches" + "炒豆子" - rotating content
 */
export async function PopularThisWeek({ locale }: { locale: string }) {
  const popularPages = await getPopularThisWeek(6)

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🔥 Popular This Week
        </h2>
        <Link
          href="/directory"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {popularPages.map(page => {
          const category = page.subject.toLowerCase()
          return (
            <Card key={page.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/${locale}/categories/${category}/${page.slug}`} prefetch={false}>
                <div className="aspect-square bg-white p-2">
                  <Image
                    src={page.image_url}
                    alt={page.title}
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
                </div>
              </Link>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Updated every 24 hours • Protocol 5: Dynamic Rotation
      </p>
    </section>
  )
}

/**
 * Protocol 5: "Trending" section
 * Real-time trending pages (simulated for now)
 */
export async function TrendingPages({ locale }: { locale: string }) {
  const trendingPages = await getTrendingPages(6)

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          📈 Trending Now
        </h2>
        <Link
          href="/directory"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {trendingPages.map(page => {
          const category = page.subject.toLowerCase()
          return (
            <Card key={page.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/${locale}/categories/${category}/${page.slug}`} prefetch={false}>
                <div className="aspect-square bg-white p-2">
                  <Image
                    src={page.image_url}
                    alt={page.title}
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
                </div>
              </Link>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Video: "New pages get priority temporarily"
 * Give pages less than 30 days old a boost
 */
export async function NewPagesSection({ locale }: { locale: string }) {
  const newPages = await getNewPages(6)

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          ✨ New This Month
        </h2>
        <Link
          href="/directory"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {newPages.map(page => {
          const category = page.subject.toLowerCase()
          return (
            <Card key={page.slug} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/${locale}/categories/${category}/${page.slug}`} prefetch={false}>
                <div className="aspect-square bg-white p-2 relative">
                  <Image
                    src={page.image_url}
                    alt={page.title}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    NEW
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {page.title}
                  </h3>
                </div>
              </Link>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
