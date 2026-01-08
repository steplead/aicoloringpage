// Protocol 5: "Frying Beans" - Dynamic Link Rotation Strategy
// Video: "换一换，不停的换一换" - Keep changing links to help Google crawl all pages

import seoPages from '@/data/seo-pages.json'
import { getCategoryForPage, getTagsForPage, type PageData } from './categories'

const ROTATION_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000 // 1 week

/**
 * Get rotation cycle based on current time
 * This creates a new cycle every 24 hours
 */
function getRotationCycle(): number {
  return Math.floor(Date.now() / ROTATION_INTERVAL)
}

/**
 * Get week-based cycle for "Popular this Week"
 */
function getWeekCycle(): number {
  return Math.floor(Date.now() / WEEK_IN_MS)
}

/**
 * Get seeded random number for consistent rotation within a cycle
 */
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000
  return x - Math.floor(x)
}

/**
 * Protocol 5: Get rotated related pages based on time-based cycle
 * "Dynamic Rotation: On high-authority pages, rotate 'Recommended' links"
 */
export async function getRotatedRelatedPages(
  currentSlug: string,
  count: number = 4
): Promise<PageData[]> {
  const cycle = getRotationCycle()
  const seed = cycle + currentSlug.length // Deterministic seed

  const otherPages = seoPages.filter(page => page.slug !== currentSlug)

  // Shuffle based on cycle seed (deterministic for 24h period)
  const shuffled = otherPages
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Protocol 5: Get pages from same category (rotated weekly)
 */
export async function getRotatedSameCategory(
  currentSlug: string,
  count: number = 4
): Promise<PageData[]> {
  const currentPage = seoPages.find(p => p.slug === currentSlug)
  if (!currentPage) return []

  const category = getCategoryForPage(currentPage)
  if (!category) return []

  const sameCategory = seoPages.filter(page => {
    return page.slug !== currentSlug && getCategoryForPage(page) === category
  })

  const weekCycle = getWeekCycle()
  const seed = weekCycle + currentSlug.length

  const shuffled = sameCategory
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Protocol 5: Get pages with same tags (rotated weekly)
 */
export async function getRotatedSameTags(
  currentSlug: string,
  count: number = 4
): Promise<PageData[]> {
  const currentPage = seoPages.find(p => p.slug === currentSlug)
  if (!currentPage) return []

  const currentTags = getTagsForPage(currentPage)

  const sameTags = seoPages.filter(page => {
    if (page.slug === currentSlug) return false
    const tags = getTagsForPage(page)
    const intersection = tags.filter(t => currentTags.includes(t))
    return intersection.length >= 2 // At least 2 common tags
  })

  const weekCycle = getWeekCycle()
  const seed = weekCycle + currentSlug.length + 1

  const shuffled = sameTags
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Protocol 5: Get pages starting with same letter (A-Z rotation)
 */
export async function getRotatedSameLetter(
  currentSlug: string,
  count: number = 4
): Promise<PageData[]> {
  const currentPage = seoPages.find(p => p.slug === currentSlug)
  if (!currentPage) return []

  const firstLetter = currentPage.slug.charAt(0).toLowerCase()

  const sameLetter = seoPages.filter(page => {
    return page.slug !== currentSlug && page.slug.charAt(0).toLowerCase() === firstLetter
  })

  const weekCycle = getWeekCycle()
  const seed = weekCycle + firstLetter.charCodeAt(0)

  const shuffled = sameLetter
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Protocol 5: "Popular This Week" simulation
 * In production, this would query analytics for actual popular pages
 * For now, we simulate by rotating through pages weekly
 */
export async function getPopularThisWeek(count: number = 10): Promise<PageData[]> {
  const weekCycle = getWeekCycle()
  const seed = weekCycle * 999

  const shuffled = seoPages
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Protocol 5: "Trending" pages (simulated - would be real-time in production)
 */
export async function getTrendingPages(count: number = 10): Promise<PageData[]> {
  const dayCycle = getRotationCycle()
  const seed = dayCycle * 777

  const shuffled = seoPages
    .map((page, index) => ({
      page,
      sortKey: seededRandom(seed, index)
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(item => item.page)
    .slice(0, count)

  return shuffled
}

/**
 * Video: "New pages get priority temporarily"
 * Give pages less than 30 days old a boost in rotation
 */
export async function getNewPages(count: number = 5): Promise<PageData[]> {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)

  const newPages = seoPages.filter(page => {
    const createdAt = new Date(page.created_at).getTime()
    return createdAt > thirtyDaysAgo
  })

  // Return newest first
  return newPages
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateB - dateA
    })
    .slice(0, count)
}
