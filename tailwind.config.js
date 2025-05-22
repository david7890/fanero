/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        secondary: 'var(--secondary)',
        'secondary-dark': 'var(--secondary-dark)',
        accent: 'var(--accent)',
        'accent-dark': 'var(--accent-dark)',
        success: 'var(--success)',
        error: 'var(--error)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
      borderRadius: {
        card: 'var(--card-radius)',
      },
      height: {
        header: 'var(--header-height)',
      },
    },
  },
  plugins: [],
}; 