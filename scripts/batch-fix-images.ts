/**
 * Batch Image Generation & Upload Script
 *
 * Fixes missing/placeholder images for SEO pages.
 * Processes in batches of 10 to avoid token limits.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const BATCH_SIZE = 10
const SEO_PAGES_PATH = path.join(__dirname, '../src/data/seo-pages.json')
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
    console.error('❌ Missing environment variables:')
    if (!SUPABASE_URL) console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    if (!SUPABASE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    if (!GEMINI_API_KEY) console.error('   - GOOGLE_GENERATIVE_AI_API_KEY')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface SEOPage {
    slug: string
    title: string
    prompt: string
    style: string
    subject: string
    audience: string
    image_url: string
    created_at: string
}

/**
 * Generate image using Gemini API
 */
async function generateImage(prompt: string): Promise<Buffer | null> {
    const modelName = 'gemini-2.5-flash-image'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`

    const fullPrompt = `Generate a black and white coloring page of ${prompt}.

CRITICAL INSTRUCTIONS:
1. OUTPUT MUST BE PURE LINE ART ONLY.
2. NO SHADING, NO GREYSCALE, NO GRADIENTS.
3. Do not include any text in the image.
4. SIMPLIFY AGGRESSIVELY. Remove all textures, shading, and small details.
5. Use THICK, BOLD, UNIFORM lines (like a marker).
6. Make it cute and playful (kawaii style).

Ensure the image is a high-quality, printable coloring page.`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { temperature: 0.7 }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`   ❌ Gemini API Error: ${response.status} - ${errorText}`)
            return null
        }

        const data = await response.json()
        const candidate = data.candidates?.[0]

        if (!candidate) {
            console.error('   ❌ No candidates returned')
            return null
        }

        const parts = candidate.content?.parts || []
        const imagePart = parts.find((part: any) => part.inlineData)

        if (imagePart) {
            const base64Image = imagePart.inlineData.data
            return Buffer.from(base64Image, 'base64')
        }

        const textPart = parts.find((part: any) => part.text)
        if (textPart) {
            console.error(`   ❌ AI returned text instead of image`)
            return null
        }

        return null
    } catch (error) {
        console.error(`   ❌ Error generating image:`, error)
        return null
    }
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(buffer: Buffer, filename: string): Promise<string | null> {
    try {
        const filePath = `${filename}`

        const { data, error } = await supabase.storage
            .from('seo-images')
            .upload(filePath, buffer, {
                contentType: 'image/png',
                upsert: true
            })

        if (error) {
            console.error(`   ❌ Upload error:`, error.message)
            return null
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('seo-images')
            .getPublicUrl(filePath)

        return publicUrl
    } catch (error) {
        console.error(`   ❌ Upload error:`, error)
        return null
    }
}

/**
 * Process a single page
 */
async function processPage(page: SEOPage): Promise<boolean> {
    console.log(`\n📄 Processing: ${page.slug}`)

    // Skip if already has valid image
    if (page.image_url && !page.image_url.includes('placeholder')) {
        console.log(`   ✅ Already has image, skipping`)
        return true
    }

    // Generate image
    console.log(`   🎨 Generating image...`)
    const imageBuffer = await generateImage(page.prompt)

    if (!imageBuffer) {
        console.log(`   ❌ Failed to generate image`)
        return false
    }

    // Upload image
    const filename = `${page.slug}-${Date.now()}.png`
    console.log(`   📤 Uploading to Supabase...`)
    const publicUrl = await uploadImage(imageBuffer, filename)

    if (!publicUrl) {
        console.log(`   ❌ Failed to upload image`)
        return false
    }

    console.log(`   ✅ Image uploaded: ${publicUrl}`)

    // Update page data
    page.image_url = publicUrl
    return true
}

/**
 * Main batch processing function
 */
async function batchProcess(subjectFilter?: string) {
    console.log('🚀 Starting batch image generation...\n')

    // Load pages
    const seoPages: SEOPage[] = JSON.parse(fs.readFileSync(SEO_PAGES_PATH, 'utf-8'))

    // Filter pages needing image updates
    let pagesToFix = seoPages.filter(page =>
        !page.image_url ||
        page.image_url === '' ||
        page.image_url.includes('placeholder')
    )

    // Optional: Filter by subject
    if (subjectFilter) {
        pagesToFix = pagesToFix.filter(page => page.subject === subjectFilter)
    }

    console.log(`📊 Total pages needing images: ${pagesToFix.length}`)

    if (subjectFilter) {
        console.log(`📌 Subject filter: ${subjectFilter}`)
    }

    // Process in batches
    const batch = pagesToFix.slice(0, BATCH_SIZE)
    console.log(`\n🔄 Processing batch of ${batch.length} pages...\n`)

    let successCount = 0
    let failCount = 0

    for (const page of batch) {
        const success = await processPage(page)
        if (success) {
            successCount++
        } else {
            failCount++
        }
    }

    // Save updated pages
    console.log(`\n💾 Saving updated pages...`)
    fs.writeFileSync(SEO_PAGES_PATH, JSON.stringify(seoPages, null, 2))

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📋 BATCH SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successfully processed: ${successCount}/${batch.length}`)
    console.log(`❌ Failed: ${failCount}/${batch.length}`)
    console.log(`📊 Remaining pages: ${pagesToFix.length - batch.length}`)
    console.log('='.repeat(60))

    if (pagesToFix.length > BATCH_SIZE) {
        console.log(`\n💡 Run again to process next batch of ${BATCH_SIZE} pages`)
    }
}

// Run
(async () => {
    const subject = process.argv[2] // Optional subject filter
    await batchProcess(subject)
})()
