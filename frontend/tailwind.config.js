/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          'black-soft': '#141414',
          'black-card': '#1A1A1A',
          yellow: '#FACC15',
          'yellow-dark': '#EAB308',
          'yellow-glow': '#FDE047',
          gray: {
            850: '#262626',
            750: '#404040',
            650: '#525252',
          },
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', 'system-ui', 'sans-serif'],
        body: ['"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
        'yellow-accent':
          'linear-gradient(90deg, #FACC15 0%, #EAB308 100%)',
      },
      boxShadow: {
        yellow: '0 0 30px rgba(250, 204, 21, 0.25)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
