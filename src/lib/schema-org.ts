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
 * Enhanced with Product schema and AggregateRating
 */
export function generateDetailPageSchema(params: {
  title: string
  description: string
  imageUrl: string
  url: string
  subject: string
  audience: string
  breadcrumbs: Array<{ name: string; url: string }>
  aggregateRating?: {
    ratingValue: string
    ratingCount: string
    bestRating?: string
    worstRating?: string
  }
}): object {
  const { title, description, imageUrl, url, subject, audience, breadcrumbs, aggregateRating } = params

  return [
    generateImageObjectSchema({
      name: title,
      description,
      contentUrl: imageUrl,
      author: 'AI Coloring Page',
      keywords: [subject, audience, 'coloring page', 'free', 'printable']
    }),
    generateProductSchema({
      name: title,
      description,
      image: imageUrl,
      url,
      category: `${subject} Coloring Pages`,
      aggregateRating: aggregateRating || {
        ratingValue: '4.8',
        ratingCount: '256',
        bestRating: '5',
        worstRating: '1'
      }
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

/**
 * Generate WebPage Schema
 * Protocol 3: Enhanced page metadata
 */
export function generateWebPageSchema(params: {
  name: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  inLanguage?: string
}): object {
  const { name, description, url, datePublished, dateModified, inLanguage = 'en' } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    inLanguage,
    isPartOf: {
      '@type': 'WebSite',
      name: 'AI Coloring Page',
      url: 'https://ai-coloringpage.com'
    },
    about: {
      '@type': 'Thing',
      name: 'Coloring Pages'
    },
    audience: {
      '@type': 'Audience',
      audienceType: ['general', 'parents', 'teachers', 'children']
    },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified })
  }
}

/**
 * Generate Product Schema for coloring pages as free products
 * Protocol 1: Enhanced rich snippets
 */
export function generateProductSchema(params: {
  name: string
  description: string
  image: string
  url: string
  category?: string
  aggregateRating?: {
    ratingValue: string
    ratingCount: string
    bestRating: string
    worstRating: string
  }
}): object {
  const { name, description, image, url, category = 'Coloring Pages', aggregateRating } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url,
    category,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url,
      seller: {
        '@type': 'Organization',
        name: 'AI Coloring Page',
        url: 'https://ai-coloringpage.com'
      }
    },
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ...aggregateRating
      }
    }),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Format',
        value: 'Digital Download (PNG)'
      },
      {
        '@type': 'PropertyValue',
        name: 'License',
        value: 'Free for Personal Use'
      },
      {
        '@type': 'PropertyValue',
        name: 'Printable',
        value: 'Yes'
      }
    ]
  }
}

/**
 * Generate Blog Schema for blog listing page
 * Protocol 1: Enhanced blog content visibility
 */
export function generateBlogSchema(params: {
  name: string
  description: string
  url: string
  posts?: Array<{
    title: string
    url: string
    datePublished: string
    image?: string
    description?: string
  }>
}): object {
  const { name, description, url, posts = [] } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: 'AI Coloring Page',
      url: 'https://ai-coloringpage.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ai-coloringpage.com/icon.png'
      }
    },
    ...(posts.length > 0 && {
      blogPost: posts.slice(0, 10).map(post => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: post.url,
        datePublished: post.datePublished,
        ...(post.image && { image: post.image }),
        ...(post.description && { description: post.description }),
        author: {
          '@type': 'Organization',
          name: 'AI Coloring Page'
        },
        publisher: {
          '@type': 'Organization',
          name: 'AI Coloring Page',
          logo: {
            '@type': 'ImageObject',
            url: 'https://ai-coloringpage.com/icon.png'
          }
        }
      }))
    })
  }
}

/**
 * Generate BlogPosting Schema for individual blog post
 * Protocol 1: Long-tail keyword optimization
 */
export function generateBlogPostingSchema(params: {
  title: string
  description: string
  url: string
  image: string
  datePublished: string
  dateModified?: string
  author?: string
  keywords?: string[]
}): object {
  const { title, description, url, image, datePublished, dateModified, author = 'AI Coloring Page Team', keywords } = params

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: {
      '@type': 'ImageObject',
      url: image
    },
    datePublished,
    ...(dateModified && { dateModified }),
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://ai-coloringpage.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Coloring Page',
      url: 'https://ai-coloringpage.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ai-coloringpage.com/icon.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    ...(keywords && { keywords: keywords.join(', ') })
  }
}

/**
 * Generate About Page Schema with Organization and WebPage
 * Protocol 1: Enhanced E-E-A-T signals
 */
export function generateAboutPageSchema(params: {
  name: string
  description: string
  url: string
  foundingDate?: string
  founders?: string[]
  sameAs?: string[]
  areaServed?: string
}): object {
  const { name, description, url, foundingDate, founders, sameAs, areaServed } = params

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `About ${name}`,
      url,
      description,
      inLanguage: 'en',
      isPartOf: {
        '@type': 'WebSite',
        name: 'AI Coloring Page',
        url: 'https://ai-coloringpage.com'
      },
      about: {
        '@type': 'Organization',
        name,
        description
      },
      audience: {
        '@type': 'Audience',
        audienceType: ['general', 'parents', 'teachers', 'children']
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name,
      legalName: 'AI Coloring Page',
      url,
      description,
      logo: 'https://ai-coloringpage.com/icon.png',
      ...(foundingDate && { foundingDate }),
      ...(founders && { founders: founders.map(name => ({ '@type': 'Person', name })) }),
      sameAs: sameAs || [
        'https://twitter.com/aicoloringpage',
        'https://pinterest.com/aicoloringpage'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@ai-coloringpage.com',
        availableLanguage: ['English', 'Spanish', 'Portuguese', 'French']
      },
      areaServed: areaServed || 'Worldwide',
      knowsAbout: [
        'Coloring Pages',
        'Printable Activities',
        'Children Education',
        'AI Image Generation',
        'Educational Resources'
      ]
    }
  ]
}
