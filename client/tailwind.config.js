module.exports = {
  // Enable class-based dark mode
  darkMode: 'class',

  content: [
    "./src/css/**/*.css",
    "./src/css/Global.css",
    "./src/css/index.css",
    "./src/css/pages/*.css",
    "./src/css/components/*.css",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/index.js",               
    "./src/App.js",
  ],
  theme: {
    extend: {
      colors: {
        'solana-primary': "#9945ff", 
        'solana-secondary': "#14f195", 
        'solana-light': "#f3f4f6",       
        'solana-dark': "#1c1c1e",     
        'solana-text-light': "#a1a1aa", 
        'solana-text-dark': "#ffffff",    
        'solana-error': "#ff4d4d",        
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],    // Sleek modern font
      },
      backgroundImage: {
        'solana-gradient': "linear-gradient(135deg, #9945ff, #14f195)",
      },
      boxShadow: {
        solana: "0 4px 6px -1px rgba(110, 86, 255, 0.5), 0 2px 4px -1px rgba(0, 255, 163, 0.3)",
      },
    },
  },
  plugins: [],
};