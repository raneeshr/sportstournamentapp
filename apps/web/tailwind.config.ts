import type { Config } from 'tailwindcss'
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { brand: { DEFAULT: '#534AB7', light: '#EEEDFE', dark: '#3C3489' } } } },
  plugins: [],
} satisfies Config
