module.exports = {
  // ✅ Enable class-based dark mode
  darkMode: 'class',

  content: [
    "./src/css/**/*.css",
    "./src/css/Global.css",
    "./src/css/index.css",          // Directly reference index.css
    "./src/css/pages/*.css",        // Directly target all .css files in `pages`
    "./src/css/components/*.css",   // Directly target all .css files in `components`
    "./src/**/*.{js,jsx,ts,tsx}",   // All JS, JSX, TS, and TSX files inside `src`
    "./src/index.js",               // Entry point for React app
    "./src/App.js",
  ],
  theme: {
    extend: {
      colors: {
        'solana-primary': "#9945ff",       // Matches :root
        'solana-secondary': "#14f195",    // Matches :root
        'solana-light': "#f3f4f6",        // Matches :root
        'solana-dark': "#1c1c1e",         // Matches :root
        'solana-text-light': "#a1a1aa",   // Matches :root
        'solana-text-dark': "#ffffff",    // Matches :root
        'solana-error': "#ff4d4d",        // Matches :root
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],    // Sleek modern font
      },
      backgroundImage: {
        'solana-gradient': "linear-gradient(135deg, #9945ff, #14f195)", // Matches :root gradient
      },
      boxShadow: {
        solana: "0 4px 6px -1px rgba(110, 86, 255, 0.5), 0 2px 4px -1px rgba(0, 255, 163, 0.3)", // Custom Solana shadow
      },
    },
  },
  plugins: [],
};