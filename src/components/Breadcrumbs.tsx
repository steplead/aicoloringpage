import { Link } from '@/i18n/routing'
import { CATEGORIES } from '@/lib/categories'

interface BreadcrumbsProps {
  category: string
  slug: string
}

export function Breadcrumbs({ category, slug }: BreadcrumbsProps) {
  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]

  // Format slug for display
  const formatSlug = (slug: string) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Categories', href: '/categories' },
    ...(categoryData ? [{ name: categoryData.name, href: `/categories/${category}` }] : []),
    { name: formatSlug(slug), href: `#${slug}` }
  ]

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {index < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href as any}
                className="text-gray-600 hover:text-purple-700 transition-colors"
              >
                {crumb.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {crumb.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
