/** @type {import('tailwindcss').Config} */
// Gray, indigo (the accent) and green (the "save" colour) read from CSS variables, so a colour
// theme can restyle the whole app by redefining them (see src/index.css).
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--white) / <alpha-value>)',
        gray: {
        50: 'rgb(var(--gray-50) / <alpha-value>)',
        100: 'rgb(var(--gray-100) / <alpha-value>)',
        200: 'rgb(var(--gray-200) / <alpha-value>)',
        300: 'rgb(var(--gray-300) / <alpha-value>)',
        400: 'rgb(var(--gray-400) / <alpha-value>)',
        500: 'rgb(var(--gray-500) / <alpha-value>)',
        600: 'rgb(var(--gray-600) / <alpha-value>)',
        700: 'rgb(var(--gray-700) / <alpha-value>)',
        800: 'rgb(var(--gray-800) / <alpha-value>)',
        900: 'rgb(var(--gray-900) / <alpha-value>)',
      },
        indigo: {
        50: 'rgb(var(--indigo-50) / <alpha-value>)',
        100: 'rgb(var(--indigo-100) / <alpha-value>)',
        200: 'rgb(var(--indigo-200) / <alpha-value>)',
        300: 'rgb(var(--indigo-300) / <alpha-value>)',
        400: 'rgb(var(--indigo-400) / <alpha-value>)',
        500: 'rgb(var(--indigo-500) / <alpha-value>)',
        600: 'rgb(var(--indigo-600) / <alpha-value>)',
        700: 'rgb(var(--indigo-700) / <alpha-value>)',
        800: 'rgb(var(--indigo-800) / <alpha-value>)',
        900: 'rgb(var(--indigo-900) / <alpha-value>)',
      },
        green: {
        50: 'rgb(var(--green-50) / <alpha-value>)',
        100: 'rgb(var(--green-100) / <alpha-value>)',
        200: 'rgb(var(--green-200) / <alpha-value>)',
        300: 'rgb(var(--green-300) / <alpha-value>)',
        400: 'rgb(var(--green-400) / <alpha-value>)',
        500: 'rgb(var(--green-500) / <alpha-value>)',
        600: 'rgb(var(--green-600) / <alpha-value>)',
        700: 'rgb(var(--green-700) / <alpha-value>)',
        800: 'rgb(var(--green-800) / <alpha-value>)',
        900: 'rgb(var(--green-900) / <alpha-value>)',
      },
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
