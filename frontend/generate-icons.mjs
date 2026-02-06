import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sizes = [192, 512];
const faviconSizes = [32, 48]; // Multiple sizes for better compatibility
const svgPath = join(__dirname, 'public', 'icon.svg');

console.log('🎨 Generating PWA icons and favicon from SVG...\n');

async function generateIcons() {
  const svgBuffer = readFileSync(svgPath);

  // Generate PWA icons
  for (const size of sizes) {
    const filename = `icon-${size}.png`;
    const filepath = join(__dirname, 'public', filename);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(filepath);

      console.log(`✅ Created: public/${filename} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to create ${filename}:`, error.message);
    }
  }

  // Generate favicon.ico (32x32 is standard)
  try {
    const faviconPath = join(__dirname, 'public', 'favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(faviconPath);

    console.log(`✅ Created: public/favicon.ico (32x32)`);
  } catch (error) {
    console.error(`❌ Failed to create favicon.ico:`, error.message);
  }

  // Also generate apple-touch-icon for iOS
  try {
    const appleTouchPath = join(__dirname, 'public', 'apple-touch-icon.png');
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(appleTouchPath);

    console.log(`✅ Created: public/apple-touch-icon.png (180x180)`);
  } catch (error) {
    console.error(`❌ Failed to create apple-touch-icon.png:`, error.message);
  }

  console.log('\n✨ All icons generated successfully!');
}

generateIcons().catch(console.error);
