/** Sobel edges on an opaque white background; pure and safe to run offline. */
export function photoOutline(pixels: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    if (pixels.length !== width * height * 4) throw new Error('Invalid pixel dimensions')
    const gray = new Float32Array(width * height)
    for (let i = 0; i < gray.length; i++) {
        gray[i] = pixels[i * 4] * 0.299 + pixels[i * 4 + 1] * 0.587 + pixels[i * 4 + 2] * 0.114
    }
    const outline = new Uint8ClampedArray(width * height * 4).fill(255)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x
            const gx = -gray[i-width-1] + gray[i-width+1] - 2*gray[i-1] + 2*gray[i+1] - gray[i+width-1] + gray[i+width+1]
            const gy = -gray[i-width-1] - 2*gray[i-width] - gray[i-width+1] + gray[i+width-1] + 2*gray[i+width] + gray[i+width+1]
            const value = Math.hypot(gx, gy) > 75 ? 0 : 255
            outline[i*4] = outline[i*4+1] = outline[i*4+2] = value
        }
    }
    return outline
}
