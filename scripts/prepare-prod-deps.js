import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Daftar dependencies yang tidak diperlukan di production
const testDependencies = [
  '@playwright/test',
  '@testing-library',
  'jest',
  'jest-',
  'supertest',
  'msw',
  'node-mocks-http',
  'react-test-renderer',
]

// Membaca package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Buat salinan untuk produksi
const productionPackageJson = {
  name: packageJson.name,
  version: packageJson.version,
  private: packageJson.private,
  scripts: {
    start: 'next start',
    build: 'next build',
  },
  dependencies: {},
  devDependencies: {
    // Hanya simpan beberapa dev dependencies yang benar-benar diperlukan
    typescript: packageJson.devDependencies.typescript,
    postcss: packageJson.devDependencies.postcss,
    autoprefixer: packageJson.devDependencies.autoprefixer,
    tailwindcss: packageJson.devDependencies.tailwindcss,
  },
}

// Salin dependensi produksi saja
for (const [dep, version] of Object.entries(packageJson.dependencies)) {
  // Skip dependencies yang tidak diperlukan di production
  if (!testDependencies.some((testDep) => dep.includes(testDep))) {
    productionPackageJson.dependencies[dep] = version
  }
}

// Simpan package.json.prod
const outputPath = path.join(__dirname, '..', 'package.json.prod')
fs.writeFileSync(
  outputPath,
  JSON.stringify(productionPackageJson, null, 2),
  'utf8'
)

console.log(`Production package.json created at ${outputPath}`)
