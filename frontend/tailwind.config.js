/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B1220',
          sidebar: '#0D1728',
          surface: '#111C2E',
          surfaceHover: '#18253C',
          border: '#1E293B',
          blue: '#2563EB',
          red: '#DC2626',
          orange: '#F59E0B',
          yellow: '#EAB308',
          green: '#16A34A',
          muted: '#94A3B8',
          text: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
