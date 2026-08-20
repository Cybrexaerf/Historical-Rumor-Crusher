import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

/**
 * 单文件内联构建：全部 JS/CSS 内联进 index.html。
 * 原因：file:// 协议下浏览器禁止加载外部 module 脚本（CORS），
 * 双击打开会空白页；内联脚本不经过网络请求，可正常执行。
 * 字体保持为外部文件（CSS url() 子资源在 file:// 下可用）。
 */
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile({ useRecommendedBuildConfig: false })],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
