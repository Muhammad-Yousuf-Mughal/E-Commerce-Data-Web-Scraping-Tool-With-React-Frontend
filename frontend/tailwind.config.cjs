/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-bg))",
        surface: "rgb(var(--color-surface))",
        "surface-hover": "rgb(var(--color-surface-hover))",
        border: "rgb(var(--color-border))",
        accent: "rgb(var(--color-accent))",
        "accent-hover": "rgb(var(--color-accent-hover))",
        text: "rgb(var(--color-text))",
        "text-secondary": "rgb(var(--color-text-secondary))",
        "text-tertiary": "rgb(var(--color-text-tertiary))",
      },
      backgroundImage: {
        radial:
          "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 70%)",
      },
    },
  },
  plugins: [],
};
