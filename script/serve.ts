/**
 * Minimal static server for `dist/`, matching GitHub Pages semantics:
 *
 *   - `/foo/` and `/foo` both serve `dist/foo/index.html`
 *   - an unknown path serves `404.html` with a 404 status
 *   - no rewriting, no SPA catch-all beyond that
 *
 * Used by `npm run serve` and by `script/verify.ts`, so verification exercises
 * the same resolution rules the real host applies.
 */

import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { brotliCompressSync, gzipSync } from "node:zlib";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const BASE_PATH = process.env.BASE_PATH || "/";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json",
};

/** Resolve a request path to a file on disk, or null. */
export function resolveFile(requestPath: string): string | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(requestPath.split("?")[0].split("#")[0]);
  } catch {
    return null;
  }

  const base = BASE_PATH.replace(/\/$/, "");
  if (base && pathname.startsWith(base)) pathname = pathname.slice(base.length) || "/";

  // Reject traversal before touching the filesystem.
  const normalized = path.posix.normalize(pathname);
  if (normalized.includes("..")) return null;

  const candidate = path.join(DIST, normalized);
  if (!candidate.startsWith(DIST)) return null;

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  const indexed = path.join(candidate, "index.html");
  if (existsSync(indexed) && statSync(indexed).isFile()) return indexed;

  return null;
}

/**
 * GitHub Pages compresses text responses, so this server does too. Without it a
 * local Lighthouse run models the uncompressed byte count over a throttled
 * connection and reports a transfer cost several times what production pays.
 */
const COMPRESSIBLE = /\.(html|js|mjs|css|json|xml|txt|svg|webmanifest)$/;
const compressionCache = new Map<string, { encoding: string; body: Buffer }>();

function compressedBody(file: string, acceptEncoding: string) {
  if (!COMPRESSIBLE.test(file)) return null;

  const encoding = /\bbr\b/.test(acceptEncoding) ? "br" : /\bgzip\b/.test(acceptEncoding) ? "gzip" : null;
  if (!encoding) return null;

  // Keyed on mtime and size as well as the path: a rebuild replaces files in
  // place, and a cache keyed on the path alone would keep serving the previous
  // build's bytes to anything measuring the site.
  const stats = statSync(file);
  const key = `${encoding}:${file}:${stats.mtimeMs}:${stats.size}`;
  const cached = compressionCache.get(key);
  if (cached) return cached;

  const raw = readFileSync(file);
  const body = encoding === "br" ? brotliCompressSync(raw) : gzipSync(raw);
  const entry = { encoding, body };
  compressionCache.set(key, entry);
  return entry;
}

export function createStaticServer(): http.Server {
  return http.createServer((req, res) => {
    const file = resolveFile(req.url ?? "/");

    if (!file) {
      const notFound = path.join(DIST, "404.html");
      if (existsSync(notFound)) {
        res.writeHead(404, { "content-type": MIME[".html"] });
        createReadStream(notFound).pipe(res);
      } else {
        res.writeHead(404, { "content-type": MIME[".txt"] });
        res.end("404");
      }
      return;
    }

    const contentType = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
    const compressed = compressedBody(file, String(req.headers["accept-encoding"] ?? ""));

    if (compressed) {
      res.writeHead(200, {
        "content-type": contentType,
        "content-encoding": compressed.encoding,
        "content-length": compressed.body.byteLength,
        vary: "Accept-Encoding",
      });
      res.end(compressed.body);
      return;
    }

    res.writeHead(200, {
      "content-type": contentType,
      "content-length": statSync(file).size,
    });
    createReadStream(file).pipe(res);
  });
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  if (!existsSync(DIST)) {
    console.error("[serve] no dist/ directory. Run `npm run build` first.");
    process.exit(1);
  }
  const port = Number(process.env.PORT || 4173);
  createStaticServer().listen(port, () => {
    console.log(`[serve] dist/ on http://localhost:${port}${BASE_PATH}`);
  });
}
