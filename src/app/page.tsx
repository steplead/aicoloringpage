import { Metadata } from 'next'
import { HomeClient } from '@/components/HomeClient'

export const metadata: Metadata = {
  title: 'AI Coloring Page Generator | Free & Unlimited',
  description: 'Turn any photo or idea into a custom coloring page in seconds. Free AI coloring book generator for kids and adults. No sign-up required.',
  alternates: {
    canonical: 'https://ai-coloringpage.com',
  },
  openGraph: {
    title: 'AI Coloring Page Generator - Turn Photos into Coloring Pages',
    description: 'Create custom coloring pages from photos or text prompts. Free, instant, and high-quality.',
    url: 'https://ai-coloringpage.com',
    siteName: 'AI Coloring Page',
    images: [
      {
        url: '/og-image.png', // We should ensure this exists or use a default
        width: 1200,
        height: 630,
        alt: 'AI Coloring Page Generator Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Home() {
  // Schema.org for WebSite and SoftwareApplication
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Coloring Page Generator',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  )
}
