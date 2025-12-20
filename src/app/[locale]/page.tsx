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
