/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        "se-green": "var(--green--primary)",
        "se-green-bg": "var(--green--background)",
        "se-green-secondary": "var(--green--secondary)",
        "se-black": "var(--black--black)",
        "se-white": "var(--white--white)",
      },
      spacing: {
        "se-xs": "var(--space--xs)",
        "se-sm": "var(--space--sm)",
        "se-md": "var(--space--md)",
        "se-lg": "var(--space--lg)",
        "se-xl": "var(--space--xl)",
      },
      borderRadius: {
        "se-sm": "var(--radius--sm)",
        "se-lg": "var(--radius--lg)",
        "se-xl": "var(--radius--xl)",
      },
    },
  },
};
