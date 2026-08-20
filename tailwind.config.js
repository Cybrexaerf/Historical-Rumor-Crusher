/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--c-paper)',
        paperdeep: 'var(--c-paper-deep)',
        ink: 'var(--c-ink)',
        inksoft: 'var(--c-ink-soft)',
        gold: 'var(--c-gold)',
        seal: 'var(--c-seal)',
        verdict: 'var(--c-verdict-green)'
      },
      fontFamily: {
        serifzh: ['"Noto Serif SC"', '"Source Han Serif SC"', 'SimSun', 'serif'],
        kai: ['"LXGW WenKai"', 'KaiTi', 'KaiTi_GB2312', 'serif']
      }
    }
  },
  plugins: []
}
