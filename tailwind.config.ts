import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#F7F8FA',
          section: '#FFFFFF',
          soft: '#F1F3F6',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#5F6368',
          muted: '#8A8F98',
        },
        brand: {
          gold: '#C9A13B',
          goldDark: '#A67C1F',
          goldSoft: '#E6C977',
        },
        stroke: '#ECECEC',
      },
      boxShadow: {
        card: '0 6px 20px rgba(0,0,0,0.05)',
        cardHover: '0 12px 30px rgba(0,0,0,0.08)',
        cta: '0 8px 20px rgba(201,161,59,0.15)',
      },
      borderRadius: {
        md: '14px',
        lg: '16px',
        xl: '20px',
      },
    },
  },
  plugins: [],
}

export default config
