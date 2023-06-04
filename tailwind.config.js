/** @type {import('tailwindcss').Config} */

import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif'],
      'lato': ['Lato', 'sans-serif'],
      'ubuntu': ['Ubuntu', 'sans-serif'],
      'noto': ['Noto Sans', 'sans-serif'],
    },
    colors: {
      indigo: colors.indigo,
      white: colors.white,
      black: colors.black,
      red: colors.red,
      gray: colors.gray,
      green: colors.green,
      // slate: colors.slate
    },
    backgroundImage: {
      'bgImage': "url('/src/assets/images/background.jpg')",
      'register': "url('/src/assets/images/registerPage.jpg')",
      'manufacturer': "url('/src/assets/images/manufacturer.jpg')",
      "transporter": "url('/src/assets/images/transporter.jpg')",
    },
    plugins: [],
  }
}