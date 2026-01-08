// Protocol 2: Category & Tag System
// This library handles page classification and generates category/tag structures

export interface PageData {
  slug: string
  title: string
  description: string
  image_url: string
  prompt: string
  style: string
  subject: string
  audience: string
  created_at: string
  pinterest_posted?: boolean
}

// Protocol 2: 5+ Categories (Classified Listing Strategy)
export const CATEGORIES = {
  animals: {
    name: 'Animals',
    description: 'Free printable animal coloring pages including cats, dogs, elephants, and more',
    subjects: ['Cat', 'Dog', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Dinosaur', 'Horse', 'Bird', 'Fish']
  },
  characters: {
    name: 'Characters',
    description: 'Popular character coloring pages from movies, cartoons, and comics',
    subjects: ['Princess', 'Superhero', 'Pirate', 'Mermaid', 'Knight', 'Fairy', 'Wizard', 'Dragon']
  },
  holidays: {
    name: 'Holidays',
    description: 'Holiday-themed coloring pages for Christmas, Halloween, Easter, and more',
    subjects: ['Christmas', 'Halloween', 'Easter', 'Thanksgiving', 'Valentine', 'St. Patrick']
  },
  nature: {
    name: 'Nature',
    description: 'Beautiful nature coloring pages including flowers, trees, landscapes, and weather',
    subjects: ['Flower', 'Tree', 'Mountain', 'Ocean', 'Sun', 'Moon', 'Rainbow', 'Cloud']
  },
  vehicles: {
    name: 'Vehicles',
    description: 'Vehicle coloring pages featuring cars, trucks, planes, trains, and boats',
    subjects: ['Car', 'Truck', 'Airplane', 'Train', 'Boat', 'Rocket', 'Spaceship', 'Bicycle']
  }
}

// Protocol 2: 20+ Tags (Multi-pathing Strategy)
export const TAGS = {
  // Difficulty-based tags
  easy: { name: 'Easy', description: 'Simple coloring pages perfect for beginners' },
  difficult: { name: 'Difficult', description: 'Challenging designs for experienced colorists' },

  // Audience-based tags
  preschool: { name: 'Preschool', description: 'For children ages 3-5' },
  kindergarten: { name: 'Kindergarten', description: 'For children ages 5-6' },
  adult: { name: 'Adult', description: 'Intricate designs for adults' },
  teen: { name: 'Teen', description: 'Designs suitable for teenagers' },

  // Style-based tags
  free: { name: 'Free', description: 'Completely free to download and print' },
  printable: { name: 'Printable', description: 'High-quality print-ready pages' },
  educational: { name: 'Educational', description: 'Learn while coloring' },
  fun: { name: 'Fun', description: 'Entertaining designs for everyone' },

  // Theme-based tags
  fantasy: { name: 'Fantasy', description: 'Magical and mythical creatures' },
  realistic: { name: 'Realistic', description: 'Lifelike and detailed designs' },
  cartoon: { name: 'Cartoon', description: 'Fun cartoon-style pages' },
  seasonal: { name: 'Seasonal', description: 'Season and holiday themed' },

  // Feature-based tags
  beginner: { name: 'Beginner', description: 'Perfect for coloring beginners' },
  intermediate: { name: 'Intermediate', description: 'For those with some experience' },
  advanced: { name: 'Advanced', description: 'Complex designs for experts' },
  detailed: { name: 'Detailed', description: 'Intricate and detailed artwork' },

  // Content-based tags
  animals: { name: 'Animals', description: 'All kinds of animals and wildlife' },
  characters: { name: 'Characters', description: 'Favorite characters and heroes' }
}

/**
 * Get category for a page based on subject
 */
export function getCategoryForPage(page: PageData): string | null {
  for (const [key, category] of Object.entries(CATEGORIES)) {
    if (category.subjects.includes(page.subject)) {
      return key
    }
  }
  return null
}

/**
 * Get tags for a page based on audience and subject
 */
export function getTagsForPage(page: PageData): string[] {
  const tags: string[] = []

  // Add audience-based tags
  if (page.audience === 'Kids' || page.audience === 'Toddlers' || page.audience === 'Preschoolers') {
    tags.push('easy', 'preschool', 'beginner')
  } else if (page.audience === 'Adults') {
    tags.push('adult', 'detailed', 'advanced')
  } else if (page.audience === 'Teens') {
    tags.push('teen', 'intermediate')
  }

  // Add universal tags
  tags.push('free', 'printable', 'fun')

  // Add category tag
  const category = getCategoryForPage(page)
  if (category) {
    tags.push(category)
  }

  // Remove duplicates
  return Array.from(new Set(tags))
}

/**
 * Get all pages for a specific category
 */
export function getPagesByCategory(pages: PageData[], category: string): PageData[] {
  const categoryData = CATEGORIES[category as keyof typeof CATEGORIES]
  if (!categoryData) return []

  return pages.filter(page => categoryData.subjects.includes(page.subject))
}

/**
 * Get all pages for a specific tag
 */
export function getPagesByTag(pages: PageData[], tag: string): PageData[] {
  return pages.filter(page => {
    const tags = getTagsForPage(page)
    return tags.includes(tag)
  })
}

/**
 * Get pages starting with a specific letter (for A-Z index)
 */
export function getPagesByLetter(pages: PageData[], letter: string): PageData[] {
  return pages.filter(page => {
    const firstChar = page.slug.charAt(0).toLowerCase()
    return firstChar === letter.toLowerCase()
  })
}
