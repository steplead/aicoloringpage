import { Header } from '@/components/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import statisticsData from '@/data/coloring-statistics.json'
import { BarChart3, TrendingUp, Users, BookOpen, Quote, Link2 } from 'lucide-react'
import { Link } from '@/i18n/routing'

const BASE_URL = 'https://ai-coloringpage.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return {
        title: 'Coloring Page Statistics & Research 2026 | Data-Driven Insights',
        description: 'Comprehensive statistics and research on the benefits of coloring for child development, industry trends, and educational insights. Compiled from 50+ scientific studies.',
        keywords: ['coloring statistics', 'coloring benefits research', 'child development data', 'coloring page trends', 'educational coloring research'],
        alternates: {
            canonical: `${BASE_URL}/${locale}/statistics`,
            languages: {
                'en': `${BASE_URL}/en/statistics`,
                'es': `${BASE_URL}/es/statistics`,
                'pt': `${BASE_URL}/pt/statistics`,
                'fr': `${BASE_URL}/fr/statistics`,
                'x-default': `${BASE_URL}/en/statistics`,
            },
        },
        openGraph: {
            title: 'Coloring Page Statistics & Research 2026',
            description: 'Data-backed insights on coloring benefits, industry trends, and child development research.',
            images: ['/og-statistics.jpg'],
        },
    };
}

export default async function StatisticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Structured Data: Dataset (for rich results)
    const datasetJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Coloring Benefits for Child Development Research 2026',
        description: 'Comprehensive data-backed research on how coloring activities improve child development',
        provider: {
            '@type': 'Organization',
            name: 'AI Coloring Page',
            url: BASE_URL
        },
        datePublished: '2025-01-01',
        dateModified: '2026-01-01',
        citation: statisticsData[0].sources
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
            />
            <Header />

            <main className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Badge className="mb-4" variant="secondary">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Data-Driven Insights
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Coloring Page Statistics & Research
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Comprehensive research and industry insights compiled from <strong>50+ scientific studies</strong> and market research reports.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                        Last updated: {statisticsData[0].lastUpdated}
                    </p>
                </div>

                {statisticsData.map((report: any) => (
                    <div key={report.id} className="max-w-6xl mx-auto mb-20">
                        {/* Report Header */}
                        <Card className="p-8 mb-12 border-t-4 border-t-blue-500">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                {report.title}
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {report.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    {report.statistics.length} Statistics
                                </span>
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {report.sources.length} Sources
                                </span>
                            </div>
                        </Card>

                        {/* Key Statistics Grid */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                Key Statistics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {report.statistics.map((stat: any, idx: number) => (
                                    <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge variant="outline">{stat.category}</Badge>
                                            <span className="text-3xl font-extrabold text-blue-600">
                                                {stat.statistic}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 font-medium mb-2">
                                            {stat.description}
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Link2 className="w-3 h-3" />
                                            {stat.source}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-sm text-gray-600">
                                                <strong>Key Benefit:</strong> {stat.relatedBenefit}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Charts Section */}
                        {report.charts && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    Visual Data
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {report.charts.map((chart: any, idx: number) => (
                                        <Card key={idx} className="p-6">
                                            <h4 className="font-bold text-gray-800 mb-4">
                                                {chart.title}
                                            </h4>
                                            <div className="space-y-3">
                                                {Object.entries(chart.data).map(([key, value]) => (
                                                    <div key={key}>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-700">{key}</span>
                                                            <span className="font-bold text-blue-600">
                                                                {typeof value === 'number' ? value : value}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                                            <div
                                                                className="bg-blue-600 h-3 rounded-full transition-all"
                                                                style={{
                                                                    width: `${Math.min(100, (typeof value === 'number' ? value : 0) / 2)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4 text-center">
                                                {chart.unit}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expert Quotes */}
                        {report.quotes && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Quote className="w-6 h-6 text-purple-600" />
                                    Expert Opinions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {report.quotes.map((quote: any, idx: number) => (
                                        <Card key={idx} className="p-6 bg-purple-50 border-purple-100">
                                            <p className="text-gray-700 italic mb-4">
                                                "{quote.text}"
                                            </p>
                                            <div className="border-t border-purple-200 pt-4">
                                                <p className="font-bold text-gray-900 text-sm">
                                                    {quote.author}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {quote.title}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Age Groups (if available) */}
                        {report.ageGroups && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    Recommendations by Age Group
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {report.ageGroups.map((group: any, idx: number) => (
                                        <Card key={idx} className="p-5">
                                            <h4 className="font-bold text-gray-900 mb-2">
                                                {group.age}
                                            </h4>
                                            <p className="text-sm text-gray-700 mb-3">
                                                {group.benefits}
                                            </p>
                                            <div className="bg-blue-50 rounded-lg p-3">
                                                <p className="text-xs text-blue-900 font-medium">
                                                    {group.recommendedTime}
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Searches (if available) */}
                        {report.topSearches && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                    Most Popular Coloring Page Searches
                                </h3>
                                <Card className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {report.topSearches.map((search: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <span className="text-lg font-bold text-blue-600 w-8">
                                                    #{idx + 1}
                                                </span>
                                                <span className="text-gray-700">{search}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Methodology */}
                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Methodology & Sources
                            </h3>
                            <Card className="p-6 bg-blue-50 border-blue-100">
                                <p className="text-gray-700 mb-4">
                                    {report.methodology}
                                </p>
                                <div className="border-t border-blue-200 pt-4">
                                    <p className="font-semibold text-gray-900 mb-3">Sources:</p>
                                    <ul className="space-y-2">
                                        {report.sources.map((source: string, idx: number) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                <span className="text-blue-600">•</span>
                                                {source}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    </div>
                ))}

                {/* CTA Section */}
                <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">
                        Use This Data in Your Content
                    </h3>
                    <p className="mb-6 text-blue-50">
                        Educators, bloggers, and researchers are welcome to reference these statistics with proper citation.
                        Please link back to this page as your source.
                    </p>
                    <p className="text-sm text-blue-100">
                        Citation: AI Coloring Page. (2026). <em>Coloring Page Statistics & Research Report</em>. Retrieved from {BASE_URL}/statistics
                    </p>
                </Card>

                {/* Related Resources */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8">
                        Explore Coloring Pages by Category
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/directory">
                            <Badge variant="outline" className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                                View All Categories
                            </Badge>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">
                        Data compiled for educational purposes. Statistics are updated regularly as new research becomes available.
                    </p>
                </div>
            </footer>
        </div>
    );
}
