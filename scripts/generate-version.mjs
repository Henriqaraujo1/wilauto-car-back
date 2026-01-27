import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const content = `// Auto-gerado em ${new Date().toISOString()}
export const version = '${packageJson.version}';
`;

const outputPath = path.resolve(__dirname, '../version.ts');

// Garante que a pasta existe (no caso, é a pasta raiz de back, que já existe)
fs.writeFileSync(outputPath, content);

console.log(`📦 Versão escrita em ${outputPath}:`, packageJson.version);
