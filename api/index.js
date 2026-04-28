const app = require('../server/app.js');

module.exports = (req, res) => {
  // Vercel-ге Express қолданбасын тікелей беру
  return app(req, res);
};
