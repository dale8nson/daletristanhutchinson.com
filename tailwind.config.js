/** @type {import('tailwindcss').Config} */
// const parchment = require('./src/assets/Texturelabs_Glass_151L.jpg');
// console.log(`parchment: ${parchment}`);

module.exports = {
  purge: [
    './src/**/*.js',
    './src/**/*.tsx'
  ],
  content: [
    "./src/components/**/*.{js,jsx,ts,tsx}", 
    "./src/pages/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'japan-red':'#ee0000'
      },
      backgroundImage: {
        'parchment':'url("/static/Texturelabs_Glass_151L-3d951d45321a08ca8d230b176f3e3699.jpg")'
        // 'parchment': '/static/Texturelabs_Glass_151L.jpg'
      }
    },
  },
}

