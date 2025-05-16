/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette de couleurs personnalisée
        'gsdy-jaune': '#FBFACD', // rgb(251, 250, 205)
        'gsdy-peche': '#DEBACE', // rgb(222, 186, 206)
        'gsdy-violet-clair': '#BA94D1', // rgb(186, 148, 209)
        'gsdy-violet': '#7F669D', // rgb(127, 102, 157)
      }
    },
  },
  plugins: [],
}

