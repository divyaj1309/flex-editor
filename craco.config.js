// craco.config.js
const path = require('path');

// craco.config.js
module.exports = {
    webpack: {
      configure: {
        resolve: {
          fallback: {
            util: false,
            path: false
          }
        }
      }
    }
  };
  