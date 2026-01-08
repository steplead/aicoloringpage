// Schema.org Structured Data Generator
// Protocol compliance: CollectionPage, ImageObject, FAQPage, BreadcrumbList

export interface SchemaOrganization {
  name: string
  url: string
  logo: string
}

export interface SchemaCollectionPage {
  name: string
  description: string
  numberOfItems: number
  url: string
}

export interface SchemaImageObject {
  name: string
  description: string
  contentUrl: string
  author: string
  keywords?: string[]
}

/**
 * Generate Organization Schema (E-E-A-T signal)
 */
export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Coloring Page',
    url: 'https://ai-coloringpage.com',
    logo: 'https://ai-coloringpage.com/icon.png',
    description: 'Free AI-powered coloring page generator. Create custom printable coloring pages instantly.',
    sameAs: [
      'https://twitter.com/aicoloringpage',
      'https:// pinterest.com/aicoloringpage'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@ai-coloringpage.com'
    }
  }
}

/**
 * Generate CollectionPage Schema for category/tag pages
 */
export function generateCollectionPageSchema(data: SchemaCollectionPage): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.name,
    description: data.description,
    url: data.url,
    numberOfItems: data.numberOfItems,
    about: {
      '@type': 'Thing',
      name: data.name.split(' ')[0] // Extract main keyword
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.numberOfItems,
      itemListElement: Array.from({ length: Math.min(data.numberOfItems, 10) }, (_, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: `${data.name} - Page ${i + 1}`
        }
      }))
    }
  }
}

/**
 * Generate ImageObject Schema for detail pages
 */
export function generateImageObjectSchema(data: SchemaImageObject): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: data.name,
    description: data.description,
    contentUrl: data.contentUrl,
    author: {
      '@type': 'Organization',
      name: data.author
    },
    keywords: data.keywords?.join(', '),
    license: 'https://creativecommons.org/licenses/by/4.0/',
    acquireLicensePage: 'https://ai-coloringpage.com/terms'
  }
}

/**
 * Generate FAQPage Schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }
}

/**
 * Common coloring page FAQs
 */
export const COLORING_PAGE_FAQS = [
  {
    question: 'How do I print a coloring page?',
    answer: 'Click the Download button to save the high-resolution PNG file, then open it on your computer and print using your printer settings. We recommend using cardstock paper for best results with markers.'
  },
  {
    question: 'Are these coloring pages really free?',
    answer: 'Yes! All our coloring pages are 100% free to download and print. No sign-up, no registration, no hidden fees. Just click and download.'
  },
  {
    question: 'Can I use these coloring pages commercially?',
    answer: 'Our coloring pages are free for personal use. For commercial use, please review our Terms of Service or contact us for licensing options.'
  },
  {
    question: 'What paper should I use for coloring?',
    answer: 'For crayons and colored pencils, standard printer paper (20lb) works fine. For markers, we recommend cardstock (65-80lb) to prevent bleeding. Watercolors work best on watercolor paper or mixed media paper.'
  },
  {
    question: 'How do I create my own coloring page?',
    answer: 'Use our AI-powered generator on the home page! Just type what you want (e.g., "cat coloring page for kids"), choose a style, and click Generate. Your custom coloring page will be ready in seconds.'
  }
]

/**
 * Generate complete Schema for detail pages
 */
export function generateDetailPageSchema(params: {
  title: string
  description: string
  imageUrl: string
  url: string
  subject: string
  audience: string
  breadcrumbs: Array<{ name: string; url: string }>
}): object {
  const { title, description, imageUrl, url, subject, audience, breadcrumbs } = params

  return [
    generateImageObjectSchema({
      name: title,
      description,
      contentUrl: imageUrl,
      author: 'AI Coloring Page',
      keywords: [subject, audience, 'coloring page', 'free', 'printable']
    }),
    generateFAQSchema(COLORING_PAGE_FAQS),
    generateBreadcrumbSchema(breadcrumbs)
  ]
}

/**
 * Generate complete Schema for category pages
 */
export function generateCategoryPageSchema(params: {
  name: string
  description: string
  count: number
  url: string
  breadcrumbs: Array<{ name: string; url: string }>
}): object {
  const { name, description, count, url, breadcrumbs } = params

  return [
    generateOrganizationSchema(),
    generateCollectionPageSchema({
      name,
      description,
      numberOfItems: count,
      url
    }),
    generateBreadcrumbSchema(breadcrumbs)
  ]
}
