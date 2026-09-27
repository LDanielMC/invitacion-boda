import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'public', 'assets');

async function convertSvgToWebP(name, density = 150, quality = 85) {
  const svgPath = join(assetsDir, `${name}.svg`);
  const webpPath = join(assetsDir, `${name}.webp`);
  
  console.log(`Convirtiendo ${name}.svg a WebP...`);
  
  try {
    const svgStats = await fs.stat(svgPath);
    const svgSizeKB = (svgStats.size / 1024).toFixed(2);
    
    await sharp(svgPath, { density })
      .webp({ quality, effort: 6 })
      .toFile(webpPath);
    
    const webpStats = await fs.stat(webpPath);
    const webpSizeKB = (webpStats.size / 1024).toFixed(2);
    const reduction = ((1 - webpStats.size / svgStats.size) * 100).toFixed(0);
    
    console.log(`✅ ${name}.webp creado`);
    console.log(`   SVG: ${svgSizeKB} KB → WebP: ${webpSizeKB} KB (${reduction}% reducción)`);
  } catch (error) {
    console.error(`Error con ${name}:`, error.message);
  }
}

async function convertLiverpoolFixed() {
  const svgPath = join(assetsDir, 'Liverpool.svg');
  const webpPath = join(assetsDir, 'Liverpool.webp');
  
  console.log('Convirtiendo Liverpool.svg a WebP (con dimensiones correctas)...');
  
  try {
    const svgStats = await fs.stat(svgPath);
    const svgSizeKB = (svgStats.size / 1024).toFixed(2);
    
    // Usar density más alto para capturar todo el SVG
    await sharp(svgPath, { density: 300 })
      .resize({ width: 400, fit: 'inside' })
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath);
    
    const webpStats = await fs.stat(webpPath);
    const webpSizeKB = (webpStats.size / 1024).toFixed(2);
    const reduction = ((1 - webpStats.size / svgStats.size) * 100).toFixed(0);
    
    console.log(`✅ Liverpool.webp creado`);
    console.log(`   SVG: ${svgSizeKB} KB → WebP: ${webpSizeKB} KB (${reduction}% reducción)`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

convertLiverpoolFixed();
