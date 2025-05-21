const path = require('path');

const configFile = path.resolve(__dirname, './renderer/tailwind.config.ts');

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {
      config: configFile
    },
    'autoprefixer': {},
  }
};

