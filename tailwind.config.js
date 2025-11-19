/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-green': '#33FF00',
        'terminal-amber': '#FFB000',
        'error-red': '#FF3333',
        'true-black': '#000000',
        'pure-white': '#FFFFFF',
      },
      fontFamily: {
        'vt323': ['VT323', 'monospace'],
        'space-mono': ['Space Mono', 'monospace'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'blink': 'blink 1s infinite',
        'glitch': 'glitch 0.3s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}

