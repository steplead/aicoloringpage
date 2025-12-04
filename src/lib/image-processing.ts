import sharp from 'sharp';

/**
 * Processes an image buffer to create a high-quality coloring page.
 * It converts the image to grayscale and applies a threshold to ensure
 * crisp black and white lines (no gray smudges).
 */
export async function processImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
        const processed = await sharp(imageBuffer)
            .grayscale() // Convert to grayscale
            .threshold(160) // Higher threshold = Bolder lines (more grays become black)
            .toFormat('png')
            .toBuffer();

        return processed;
    } catch (error) {
        console.error('Image processing failed:', error);
        throw new Error('Failed to process image');
    }
}
