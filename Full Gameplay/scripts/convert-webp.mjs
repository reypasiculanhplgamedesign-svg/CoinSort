import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function convertToWebp(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await convertToWebp(fullPath);
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.png') {
      const outputFilePath = path.join(dir, `${path.parse(entry.name).name}.webp`);
      
      try {
        await sharp(fullPath)
          .webp({ quality: 75 })
          .toFile(outputFilePath);
        
        console.log(`Converted: ${fullPath} -> ${outputFilePath}`);
        
        // Delete the original PNG file
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Error converting ${fullPath}:`, err);
      }
    }
  }
}

const inputFolder = path.resolve(process.cwd(), 'public/assets/images');
console.log(`Starting WebP conversion in ${inputFolder}...`);
convertToWebp(inputFolder).then(() => console.log('Done!')).catch(console.error);
