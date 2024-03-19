/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
          'bright-gradient': 'linear-gradient(to right, #D4AF37, #9B1F26, #D4AF37)',

      },
      colors: {
        'theme-dark-red': '#9B1F26', // A dark, rich red
        'theme-dark-grey': '#333', // A dark, almost black grey
        'theme-gold': '#D4AF37', // A victorious gold
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cmyk"],
  },
};
