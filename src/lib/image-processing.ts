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
            .threshold(128) // Force pixels to black or white (0 or 255)
            .toFormat('png')
            .toBuffer();

        return processed;
    } catch (error) {
        console.error('Image processing failed:', error);
        throw new Error('Failed to process image');
    }
}
