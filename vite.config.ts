import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
            if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'router'
            if (id.includes('minisearch') || id.includes('pinyin-pro')) return 'search'
            if (id.includes('zod')) return 'zod'
            if (id.includes('markdown-it') || id.includes('dompurify') || id.includes('js-yaml')) return 'markdown'
            return 'vendor'
          }
          return undefined
        }
      }
    }
  }
})
