import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:    '#2C5F2D',
        'primary-hover': '#245026',
        moss:       '#97BC62',
        'moss-light': '#b8d47a',
        'dark-bg':  '#1A3C34',
        'dark-card':'#1E4D2B',
        cream:      '#F7F5F0',
        'light-green': '#F0F7EE',
        gold:       '#D4A853',
        'gold-light':'#F0C96A',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        signature: ['Dancing Script', 'cursive'],
      },
      maxWidth: {
        content: '1240px',
      },
    },
  },
  plugins: [],
}
export default config
