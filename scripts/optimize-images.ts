
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SOURCE_DIR = 'launch-assets';
const TARGET_DIR = 'public/images';
const TARGET_WIDTH = 1200;
const QUALITY = 80;

async function optimizeImages() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.log(`Source directory ${SOURCE_DIR} does not exist. Skipping.`);
        return;
    }

    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SOURCE_DIR);

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|webp)$/i)) {
            const sourcePath = path.join(SOURCE_DIR, file);
            const targetFilename = path.parse(file).name + '.webp';
            const targetPath = path.join(TARGET_DIR, targetFilename);

            try {
                await sharp(sourcePath)
                    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
                    .webp({ quality: QUALITY })
                    .toFile(targetPath);

                console.log(`Optimized: ${file} -> ${targetFilename}`);
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    }
}

optimizeImages();
