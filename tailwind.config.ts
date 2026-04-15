import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0f172a',
          panel: '#111827',
          muted: '#94a3b8',
          border: '#1f2937'
        }
      }
    }
  },
  plugins: []
}

export default config
