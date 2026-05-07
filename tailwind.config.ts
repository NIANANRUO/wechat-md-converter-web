import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17201b',
        paper: '#f7f4ee',
        fern: '#1e6f5c',
        coral: '#d85f47',
        mist: '#dce8e3'
      }
    }
  },
  plugins: []
}

export default config
