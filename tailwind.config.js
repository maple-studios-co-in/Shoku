/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White-label brand colors are driven by CSS variables (channels)
        // so the Admin console can re-theme the whole app live.
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-dark": "rgb(var(--brand-dark) / <alpha-value>)",
        "brand-tint": "rgb(var(--brand-tint) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-tint": "rgb(var(--accent-tint) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04), 0 10px 30px rgba(16,24,40,.06)",
        pop: "0 12px 40px rgba(16,24,40,.14)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
