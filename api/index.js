// Vercel serverless entrypoint.
//
// Plain CommonJS on purpose: `npm run build` (tsc, via nest build) has already
// compiled src/ to dist/ with decorator metadata intact, which is what NestJS
// dependency injection needs. Vercel's TypeScript path uses esbuild, which
// drops that metadata — so nothing here is TypeScript.
const { getServer } = require('../dist/serverless.js');

module.exports = async function handler(req, res) {
  const server = await getServer();
  return server(req, res);
};
