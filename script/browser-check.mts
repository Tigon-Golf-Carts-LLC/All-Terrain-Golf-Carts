/**
 * Browser verification against the served `dist/`.
 *
 * Checks the things static analysis cannot: that pages hydrate without console
 * errors, that no request goes to a same-origin API, that the served image bytes
 * really are WebP/AVIF, and that the filter round-trips through reload and
 * browser back/forward the way the tests claim it does.
 */

import { chromium } from "playwright";

const ORIGIN = process.env.ORIGIN ?? "http://localhost:4173";

const failures: string[] = [];
function check(ok: boolean, label: string, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures.push(label + (detail ? `: ${detail}` : ""));
}

const notes: string[] = [];
function note(label: string, detail: string) {
  console.log(`  NOTE  ${label} — ${detail}`);
  notes.push(`${label}: ${detail}`);
}

/**
 * This sandbox has no egress to third-party hosts, so requests to analytics,
 * Google Fonts and the OpenStreetMap embed fail here and would succeed in
 * production. Those are reported as notes; anything same-origin is a real defect.
 */
const THIRD_PARTY = /googletagmanager|google-analytics|fonts\.(googleapis|gstatic)\.com|openstreetmap\.org/;
const isSandboxBlocked = (text: string) =>
  /ERR_TUNNEL_CONNECTION_FAILED|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED|ERR_PROXY/.test(text);

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

async function inspect(pathname: string) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const requests: { url: string; type: string }[] = [];

  const blocked: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (isSandboxBlocked(message.text())) blocked.push(message.text());
    else consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const detail = `${request.url()} (${request.failure()?.errorText})`;
    if (THIRD_PARTY.test(request.url())) blocked.push(detail);
    else failedRequests.push(detail);
  });
  page.on("response", (response) => {
    requests.push({ url: response.url(), type: response.headers()["content-type"] ?? "" });
  });

  const response = await page.goto(`${ORIGIN}${pathname}`, { waitUntil: "networkidle" });
  return { page, consoleErrors, failedRequests, requests, blocked, status: response?.status() ?? 0 };
}

console.log(`\nBROWSER VERIFICATION (${ORIGIN})`);
console.log("=".repeat(60));

/* ---------------- page loads ---------------- */

for (const pathname of [
  "/",
  "/inventory/",
  "/inventory/new/",
  "/inventory/2026-evolution-d-max-xt4-red/",
  "/evolution-d-max-xt6/",
  "/guides/what-is-an-all-terrain-golf-cart/",
  "/florida/",
]) {
  console.log(`\n${pathname}`);
  const { page, consoleErrors, failedRequests, requests, blocked, status } = await inspect(pathname);

  check(status === 200, "HTTP 200");
  check(consoleErrors.length === 0, "no console errors from the site", consoleErrors.slice(0, 3).join(" | "));
  check(failedRequests.length === 0, "no failed same-origin requests", failedRequests.slice(0, 3).join(" | "));
  if (blocked.length) {
    note("third-party requests blocked by the sandbox", `${blocked.length} (would load in production)`);
  }

  const apiCalls = requests.filter((r) => new URL(r.url).origin === ORIGIN && r.url.includes("/api/"));
  check(apiCalls.length === 0, "no same-origin /api/ request", apiCalls.map((r) => r.url).join(", "));

  const h1s = await page.locator("h1").count();
  check(h1s === 1, "exactly one <h1>", `found ${h1s}`);

  const heroText = (await page.locator("h1").first().textContent()) ?? "";
  check(heroText.trim().length > 0, "<h1> has text", heroText.slice(0, 50));

  // The phone CTA has to be present and dial the right number.
  const telHrefs = await page.locator('a[href^="tel:"]').evaluateAll((els) =>
    els.map((el) => (el as HTMLAnchorElement).getAttribute("href")),
  );
  check(telHrefs.length > 0, "phone CTA present", `${telHrefs.length} tel: links`);
  check(
    telHrefs.every((href) => href === "tel:+18448846744"),
    "every tel: link is the same number",
    Array.from(new Set(telHrefs)).join(", "),
  );

  // Images actually served as modern formats.
  const imageResponses = requests.filter((r) => r.type.startsWith("image/"));
  const modern = imageResponses.filter((r) => /avif|webp/.test(r.type));
  const legacy = imageResponses.filter((r) => /jpeg|jpg/.test(r.type));
  check(
    imageResponses.length === 0 || modern.length > 0,
    "images served as WebP/AVIF",
    `${modern.length} modern, ${legacy.length} legacy of ${imageResponses.length}`,
  );
  check(legacy.length === 0, "no JPEG served", legacy.map((r) => r.url.split("/").pop()).join(", "));

  await page.close();
}

/* ---------------- filter behaviour ---------------- */

console.log("\nFilter behaviour on /inventory/");
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  async function resultCount(): Promise<number> {
    const text = (await page.locator('[data-testid="result-count"]').textContent()) ?? "";
    const match = text.match(/of (\d+)/);
    return match ? Number(match[1]) : -1;
  }

  await page.goto(`${ORIGIN}/inventory/`, { waitUntil: "networkidle" });
  const total = await resultCount();
  check(total === 12, "unfiltered listing shows all 12 carts", String(total));

  // Deep link with four filters, then confirm the controls restored.
  await page.goto(`${ORIGIN}/inventory/?condition=new&color=black&model=d-max-xt6&seats=6`, {
    waitUntil: "networkidle",
  });
  const restored = await Promise.all(
    [
      "facet-condition-new",
      "facet-color-black",
      "facet-model-d-max-xt6",
      "facet-seats-6",
    ].map((id) => page.locator(`[data-testid="${id}"]`).getAttribute("data-state")),
  );
  check(
    restored.every((state) => state === "checked"),
    "reload with a 4-filter URL restores all four controls",
    restored.join(", "),
  );
  check((await resultCount()) === 1, "the 4-filter URL returns 1 cart", String(await resultCount()));

  // Two colors -> union.
  await page.goto(`${ORIGIN}/inventory/?color=black&color=red`, { waitUntil: "networkidle" });
  check((await resultCount()) === 4, "two colors return the union (4)", String(await resultCount()));

  // Clicking a facet writes to the URL, and Back undoes exactly that click.
  await page.goto(`${ORIGIN}/inventory/`, { waitUntil: "networkidle" });
  await page.locator('[data-testid="facet-color-red"]').click();
  await page.waitForFunction(() => window.location.search.includes("color=red"));
  check(page.url().includes("color=red"), "clicking a facet writes it to the URL", new URL(page.url()).search);
  const afterClick = await resultCount();
  check(afterClick === 2, "red returns 2 carts", String(afterClick));

  await page.goBack({ waitUntil: "networkidle" });
  check(!page.url().includes("color=red"), "Back removes the filter from the URL", new URL(page.url()).search);
  check((await resultCount()) === 12, "Back restores the unfiltered result set", String(await resultCount()));

  await page.goForward({ waitUntil: "networkidle" });
  check(page.url().includes("color=red"), "Forward reapplies the filter", new URL(page.url()).search);
  check((await resultCount()) === 2, "Forward restores the filtered result set", String(await resultCount()));

  // A known value with no stock: empty state, named filters, one-click clear.
  await page.goto(`${ORIGIN}/inventory/?condition=used`, { waitUntil: "networkidle" });
  const emptyVisible = await page.locator('[data-testid="empty-state"]').isVisible();
  const emptyText = (await page.locator('[data-testid="empty-state"]').textContent()) ?? "";
  check(emptyVisible, "condition=used shows the empty state");
  check(emptyText.includes("Condition: Used"), "empty state names the active filter");
  await page.locator('[data-testid="button-empty-clear-all"]').click();
  await page.waitForFunction(() => window.location.search === "");
  check((await resultCount()) === 12, "clear all restores every cart", String(await resultCount()));

  // An unknown value is ignored with an explanation rather than zero results.
  await page.goto(`${ORIGIN}/inventory/?color=chartreuse`, { waitUntil: "networkidle" });
  const ignored = await page.locator('[data-testid="ignored-filters"]').isVisible();
  check(ignored, "unknown filter value shows the ignored-filters notice");
  check((await resultCount()) === 12, "unknown value does not empty the results", String(await resultCount()));

  // A preset page carries its baseline filter and can be narrowed further.
  await page.goto(`${ORIGIN}/inventory/4-seat/`, { waitUntil: "networkidle" });
  check((await resultCount()) === 6, "the /inventory/4-seat/ preset returns 6 carts", String(await resultCount()));
  await page.goto(`${ORIGIN}/inventory/4-seat/?color=red`, { waitUntil: "networkidle" });
  check((await resultCount()) === 1, "preset plus a URL filter intersects", String(await resultCount()));

  // Filters survive a trip to a detail page and back.
  await page.goto(`${ORIGIN}/inventory/?color=red`, { waitUntil: "networkidle" });
  await page.locator('[data-testid="inventory-card-2026-evolution-d-max-xt4-red"] a').first().click();
  await page.waitForURL(/2026-evolution-d-max-xt4-red/);
  await page.goBack({ waitUntil: "networkidle" });
  check(page.url().includes("color=red"), "filters survive navigating to a detail page and back", new URL(page.url()).search);
  check((await resultCount()) === 2, "and the result set comes back", String(await resultCount()));

  check(errors.length === 0, "no page errors during filtering", errors.slice(0, 3).join(" | "));
  await page.close();
}

/* ---------------- 404 fallback ---------------- */

console.log("\n404 fallback");
{
  const page = await browser.newPage();
  const response = await page.goto(`${ORIGIN}/no-such-page/`, { waitUntil: "networkidle" });
  check(response?.status() === 404, "unknown path returns HTTP 404", String(response?.status()));
  const body = (await page.locator("body").textContent()) ?? "";
  check(body.includes("404") || /not found/i.test(body), "404 page renders the not-found view");
  await page.close();
}

await browser.close();

console.log("\n" + "=".repeat(60));
if (failures.length) {
  console.log(`${failures.length} failure(s):`);
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exit(1);
}
console.log("All browser checks passed.");
