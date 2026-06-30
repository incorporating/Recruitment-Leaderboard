@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { color-scheme: dark; }
  html, body, #root { height: 100%; }
  body {
    @apply bg-navy-900 text-slate-100 font-sans antialiased;
  }
  h1, h2, h3 { @apply font-display; }
}

@layer utilities {
  .tnum { font-variant-numeric: tabular-nums; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
