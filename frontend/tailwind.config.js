/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          bg: '#0b141a',
          panel: '#111b21',
          header: '#202c33',
          hover: '#222e35',
          active: '#2a3942',
          incoming: '#202c33',
          outgoing: '#005c4b',
          green: '#00a884',
          teal: '#25d366',
          check: '#53bdeb',
          border: '#222e35',
          text: '#e9edef',
          muted: '#8696a0',
        },
        chase: {
          950: '#060911',
          900: '#0B0F19',
          850: '#111726',
          800: '#161F33',
          700: '#1F2B48',
          600: '#2F3F66',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        citation: {
          bg: '#FEF08A',
          border: '#FACC15',
          text: '#713F12',
          darkBg: '#422006',
          darkBorder: '#CA8A04',
          darkText: '#FEF08A',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
