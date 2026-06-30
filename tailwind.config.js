/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Newman Stewart brand palette
        navy: {
          DEFAULT: '#1e3c55', // primary
          900: '#152b3d',     // darker shade for deep backgrounds
          800: '#1e3c55',
          700: '#274a68',     // raised surfaces / cards
          600: '#325a7c',     // borders / hover
          500: '#3f6c91',
        },
        brand: {
          blue: '#349ed9',    // secondary (mid blue) - primary accent
          light: '#79cdf5',   // tertiary (light blue)
          purple: '#86648e',  // quinary
        },
        gold: '#F5C24B',
        silver: '#C7CCD1',
        bronze: '#CD7F4A',
      },
      fontFamily: {
        // Source Sans Pro = body, Playfair Display = headings
        sans: ['"Source Sans 3"', '"Source Sans Pro"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
