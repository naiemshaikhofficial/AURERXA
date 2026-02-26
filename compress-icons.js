const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function compressIcon(filename, size) {
    const inputPath = path.join(__dirname, 'app', filename);
    const outputPath = path.join(__dirname, 'app', `compressed_${filename}`);

    if (!fs.existsSync(inputPath)) {
        console.log(`${filename} not found`);
        return;
    }

    try {
        await sharp(inputPath)
            .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(outputPath);

        console.log(`Successfully compressed ${filename}`);

        // Replace original with compressed
        fs.renameSync(outputPath, inputPath);
    } catch (e) {
        console.error(`Error compressing ${filename}:`, e);
    }
}

async function run() {
    await compressIcon('icon.png', 512);
    await compressIcon('apple-icon.png', 512);
}

run();
