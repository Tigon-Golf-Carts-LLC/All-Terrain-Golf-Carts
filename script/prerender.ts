/**
 * Prerenderer.
 *
 * GitHub Pages resolves a URL to a file. `/inventory/new/` has to be a real
 * `dist/inventory/new/index.html` or it 404s, and a crawler that fetches it must
 * get the finished page, not an empty `<div id="root">`.
 *
 * So every route in the registry is rendered here with `react-dom/server` and
 * written to its own directory index. The same `App` the browser hydrates does
 * the rendering, which is what keeps the static HTML and the live app identical.
 *
 * Also emits the three files a static host needs and nobody remembers:
 *   - `404.html`   the SPA fallback for URLs that were never prerendered
 *   - `.nojekyll`  so paths beginning with `_` are served
 *   - `CNAME`      the custom domain, which Pages wipes on every deploy
 */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createServer, type ViteDevServer } from "vite";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const TEMPLATE = path.join(DIST, "index.html");

const BASE_PATH = process.env.BASE_PATH || "/";
/** Bare domain for the CNAME file. Empty disables it (project sites). */
const SITE_DOMAIN = process.env.SITE_DOMAIN ?? "allterraingolfcarts.com";

interface EntryServer {
  render: (pathname: string) => { html: string; head: string };
  allRoutes: () => string[];
  routes: { path: string; indexable: boolean }[];
}

function fail(message: string): never {
  console.error(`\n[prerender] FAILED: ${message}`);
  process.exit(1);
}

/** `/` -> `dist/index.html`, `/inventory/new` -> `dist/inventory/new/index.html`. */
function outputPathFor(route: string): string {
  if (route === "/") return TEMPLATE;
  return path.join(DIST, route.replace(/^\/+/, ""), "index.html");
}

function injectInto(template: string, head: string, html: string): string {
  if (!template.includes("<!--app-head-->") || !template.includes("<!--app-html-->")) {
    fail("dist/index.html is missing the <!--app-head--> or <!--app-html--> marker; did `vite build` run?");
  }
  return template.replace("<!--app-head-->", head).replace("<!--app-html-->", html);
}

async function main() {
  if (!existsSync(TEMPLATE)) {
    fail(`no build output at ${path.relative(ROOT, TEMPLATE)}. Run \`vite build\` first.`);
  }

  // Read the template before anything writes to it: rendering "/" overwrites it.
  const template = await readFile(TEMPLATE, "utf-8");

  let vite: ViteDevServer | undefined;
  try {
    vite = await createServer({
      root: path.join(ROOT, "client"),
      base: BASE_PATH,
      configFile: path.join(ROOT, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "custom",
      logLevel: "warn",
    });

    const entry = (await vite.ssrLoadModule("/src/entry-server.tsx")) as EntryServer;
    const routes = entry.allRoutes();
    if (routes.length === 0) fail("the route registry is empty");

    let written = 0;
    const emptyRenders: string[] = [];

    for (const route of routes) {
      let rendered: { html: string; head: string };
      try {
        rendered = entry.render(route);
      } catch (error) {
        fail(`rendering ${route} threw: ${(error as Error).stack ?? error}`);
      }

      // A route that renders nothing would ship as a blank shell. That is the
      // exact failure this script exists to prevent, so it is fatal.
      const textLength = rendered.html.replace(/<[^>]*>/g, "").trim().length;
      if (textLength < 200) emptyRenders.push(`${route} (${textLength} chars of text)`);

      const output = outputPathFor(route);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, injectInto(template, rendered.head, rendered.html), "utf-8");
      written += 1;
    }

    if (emptyRenders.length > 0) {
      fail(`these routes rendered almost no content:\n  - ${emptyRenders.join("\n  - ")}`);
    }

    console.log(`[prerender] wrote ${written} prerendered routes`);

    // --- SPA fallback -------------------------------------------------------
    // Left with an empty root on purpose: Pages serves this for any URL that was
    // never prerendered, and the client router then renders the right view.
    const notFoundHead = entry.render("/404").head;
    await writeFile(path.join(DIST, "404.html"), injectInto(template, notFoundHead, ""), "utf-8");
    console.log("[prerender] wrote 404.html (SPA fallback)");

    // --- static-host plumbing ----------------------------------------------
    await writeFile(path.join(DIST, ".nojekyll"), "", "utf-8");
    console.log("[prerender] wrote .nojekyll");

    if (SITE_DOMAIN) {
      // Pages deletes CNAME on each deploy, so the build has to re-emit it.
      await writeFile(path.join(DIST, "CNAME"), `${SITE_DOMAIN}\n`, "utf-8");
      console.log(`[prerender] wrote CNAME (${SITE_DOMAIN})`);
    } else {
      console.log("[prerender] SITE_DOMAIN is empty; skipping CNAME");
    }

    // --- the snapshot, published for inspection ----------------------------
    const snapshot = path.join(ROOT, "client/src/data/inventory.json");
    await mkdir(path.join(DIST, "data"), { recursive: true });
    await copyFile(snapshot, path.join(DIST, "data/inventory.json"));
    console.log("[prerender] copied the inventory snapshot to dist/data/inventory.json");
  } finally {
    await vite?.close();
  }
}

main().catch((error) => {
  fail((error as Error).stack ?? String(error));
});
