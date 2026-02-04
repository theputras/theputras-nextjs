/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PERBAIKAN KONSISTENSI WARNA
        
        // 1. Primary (Pink Brand Lu) - Konsisten untuk text, bg, tombol
        primary: {
          DEFAULT: '#F85C70', // Pink utama
          hover: '#f62b45',   // Pink agak gelap (buat hover)
        },

        // 2. Secondary/Danger (Biru Unik Lu)
        // Gua jadiin ini 'secondary' atau 'accent' biar lebih masuk akal drpd 'danger'
        blue: {
          DEFAULT: '#6393c9', // Biru
          hover: '#2c445f',   // Biru gelap (buat hover)
          light: '#79A9F5',   // Biru terang (dari var --blue)
        },

        // Warna Pelengkap lain dari CSS lu
        dark: '#343a40',
        light: '#f8f9fa',
        customGray: 'rgba(242, 244, 247, 0.15)',
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}