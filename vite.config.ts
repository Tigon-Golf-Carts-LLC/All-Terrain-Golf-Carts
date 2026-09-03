import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * `BASE_PATH` is the single knob that decides whether asset and route URLs are
 * rooted at `/` or under a repository subdirectory:
 *
 *   "/"            custom domain, or <user>.github.io
 *   "/<repo>/"     GitHub Pages project site
 *
 * The router reads the same value through `import.meta.env.BASE_URL`, so a
 * single environment variable moves the whole site.
 */
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: false,
    // One vendor chunk for dependencies and one for the icon set, which is the
    // largest single dependency and changes on a different cadence to the rest.
    // React is deliberately left in `vendor`: splitting it out produced a
    // circular chunk graph, and the two are always fetched together anyway.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("lucide-react")) return "icons";
          return "vendor";
        },
      },
    },
    cssMinify: true,
    minify: "esbuild",
    reportCompressedSize: true,
  },
  ssr: {
    // Dependencies stay external during prerendering so Node loads their CommonJS
    // builds directly. Bundling them through Vite's ESM module runner breaks
    // React's `module.exports` entry points.
    external: ["react", "react-dom", "react-dom/server"],
  },
});
