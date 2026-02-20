import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImage = 'd:/Website/aurerxa/public/Picsart_26-02-18_11-45-09-505.png';
const publicDir = 'd:/Website/aurerxa/public';

async function generateAssets() {
    try {
        console.log('Generating assets...');

        // 1. Generate PNGs for Manifest and Apple
        await sharp(sourceImage)
            .resize(180, 180)
            .toFile(path.join(publicDir, 'apple-touch-icon.png'));

        await sharp(sourceImage)
            .resize(192, 192)
            .toFile(path.join(publicDir, 'icon-192.png'));

        await sharp(sourceImage)
            .resize(512, 512)
            .toFile(path.join(publicDir, 'icon-512.png'));

        // 2. Generate Favicon
        await sharp(sourceImage)
            .resize(48, 48)
            .toFile(path.join(publicDir, 'favicon.ico'));

        // 3. Generate high-res WebP logo for app usage
        await sharp(sourceImage)
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .webp({ quality: 90 })
            .toFile(path.join(publicDir, 'logo-new.webp'));
        console.log('Generated logo-new.webp');

        console.log('Assets generated successfully!');
    } catch (error) {
        console.error('Error generating assets:', error);
    }
}

generateAssets();
