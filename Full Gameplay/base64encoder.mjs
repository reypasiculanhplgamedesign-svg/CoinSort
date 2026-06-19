import fs from 'fs';
import path from 'path';

/**
 * Encodes files in a folder (and sub-folders) to Base64 and writes JS export files.
 * @param {string} inputFolder - The folder containing the files to process.
 * @param {string} outputFolder - The folder to save the generated JS files.
 */
async function encodeFilesToBase64(inputFolder, outputFolder) {
  fs.mkdirSync(outputFolder, { recursive: true });

  const imports = [];

  // Recursive function to process files
  async function processFolder(folder) {
    const entries = fs.readdirSync(folder, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);

      if (entry.isDirectory()) {
        // Recurse into sub-folder
        await processFolder(fullPath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(inputFolder, fullPath);
        const parsedPath = path.parse(relativePath);
        const exportBasePath = path.join(parsedPath.dir, parsedPath.name);
        const fileExt = path.extname(entry.name).slice(1); // Remove the leading dot

        // Read the file and encode it to Base64
        const fileContent = fs.readFileSync(fullPath);
        const base64Content = fileContent.toString('base64');

        // Determine the MIME type for known file types
        const mimeType = getMimeType(fileExt);

        // Create the export string
        const exportName = `${toIdentifier(exportBasePath)}${fileExt.toUpperCase()}`;
        const exportContent = `export const ${exportName} = "data:${mimeType};base64,${base64Content}";`;

        // Write to a .js file in the output folder
        const outputFilePath = path.join(outputFolder, relativePath.replace(/\\|\//g, '_') + '.js');
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        fs.writeFileSync(outputFilePath, exportContent);

        // Add to imports list
        const importLine = `import { ${exportName} } from '../../media/${path.relative(outputFolder, outputFilePath).replace(/\\/g, '/')}';`;
        imports.push(importLine);

        console.log(`Processed: ${entry.name} -> ${outputFilePath}`);
      }
    }
  }

  // Start processing the input folder
  await processFolder(inputFolder);

  // Write the imports list to a text file
  const importsFilePath = path.join(outputFolder, 'imports.txt');
  fs.writeFileSync(importsFilePath, imports.join('\n'));
  console.log(`Imports file written to: ${importsFilePath}`);
}

/**
 * Get the MIME type based on the file extension.
 * @param {string} ext - The file extension.
 * @returns {string} MIME type.
 */
function getMimeType(ext) {
  const mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    json: 'application/json',
    atlas: 'text/plain',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Converts a string to camelCase.
 * @param {string} str - The input string.
 * @returns {string} The camelCase version of the string.
 */
function toIdentifier(str) {
  const words = str
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const identifier = words
    .map((word, index) => {
      const normalized = word.charAt(0).toUpperCase() + word.slice(1);
      return index === 0
        ? normalized.charAt(0).toLowerCase() + normalized.slice(1)
        : normalized;
    })
    .join('');

  return /^\d/.test(identifier) ? `asset${identifier}` : identifier;
}

const inputFolder = process.env.BASE64_INPUT || './public/assets/coin-sort';
const outputFolder = process.env.BASE64_OUTPUT || './media-coin-sort';

encodeFilesToBase64(inputFolder, outputFolder).catch(console.error);
