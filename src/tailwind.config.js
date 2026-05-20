/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cielo: {
          50: '#EBF5FF',
          100: '#D6EBFF',
          200: '#B5D8FF',
          300: '#89CFF0',    // Azul cielo claro
          400: '#7CB9E8',    // Azul cielo principal
          500: '#5BA0D9',    // Azul medio
          600: '#4A90E2',    // Azul más intenso
          700: '#2E75B6',
          800: '#1E5A8A',
          900: '#0F3F60',
        },
        beige: {
          50: '#FDFBF7',
          100: '#FBF7F0',
          200: '#F7F0E6',
          300: '#F5F0E1',    // Beige claro (fondo)
          400: '#EFE5D4',
          500: '#E8DCC8',    // Beige secundario
          600: '#D4C4A8',    // Beige oscuro (bordes)
          700: '#B8A88C',
          800: '#9C8C70',
          900: '#807054',
        },
        blanco: '#FFFFFF',
        texto: {
          primary: '#2C3E50',    // Azul grisáceo para texto principal
          secondary: '#6B7B8D',  // Gris azulado para texto secundario
          light: '#8A9BA8',      // Gris claro
        }
      },
    },
  },
  plugins: [],
}