import { getTranslations } from 'next-intl/server';
import { HomeClient } from '@/components/HomeClient';

export const runtime = 'edge';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      canonical: 'https://ai-coloringpage.com',
      languages: {
        'en': 'https://ai-coloringpage.com/en',
        'es': 'https://ai-coloringpage.com/es',
        'pt': 'https://ai-coloringpage.com/pt',
        'fr': 'https://ai-coloringpage.com/fr',
        'x-default': 'https://ai-coloringpage.com/en',
      }
    },
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      url: `https://ai-coloringpage.com/${locale}`,
      siteName: 'AI Coloring Page',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
      locale: locale,
      type: 'website',
    },
  };
}

export default async function Home() {
  // Enhanced Schema.org for homepage
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Coloring Page',
    alternateName: 'AI Coloring Page Generator',
    url: 'https://ai-coloringpage.com',
    description: 'Free AI-powered coloring page generator. Create custom printable coloring pages for kids and adults instantly.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ai-coloringpage.com/directory?q={search_term}',
      'query-input': 'required name=search_term'
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Coloring Page',
      url: 'https://ai-coloringpage.com',
      logo: 'https://ai-coloringpage.com/icon.png'
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Coloring Page',
    url: 'https://ai-coloringpage.com',
    logo: 'https://ai-coloringpage.com/icon.png',
    description: 'Free AI-powered coloring page generator. Create custom printable coloring pages for kids and adults instantly.',
    sameAs: [
      'https://twitter.com/aicoloringpage',
      'https://pinterest.com/aicoloringpage'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@ai-coloringpage.com'
    }
  }

  const softwareSchema = {
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
      bestRating: '5',
      worstRating: '1'
    },
    creator: {
      '@type': 'Organization',
      name: 'AI Coloring Page'
    }
  }

  const jsonLd = [webSiteSchema, organizationSchema, softwareSchema]

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
