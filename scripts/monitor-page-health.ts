/**
 * Page Health Monitoring System
 *
 * According to Protocol 5 (Ecosystem Metabolism):
 * "If a page has 0 Traffic and 0 Impressions for >6 Months:
 *  - 301 Redirect to relevant parent category (if has backlinks)
 *  - 410 Gone if serves no purpose
 *  - Noindex to save crawl budget"
 *
 * This script identifies "dead pages" that need pruning.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface PageHealth {
    slug: string
    title: string
    subject: string
    audience: string
    created_at: string
    ageInMonths: number
    hasImage: boolean
    hasBacklinks: boolean
    status: 'healthy' | 'review' | 'prune'
    recommendation: string
}

/**
 * Calculate page age in months
 */
function calculatePageAge(createdAt: string): number {
    const created = new Date(createdAt)
    const now = new Date()
    const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 +
                      (now.getMonth() - created.getMonth())
    return monthsDiff
}

/**
 * Determine page health status
 */
function determinePageHealth(page: any, ageInMonths: number): PageHealth['status'] {
    // If page has placeholder image, mark for review
    if (!page.image_url || page.image_url.includes('placeholder')) {
        return 'review'
    }

    // If page is >6 months old, needs review
    if (ageInMonths > 6) {
        return 'prune'
    }

    return 'healthy'
}

/**
 * Generate recommendation for page
 */
function generateRecommendation(status: PageHealth['status'], page: any): string {
    switch (status) {
        case 'healthy':
            return 'Keep. Page is active and generating value.'
        case 'review':
            return 'Review: Missing or placeholder image detected. Update with generated image.'
        case 'prune':
            return `Action Required: Page is ${calculatePageAge(page.created_at)} months old.
            1. Check Google Search Console for impressions/clicks
            2. If 0 impressions + 0 clicks: Consider 410 or noindex
            3. If has backlinks: 301 to relevant category page
            4. Otherwise: Delete to save crawl budget`
        default:
            return 'Unknown status'
    }
}

/**
 * Analyze page health
 */
function analyzePageHealth() {
    const seoPagesPath = path.join(__dirname, '../src/data/seo-pages.json')
    const seoPages = JSON.parse(fs.readFileSync(seoPagesPath, 'utf-8'))

    console.log('🔍 Analyzing page health...\n')
    console.log(`📊 Total pages: ${seoPages.length}\n`)

    const healthReport: PageHealth[] = []
    const stats = {
        healthy: 0,
        review: 0,
        prune: 0,
        total: seoPages.length
    }

    for (const page of seoPages) {
        const ageInMonths = calculatePageAge(page.created_at)
        const hasImage = page.image_url && !page.image_url.includes('placeholder')
        const status = determinePageHealth(page, ageInMonths)

        stats[status]++

        healthReport.push({
            slug: page.slug,
            title: page.title,
            subject: page.subject,
            audience: page.audience,
            created_at: page.created_at,
            ageInMonths,
            hasImage,
            hasBacklinks: false, // Would need Ahrefs/Moz API
            status,
            recommendation: generateRecommendation(status, page)
        })
    }

    // Generate report
    console.log('📈 Health Summary:')
    console.log(`   ✅ Healthy: ${stats.healthy} (${((stats.healthy / stats.total) * 100).toFixed(1)}%)`)
    console.log(`   ⚠️  Review: ${stats.review} (${((stats.review / stats.total) * 100).toFixed(1)}%)`)
    console.log(`   ❌ Prune:  ${stats.prune} (${((stats.prune / stats.total) * 100).toFixed(1)}%)`)
    console.log('')

    // Identify pages needing action
    const needsAction = healthReport.filter(p => p.status !== 'healthy')

    if (needsAction.length > 0) {
        console.log(`🚨 ${needsAction.length} pages need attention:\n`)

        // Group by subject for easier analysis
        const bySubject = needsAction.reduce((acc, page) => {
            if (!acc[page.subject]) {
                acc[page.subject] = []
            }
            acc[page.subject].push(page)
            return acc
        }, {} as Record<string, PageHealth[]>)

        for (const [subject, pages] of Object.entries(bySubject)) {
            console.log(`📌 ${subject} (${pages.length} pages):`)
            pages.slice(0, 3).forEach(page => {
                console.log(`   - ${page.slug}`)
                console.log(`     Status: ${page.status.toUpperCase()}`)
                console.log(`     Age: ${page.ageInMonths} months`)
                console.log(`     Image: ${page.hasImage ? '✅' : '❌'}`)
            })
            if (pages.length > 3) {
                console.log(`   ... and ${pages.length - 3} more`)
            }
            console.log('')
        }
    }

    // Save detailed report
    const reportPath = path.join(__dirname, '../page-health-report.json')
    fs.writeFileSync(reportPath, JSON.stringify({
        generatedAt: new Date().toISOString(),
        summary: stats,
        pages: healthReport
    }, null, 2))

    console.log(`💾 Detailed report saved to: ${reportPath}`)
    console.log('\n✅ Page health analysis complete!')

    // Next steps
    console.log('\n📋 Next Steps:')
    console.log('1. Review page-health-report.json')
    console.log('2. For pages marked "prune":')
    console.log('   - Check Google Search Console for actual traffic data')
    console.log('   - If 0 impressions/6 months: Consider deletion or noindex')
    console.log('   - If has backlinks: 301 redirect to category page')
    console.log('3. For pages marked "review":')
    console.log('   - Update placeholder images with generated images')
    console.log('   - Check for broken links or missing metadata')
    console.log('\n💡 To integrate with Google Search Console API:')
    console.log('   See scripts/gsc-integration-example.ts (not implemented)')
}

// Run the analysis
analyzePageHealth()
