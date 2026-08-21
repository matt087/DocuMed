const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/app.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "dist/app.js",
    format: "cjs",
    external: ["better-sqlite3"],
    sourcemap: true,
    logLevel: "info",
  })
  .catch(() => process.exit(1));