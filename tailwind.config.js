/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f9f9ff',
        primary: {
          DEFAULT: '#111827',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#00FF00',
          foreground: '#000000',
        },
        danger: {
          DEFAULT: '#E11D48',
          foreground: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#d3daea',
        },
        // Dark Mode specific palette
        dark: {
          bg: '#0D0F0A',
          surface: '#161912',
          border: '#24281E',
          accent: '#00FF00',
          text: '#D4FF9D',
          dim: '#6E7B68'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(17, 24, 39, 0.05)',
        'ambient': '0 10px 40px -4px rgba(17, 24, 39, 0.08)',
      }
    },
  },
  plugins: [],
}
