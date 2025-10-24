import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-manifest-and-assets',
      apply: 'build',
      writeBundle() {
        // Copy manifest.json
        const manifest = fs.readFileSync(resolve(__dirname, 'src/manifest.json'), 'utf-8')
        fs.writeFileSync(resolve(__dirname, 'dist/manifest.json'), manifest)

        // Copy content.css
        const contentCss = fs.readFileSync(resolve(__dirname, 'src/content.css'), 'utf-8')
        fs.writeFileSync(resolve(__dirname, 'dist/content.css'), contentCss)

        // Move options.html from src subdirectory to root
        const srcHtmlPath = resolve(__dirname, 'dist/src/options.html')
        const destHtmlPath = resolve(__dirname, 'dist/options.html')
        if (fs.existsSync(srcHtmlPath)) {
          fs.copyFileSync(srcHtmlPath, destHtmlPath)
        }

        // Copy images directory
        const imagesDir = resolve(__dirname, 'src/images')
        const distImagesDir = resolve(__dirname, 'dist/images')
        if (fs.existsSync(imagesDir)) {
          if (!fs.existsSync(distImagesDir)) {
            fs.mkdirSync(distImagesDir, { recursive: true })
          }
          const files = fs.readdirSync(imagesDir)
          files.forEach(file => {
            fs.copyFileSync(resolve(imagesDir, file), resolve(distImagesDir, file))
          })
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        options: resolve(__dirname, 'src/options.html'),
        content: resolve(__dirname, 'src/content.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  }
})

